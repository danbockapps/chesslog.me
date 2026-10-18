import {getCollectionDisplayName} from '@/lib/collectionUtils'
import {db} from '@/lib/db'
import {formatCollectionExport} from '@/lib/exportFormat'
import {collections, gameComments, games, gameTags, tags, users} from '@/lib/schema'
import {and, asc, desc, eq, inArray, isNull} from 'drizzle-orm'
import {FC} from 'react'
import CopyButton from './copyButton'

const ExportView: FC<{collectionId: string}> = ({collectionId}) => {
  const collection = db.select().from(collections).where(eq(collections.id, collectionId)).get()

  if (!collection || collection.deletedAt) {
    return <p className="text-base-content/50">This collection is not available.</p>
  }

  const tagRows = db
    .select({gameId: gameTags.gameId, name: tags.name, description: tags.description})
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .innerJoin(games, eq(gameTags.gameId, games.id))
    .where(and(eq(games.collectionId, collectionId), isNull(tags.deletedAt)))
    .all()

  const tagsByGame = new Map<number, string[]>()
  for (const {gameId, name} of tagRows) {
    tagsByGame.set(gameId, [...(tagsByGame.get(gameId) ?? []), name])
  }

  const usedTagNames = new Set([...tagsByGame.values()].flat())
  const usedTags = [...new Set(tagRows.map((t) => t.name))]
    .filter((name) => usedTagNames.has(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      description: tagRows.find((t) => t.name === name)!.description,
    }))

  const allGames = db
    .select()
    .from(games)
    .where(eq(games.collectionId, collectionId))
    .orderBy(desc(games.gameDttm))
    .all()

  const gameIds = allGames.map((g) => g.id)
  const commentRows =
    gameIds.length > 0
      ? db
          .select({
            gameId: gameComments.gameId,
            text: gameComments.text,
            authorLichessUsername: users.lichessUsername,
            authorEmail: users.email,
          })
          .from(gameComments)
          .innerJoin(users, eq(gameComments.userId, users.id))
          .where(inArray(gameComments.gameId, gameIds))
          .orderBy(asc(gameComments.createdAt), asc(gameComments.id))
          .all()
      : []

  // Same author display as the discussion UI
  const commentsByGame = new Map<number, {author: string; text: string}[]>()
  for (const c of commentRows) {
    const author = c.authorLichessUsername ?? c.authorEmail.split('@')[0]
    commentsByGame.set(c.gameId, [...(commentsByGame.get(c.gameId) ?? []), {author, text: c.text}])
  }

  const annotatedGames = allGames
    .map((g) => ({
      url: g.url ?? (g.lichessGameId ? `https://lichess.org/${g.lichessGameId}` : null),
      gameDttm: g.gameDttm,
      whiteUsername: g.whiteUsername,
      blackUsername: g.blackUsername,
      whiteRating: g.whiteRating,
      blackRating: g.blackRating,
      whiteResult: g.whiteResult,
      blackResult: g.blackResult,
      winner: g.winner,
      eco: g.eco,
      timeControl: g.timeControl,
      tags: tagsByGame.get(g.id) ?? [],
      notes: g.notes,
      comments: commentsByGame.get(g.id) ?? [],
    }))
    .filter((g) => g.tags.length > 0 || !!g.notes?.trim() || g.comments.length > 0)

  const text = formatCollectionExport({
    name: getCollectionDisplayName(collection),
    username: collection.username,
    exportedAt: new Date(),
    tags: usedTags,
    games: annotatedGames,
  })

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-3 pr-4">
        <h2 className="text-lg font-semibold">Export</h2>
        {annotatedGames.length > 0 && (
          <div className="ml-auto shrink-0">
            <CopyButton text={text} />
          </div>
        )}
      </div>

      {annotatedGames.length > 0 ? (
        <pre
          className="bg-base-100 border border-base-300 rounded-lg p-4 text-sm whitespace-pre-wrap
            break-words font-mono max-h-[60vh] overflow-y-auto"
        >
          {text}
        </pre>
      ) : (
        <p className="text-base-content/50">No games with tags, notes, or comments yet.</p>
      )}
    </div>
  )
}

export default ExportView
