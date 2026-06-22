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
import {fetchLichessStudyPgn} from '@/lib/lichessStudy'
import {extractStudyName} from '@/lib/pgnImport'
import {collections} from '@/lib/schema'
import {revalidatePath} from 'next/cache'
import {TimeClass, Type} from './createNewModal'

export async function createCollection(
  type: Type,
  username: string,
  timeClass: TimeClass,
  name: string | null,
  studyUrl: string | null = null,
): Promise<{error: string} | {collectionId: string}> {
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
    if (!studyId) return {error: 'Could not find a Lichess study id in that URL.'}
    // Verify the study is reachable before creating a collection for it, and use its name. A
    // private (or nonexistent) study can't be imported, so surface that instead of creating an
    // empty, broken collection.
    const result = await fetchStudyName(studyId)
    if ('error' in result) return {error: result.error}
    studyName = result.name
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

  // Auto-import 20 most recent games for platform collections
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
          .slice(0, 20)
          .map((g) => transformChesscomGame(g, collectionId))

        saveGames(gamesData, collectionId, 'chesscom')
      } else if (type === 'lichess') {
        const params: Record<string, string> = {
          max: '20',
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
  // The caller navigates client-side. Redirecting here works by throwing internally, which the
  // caller's catch would surface as a spurious error as the page unmounts.
  return {collectionId}
}

/**
 * Fetch just enough of a study's PGN to read its [StudyName] header, while also confirming the
 * study is accessible. Reads the stream and stops early (the header is in the first game), so large
 * studies aren't downloaded in full.
 *
 * Returns `{error}` when the study can't be reached (private, deleted, or never existed) so the
 * caller can refuse to create a broken collection. Returns `{name}` otherwise — `name` may be null
 * if the study is reachable but its name couldn't be parsed, which is fine to fall back from.
 */
async function fetchStudyName(studyId: string): Promise<{name: string | null} | {error: string}> {
  let res: Response
  try {
    res = await fetchLichessStudyPgn(studyId)
  } catch (e) {
    console.error('Failed to fetch study name:', e)
    return {error: "Couldn't reach Lichess to load that study. Please try again."}
  }

  if (res.status === 401 || res.status === 403 || res.status === 404) {
    return {
      error:
        "That Lichess study is private or doesn't exist. Studies must be unlisted or public to be imported.",
    }
  }
  if (!res.ok) return {error: `Lichess returned an error (${res.status}) loading that study.`}
  if (!res.body) return {name: null}

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (buffer.length < 65536) {
      const {done, value} = await reader.read()
      if (done) break
      buffer += decoder.decode(value, {stream: true})
      const name = extractStudyName(buffer)
      if (name) return {name}
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return {name: extractStudyName(buffer)}
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
