'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {fetchLichessGames, LichessGame, saveGames, transformLichessGame} from '@/lib/gameImport'
import {collections} from '@/lib/schema'
import {and, eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

const importLichessGames = async (
  collectionId: string,
  lastRefreshed: Date | null,
  username: string,
  timeClass: string | null = null,
): Promise<{error: string} | undefined> => {
  const user = await requireAuth()
  const owned = db
    .select({id: collections.id})
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.ownerId, user.id)))
    .get()
  if (!owned) throw new Error('Unauthorized')

  console.log('importLichessGames')
  console.time('importLichessGames')

  const baseParams: Record<string, string> = {
    max: '20',
    since: `${lastRefreshed?.getTime() ?? ''}`,
    moves: 'false',
    opening: 'true',
    lastFen: 'true',
  }

  try {
    let data: LichessGame[]
    if (timeClass) {
      // Lichess bug: perfType filter sometimes omits the very latest games.
      // Fetch both filtered and unfiltered in parallel, then merge. The DB
      // unique constraint handles deduplication on insert.
      const [filtered, all] = await Promise.all([
        fetchLichessGames(username, {...baseParams, perfType: timeClass}),
        fetchLichessGames(username, baseParams),
      ])
      const allFiltered = all.filter((g) => g.perf === timeClass)
      data = [...filtered, ...allFiltered]
    } else {
      data = await fetchLichessGames(username, baseParams)
    }

    console.timeLog('importLichessGames', `fetched ${data.length} games`)

    if (data.length > 0) {
      const gamesData = data.map((g) => transformLichessGame(g, collectionId))
      saveGames(gamesData, collectionId, 'lichess')
      console.timeLog('importLichessGames', 'inserted')
    }

    console.timeEnd('importLichessGames')
    revalidatePath(`/collections/${collectionId}`)
  } catch (e) {
    console.error('importLichessGames error:', e)
    return {error: 'Failed to connect to Lichess. Please try again.'}
  }
}

export default importLichessGames
