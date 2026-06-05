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
  if (isStudy) {
    studyId = extractStudyId(studyUrl)
    if (!studyId) throw new Error('Could not find a Lichess study id in that URL')
  }

  const collectionId = crypto.randomUUID()
  const trimmedUsername = username.trim()

  db.insert(collections)
    .values({
      id: collectionId,
      ownerId: user.id,
      name: isPlatform ? null : name?.trim() || (isStudy ? 'Lichess Study' : 'Untitled collection'),
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

/** Extract the 8-character study id from a Lichess study URL or a raw id. */
function extractStudyId(input: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()

  const urlMatch = trimmed.match(/lichess\.org\/study\/([A-Za-z0-9]{8})/)
  if (urlMatch) return urlMatch[1]

  if (/^[A-Za-z0-9]{8}$/.test(trimmed)) return trimmed

  return null
}
