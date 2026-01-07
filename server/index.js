import express from 'express'
import cors from 'cors'

const app = express()

// Configure CORS to allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://songmaster.netlify.app',
  'https://*.netlify.app',
  'https://*.railway.app',
]

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.some(o => origin === o || origin.endsWith(o.replace('*', '')))) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  credentials: true,
}))
app.use(express.json())

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
  return JSON.parse(data.choices[0].message.content)
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Generate song endpoint
app.post('/api/generate', async (req, res) => {
  const { agent, prompt, model_name } = req.body

  try {
    const result = await callOpenRouter(
      model_name || 'anthropic/claude-sonnet-4-5',
      [{ role: 'user', content: prompt }],
      { maxTokens: 4000 }
    )
    res.json(result)
  } catch (error) {
    console.error('Song generation error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate song' })
  }
})

// Generate artist endpoint
app.post('/api/generate-artist', async (req, res) => {
  const { input, model_name } = req.body

  try {
    const result = await callOpenRouter(
      model_name || 'anthropic/claude-sonnet-4-5',
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

// Orchestrate endpoint (evaluate and score songs)
app.post('/api/orchestrate', async (req, res) => {
  const { prompt, songs, model_name } = req.body

  try {
    const result = await callOpenRouter(
      model_name || 'anthropic/claude-sonnet-4-5',
      [
        {
          role: 'system',
          content: `You are an expert music producer and critic. Evaluate song specifications and score them.

For each song, evaluate on a scale of 1-10:
- Music Style: How well the style matches the request
- Lyrics: Quality, coherence, and emotional impact
- Originality: Creative and unique elements
- Cohesion: How well lyrics and style work together

Return JSON with this structure:
{
  "scores": {
    "agent_id": {
      "music_style": 8,
      "lyrics": 7,
      "originality": 6,
      "cohesion": 8,
      "total": 7.25
    }
  },
  "feedback": {
    "agent_id": "Brief explanation of scores"
  },
  "winner_agent_id": "agent_id_of_best_song"
}`
        },
        { role: 'user', content: `Evaluate these songs:\n\n${JSON.stringify(songs, null, 2)}` }
      ],
      { maxTokens: 2000 }
    )
    res.json(result)
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`SongMaster API running on port ${PORT}`)
})
