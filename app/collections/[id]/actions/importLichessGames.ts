'use server'

import {requireAuth, requireOwnership} from '@/lib/auth'
import {db} from '@/lib/db'
import {collections, games} from '@/lib/schema'
import {eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

const importLichessGames = async (
  collectionId: string,
  lastRefreshed: Date | null,
  username: string,
  timeClass: string | null = null,
) => {
  // Verify user owns this collection
  const user = await requireAuth()
  await requireOwnership(collectionId, user.id)

  console.log('importLichessGames')
  console.time('importLichessGames')

  const params: Record<string, string> = {
    max: '100',
    since: `${lastRefreshed?.getTime() ?? ''}`,
    moves: 'false',
    opening: 'true',
    lastFen: 'true',
  }

  // Add perfType filter if timeClass is specified
  if (timeClass) {
    params.perfType = timeClass
  }

  const url = `https://lichess.org/api/games/user/${username}?${new URLSearchParams(params)}`

  const qr = await fetch(url, {
    headers: {accept: 'application/x-ndjson', Authorization: 'Bearer ' + process.env.LICHESS_TOKEN},
  })

  console.timeLog('importLichessGames', 'HTTP status', qr.status, qr.statusText)
  const text = await qr.text()
  console.timeLog('importLichessGames', `fetched ${text.length} bytes`)

  const data: Game[] = text
    .split(/\r?\n/)
    .map((l) => (l.trim() ? JSON.parse(l) : null))
    .filter((l) => l)

  if (data.length > 0) {
    try {
      const gamesData = data.map((g) => ({
        site: 'lichess' as const,
        collectionId,
        eco: g.opening?.name ?? null,
        fen: g.lastFen,
        gameDttm: new Date(g.createdAt).toISOString(),
        clockInitial: g.clock.initial ?? null,
        clockIncrement: g.clock.increment ?? null,
        lichessGameId: g.id,
        whiteUsername: g.players.white.user?.name ?? 'Unknown',
        blackUsername: g.players.black.user?.name ?? 'Unknown',
        whiteRating: g.players.white.rating,
        blackRating: g.players.black.rating,
        winner: g.winner,
      }))

      db.insert(games)
        .values(gamesData)
        .onConflictDoNothing({target: [games.collectionId, games.lichessGameId]})
        .run()

      console.timeLog('importLichessGames', 'inserted')

      // Update last refreshed timestamp
      db.update(collections)
        .set({lastRefreshed: new Date().toISOString()})
        .where(eq(collections.id, collectionId))
        .run()
    } catch (e) {
      console.log('Caught error inserting games for Lichess')
      console.error(e)
    }
  }

  console.timeEnd('importLichessGames')
  revalidatePath(`/collections/${collectionId}`)
}

interface User {
  name: string
  flair?: string
  patron?: boolean
  id: string
}

interface Player {
  user: User
  rating: number
}

interface Players {
  white: Player
  black: Player
}

interface Opening {
  eco: string
  name: string
  ply: number
}

interface Clock {
  initial: number
  increment: number
  totalTime: number
}

interface Game {
  id: string
  rated: boolean
  variant: string
  speed: string
  perf: string
  createdAt: number
  lastMoveAt: number
  status: string
  source: string
  players: Players
  winner: string
  opening?: Opening
  clock: Clock
  lastFen: string
  lastMove: string
}

export default importLichessGames
