import { Link } from 'react-router-dom'
import { Music, Users, Sparkles, Zap, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function Landing() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary-400" />
            <span className="text-xl font-bold text-white">SongMaster</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="mb-6 text-5xl font-bold text-white">
            Create Songs with <span className="text-primary-400">AI Agents</span>
          </h1>
          <p className="mb-8 text-xl text-gray-400">
            SongMaster uses multiple AI models to generate unique song specifications.
            From lyrics to style, let AI collaborate on your next hit.
          </p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Start Creating <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-gray-800 bg-gray-800/50 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600/20">
              <Users className="h-7 w-7 text-primary-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Multi-Agent Collaboration</h3>
            <p className="text-gray-400">
              Multiple AI agents generate songs in parallel, then an orchestrator evaluates and scores each one.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-600/20">
              <Sparkles className="h-7 w-7 text-yellow-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">AI-Generated Artists</h3>
            <p className="text-gray-400">
              Describe a music style and let AI create unique fictional artists with detailed style descriptions.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600/20">
              <Zap className="h-7 w-7 text-green-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Lightning Fast</h3>
            <p className="text-gray-400">
              Powered by free models through OpenRouter. Create songs instantly without breaking the bank.
            </p>
          </div>
        </div>
      </section>

      {/* Models */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-8 text-3xl font-bold text-white">Powered by Leading AI Models</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Claude Sonnet 4.5',
              'GPT-4o',
              'Grok 4.1 Fast',
              'DeepSeek V3.2',
              'Gemini 3 Flash',
              'MiniMax M2.1',
              'GLM-4.7',
              'Xiaomi Mimo',
            ].map((model) => (
              <span
                key={model}
                className="rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500">
        <p>SongMaster - AI-Powered Song Creation</p>
      </footer>
    </div>
  )
}
