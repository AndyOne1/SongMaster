import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Music, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export function Register() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!passwordValid) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Check Your Email</h1>
          <p className="mb-6 text-gray-400">
            We've sent a confirmation link to <span className="text-white">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to activate your account, then sign in.
          </p>
          <Link to="/login" className="mt-6 inline-block">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Music className="h-10 w-10 text-primary-400" />
            <span className="text-2xl font-bold text-white">SongMaster</span>
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-8">
          <h1 className="mb-2 text-center text-2xl font-bold text-white">Create Account</h1>
          <p className="mb-6 text-center text-gray-400">Start creating songs with AI</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border bg-gray-900 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none ${
                    password && !passwordValid ? 'border-red-500' : 'border-gray-700 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {password && !passwordValid && (
                <p className="mt-1 text-xs text-red-400">At least 8 characters</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border bg-gray-900 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none ${
                    confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-700 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-400">Passwords don't match</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
