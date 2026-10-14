import {requireAdmin} from '@/lib/auth'
import {getCollectionDisplayName} from '@/lib/collectionUtils'
import {db} from '@/lib/db'
import {collections, gameComments, gameTags, games, users} from '@/lib/schema'
import {and, eq, isNotNull, ne, or, sql} from 'drizzle-orm'
import AdminUserTable, {AdminUserRow} from './userTable'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()

  const allUsers = db.select().from(users).all()

  const allCollections = db.select().from(collections).all()

  // Logged game count per collection: games with notes or at least one tag
  const loggedCounts = db
    .select({
      ownerId: collections.ownerId,
      collectionId: games.collectionId,
      count: sql<number>`count(distinct ${games.id})`,
    })
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .leftJoin(gameTags, eq(gameTags.gameId, games.id))
    .where(or(and(isNotNull(games.notes), ne(games.notes, '')), isNotNull(gameTags.gameId)))
    .groupBy(collections.ownerId, games.collectionId)
    .all()

  const loggedByCollection = new Map<string, number>()
  const loggedByUser = new Map<string, number>()
  for (const r of loggedCounts) {
    loggedByCollection.set(r.collectionId, r.count)
    loggedByUser.set(r.ownerId, (loggedByUser.get(r.ownerId) ?? 0) + r.count)
  }

  // Most recent logged game per user (played date, falling back to import date)
  const lastLoggedGames = db
    .select({
      ownerId: collections.ownerId,
      last: sql<string | null>`max(coalesce(${games.gameDttm}, ${games.createdAt}))`,
    })
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .leftJoin(gameTags, eq(gameTags.gameId, games.id))
    .where(or(and(isNotNull(games.notes), ne(games.notes, '')), isNotNull(gameTags.gameId)))
    .groupBy(collections.ownerId)
    .all()

  // Most recent comment posted per user
  const lastComments = db
    .select({
      userId: gameComments.userId,
      last: sql<string | null>`max(${gameComments.createdAt})`,
    })
    .from(gameComments)
    .groupBy(gameComments.userId)
    .all()

  const lastLoggedMap = new Map(lastLoggedGames.map((r) => [r.ownerId, r.last]))
  const lastCommentMap = new Map(lastComments.map((r) => [r.userId, r.last]))

  const collectionsByOwner = new Map<string, typeof allCollections>()
  for (const c of allCollections) {
    const list = collectionsByOwner.get(c.ownerId) ?? []
    list.push(c)
    collectionsByOwner.set(c.ownerId, list)
  }

  const rows: AdminUserRow[] = allUsers.map((u) => {
    const userCollections = (collectionsByOwner.get(u.id) ?? []).map((c) => ({
      id: c.id,
      displayName: getCollectionDisplayName(c),
      deleted: Boolean(c.deletedAt),
      loggedCount: loggedByCollection.get(c.id) ?? 0,
    }))

    const lastActivity = [lastLoggedMap.get(u.id) ?? null, lastCommentMap.get(u.id) ?? null]
      .filter((d): d is string => d !== null)
      .sort()
      .at(-1)

    return {
      id: u.id,
      email: u.email,
      lichessUsername: u.lichessUsername,
      createdAt: u.createdAt,
      totalLoggedCount: loggedByUser.get(u.id) ?? 0,
      lastActivity: lastActivity ?? null,
      collections: userCollections,
    }
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-base-content mb-2">Admin — Users</h1>
        <p className="text-base-content/60 max-w-lg text-sm">
          {rows.length} user{rows.length === 1 ? '' : 's'}. Click a column header to sort.
        </p>
      </div>

      <AdminUserTable rows={rows} />
    </div>
  )
}
