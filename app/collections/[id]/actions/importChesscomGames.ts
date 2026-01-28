'use server'

import {requireAuth, requireOwnership} from '@/lib/auth'
import {db} from '@/lib/db'
import {collections, games} from '@/lib/schema'
import {eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

const importChesscomGames = async (
  collectionId: string,
  lastRefreshed: Date | null,
  username: string,
  timeClass: string | null = null,
) => {
  // Verify user owns this collection
  const user = await requireAuth()
  await requireOwnership(collectionId, user.id)

  console.log('importChesscomGames')
  console.time('importChesscomGames')

  const currentDate = new Date()

  const numCurrentMonthGames = await importChesscomGamesForMonth({
    year: currentDate.getFullYear(),
    jsMonth: currentDate.getMonth(),
    username,
    collectionId,
    lastRefreshed,
    timeClass,
  })

  if (
    (!lastRefreshed && numCurrentMonthGames < 25) ||
    currentDate.getMonth() !== lastRefreshed?.getMonth() ||
    currentDate.getFullYear() !== lastRefreshed?.getFullYear()
  ) {
    await importChesscomGamesForMonth({
      year:
        currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear(),
      jsMonth: currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1,
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
  const data = (await result.json()) as {games: Game[]}
  console.timeLog('importChesscomGames', `fetched ${data.games.length} games`)

  try {
    const gamesData = data.games
      .filter((g) => !lastRefreshed || new Date(g.end_time * 1000) > lastRefreshed)
      .filter((g) => !timeClass || g.time_class === timeClass)
      .map((g) => ({
        site: 'chess.com' as const,
        collectionId,
        eco: g.eco,
        fen: g.fen,
        gameDttm: new Date(g.end_time * 1000).toISOString(),
        timeControl: g.time_control,
        url: g.url,
        whiteUsername: g.white.username,
        blackUsername: g.black.username,
        whiteRating: g.white.rating,
        blackRating: g.black.rating,
        whiteResult: g.white.result,
        blackResult: g.black.result,
      }))

    if (gamesData.length > 0) {
      db.insert(games).values(gamesData).onConflictDoNothing({target: games.url}).run()
    }

    console.timeLog('importChesscomGames', 'attempted to insert')

    // Update last refreshed timestamp
    db.update(collections)
      .set({lastRefreshed: new Date().toISOString()})
      .where(eq(collections.id, collectionId))
      .run()
  } catch (e) {
    console.log('Caught error inserting games for Chess.com')
    console.error(e)
  }

  return data.games.length
}

interface Player {
  rating: number
  result: ChesscomResult
  '@id': string
  username: string
  uuid: string
}

export type ChesscomResult =
  | 'repetition'
  | 'abandoned'
  | 'checkmated'
  | 'stalemate'
  | 'insufficient'
  | 'agreed'
  | 'timeout'
  | 'timevsinsufficient'
  | 'win'
  | 'resigned'

interface Game {
  url: string
  pgn: string
  time_control: string
  end_time: number
  rated: boolean
  tcn: string
  uuid: string
  initial_setup: string
  fen: string
  time_class: string
  rules: string
  white: Player
  black: Player
  eco: string
}

export default importChesscomGames
