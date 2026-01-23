'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {cookies} from 'next/headers'
import {lucia} from '@/lib/auth'
import {db} from '@/lib/db'
import {users} from '@/lib/schema'
import {eq} from 'drizzle-orm'
import {compare} from 'bcrypt'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=400')
  }

  // Find user by email
  const user = db.select().from(users).where(eq(users.email, email.toLowerCase())).get()

  if (!user) {
    redirect('/login?error=400')
  }

  // Verify password
  const validPassword = await compare(password, user.hashedPassword)

  if (!validPassword) {
    redirect('/login?error=400')
  }

  // Create session
  const session = await lucia.createSession(user.id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

  revalidatePath('/', 'layout')
  redirect('/collections')
}

export async function logout() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value

  if (sessionId) {
    await lucia.invalidateSession(sessionId)
  }

  const sessionCookie = lucia.createBlankSessionCookie()
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

  revalidatePath('/', 'layout')
  redirect('/login')
}
