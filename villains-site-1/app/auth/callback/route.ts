import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Get base path from environment
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'
  const error_description = searchParams.get('error_description')

  // Build the site URL from request origin + base path
  const siteUrl = `${origin}${BASE_PATH}`

  // If there's an error from Supabase
  if (error_description) {
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error_description)}`)
  }

  const supabase = await createClient()

  // Handle code exchange (from email confirmation)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
    
    return NextResponse.redirect(`${siteUrl}/login?error=code_exchange_failed`)
  }

  // Handle token hash (from magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'magiclink' | 'signup' | 'invite' | 'recovery',
    })
    
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
    
    return NextResponse.redirect(`${siteUrl}/login?error=token_verification_failed`)
  }

  // No code or token - redirect to login
  return NextResponse.redirect(`${siteUrl}/login?error=missing_auth_params`)
}
