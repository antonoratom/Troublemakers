import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Try to find and parse the auth token cookie
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  let parsedToken = null
  if (authCookie) {
    try {
      parsedToken = JSON.parse(decodeURIComponent(authCookie.value))
    } catch (e) {
      parsedToken = { parseError: String(e) }
    }
  }
  
  // Create supabase client directly here with detailed logging
  const supabase = createServerClient(
    'https://oxhllxkvklxkxvdtpebd.supabase.co',
    'sb_publishable_X3qkbag4sU8Pna_7wzFmzA_Mj8Zj0Rr',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )
  
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  return NextResponse.json({
    cookieCount: allCookies.length,
    cookies: allCookies.map(c => ({ 
      name: c.name, 
      valueLength: c.value.length,
      valuePreview: c.value.substring(0, 100) + '...' 
    })),
    parsedToken: parsedToken ? {
      hasAccessToken: !!parsedToken.access_token,
      hasRefreshToken: !!parsedToken.refresh_token,
      accessTokenLength: parsedToken.access_token?.length,
      expiresAt: parsedToken.expires_at,
    } : null,
    session: sessionError ? { error: sessionError.message } : { 
      exists: !!sessionData.session,
      expires: sessionData.session?.expires_at 
    },
    user: userError ? { error: userError.message } : {
      exists: !!userData.user,
      email: userData.user?.email,
      id: userData.user?.id
    }
  })
}
