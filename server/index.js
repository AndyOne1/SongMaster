import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// Supabase client for fetching system prompts
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

async function fetchSystemPrompt(key) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('Supabase credentials not set, using fallback prompts')
    return null
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/system_prompts?key=eq.${key}&select=content`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    })
    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        return data[0].content
      }
    }
  } catch (error) {
    console.error('Failed to fetch system prompt:', error)
  }
  return null
}

// Helper function to call OpenRouter
async function callOpenRouter(model, messages, options = {}) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://songmaster.app',
      'X-Title': 'SongMaster',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OpenRouter error: ${response.status}`)
  }

  const data = await response.json()
  let content = data.choices[0].message.content

  // Strip markdown code fences
  content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')

  // Parse JSON
  const parsed = JSON.parse(content)

  // For generate endpoint: extract structured fields
  // For orchestrate endpoint: return full response
  if (options.extractFields) {
    return {
      name: parsed.name || 'Untitled',
      style: parsed.style || parsed.style_description || '',
      lyrics: parsed.lyrics || ''
    }
  }

  return parsed
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Generate song endpoint (multi-agent parallel generation)
app.post('/api/generate', async (req, res) => {
  const { song_id, agents, prompt, user_request, user_style } = req.body

  if (!song_id || !agents || agents.length === 0) {
    return res.status(400).json({ error: 'song_id and agents required' })
  }

  // Build artist context if artist info provided
  const artistContext = req.body.artist_context || ''

  // Fetch system prompt from database or use fallback
  let systemPrompt = await fetchSystemPrompt('song_generation')

  if (systemPrompt) {
    // Replace placeholders with actual values
    systemPrompt = systemPrompt
      .replace('{artist_context}', artistContext || 'Create an original artist style')
      .replace('{song_description}', user_request || '')
      .replace('{style_description}', user_style || '')
      .replace('{iteration_feedback}', '')
  } else {
    // Fallback prompt
    systemPrompt = `You are a professional songwriter.

Artist Context:
${artistContext || 'Create an original artist style'}

Song Description: ${user_request}
Desired Style: ${user_style}

Create an original song specification. Return JSON with:
- name: Song title (max 50 chars)
- style: Detailed music style description
- lyrics: Complete song lyrics with verse/chorus structure

Return valid JSON only.`
  }

  try {
    // Call all agents in parallel
    const agentPromises = agents.map(async (agent) => {
      const result = await callOpenRouter(
        agent.model_name,
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: user_request }],
        { maxTokens: 4000, extractFields: true }
      )
      return { agentId: agent.id, ...result }
    })

    const results = await Promise.allSettled(agentPromises)

    // Collect successful results
    const completedResults = {}
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        completedResults[result.value.agentId] = {
          name: result.value.name,
          style: result.value.style,
          lyrics: result.value.lyrics
        }
      }
    }

    res.json({
      song_id,
      results: completedResults,
      completed_count: Object.keys(completedResults).length,
      failed_count: agents.length - Object.keys(completedResults).length
    })
  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate' })
  }
})

// Generate artist endpoint
app.post('/api/generate-artist', async (req, res) => {
  const { input, model_name } = req.body

  console.log('Artist generation request:', { input, model_name })

  try {
    const result = await callOpenRouter(
      model_name || 'anthropic/claude-sonnet-4.5',
      [
        {
          role: 'system',
          content: `You are an expert at creating unique fictional artists and bands. Generate 3 creative artist profiles based on user input.

Return a JSON object with this structure:
{
  "artists": [
    {
      "name": "Artist/Band Name",
      "style_description": "Detailed description of their musical style",
      "special_characteristics": "What makes them unique"
    }
  ]
}

Be creative and varied with each option.`
        },
        { role: 'user', content: input }
      ],
      { maxTokens: 2000 }
    )
    res.json({ options: result.artists || result })
  } catch (error) {
    console.error('Artist generation error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate artists' })
  }
})

// Orchestrate endpoint (evaluate and score songs with structured output)
app.post('/api/orchestrate', async (req, res) => {
  const { song_id, user_request, user_style, songs, orchestrator_model_name } = req.body

  if (!song_id || !songs || Object.keys(songs).length === 0) {
    return res.status(400).json({ error: 'song_id and songs required' })
  }

  // Use provided model or fall back to environment variable or default
  const model = orchestrator_model_name || process.env.ORCHESTRATOR_MODEL || 'gpt-4o'

  // Build songs summary for evaluation
  const songsSummary = Object.entries(songs).map(([agentId, song]) => {
    const lyrics = song.lyrics || ''
    return `[Agent: ${agentId}]
Name: ${song.name || 'Untitled'}
Style: ${song.style || song.style_description || 'Unknown'}
Lyrics: ${lyrics.substring(0, 500)}${lyrics.length > 500 ? '...' : ''}`
  }).join('\n\n---\n\n')

  // Fetch system prompt from database or use fallback
  let systemPrompt = await fetchSystemPrompt('orchestrator')

  if (systemPrompt) {
    // Replace placeholders with actual values
    systemPrompt = systemPrompt
      .replace('{song_description}', user_request || '')
      .replace('{style_description}', user_style || '')
      .replace('{songs}', songsSummary)
  } else {
    // Fallback prompt
    systemPrompt = `You are an expert music producer. Evaluate these song specifications and score them.

# User Request
Song Description: ${user_request}
Desired Style: ${user_style}

# Songs to Evaluate
${songsSummary}

# Scoring Criteria (1-10 each)
1. Music Style: How well the style matches the request
2. Lyrics: Quality, coherence, and emotional impact
3. Originality: Creative and unique elements
4. Cohesion: How well lyrics and style work together

# Output Format
Return JSON with this structure:
{
  "evaluations": {
    "agent_id": {
      "matched_request": "Yes/No + brief explanation",
      "scores": {
        "music_style": 8,
        "lyrics": 7,
        "originality": 6,
        "cohesion": 8
      },
      "analysis": "Short 1-2 sentence analysis",
      "evaluation": "Full evaluation paragraph",
      "recommendations": "How to improve / make more like request"
    }
  },
  "winner_agent_id": "agent_id_of_best_song",
  "winner_reason": "Why this song won (2-3 sentences)"
}`
  }

  try {
    const result = await callOpenRouter(model,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Evaluate all songs and return structured JSON.' }
      ],
      { maxTokens: 3000 }
    )

    res.json({
      song_id,
      ...result
    })
  } catch (error) {
    console.error('Orchestration error:', error)
    res.status(500).json({ error: error.message || 'Failed to orchestrate' })
  }
})

// Batch generate (multiple agents in parallel)
app.post('/api/generate-batch', async (req, res) => {
  const { agents, prompt } = req.body

  try {
    const results = await Promise.all(
      agents.map(async (agent) => {
        const result = await callOpenRouter(
          agent.model_name,
          [{ role: 'user', content: prompt }],
          { maxTokens: agent.max_output || 4000 }
        )
        return { agentId: agent.id, ...result }
      })
    )
    res.json({ results })
  } catch (error) {
    console.error('Batch generation error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate batch' })
  }
})

// Catch-all: Return error for non-API routes (frontend is on Netlify)
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.status(404).json({
      error: 'Not Found',
      message: 'This is the SongMaster API. The frontend is at https://songmaster.netlify.app',
      endpoints: ['/api/health', '/api/generate', '/api/generate-artist', '/api/orchestrate']
    })
    return
  }
  res.status(404).json({ error: 'Endpoint not found' })
})

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

// Log startup info
console.log('Starting SongMaster API...')
console.log('OPENROUTER_API_KEY set:', !!process.env.OPENROUTER_API_KEY)
console.log('SUPABASE_URL set:', !!SUPABASE_URL)
console.log('PORT:', PORT)
console.log('HOST:', HOST)
console.log('NODE_ENV:', process.env.NODE_ENV)

try {
  app.listen(PORT, HOST, () => {
    console.log(`SongMaster API running on ${HOST}:${PORT}`)
  })
} catch (error) {
  console.error('Failed to start server:', error)
  process.exit(1)
}
