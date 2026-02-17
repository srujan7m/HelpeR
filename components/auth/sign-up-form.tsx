'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Mail, Lock, Loader2 } from 'lucide-react'

type UserRole = 'recruiter' | 'candidate'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState<UserRole>('recruiter')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleGoogleSignUp = () => {
    setIsLoading(true)
    // Simulate OAuth
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Get Started
        </h1>
        <p className="text-muted-foreground">
          Join HelpeR and transform your hiring
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            I am a...
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 flex-1 p-3 border border-input rounded-lg cursor-pointer hover:bg-secondary transition-colors" style={{ borderColor: role === 'recruiter' ? 'var(--foreground)' : '' }}>
              <input
                type="radio"
                name="role"
                value="recruiter"
                checked={role === 'recruiter'}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-4 h-4 accent-foreground"
              />
              <span className="text-sm font-medium">Recruiter</span>
            </label>
            <label className="flex items-center gap-2 flex-1 p-3 border border-input rounded-lg cursor-pointer hover:bg-secondary transition-colors" style={{ borderColor: role === 'candidate' ? 'var(--foreground)' : '' }}>
              <input
                type="radio"
                name="role"
                value="candidate"
                checked={role === 'candidate'}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-4 h-4 accent-foreground"
              />
              <span className="text-sm font-medium">Candidate</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Google Sign Up */}
      <button
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="w-full py-2 px-4 border border-input rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign up with Google
      </button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
