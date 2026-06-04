import {Lucia, TimeSpan} from 'lucia'
import {BetterSqlite3Adapter} from '@lucia-auth/adapter-sqlite'
import {sqlite} from './db'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'

// Create Lucia adapter for better-sqlite3 (needs raw sqlite instance, not Drizzle)
const adapter = new BetterSqlite3Adapter(sqlite, {
  user: 'users',
  session: 'sessions',
})

// Initialize Lucia
export const lucia = new Lucia(adapter, {
  // Sessions effectively never expire. This app is low-security; there's no
  // reason to log a user out after a period of time. ~1000 years.
  sessionExpiresIn: new TimeSpan(52000, 'w'),
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
  }),
})

// TypeScript declarations for Lucia
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseUserAttributes {
  email: string
}

/**
 * Helper: Get current authenticated user or redirect to login
 * Use this in Server Components and Server Actions to ensure user is authenticated
 */
export async function requireAuth() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value

  if (!sessionId) {
    redirect('/login')
  }

  const {user, session} = await lucia.validateSession(sessionId)

  if (!user) {
    // Cookie is present but the session is invalid (e.g. the row no longer
    // exists). Route through /logout to clear the stale cookie; otherwise the
    // middleware (which only checks for cookie presence) bounces /login back
    // to here and we get an infinite redirect loop.
    redirect('/logout')
  }

  // Refresh session if needed. cookies().set() throws during a Server Component
  // render, so guard it — the refresh is best-effort.
  if (session && session.fresh) {
    try {
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    } catch {}
  }

  return user
}

/**
 * Helper: Get current user without redirecting
 * Returns null if no valid session
 * Useful for optional authentication scenarios
 */
export async function getUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value

  if (!sessionId) {
    return null
  }

  const {user, session} = await lucia.validateSession(sessionId)

  if (!user) {
    return null
  }

  // Refresh session if needed. cookies().set() throws during a Server Component
  // render, so guard it — the refresh is best-effort.
  if (session && session.fresh) {
    try {
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    } catch {}
  }

  return user
}
