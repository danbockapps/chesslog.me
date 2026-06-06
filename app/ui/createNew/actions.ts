'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {
  ChesscomGame,
  fetchLichessGames,
  saveGames,
  transformChesscomGame,
  transformLichessGame,
} from '@/lib/gameImport'
import {extractStudyName} from '@/lib/pgnImport'
import {collections} from '@/lib/schema'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {TimeClass, Type} from './createNewModal'

export async function createCollection(
  type: Type,
  username: string,
  timeClass: TimeClass,
  name: string | null,
  studyUrl: string | null = null,
) {
  const user = await requireAuth()

  const isPlatform = type === 'lichess' || type === 'chess.com'
  const isStudy = type === 'lichess-study'

  if (isPlatform && !timeClass) {
    throw new Error('Time class is required for platform collections')
  }

  let studyId: string | null = null
  let studyName: string | null = null
  if (isStudy) {
    studyId = extractStudyId(studyUrl)
    if (!studyId) throw new Error('Could not find a Lichess study id in that URL')
    // The collection is named after the study itself rather than a user-entered name.
    studyName = await fetchStudyName(studyId)
  }

  const collectionId = crypto.randomUUID()
  const trimmedUsername = username.trim()

  const collectionName = isPlatform
    ? null
    : isStudy
      ? studyName || 'Lichess Study'
      : name?.trim() || 'Untitled collection'

  db.insert(collections)
    .values({
      id: collectionId,
      ownerId: user.id,
      name: collectionName,
      username: trimmedUsername || null,
      site: isPlatform || isStudy ? type : null,
      timeClass: timeClass,
      studyId,
    })
    .run()

  // Study collections refresh manually (the import requires a game-selection step), so don't
  // auto-import here.

  // Auto-import 5 most recent games for platform collections
  if (isPlatform && trimmedUsername) {
    try {
      if (type === 'chess.com') {
        const now = new Date()
        const mm = `${now.getMonth() < 9 ? '0' : ''}${now.getMonth() + 1}`
        const result = await fetch(
          `https://api.chess.com/pub/player/${trimmedUsername}/games/${now.getFullYear()}/${mm}`,
        )
        const data = (await result.json()) as {games: ChesscomGame[]}

        const gamesData = data.games
          .filter((g) => !timeClass || g.time_class === timeClass)
          .sort((a, b) => b.end_time - a.end_time)
          .slice(0, 5)
          .map((g) => transformChesscomGame(g, collectionId))

        saveGames(gamesData, collectionId, 'chesscom')
      } else if (type === 'lichess') {
        const params: Record<string, string> = {
          max: '5',
          moves: 'false',
          opening: 'true',
          lastFen: 'true',
        }
        if (timeClass) {
          params.perfType = timeClass
        }

        const data = await fetchLichessGames(trimmedUsername, params)
        const gamesData = data.map((g) => transformLichessGame(g, collectionId))

        saveGames(gamesData, collectionId, 'lichess')
      }
    } catch (e) {
      console.error('Failed to auto-import initial games:', e)
    }
  }

  revalidatePath('/collections')
  redirect(`/collections/${collectionId}`)
}

/**
 * Fetch just enough of a study's PGN to read its [StudyName] header. Reads the stream and stops
 * early (the header is in the first game), so large studies aren't downloaded in full. Returns null
 * on any failure so collection creation still succeeds.
 */
async function fetchStudyName(studyId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://lichess.org/api/study/${studyId}.pgn`, {
      headers: {Authorization: 'Bearer ' + process.env.LICHESS_TOKEN},
    })
    if (!res.ok || !res.body) return null

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
      while (buffer.length < 65536) {
        const {done, value} = await reader.read()
        if (done) break
        buffer += decoder.decode(value, {stream: true})
        const name = extractStudyName(buffer)
        if (name) return name
      }
    } finally {
      await reader.cancel().catch(() => {})
    }
    return extractStudyName(buffer)
  } catch (e) {
    console.error('Failed to fetch study name:', e)
    return null
  }
}

/** Extract the 8-character study id from a Lichess study URL or a raw id. */
function extractStudyId(input: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()

  const urlMatch = trimmed.match(/lichess\.org\/study\/([A-Za-z0-9]{8})/)
  if (urlMatch) return urlMatch[1]

  if (/^[A-Za-z0-9]{8}$/.test(trimmed)) return trimmed

  return null
}
