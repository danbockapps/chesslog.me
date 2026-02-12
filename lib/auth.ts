import {Lucia} from 'lucia'
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
    redirect('/login')
  }

  // Refresh session if needed
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
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

  // Refresh session if needed
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  }

  return user
}
