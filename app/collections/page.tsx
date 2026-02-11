import {requireAuth} from '@/lib/auth'
import {getCollectionDisplayName} from '@/lib/collectionUtils'
import {db} from '@/lib/db'
import {collections, games, gameTags} from '@/lib/schema'
import {and, eq, isNotNull, ne, or, sql} from 'drizzle-orm'
import CreateNew from '../ui/createNew/createNew'
import CollectionCard from './collectionCard'

export const dynamic = 'force-dynamic'

export default async function PrivatePage() {
  const user = await requireAuth()

  const userCollections = db
    .select()
    .from(collections)
    .where(eq(collections.ownerId, user.id))
    .all()

  // Total game count per collection
  const totalCounts = db
    .select({
      collectionId: games.collectionId,
      count: sql<number>`count(${games.id})`,
    })
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .where(eq(collections.ownerId, user.id))
    .groupBy(games.collectionId)
    .all()

  // Logged game count: games with notes or at least one tag
  const loggedCounts = db
    .select({
      collectionId: games.collectionId,
      count: sql<number>`count(distinct ${games.id})`,
    })
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .leftJoin(gameTags, eq(gameTags.gameId, games.id))
    .where(
      and(
        eq(collections.ownerId, user.id),
        or(and(isNotNull(games.notes), ne(games.notes, '')), isNotNull(gameTags.gameId)),
      ),
    )
    .groupBy(games.collectionId)
    .all()

  const totalCountMap = new Map(totalCounts.map((r) => [r.collectionId, r.count]))
  const loggedCountMap = new Map(loggedCounts.map((r) => [r.collectionId, r.count]))

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-base-content mb-2">My Collections</h1>
        <p className="text-base-content/60 max-w-lg text-sm">
          Collections group your games for review and annotation. Import games from Chess.com or
          Lichess, or create a manual collection. Add tags and notes to track patterns in your play.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:gap-4">
        {userCollections?.map((c) => {
          const displayName = getCollectionDisplayName(c)
          return (
            <CollectionCard
              key={c.id}
              id={c.id}
              title={displayName}
              site={c.site}
              username={c.username}
              timeClass={c.timeClass}
              totalGameCount={totalCountMap.get(c.id) ?? 0}
              loggedGameCount={loggedCountMap.get(c.id) ?? 0}
            />
          )
        })}

        <CreateNew />
      </div>
    </div>
  )
}
