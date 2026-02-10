import {db} from '@/lib/db'
import {collections, games} from '@/lib/schema'
import {eq} from 'drizzle-orm'

// Chess.com types

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

interface ChesscomPlayer {
  rating: number
  result: ChesscomResult
  '@id': string
  username: string
  uuid: string
}

export interface ChesscomGame {
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
  white: ChesscomPlayer
  black: ChesscomPlayer
  eco: string
}

// Lichess types

interface LichessUser {
  name: string
  flair?: string
  patron?: boolean
  id: string
}

interface LichessPlayer {
  user?: LichessUser
  rating: number
}

interface LichessOpening {
  eco: string
  name: string
  ply: number
}

interface LichessClock {
  initial: number
  increment: number
  totalTime: number
}

export interface LichessGame {
  id: string
  rated: boolean
  variant: string
  speed: string
  perf: string
  createdAt: number
  lastMoveAt: number
  status: string
  source: string
  players: {white: LichessPlayer; black: LichessPlayer}
  winner: string
  opening?: LichessOpening
  clock: LichessClock
  lastFen: string
  lastMove: string
}

// Transform functions

export function transformChesscomGame(g: ChesscomGame, collectionId: string) {
  return {
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
  }
}

export function transformLichessGame(g: LichessGame, collectionId: string) {
  return {
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
  }
}

// Fetch helpers

export async function fetchLichessGames(
  username: string,
  params: Record<string, string>,
): Promise<LichessGame[]> {
  const url = `https://lichess.org/api/games/user/${username}?${new URLSearchParams(params)}`

  console.log('fetchLichessGames', url)
  console.time('fetchLichessGames')

  const qr = await fetch(url, {
    headers: {accept: 'application/x-ndjson', Authorization: 'Bearer ' + process.env.LICHESS_TOKEN},
  })

  const text = await qr.text()

  console.timeEnd('fetchLichessGames')

  return text
    .split(/\r?\n/)
    .map((l) => (l.trim() ? JSON.parse(l) : null))
    .filter((l): l is LichessGame => l !== null)
}

// DB helpers

export function saveGames(
  gamesData: (typeof games.$inferInsert)[],
  collectionId: string,
  conflictTarget: 'chesscom' | 'lichess',
) {
  if (gamesData.length === 0) return

  const target =
    conflictTarget === 'chesscom'
      ? [games.collectionId, games.url]
      : [games.collectionId, games.lichessGameId]

  db.insert(games).values(gamesData).onConflictDoNothing({target}).run()

  db.update(collections)
    .set({lastRefreshed: new Date().toISOString()})
    .where(eq(collections.id, collectionId))
    .run()
}
