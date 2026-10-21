'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {ChesscomGame, transformChesscomGame, saveGames} from '@/lib/gameImport'
import {collections} from '@/lib/schema'
import {and, eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

export type {ChesscomResult} from '@/lib/gameImport'

// Cap for the first-import backwards walk so a user with very few games doesn't trigger an
// unbounded number of archive fetches. Anything older is covered by "load older".
const MAX_BACKFILL_MONTHS = 6

const importChesscomGames = async (
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

  console.log('importChesscomGames')
  console.time('importChesscomGames')

  try {
    const archivesResult = await fetch(
      `https://api.chess.com/pub/player/${username}/games/archives`,
    )
    if (!archivesResult.ok) {
      return {error: `Could not load Chess.com archives (${archivesResult.status})`}
    }
    const archivesData = (await archivesResult.json()) as {archives: string[]}

    // Parse year/month from archive URLs like ".../games/2023/01"
    const archiveMonths = archivesData.archives.map((url) => {
      const parts = url.split('/')
      return {
        year: parseInt(parts[parts.length - 2]),
        jsMonth: parseInt(parts[parts.length - 1]) - 1,
      }
    })

    // Incremental refresh: Chess.com places a game in the archive month in which it ENDED, so
    // fetching months from lastRefreshed's month onward (capped) plus an end_time filter is
    // guaranteed not to miss anything, and keeps refreshes cheap.
    //
    // First import (lastRefreshed null — the creation auto-import may have found nothing): the
    // newest matching game can be many months old (a Daily collection where the last game
    // finished 6 months ago), so walk backwards newest-first until a month yields matching
    // games, up to a cap. Older games beyond that come in via "load older".
    const monthsToFetch: typeof archiveMonths = []
    if (lastRefreshed) {
      const lastYear = lastRefreshed.getFullYear()
      const lastMonth = lastRefreshed.getMonth()
      monthsToFetch.push(
        ...[...archiveMonths]
          .reverse()
          .filter(
            ({year, jsMonth}) => year > lastYear || (year === lastYear && jsMonth >= lastMonth),
          )
          .slice(0, 2),
      )
    } else {
      for (const month of [...archiveMonths].reverse().slice(0, MAX_BACKFILL_MONTHS)) {
        monthsToFetch.push(month)
        const count = await importChesscomGamesForMonth({
          ...month,
          username,
          collectionId,
          lastRefreshed: null,
          timeClass,
        })
        if (count > 0) break
      }
    }

    for (const {year, jsMonth} of monthsToFetch) {
      await importChesscomGamesForMonth({
        year,
        jsMonth,
        username,
        collectionId,
        timeClass,
        lastRefreshed,
      })
    }

    console.timeEnd('importChesscomGames')
    revalidatePath(`/collections/${collectionId}`)
  } catch (e) {
    console.error('importChesscomGames error:', e)
    return {error: 'Failed to connect to Chess.com. Please try again.'}
  }
}

interface ImportChesscomGamesForMonthProps {
  year: number
  jsMonth: number
  username: string
  collectionId: string
  lastRefreshed: Date | null
  timeClass: string | null
}

const importChesscomGamesForMonth = async ({
  year,
  jsMonth,
  username,
  collectionId,
  lastRefreshed,
  timeClass,
}: ImportChesscomGamesForMonthProps) => {
  const mm = `${jsMonth < 9 ? '0' : ''}${jsMonth + 1}`
  console.timeLog('importChesscomGames', `fetching games for ${year}-${mm}`)
  const result = await fetch(`https://api.chess.com/pub/player/${username}/games/${year}/${mm}`)
  if (!result.ok) {
    throw new Error(`Chess.com API returned ${result.status} for ${year}-${mm}`)
  }
  const data = (await result.json()) as {games: ChesscomGame[]}
  console.timeLog('importChesscomGames', `fetched ${data.games.length} games`)

  const gamesData = data.games
    .filter((g) => !lastRefreshed || new Date(g.end_time * 1000) > lastRefreshed)
    .filter((g) => !timeClass || g.time_class === timeClass)
    .map((g) => transformChesscomGame(g, collectionId))

  saveGames(gamesData, collectionId, 'chesscom')

  console.timeLog('importChesscomGames', 'attempted to insert')
  return gamesData.length
}

export default importChesscomGames
