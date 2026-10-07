import crypto from 'crypto'

const AUTHORIZE_URL = 'https://lichess.org/oauth'
const TOKEN_URL = 'https://lichess.org/api/token'
const API_URL = 'https://lichess.org/api'
const SCOPE = 'email:read'

export const VERIFIER_COOKIE = 'chesslog_oauth_verifier'
export const STATE_COOKIE = 'chesslog_oauth_state'

export const oauthCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 600,
  secure: process.env.NODE_ENV === 'production',
}

// Lichess has no app registration: any stable string identifies the client.
function getClientId() {
  const clientId = process.env.LICHESS_CLIENT_ID
  if (!clientId) throw new Error('LICHESS_CLIENT_ID is not set')
  return clientId
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url')
}

export function generateState() {
  return crypto.randomBytes(16).toString('base64url')
}

export function codeChallenge(verifier: string) {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}

// The container binds 0.0.0.0, so build the public origin from proxy headers.
export function buildRedirectUri(headers: Headers, fallbackOrigin: string) {
  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (!host) return `${fallbackOrigin}/auth/lichess/callback`
  const proto = headers.get('x-forwarded-proto')?.split(',')[0].trim() ?? 'http'
  return `${proto}://${host.split(',')[0].trim()}/auth/lichess/callback`
}

export function buildAuthorizeUrl({
  redirectUri,
  state,
  codeVerifier,
}: {
  redirectUri: string
  state: string
  codeVerifier: string
}) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: getClientId(),
    redirect_uri: redirectUri,
    scope: SCOPE,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge(codeVerifier),
  })
  return `${AUTHORIZE_URL}?${params}`
}

export async function exchangeCodeForToken({
  code,
  redirectUri,
  codeVerifier,
}: {
  code: string
  redirectUri: string
  codeVerifier: string
}): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: getClientId(),
      code_verifier: codeVerifier,
    }),
  })
  if (!res.ok) throw new Error(`Lichess token exchange failed: ${res.status}`)
  const data = (await res.json()) as {access_token?: string}
  if (!data.access_token) throw new Error('Lichess token response had no access_token')
  return data.access_token
}

export async function fetchLichessAccount(token: string) {
  const res = await fetch(`${API_URL}/account`, {headers: {authorization: `Bearer ${token}`}})
  if (!res.ok) throw new Error(`Lichess account fetch failed: ${res.status}`)
  const data = (await res.json()) as {id: string; username: string}
  return {id: data.id, username: data.username}
}

// Lichess confirms emails itself, so this is the only email we trust for linking.
export async function fetchLichessEmail(token: string): Promise<string | null> {
  const res = await fetch(`${API_URL}/account/email`, {
    headers: {authorization: `Bearer ${token}`},
  })
  if (!res.ok) return null
  const data = (await res.json()) as {email?: string | null}
  return data.email ? normalizeEmail(data.email) : null
}
