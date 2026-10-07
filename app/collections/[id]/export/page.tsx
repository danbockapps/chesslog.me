import {getCollectionDisplayName} from '@/lib/collectionUtils'
import {db} from '@/lib/db'
import {formatCollectionExport} from '@/lib/exportFormat'
import {collections, games, gameTags, tags} from '@/lib/schema'
import {and, desc, eq, isNull} from 'drizzle-orm'
import {FC} from 'react'
import CopyButton from './copyButton'

export const dynamic = 'force-dynamic'

const Export: FC<{params: Promise<{id: string}>}> = async (props) => {
  const {id} = await props.params

  const collection = db.select().from(collections).where(eq(collections.id, id)).get()

  if (!collection || collection.deletedAt) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <p className="text-base-content/50 text-lg">This collection is not available.</p>
      </div>
    )
  }

  const tagRows = db
    .select({gameId: gameTags.gameId, name: tags.name, description: tags.description})
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .innerJoin(games, eq(gameTags.gameId, games.id))
    .where(and(eq(games.collectionId, id), isNull(tags.deletedAt)))
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

  const annotatedGames = db
    .select()
    .from(games)
    .where(eq(games.collectionId, id))
    .orderBy(desc(games.gameDttm))
    .all()
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
    }))
    .filter((g) => g.tags.length > 0 || !!g.notes?.trim())

  const text = formatCollectionExport({
    name: getCollectionDisplayName(collection),
    username: collection.username,
    exportedAt: new Date(),
    tags: usedTags,
    games: annotatedGames,
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Export</h1>
        {annotatedGames.length > 0 && (
          <div className="ml-auto shrink-0">
            <CopyButton text={text} />
          </div>
        )}
      </div>

      {annotatedGames.length > 0 ? (
        <pre
          className="bg-base-100 border border-base-300 rounded-lg p-4 text-sm whitespace-pre-wrap
            break-words font-mono"
        >
          {text}
        </pre>
      ) : (
        <p className="text-base-content/50">No games with tags or notes yet.</p>
      )}
    </div>
  )
}

export default Export
