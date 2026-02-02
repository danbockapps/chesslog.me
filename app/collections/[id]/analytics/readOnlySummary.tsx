import {db} from '@/lib/db'
import {games, gameTags, tags} from '@/lib/schema'
import {and, desc, eq, inArray, or} from 'drizzle-orm'

interface Game {
  id: number
  whiteUsername: string | null
  blackUsername: string | null
  whiteResult: string | null
  blackResult: string | null
  winner: string | null
  timeControl: string | null
  gameDttm: string | null
  eco: string | null
  notes: string | null
  site: 'chess.com' | 'lichess' | null
  tags: {id: number; name: string; public: boolean}[]
}

function getResultColor(game: Game, username: string, site: 'chess.com' | 'lichess'): string {
  if (site === 'chess.com') {
    const isWhite = game.whiteUsername === username
    const myResult = isWhite ? game.whiteResult : game.blackResult

    if (myResult === 'win') return 'bg-success'
    if (['checkmated', 'timeout', 'resigned', 'abandoned'].includes(myResult ?? ''))
      return 'bg-error'
    return 'bg-neutral'
  } else {
    // Lichess
    const isWhite = game.whiteUsername === username
    if (game.winner === 'draw') return 'bg-neutral'
    if ((isWhite && game.winner === 'white') || (!isWhite && game.winner === 'black'))
      return 'bg-success'
    return 'bg-error'
  }
}

function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) return 'Unknown date'

  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default async function ReadOnlySummary({
  collectionId,
  username,
  userId,
  site,
}: {
  collectionId: string
  username: string
  userId: string
  site: 'chess.com' | 'lichess'
}) {
  // Fetch all games for collection
  const allGames = db
    .select({
      id: games.id,
      whiteUsername: games.whiteUsername,
      blackUsername: games.blackUsername,
      whiteResult: games.whiteResult,
      blackResult: games.blackResult,
      winner: games.winner,
      timeControl: games.timeControl,
      gameDttm: games.gameDttm,
      eco: games.eco,
      notes: games.notes,
      site: games.site,
    })
    .from(games)
    .where(eq(games.collectionId, collectionId))
    .orderBy(desc(games.gameDttm))
    .all()

  if (allGames.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
        <div className="text-center">
          <p className="text-base-content/70">No games found</p>
          <p className="text-sm text-base-content/50 mt-1">Import games to see summary</p>
        </div>
      </div>
    )
  }

  // Fetch all tags for these games in one query (avoid N+1)
  const gameTagData = db
    .select({
      gameId: gameTags.gameId,
      tagId: tags.id,
      tagName: tags.name,
      tagPublic: tags.public,
    })
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .where(
      and(
        inArray(
          gameTags.gameId,
          allGames.map((g) => g.id),
        ),
        or(eq(tags.ownerId, userId), eq(tags.public, true)),
      ),
    )
    .all()

  // Group tags by game ID client-side
  const tagsByGame: Record<number, {id: number; name: string; public: boolean}[]> = {}
  for (const row of gameTagData) {
    if (!tagsByGame[row.gameId]) {
      tagsByGame[row.gameId] = []
    }
    tagsByGame[row.gameId].push({
      id: row.tagId,
      name: row.tagName,
      public: Boolean(row.tagPublic),
    })
  }

  // Combine games with their tags
  const gamesWithTags: Game[] = allGames.map((game) => ({
    ...game,
    tags: tagsByGame[game.id] || [],
  }))

  return (
    <div className="space-y-3">
      {gamesWithTags.map((game) => (
        <div key={game.id} className="bg-base-100 border border-base-300 rounded-lg p-4">
          <div className="flex items-center gap-3 text-sm mb-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full ${getResultColor(game, username, site)}`} />
            <span className="font-medium">
              {game.whiteUsername || 'Unknown'} vs {game.blackUsername || 'Unknown'}
            </span>
            {game.timeControl && (
              <>
                <span className="text-base-content/70">•</span>
                <span className="text-base-content/70">{game.timeControl}</span>
              </>
            )}
            <span className="text-base-content/70">•</span>
            <span className="text-base-content/70">{formatRelativeTime(game.gameDttm)}</span>
          </div>

          {game.eco && <div className="text-xs text-base-content/70 mb-2">Opening: {game.eco}</div>}

          {game.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {game.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={`badge badge-sm ${tag.public ? 'badge-primary' : 'badge-neutral'}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {game.notes && (
            <div className="text-sm text-base-content/80">
              {game.notes.length > 200 ? game.notes.slice(0, 200) + '...' : game.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
