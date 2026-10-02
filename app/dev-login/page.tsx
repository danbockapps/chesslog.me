import {notFound} from 'next/navigation'
import {asc, ne} from 'drizzle-orm'
import {db} from '@/lib/db'
import {users} from '@/lib/schema'
import {devLogin} from './actions'

const SYSTEM_USER_ID = 'system-00000000-0000-0000-0000-000000000000'

export default async function DevLoginPage() {
  if (process.env.NODE_ENV !== 'development') notFound()

  const allUsers = db
    .select({id: users.id, email: users.email})
    .from(users)
    .where(ne(users.id, SYSTEM_USER_ID))
    .orderBy(asc(users.email))
    .all()

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Dev login</h1>
          <p className="text-base-content/70 text-sm">
            Click a user to sign in as them — dev only, no password required.
          </p>

          {allUsers.length === 0 ? (
            <p className="text-base-content/60 mt-4 text-sm">No users in the database yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {allUsers.map((user) => (
                <li key={user.id}>
                  <form action={devLogin}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button type="submit" className="btn btn-outline btn-block justify-start">
                      {user.email}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
