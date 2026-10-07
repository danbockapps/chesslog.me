import {cookies} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'
import {
  STATE_COOKIE,
  VERIFIER_COOKIE,
  buildAuthorizeUrl,
  buildRedirectUri,
  generateCodeVerifier,
  generateState,
  oauthCookieOptions,
} from '@/lib/lichessOAuth'

export async function GET(request: NextRequest) {
  const codeVerifier = generateCodeVerifier()
  const state = generateState()
  const redirectUri = buildRedirectUri(request.headers, request.nextUrl.origin)

  const cookieStore = await cookies()
  cookieStore.set(VERIFIER_COOKIE, codeVerifier, oauthCookieOptions)
  cookieStore.set(STATE_COOKIE, state, oauthCookieOptions)

  return NextResponse.redirect(buildAuthorizeUrl({redirectUri, state, codeVerifier}))
}
