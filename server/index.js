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

  // Try to parse JSON, handle incomplete responses
  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (parseError) {
    // Try to salvage incomplete JSON by finding the last complete object
    console.log(`[openrouter] JSON parse error for ${model}, trying to salvage...`)
    console.log(`[openrouter] Raw content length: ${content.length} chars`)

    // For song generation: extract name/style/lyrics
    if (options.extractFields) {
      const lyricsMatch = content.match(/"lyrics"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
      if (lyricsMatch) {
        const nameMatch = content.match(/"name"\s*:\s*"([^"]*)"/)
        const styleMatch = content.match(/"style"\s*:\s*"([^"]*)"/)
        const styleDescMatch = content.match(/"style_description"\s*:\s*"([^"]*)"/)

        return {
          name: nameMatch ? nameMatch[1] : 'Untitled',
          style: styleMatch ? styleMatch[1] : styleDescMatch ? styleDescMatch[1] : '',
          lyrics: lyricsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
        }
      }
    }

    // For orchestration: try to complete the JSON manually
    if (!options.extractFields && content.includes('"evaluations"')) {
      // Try to fix common truncation issues
      let fixed = content

      // Close any unclosed arrays/objects at the end
      const openBraces = (fixed.match(/\{/g) || []).length
      const closeBraces = (fixed.match(/\}/g) || []).length
      const openBrackets = (fixed.match(/\[/g) || []).length
      const closeBrackets = (fixed.match(/\]/g) || []).length

      for (let i = 0; i < openBraces - closeBraces; i++) fixed += '\n}'
      for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += '\n]'

      // Close any unclosed strings (very common in truncation)
      if (fixed.trim().endsWith(',') || fixed.trim().endsWith('":') || fixed.trim().endsWith(':')) {
        // Try to find the last complete field and close properly
        fixed = fixed.replace(/,\s*["\w]+:\s*[^"\}\]]*$/, '')
        fixed += '\n  }\n}'
      }

      try {
        parsed = JSON.parse(fixed)
        console.log(`[openrouter] Successfully salvaged JSON with ${Object.keys(parsed.evaluations || {}).length} evaluations`)
        return parsed
      } catch (secondError) {
        console.log(`[openrouter] Could not salvage orchestrator JSON:`, secondError.message)
      }
    }

    // If we can't salvage, throw the original error
    throw new Error(`JSON parse error: ${parseError.message}. Raw: ${content.substring(0, 200)}...`)
  }

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

// Helper function to build iteration prompt with feedback
function buildIterationPrompt(basePrompt, iterationContext, baseSong) {
  const strengths = iterationContext.evaluation.strengths
    .map(s => `- ${s}`)
    .join('\n')

  const weaknesses = iterationContext.evaluation.weaknesses
    .map(w => `- ${w}`)
    .join('\n')

  const criticalFixes = iterationContext.evaluation.recommendations.critical_fixes
    .map(r => `- ${r}`)
    .join('\n')

  const quickWins = iterationContext.evaluation.recommendations.quick_wins
    .map(r => `- ${r}`)
    .join('\n')

  const depthEnhancements = iterationContext.evaluation.recommendations.depth_enhancements
    .map(r => `- ${r}`)
    .join('\n')

  const sunoOptimization = iterationContext.evaluation.recommendations.suno_optimization
    .map(r => `- ${r}`)
    .join('\n')

  // Base song content (what we're iterating on)
  const baseSongContent = baseSong
    ? `

## CURRENT SONG TO IMPROVE

**Style:** ${baseSong.style}

**Lyrics:**
${baseSong.lyrics}`
    : ''

  return `${basePrompt}

---

## ITERATION GUIDELINES (IMPORTANT - READ CAREFULLY)

You are ITERATING on an existing song, not creating a new one. The goal is to IMPROVE specific areas while PRESERVING what already works.

### YOUR CORE PRINCIPLES:
1. PRESERVE the song structure, melody feel, and overall vibe
2. ONLY change what's specifically mentioned in weaknesses or recommendations
3. KEEP the strengths intact - don't accidentally break what works
4. MAKE MINIMAL CHANGES - targeted tweaks, not wholesale rewrites
5. The song title should remain the same (it's preserved separately)
6. You MUST use the CURRENT SONG content below as your starting point

### STRENGTHS (DO NOT CHANGE THESE):
${strengths}

### WEAKNESSES TO ADDRESS (make targeted improvements):
${weaknesses}

### RECOMMENDATIONS (apply in priority order):

**CRITICAL FIXES** (must do):
${criticalFixes || 'None'}

**QUICK WINS** (easy improvements):
${quickWins || 'None'}

**DEPTH ENHANCEMENTS** (if time permits):
${depthEnhancements || 'None'}

**SUNO OPTIMIZATION** (for better AI music generation):
${sunoOptimization || 'None'}

---${baseSongContent}

## YOUR TASK

Based on the user's original request, the feedback above, and the CURRENT SONG, make MINIMAL targeted changes:

**ORIGINAL REQUEST:**
${iterationContext.original_request}

**ORIGINAL STYLE:**
${iterationContext.original_style}
${iterationContext.custom_instructions ? `

**USER CUSTOM INSTRUCTIONS:**
${iterationContext.custom_instructions}` : ''}

**Key instructions:**
- Take the CURRENT SONG above and IMPROVE it based on the feedback
- DO NOT ignore the current song - it is what you must iterate on
- Address the critical fixes first
- Apply quick wins where relevant
- Keep the overall structure and feel intact

Remember: You are iterating on an existing song. Use the current lyrics and style as your foundation.

Iteration #${iterationContext.iteration_number}
`
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Generate song endpoint (multi-agent parallel generation)
app.post('/api/generate', async (req, res) => {
  const { song_id, agents, prompt, user_request, user_style, custom_instructions, iteration_context, original_title, iteration_number, base_song } = req.body

  if (!song_id || !agents || agents.length === 0) {
    return res.status(400).json({ error: 'song_id and agents required' })
  }

  // Build iteration title suffix
  const iterationSuffix = (iteration_number && iteration_number > 0) ? ` (Iteration #${iteration_number})` : ''

  // Check if this is an iteration (has base song)
  const isIteration = !!base_song

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

  // Inject iteration context if present
  if (iteration_context) {
    systemPrompt = buildIterationPrompt(systemPrompt, iteration_context, base_song)
  }

  try {
    // Call all agents in parallel
    const agentPromises = agents.map(async (agent) => {
      console.log(`[generate] Calling agent ${agent.id} (${agent.model_name})...`)
      try {
        const result = await callOpenRouter(
          agent.model_name,
          [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Request: ${user_request}${custom_instructions ? `\n\nCustom Instructions: ${custom_instructions}` : ''}` }],
          { maxTokens: 4000, extractFields: true }
        )
        console.log(`[generate] Agent ${agent.id} response:`, JSON.stringify(result).substring(0, 200))
        return { agentId: agent.id, ...result }
      } catch (err) {
        console.error(`[generate] Agent ${agent.id} failed:`, err.message)
        return { agentId: agent.id, error: err.message }
      }
    })

    const results = await Promise.allSettled(agentPromises)

    // Collect successful results
    const completedResults = {}
    const failedAgents = []
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        if (result.value.error) {
          failedAgents.push({ agentId: result.value.agentId, error: result.value.error })
        } else if (result.value.name && result.value.lyrics) {
          // Use original title with iteration suffix, or agent's generated name
          const songName = (original_title && iterationSuffix)
            ? `${original_title}${iterationSuffix}`
            : result.value.name
          completedResults[result.value.agentId] = {
            name: songName,
            style: result.value.style,
            lyrics: result.value.lyrics
          }
        } else {
          failedAgents.push({ agentId: result.value.agentId, error: 'Missing name or lyrics' })
        }
      } else if (result.status === 'rejected') {
        console.error(`[generate] Agent rejected:`, result.reason)
        failedAgents.push({ error: result.reason?.message || 'Unknown error' })
      }
    }

    console.log(`[generate] Completed: ${Object.keys(completedResults).length}, Failed: ${failedAgents.length}`)

    res.json({
      song_id,
      results: completedResults,
      completed_count: Object.keys(completedResults).length,
      failed_count: failedAgents.length,
      failed_agents: failedAgents
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
    // Parse input variables
    let artistType = ''
    let desiredStyle = ''

    if (input) {
      const artistTypeMatch = input.match(/Artist Type:\s*(.+?)(?:\n|$)/i)
      const styleMatch = input.match(/Desired Style:\s*(.+?)(?:\n|$)/i)

      artistType = artistTypeMatch ? artistTypeMatch[1].trim() : ''
      desiredStyle = styleMatch ? styleMatch[1].trim() : ''
    }

    // Fetch system prompt from database or use fallback
    let systemPrompt = await fetchSystemPrompt('artist_generation')

    if (systemPrompt) {
      // Replace placeholders with actual values
      systemPrompt = systemPrompt
        .replace('{artist_type}', artistType || 'Solo Artist')
        .replace('{desired_style}', desiredStyle || 'Create an original style')
    } else {
      // Fallback prompt
      systemPrompt = `You are an expert at creating unique fictional artists and bands. Generate 3 creative artist profiles based on the user input.

Input Variables:
- Artist Type: ${artistType || 'Solo Artist'}
- Desired Style: ${desiredStyle || 'Create an original style'}

Return a JSON object with this structure:
{
  "options": [
    {
      "artist_name": "Artist/Band Name",
      "artist_type": "Type of artist (e.g., Solo Artist, Band, Duo)",
      "tagline": "Brief catchy description of their style",
      "origin_story": "Detailed backstory of how the artist formed",
      "career_stage": "Career stage (e.g., Emerging, Breakthrough, Established, Legendary)",
      "musical_dna": {
        "core_genre": "Primary genre",
        "signature_sound": "What makes them sonically distinctive",
        "mood_and_emotion": "Emotional quality of their music",
        "influence_sources": ["Key influences"]
      },
      "instrumentation": {
        "primary_instruments": ["List of main instruments"],
        "production_techniques": "Production approach",
        "unique_sonic_elements": "Special sonic characteristics"
      },
      "vocal_identity": {
        "vocal_type": "Type of vocals (e.g., Male Tenor, Female Mezzo-Soprano)",
        "vocal_characteristics": "What makes their voice distinctive",
        "vocal_approach": "How they use vocals in songs"
      },
      "lyrical_identity": {
        "writing_approach": "How lyrics are written",
        "thematic_preferences": "Common themes in lyrics",
        "narrative_style": "Storytelling approach"
      },
      "references": {
        "sounds_like": ["Similar artists/bands"],
        "comparable_projects": "Comparable projects or albums",
        "fusion_elements": "Genre fusion elements"
      },
      "suno_guidelines": {
        "default_bpm": "Recommended tempo",
        "key_signature": "Recommended key",
        "duration_range": "Typical song length",
        "structure_preference": "Preferred song structure",
        "tags_and_keywords": ["Suno tags for generation"]
      },
      "brand_identity": {
        "visual_aesthetic": "Visual style and imagery",
        "brand_values": ["Core brand values"],
        "image_presentation": "How they present themselves"
      },
      "agent_brief": "Detailed brief for the artist agent about their style and requirements",
      "short_style_summary": "Brief 1-2 sentence summary of their musical style"
    }
  ]
}

Be creative and varied with each option. Ensure each artist feels unique and authentic.`
    }

    const result = await callOpenRouter(
      model_name || 'anthropic/claude-sonnet-4.5',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input || `Artist Type: ${artistType}\nDesired Style: ${desiredStyle}` }
      ],
      { maxTokens: 3000 }
    )

    // Transform result to frontend format
    const options = result.options || result.artists || []

    const transformedOptions = options.map(option => ({
      name: option.artist_name || option.name,
      style_description: option.tagline || option.style_description,
      special_characteristics: option.agent_brief || option.short_style_summary || option.special_characteristics,
      artist_type: option.artist_type,
      tagline: option.tagline,
      origin_story: option.origin_story,
      career_stage: option.career_stage,
      musical_dna: option.musical_dna || {},
      instrumentation: option.instrumentation || {},
      vocal_identity: option.vocal_identity || {},
      lyrical_identity: option.lyrical_identity || {},
      references_data: option.references || {},
      suno_guidelines: option.suno_guidelines || {},
      brand_identity: option.brand_identity || {},
      agent_brief: option.agent_brief,
      short_style_summary: option.short_style_summary
    }))

    res.json({ options: transformedOptions })
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
