import {Lucia} from 'lucia'
import {BetterSqlite3Adapter} from '@lucia-auth/adapter-sqlite'
import {db, sqlite} from './db'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {collections} from './schema'
import {eq, and} from 'drizzle-orm'

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
  const cookieStore = cookies()
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
 * Helper: Verify user owns a collection
 * Throws error if collection doesn't exist or user is not the owner
 */
export async function requireOwnership(collectionId: string, userId: string) {
  const collection = db
    .select()
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.ownerId, userId)))
    .get()

  if (!collection) {
    throw new Error('Unauthorized: Collection not found or access denied')
  }

  return collection
}

/**
 * Helper: Get current user without redirecting
 * Returns null if no valid session
 * Useful for optional authentication scenarios
 */
export async function getUser() {
  const cookieStore = cookies()
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
