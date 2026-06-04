import {lucia} from '@/lib/auth'
import {NextResponse, type NextRequest} from 'next/server'

// GET counterpart to the logout() server action in app/login/actions.ts.
//
// A navigable URL is needed (rather than reusing the server action) because
// requireAuth() runs during a Server Component render and can only redirect()
// to a URL — it can't invoke a server action. This is the self-healing target
// when requireAuth() finds a present-but-invalid session cookie: clearing the
// cookie here breaks the /collections <-> /login redirect loop that would
// otherwise occur (the middleware treats any cookie as "logged in", while the
// page validates the session for real).
//
// Kept in parity with the logout() action: invalidate the session, clear the
// session cookie, and delete user_email.
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(lucia.sessionCookieName)?.value
  if (sessionId) {
    await lucia.invalidateSession(sessionId)
  }

  const blank = lucia.createBlankSessionCookie()
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set(blank.name, blank.value, blank.attributes)
  response.cookies.delete('user_email')
  return response
}
