import {createHash} from 'crypto'
import {Chess} from 'chess.js'
import {games} from '@/lib/schema'
import {preparePgnForChessJs} from '@/lib/pgnSanitize'

export interface ParsedPgnGame {
  pgn: string
  headers: Record<string, string | undefined>
  sanMoves: string[]
  fen: string
  importHash: string
}

/**
 * Split a multi-game PGN file into individual game strings.
 *
 * PGN games are a tag section (lines like `[Event "..."]`) followed by movetext. Once a game's
 * movetext has begun, the next tag line marks the start of a new game — regardless of whether the
 * games are separated by blank lines.
 */
export function splitPgnGames(pgnText: string): string[] {
  const lines = pgnText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  const result: string[] = []
  let current: string[] = []
  let seenMoves = false

  const flush = () => {
    const text = current.join('\n').trim()
    if (text) result.push(text)
    current = []
    seenMoves = false
  }

  for (const line of lines) {
    const isTag = /^\s*\[/.test(line)

    // A tag line after movetext means a new game has started.
    if (isTag && seenMoves) {
      flush()
    }

    if (!isTag && line.trim() !== '') {
      seenMoves = true
    }

    current.push(line)
  }
  flush()

  return result
}

/**
 * Parse a single PGN game with chess.js. Returns null if the game cannot be parsed
 * (invalid moves, malformed tags, etc.).
 */
export function parsePgnGame(gameText: string): ParsedPgnGame | null {
  try {
    const chess = new Chess()
    chess.loadPgn(preparePgnForChessJs(gameText))

    const rawHeaders = chess.header()
    const headers: Record<string, string | undefined> = {}
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (value != null) headers[key] = value
    }

    const sanMoves = chess.history()
    if (sanMoves.length === 0) return null

    return {
      pgn: gameText.trim(),
      headers,
      sanMoves,
      fen: chess.fen(),
      importHash: computeImportHash(headers, sanMoves),
    }
  } catch {
    return null
  }
}

/**
 * Content hash used to detect re-imported (duplicate) games. Based on the normalized movetext plus
 * the headers that identify a specific game, so unrelated tag/annotation edits don't break matching.
 */
export function computeImportHash(
  headers: Record<string, string | undefined>,
  sanMoves: string[],
): string {
  const moves = sanMoves.join(' ').replace(/\s+/g, ' ').trim()
  const key = [
    moves,
    headers.White ?? '',
    headers.Black ?? '',
    headers.Date ?? headers.UTCDate ?? '',
    headers.Result ?? '',
    headers.Event ?? '',
    headers.Round ?? '',
  ].join('|')

  return createHash('sha256').update(key).digest('hex')
}

/** Extract the [StudyName "..."] header from a (possibly multi-game) Lichess study PGN, or null. */
export function extractStudyName(pgn: string): string | null {
  const match = pgn.match(/\[StudyName\s+"([^"]*)"\]/)
  return match && match[1] ? match[1] : null
}

/** Convert a parsed PGN game into a row for the `games` table. */
export function transformPgnGame(
  parsed: ParsedPgnGame,
  collectionId: string,
): typeof games.$inferInsert {
  const {headers} = parsed
  const {white, black} = derivePlayers(headers)

  return {
    collectionId,
    pgn: parsed.pgn,
    importHash: parsed.importHash,
    fen: parsed.fen,
    eco: headers.Opening ?? headers.ECO ?? null,
    gameDttm: parsePgnDate(headers),
    timeControl: headers.TimeControl ?? null,
    whiteUsername: white,
    blackUsername: black,
    whiteRating: parseRating(headers.WhiteElo),
    blackRating: parseRating(headers.BlackElo),
    winner: resultToWinner(headers.Result),
  }
}

/**
 * Resolve player names. Lichess study exports omit [White]/[Black] tags, so fall back to the
 * "White vs. Black" pattern in the ChapterName/Event header (stripping a trailing date).
 */
export function derivePlayers(headers: Record<string, string | undefined>): {
  white: string
  black: string
} {
  const tagWhite = cleanName(headers.White)
  const tagBlack = cleanName(headers.Black)
  if (tagWhite && tagBlack) return {white: tagWhite, black: tagBlack}

  const source = headers.ChapterName ?? headers.Event ?? ''
  const match = source.match(/(.+?)\s+vs\.?\s+(.+)/i)
  if (match) {
    const white = tagWhite || match[1].replace(/^.*:\s*/, '').trim()
    // The second name often has a trailing date, e.g. "Dan 11/9/2025" or "Dan 2025.11.09".
    const black = tagBlack || match[2].replace(/\s+\d{1,4}[./]\d{1,2}[./]\d{1,4}\s*$/, '').trim()
    return {white: white || 'Unknown', black: black || 'Unknown'}
  }

  return {white: tagWhite || 'Unknown', black: tagBlack || 'Unknown'}
}

function cleanName(value: string | undefined): string {
  return value && value !== '?' ? value.trim() : ''
}

function parseRating(value: string | undefined): number | null {
  if (!value) return null
  const n = parseInt(value, 10)
  return Number.isNaN(n) ? null : n
}

function resultToWinner(result: string | undefined): 'white' | 'black' | 'draw' | null {
  switch (result) {
    case '1-0':
      return 'white'
    case '0-1':
      return 'black'
    case '1/2-1/2':
      return 'draw'
    default:
      return null
  }
}

/** Parse a PGN date ("YYYY.MM.DD", optionally with UTCTime) into an ISO8601 string, or null. */
function parsePgnDate(headers: Record<string, string | undefined>): string | null {
  const date = headers.UTCDate ?? headers.Date
  if (!date || date.includes('?')) return null

  const parts = date.split('.')
  if (parts.length !== 3) return null
  const [year, month, day] = parts
  const time = headers.UTCTime && !headers.UTCTime.includes('?') ? headers.UTCTime : '12:00:00'

  const iso = `${year}-${month}-${day}T${time}Z`
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}
