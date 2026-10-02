'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {cookies} from 'next/headers'
import {eq} from 'drizzle-orm'
import {lucia} from '@/lib/auth'
import {db} from '@/lib/db'
import {users} from '@/lib/schema'

export async function devLogin(formData: FormData) {
  if (process.env.NODE_ENV !== 'development') return

  const userId = formData.get('userId') as string
  if (!userId) return

  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user) return

  const session = await lucia.createSession(user.id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  cookieStore.set('user_email', user.email, {path: '/', httpOnly: true, sameSite: 'lax'})

  revalidatePath('/', 'layout')
  redirect('/collections')
}
