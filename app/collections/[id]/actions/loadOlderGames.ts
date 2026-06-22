'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {
  ChesscomGame,
  fetchLichessGames,
  LichessGame,
  saveGames,
  transformChesscomGame,
  transformLichessGame,
} from '@/lib/gameImport'
import {collections, games} from '@/lib/schema'
import {asc, eq, sql} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

// How many additional (older) games to try to load per click.
const LOAD_COUNT = 20
// Bound the number of Chess.com monthly archives we'll scan in a single click.
const MAX_CHESSCOM_MONTHS = 12

/**
 * Load games that occurred earlier than the earliest game currently stored in the collection.
 * Mirrors the refresh import, but reaches backwards in time instead of forwards. New games beyond
 * the oldest one are upserted (the unique constraint dedupes), so calling this repeatedly walks
 * further into the collection's history.
 */
const loadOlderGames = async (collectionId: string): Promise<{error: string} | {added: number}> => {
  const user = await requireAuth()

  const collection = db
    .select({
      ownerId: collections.ownerId,
      site: collections.site,
      username: collections.username,
      timeClass: collections.timeClass,
    })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get()

  if (!collection || collection.ownerId !== user.id) throw new Error('Unauthorized')

  const {site, username, timeClass} = collection
  if (!username || (site !== 'chess.com' && site !== 'lichess')) {
    return {error: 'Loading older games is only supported for Chess.com and Lichess collections.'}
  }

  // Anchor on the earliest game we already have. If the collection is empty there's nothing to
  // page back from — the normal refresh handles that case.
  const earliest = db
    .select({gameDttm: games.gameDttm})
    .from(games)
    .where(eq(games.collectionId, collectionId))
    .orderBy(asc(games.gameDttm))
    .limit(1)
    .get()
  if (!earliest?.gameDttm) return {added: 0}
  const earliestDate = new Date(earliest.gameDttm)

  console.log('loadOlderGames')
  console.time('loadOlderGames')

  try {
    const before = countGames(collectionId)

    if (site === 'lichess') {
      await loadOlderLichessGames(collectionId, username, timeClass, earliestDate)
    } else {
      await loadOlderChesscomGames(collectionId, username, timeClass, earliestDate)
    }

    const added = countGames(collectionId) - before
    console.timeEnd('loadOlderGames')
    revalidatePath(`/collections/${collectionId}`)
    return {added}
  } catch (e) {
    console.error('loadOlderGames error:', e)
    return {
      error: `Failed to connect to ${
        site === 'lichess' ? 'Lichess' : 'Chess.com'
      }. Please try again.`,
    }
  }
}

const loadOlderLichessGames = async (
  collectionId: string,
  username: string,
  timeClass: string | null,
  earliestDate: Date,
) => {
  // `until` is inclusive; the boundary game already exists and is deduped on insert.
  const baseParams: Record<string, string> = {
    max: `${LOAD_COUNT}`,
    until: `${earliestDate.getTime()}`,
    moves: 'false',
    opening: 'true',
    lastFen: 'true',
  }

  let data: LichessGame[]
  if (timeClass) {
    // Lichess bug: perfType filter sometimes omits games. Fetch both and merge (see import).
    const [filtered, all] = await Promise.all([
      fetchLichessGames(username, {...baseParams, perfType: timeClass}),
      fetchLichessGames(username, baseParams),
    ])
    data = [...filtered, ...all.filter((g) => g.perf === timeClass)]
  } else {
    data = await fetchLichessGames(username, baseParams)
  }

  if (data.length > 0) {
    saveGames(
      data.map((g) => transformLichessGame(g, collectionId)),
      collectionId,
      'lichess',
    )
  }
}

const loadOlderChesscomGames = async (
  collectionId: string,
  username: string,
  timeClass: string | null,
  earliestDate: Date,
) => {
  const archivesResult = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`)
  if (!archivesResult.ok) {
    throw new Error(`Chess.com API returned ${archivesResult.status} for archives`)
  }
  const archivesData = (await archivesResult.json()) as {archives: string[]}

  const earliestYear = earliestDate.getFullYear()
  const earliestMonth = earliestDate.getMonth()

  // Months at or before the earliest game's month, scanned newest-first so we find the next
  // chunk of older games closest to what we already have.
  const candidateMonths = archivesData.archives
    .map((url) => {
      const parts = url.split('/')
      return {
        year: parseInt(parts[parts.length - 2]),
        jsMonth: parseInt(parts[parts.length - 1]) - 1,
      }
    })
    .filter(
      ({year, jsMonth}) =>
        year < earliestYear || (year === earliestYear && jsMonth <= earliestMonth),
    )
    .sort((a, b) => b.year - a.year || b.jsMonth - a.jsMonth)
    .slice(0, MAX_CHESSCOM_MONTHS)

  let collected = 0
  for (const {year, jsMonth} of candidateMonths) {
    const mm = `${jsMonth < 9 ? '0' : ''}${jsMonth + 1}`
    const result = await fetch(`https://api.chess.com/pub/player/${username}/games/${year}/${mm}`)
    if (!result.ok) continue
    const data = (await result.json()) as {games: ChesscomGame[]}

    const gamesData = data.games
      .filter((g) => new Date(g.end_time * 1000) < earliestDate)
      .filter((g) => !timeClass || g.time_class === timeClass)
      .map((g) => transformChesscomGame(g, collectionId))

    if (gamesData.length > 0) {
      saveGames(gamesData, collectionId, 'chesscom')
      collected += gamesData.length
    }

    if (collected >= LOAD_COUNT) break
  }
}

const countGames = (collectionId: string): number =>
  db
    .select({count: sql<number>`count(*)`})
    .from(games)
    .where(eq(games.collectionId, collectionId))
    .get()?.count ?? 0

export default loadOlderGames
