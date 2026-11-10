export interface ExportGame {
  url: string | null
  gameDttm: string | null
  whiteUsername: string | null
  blackUsername: string | null
  whiteRating: number | null
  blackRating: number | null
  whiteResult: string | null
  blackResult: string | null
  winner: string | null
  eco: string | null
  timeControl: string | null
  tags: string[]
  notes: string | null
  comments: ExportComment[]
}

export interface ExportComment {
  author: string
  text: string
}

export interface ExportTag {
  name: string
  description: string | null
}

export interface ExportCollection {
  name: string
  username: string | null
  exportedAt: Date
  tags: ExportTag[]
  games: ExportGame[]
}

// Standard scoreboard notation, from whichever result fields the game has
// (Chess.com stores per-side results; Lichess/manual/PGN games store `winner`).
export function getScore(game: {
  whiteResult: string | null
  blackResult: string | null
  winner: string | null
}): string | null {
  if (game.winner === 'white' || game.whiteResult === 'win') return '1-0'
  if (game.winner === 'black' || game.blackResult === 'win') return '0-1'
  if (game.winner === 'draw' || (game.whiteResult && game.blackResult)) return '1/2-1/2'
  return null
}

function formatPlayer(name: string | null, rating: number | null) {
  const label = name || 'Unknown'
  return rating ? `${label} (${rating})` : label
}

function formatGame(game: ExportGame, index: number) {
  const score = getScore(game)
  const date = game.gameDttm?.slice(0, 10)
  const heading = [
    `## Game ${index + 1}: ${formatPlayer(game.whiteUsername, game.whiteRating)} (White) vs ${formatPlayer(game.blackUsername, game.blackRating)} (Black)`,
    score && `Result: ${score}`,
    date,
  ]
    .filter(Boolean)
    .join(' — ')

  const notes = game.notes?.trim()
  // Metadata as a list and blank lines before Notes/Comments so markdown
  // viewers render each field on its own line instead of one merged paragraph.
  const metadata = [
    game.eco && `Opening (ECO): ${game.eco}`,
    game.timeControl && `Time control: ${game.timeControl}`,
    game.url && `Link: ${game.url}`,
    game.tags.length > 0 && `Tags: ${game.tags.join(', ')}`,
  ]
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join('\n')

  const blocks = [
    metadata,
    notes && `**Notes**\n\n${notes}`,
    game.comments.length > 0 &&
      `**Comments**\n\n${game.comments
        .map((c) =>
          c.text
            .split('\n')
            .map((line, i) => `> ${i === 0 ? `${c.author}: ` : ''}${line}`)
            .join('\n'),
        )
        .join('\n>\n')}`,
  ].filter(Boolean)

  return [heading, ...blocks].join('\n\n')
}

export function formatCollectionExport(collection: ExportCollection): string {
  const header = [
    `# ${collection.name}`,
    '',
    collection.username && `- Player: ${collection.username}`,
    `- Exported: ${collection.exportedAt.toISOString().slice(0, 10)}`,
    `- Games with tags, notes, or comments: ${collection.games.length}`,
  ]
    .filter(Boolean)
    .join('\n')

  // Only tags actually used on the games below
  const usedNames = new Set(collection.games.flatMap((g) => g.tags))
  const usedTags = collection.tags.filter((tag) => usedNames.has(tag.name))

  const tagsSection =
    usedTags.length > 0
      ? `## Tags\n\n${usedTags
          .map((tag) => {
            const lines = [`- ${tag.name}`]
            if (tag.description?.trim()) lines.push(`  ${tag.description.trim()}`)
            return lines.join('\n')
          })
          .join('\n\n')}`
      : null

  return [header, tagsSection, ...collection.games.map(formatGame)].filter(Boolean).join('\n\n')
}
