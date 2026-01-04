'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [session, setSession] = useState<string>('Loading...')
  const [user, setUser] = useState<string>('Loading...')
  const [cookies, setCookies] = useState<string>('Loading...')
  const [origin, setOrigin] = useState<string>('')

  const supabase = createClient()

  useEffect(() => {
    // Check origin
    setOrigin(window.location.origin)
    
    // Check cookies
    setCookies(document.cookie || 'No cookies')
    
    // Check session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setSession(`Error: ${error.message}`)
      } else if (data.session) {
        setSession(`Session exists - expires: ${new Date(data.session.expires_at! * 1000).toISOString()}`)
      } else {
        setSession('No session')
      }
    })
    
    // Check user
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setUser(`Error: ${error.message}`)
      } else if (data.user) {
        setUser(`User: ${data.user.email} (${data.user.id})`)
      } else {
        setUser('No user')
      }
    })
  }, [supabase.auth])

  const handleTestLogin = async () => {
    const email = prompt('Enter email:')
    const password = prompt('Enter password:')
    
    if (!email || !password) return
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      alert(`Login error: ${error.message}`)
    } else {
      alert(`Login success! Session: ${data.session ? 'Yes' : 'No'}`)
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleGoToDashboard = () => {
    window.location.href = '/Troublemakers/villains-site-1/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Auth Debug Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Origin:</strong> <code className="bg-gray-100 p-1 rounded">{origin}</code></p>
            <p><strong>Expected:</strong> <code className="bg-gray-100 p-1 rounded">https://code.anton-atom.com</code></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Session:</strong> <code className="bg-gray-100 p-1 rounded text-xs break-all">{session}</code></p>
            <p><strong>User:</strong> <code className="bg-gray-100 p-1 rounded text-xs break-all">{user}</code></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">{cookies}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleTestLogin} className="w-full">Test Login</Button>
            <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
            <Button onClick={handleGoToDashboard} variant="secondary" className="w-full">Go to Dashboard</Button>
            <Button onClick={() => window.location.reload()} variant="ghost" className="w-full">Refresh</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
