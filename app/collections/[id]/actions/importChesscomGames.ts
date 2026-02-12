'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {ChesscomGame, transformChesscomGame, saveGames} from '@/lib/gameImport'
import {collections} from '@/lib/schema'
import {and, eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

export type {ChesscomResult} from '@/lib/gameImport'

const importChesscomGames = async (
  collectionId: string,
  lastRefreshed: Date | null,
  username: string,
  timeClass: string | null = null,
) => {
  const user = await requireAuth()
  const owned = db
    .select({id: collections.id})
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.ownerId, user.id)))
    .get()
  if (!owned) throw new Error('Unauthorized')

  console.log('importChesscomGames')
  console.time('importChesscomGames')

  const archivesResult = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`)
  const archivesData = (await archivesResult.json()) as {archives: string[]}

  // Parse year/month from archive URLs like ".../games/2023/01"
  const archiveMonths = archivesData.archives.map((url) => {
    const parts = url.split('/')
    return {year: parseInt(parts[parts.length - 2]), jsMonth: parseInt(parts[parts.length - 1]) - 1}
  })

  // Include months at or after lastRefreshed's month (game-level filter handles within-month precision)
  const monthsToFetch = archiveMonths.filter(({year, jsMonth}) => {
    if (!lastRefreshed) return true
    const lastYear = lastRefreshed.getFullYear()
    const lastMonth = lastRefreshed.getMonth()
    return year > lastYear || (year === lastYear && jsMonth >= lastMonth)
  })

  // Cap at 2 most recent months
  for (const {year, jsMonth} of monthsToFetch.slice(-2)) {
    await importChesscomGamesForMonth({
      year,
      jsMonth,
      username,
      collectionId,
      lastRefreshed,
      timeClass,
    })
  }

  console.timeEnd('importChesscomGames')
  revalidatePath(`/collections/${collectionId}`)
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
  const data = (await result.json()) as {games: ChesscomGame[]}
  console.timeLog('importChesscomGames', `fetched ${data.games.length} games`)

  try {
    const gamesData = data.games
      .filter((g) => !lastRefreshed || new Date(g.end_time * 1000) > lastRefreshed)
      .filter((g) => !timeClass || g.time_class === timeClass)
      .map((g) => transformChesscomGame(g, collectionId))

    saveGames(gamesData, collectionId, 'chesscom')

    console.timeLog('importChesscomGames', 'attempted to insert')
  } catch (e) {
    console.log('Caught error inserting games for Chess.com')
    console.error(e)
  }
}

export default importChesscomGames
