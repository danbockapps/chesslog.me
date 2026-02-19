'use server'

import {cookies} from 'next/headers'
import {lucia} from '@/lib/auth'
import {db} from '@/lib/db'
import {users, profiles} from '@/lib/schema'
import {hash} from 'bcrypt'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

export async function signup(email: string, password: string) {
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  // Hash password
  const hashedPassword = await hash(password, 10)

  // Generate user ID
  const userId = crypto.randomUUID()

  try {
    // Create user and profile in a transaction
    db.transaction((tx) => {
      tx.insert(users)
        .values({
          id: userId,
          email: email.toLowerCase(),
          hashedPassword,
        })
        .run()

      tx.insert(profiles)
        .values({
          id: userId,
        })
        .run()
    })
  } catch (error: any) {
    // Handle unique constraint violation (duplicate email)
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('An account with this email already exists')
    }
    console.error('Failed to create account:', error)
    throw new Error('Failed to create account')
  }

  // Create session
  const session = await lucia.createSession(userId, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  cookieStore.set('user_email', email.toLowerCase(), {path: '/', httpOnly: true, sameSite: 'lax'})

  revalidatePath('/', 'layout')
  redirect('/collections')
}
