'use server'

import {db} from '@/lib/db'
import {games, gameTags, tags} from '@/lib/schema'
import {and, desc, eq, or, sql} from 'drizzle-orm'

export interface TagStat {
  name: string
  count: number
  public: boolean
}

export interface ResultStats {
  wins: number
  draws: number
  losses: number
}

/**
 * Get tag distribution for a collection
 * Returns tags sorted by frequency (most common first)
 */
export async function getTagDistribution(collectionId: string, userId: string): Promise<TagStat[]> {
  const countColumn = sql<number>`COUNT(${gameTags.gameId})`.as('count')

  const result = db
    .select({
      name: tags.name,
      count: countColumn,
      public: tags.public,
    })
    .from(tags)
    .innerJoin(gameTags, eq(tags.id, gameTags.tagId))
    .innerJoin(games, eq(gameTags.gameId, games.id))
    .where(
      and(
        eq(games.collectionId, collectionId),
        or(eq(tags.ownerId, userId), eq(tags.public, true)),
      ),
    )
    .groupBy(tags.id)
    .orderBy(desc(countColumn))
    .limit(15)
    .all()

  return result.map((row) => ({
    name: row.name,
    count: Number(row.count),
    public: Boolean(row.public),
  }))
}

/**
 * Get win/loss/draw statistics for a collection
 * Handles both Chess.com and Lichess result formats
 */
export async function getResultStats(
  collectionId: string,
  username: string,
  site: 'chess.com' | 'lichess',
): Promise<ResultStats> {
  const allGames = db
    .select({
      whiteUsername: games.whiteUsername,
      blackUsername: games.blackUsername,
      whiteResult: games.whiteResult,
      blackResult: games.blackResult,
      winner: games.winner,
    })
    .from(games)
    .where(eq(games.collectionId, collectionId))
    .all()

  const stats = {wins: 0, draws: 0, losses: 0}

  for (const game of allGames) {
    if (site === 'chess.com') {
      const isWhite = game.whiteUsername === username
      const myResult = isWhite ? game.whiteResult : game.blackResult

      if (myResult === 'win') {
        stats.wins++
      } else if (['checkmated', 'timeout', 'resigned', 'abandoned'].includes(myResult ?? '')) {
        stats.losses++
      } else {
        stats.draws++
      }
    } else {
      // Lichess
      const isWhite = game.whiteUsername === username

      if (game.winner === 'draw') {
        stats.draws++
      } else if ((isWhite && game.winner === 'white') || (!isWhite && game.winner === 'black')) {
        stats.wins++
      } else {
        stats.losses++
      }
    }
  }

  return stats
}

/**
 * Get all games with notes for word cloud processing
 */
export async function getGamesWithNotes(collectionId: string): Promise<string[]> {
  const result = db
    .select({notes: games.notes})
    .from(games)
    .where(eq(games.collectionId, collectionId))
    .all()

  // Filter out null and empty notes client-side
  return result
    .filter((row) => row.notes !== null && row.notes !== '')
    .map((row) => row.notes as string)
}
