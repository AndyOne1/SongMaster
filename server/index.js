import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Generate artist endpoint
app.post('/api/generate-artist', async (req, res) => {
  const { input, agent_id } = req.body

  try {
    // Call AI to generate 3 artist options
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
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
          {
            role: 'user',
            content: input
          }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    res.json({ options: result.artists || result })
  } catch (error) {
    console.error('Artist generation error:', error)
    res.status(500).json({ error: 'Failed to generate artists' })
  }
})

// Orchestrate endpoint
app.post('/api/orchestrate', async (req, res) => {
  const { prompt, songs } = req.body

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
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
      "cohesion": 8
    }
  },
  "feedback": {
    "agent_id": "Brief explanation of scores"
  },
  "winner_agent_id": "agent_id_of_best_song"
}`
          },
          {
            role: 'user',
            content: `Evaluate these songs:\n\n${JSON.stringify(songs, null, 2)}`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    res.json(result)
  } catch (error) {
    console.error('Orchestration error:', error)
    res.status(500).json({ error: 'Failed to orchestrate' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
