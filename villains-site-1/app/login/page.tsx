import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // Check if user is already logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  const authError = searchParams.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">Access your fundraising dashboard</p>
        </div>
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm text-center">
            Authentication error: {decodeURIComponent(authError)}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}
