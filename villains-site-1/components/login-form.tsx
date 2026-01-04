'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Use the actual Cloudflare URL for redirects
const SITE_URL = 'https://code.anton-atom.com/Troublemakers/villains-site-1'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin')

  const supabase = createClient()

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        // Session created successfully, redirect to dashboard
        window.location.href = `${SITE_URL}/dashboard`
      } else {
        setError('Login succeeded but no session was created')
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const redirectUrl = `${SITE_URL}/auth/callback`
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) throw error

      if (data.user?.identities?.length === 0) {
        setError('An account with this email already exists')
      } else {
        setMessage(`Check your email (${email}) for a confirmation link!`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const redirectUrl = `${SITE_URL}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) throw error

      setMessage(`Magic link sent to ${email}! Check your inbox.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'signup') {
      handleSignUp(e)
    } else if (mode === 'magic') {
      handleMagicLinkLogin(e)
    } else {
      handleEmailPasswordLogin(e)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'signup' ? 'Create Account' : mode === 'magic' ? 'Magic Link' : 'Sign In'}
        </CardTitle>
        <CardDescription>
          {mode === 'signup' 
            ? 'Create a new account to get started'
            : mode === 'magic'
            ? 'We will send you a login link via email'
            : 'Sign in with your email and password'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {mode !== 'magic' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? 'Loading...' 
              : mode === 'signup' 
              ? 'Create Account' 
              : mode === 'magic'
              ? 'Send Magic Link'
              : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 pt-4 border-t space-y-2">
          {mode === 'signin' && (
            <>
              <Button 
                variant="ghost" 
                className="w-full text-sm" 
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              >
                Need an account? Sign up
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-sm" 
                onClick={() => { setMode('magic'); setError(null); setMessage(null); }}
              >
                Sign in with Magic Link
              </Button>
            </>
          )}
          {mode === 'signup' && (
            <Button 
              variant="ghost" 
              className="w-full text-sm" 
              onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
            >
              Already have an account? Sign in
            </Button>
          )}
          {mode === 'magic' && (
            <Button 
              variant="ghost" 
              className="w-full text-sm" 
              onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
            >
              Back to password sign in
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
