import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SITE_URL = 'https://code.anton-atom.com/Troublemakers/villains-site-1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'
  const error_description = searchParams.get('error_description')

  // If there's an error from Supabase
  if (error_description) {
    return NextResponse.redirect(`${SITE_URL}/login?error=${encodeURIComponent(error_description)}`)
  }

  const supabase = await createClient()

  // Handle code exchange (from email confirmation)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${SITE_URL}${next}`)
    }
    
    return NextResponse.redirect(`${SITE_URL}/login?error=code_exchange_failed`)
  }

  // Handle token hash (from magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'magiclink' | 'signup' | 'invite' | 'recovery',
    })
    
    if (!error) {
      return NextResponse.redirect(`${SITE_URL}${next}`)
    }
    
    return NextResponse.redirect(`${SITE_URL}/login?error=token_verification_failed`)
  }

  // No code or token - redirect to login
  return NextResponse.redirect(`${SITE_URL}/login?error=missing_auth_params`)
}
