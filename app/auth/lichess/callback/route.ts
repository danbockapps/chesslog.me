import crypto from 'crypto'
import {hash} from 'bcrypt'
import {eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'
import {cookies} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'
import {lucia, startSession} from '@/lib/auth'
import {db} from '@/lib/db'
import {
  STATE_COOKIE,
  VERIFIER_COOKIE,
  buildRedirectUri,
  exchangeCodeForToken,
  fetchLichessAccount,
  fetchLichessEmail,
  normalizeEmail,
} from '@/lib/lichessOAuth'
import {profiles, users} from '@/lib/schema'

export async function GET(request: NextRequest) {
  // nextUrl.origin is 0.0.0.0 in the container, so derive the public origin from proxy headers
  const redirectUri = buildRedirectUri(request.headers, request.nextUrl.origin)
  const origin = new URL(redirectUri).origin
  const fail = (error: string) => NextResponse.redirect(new URL(`/login?error=${error}`, origin))

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get(VERIFIER_COOKIE)?.value
  const expectedState = cookieStore.get(STATE_COOKIE)?.value
  cookieStore.delete(VERIFIER_COOKIE)
  cookieStore.delete(STATE_COOKIE)

  if (!code || !state || !codeVerifier || state !== expectedState) return fail('lichess')

  let lichessId: string
  let lichessUsername: string
  let email: string | null
  try {
    const token = await exchangeCodeForToken({code, redirectUri, codeVerifier})
    const account = await fetchLichessAccount(token)
    lichessId = account.id
    lichessUsername = account.username
    email = await fetchLichessEmail(token)
  } catch (e) {
    console.error('Lichess login failed', e)
    return fail('lichess')
  }

  let userId: string
  let userEmail: string

  const byLichessId = db.select().from(users).where(eq(users.lichessId, lichessId)).get()
  if (byLichessId) {
    // Returning Lichess user. Keep the stored email.
    db.update(users).set({lichessUsername}).where(eq(users.id, byLichessId.id)).run()
    userId = byLichessId.id
    userEmail = byLichessId.email
  } else {
    if (!email) return fail('lichess-no-email')

    const byEmail = db
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(email)))
      .get()
    if (byEmail) {
      // Never overwrite a different Lichess account that is already linked.
      if (byEmail.lichessId) return fail('lichess')

      // The email is Lichess-confirmed, so link. The local account's email was never
      // verified, so revoke any sessions that may belong to someone else.
      db.update(users)
        .set({lichessId, lichessUsername, emailVerified: 1})
        .where(eq(users.id, byEmail.id))
        .run()
      await lucia.invalidateUserSessions(byEmail.id)
      userId = byEmail.id
      userEmail = byEmail.email
    } else {
      // Lichess-only accounts get an unusable password hash.
      const hashedPassword = await hash(crypto.randomBytes(32).toString('hex'), 10)
      userId = crypto.randomUUID()
      userEmail = normalizeEmail(email)
      try {
        db.transaction((tx) => {
          tx.insert(users)
            .values({
              id: userId,
              email: userEmail,
              hashedPassword,
              emailVerified: 1,
              lichessId,
              lichessUsername,
            })
            .run()
          tx.insert(profiles).values({id: userId}).run()
        })
      } catch (e) {
        console.error('Lichess signup failed', e)
        return fail('lichess')
      }
    }
  }

  await startSession(userId, userEmail)
  revalidatePath('/', 'layout')
  return NextResponse.redirect(new URL('/collections', origin))
}
