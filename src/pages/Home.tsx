import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Music, Plus, Library } from 'lucide-react'

export function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-100">Welcome to SongMaster</h1>
        <p className="text-gray-400">Create amazing songs with AI-powered multi-agent collaboration</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-600/20">
            <Plus className="h-10 w-10 text-primary-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-200">Create New Song</h2>
          <p className="mb-6 text-sm text-gray-500">
            Generate song specifications with multiple AI agents working together
          </p>
          <Link to="/songs/new" className="w-full">
            <Button className="w-full">Start Creating</Button>
          </Link>
        </Card>

        <Card className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-700">
            <Music className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-200">Manage Artists</h2>
          <p className="mb-6 text-sm text-gray-500">
            Create and manage artist profiles with unique style descriptions
          </p>
          <Link to="/artists" className="w-full">
            <Button variant="outline" className="w-full">View Artists</Button>
          </Link>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-100">Recent Songs</h2>
        <Card className="p-8 text-center">
          <Library className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <p className="text-gray-500">No songs yet. Create your first song!</p>
        </Card>
      </div>
    </div>
  )
}
