'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {
  derivePlayers,
  extractStudyName,
  parsePgnGame,
  splitPgnGames,
  transformPgnGame,
} from '@/lib/pgnImport'
import {collections, games} from '@/lib/schema'
import {and, eq, isNotNull} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

export interface PgnImportPreviewItem {
  index: number
  white: string
  black: string
  date: string | null
  result: string
  event: string
  moveCount: number
  isDuplicate: boolean
}

async function requireOwnedCollection(collectionId: string) {
  const user = await requireAuth()
  const owned = db
    .select({id: collections.id, studyId: collections.studyId})
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.ownerId, user.id)))
    .get()
  if (!owned) throw new Error('Unauthorized')
  return owned
}

function existingHashes(collectionId: string): Set<string> {
  const rows = db
    .select({importHash: games.importHash})
    .from(games)
    .where(and(eq(games.collectionId, collectionId), isNotNull(games.importHash)))
    .all()
  return new Set(rows.map((r) => r.importHash as string))
}

/** Parse PGN text and report which games are new vs. already present in the collection. */
export async function previewPgnImport(
  collectionId: string,
  pgnText: string,
): Promise<PgnImportPreviewItem[]> {
  await requireOwnedCollection(collectionId)

  const existing = existingHashes(collectionId)
  const seenInFile = new Set<string>()

  return splitPgnGames(pgnText)
    .map((gameText, index) => {
      const parsed = parsePgnGame(gameText)
      if (!parsed) return null

      // A game already in the collection, or repeated earlier in this same file, is a duplicate.
      const isDuplicate = existing.has(parsed.importHash) || seenInFile.has(parsed.importHash)
      seenInFile.add(parsed.importHash)

      const {white, black} = derivePlayers(parsed.headers)

      return {
        index,
        white,
        black,
        date: parsed.headers.Date ?? parsed.headers.UTCDate ?? null,
        result: parsed.headers.Result ?? '*',
        event: parsed.headers.Event ?? '',
        moveCount: parsed.sanMoves.length,
        isDuplicate,
      } satisfies PgnImportPreviewItem
    })
    .filter((item): item is PgnImportPreviewItem => item !== null)
}

/** Insert the selected games (by split index), skipping any whose content is already present. */
export async function importPgnGames(
  collectionId: string,
  pgnText: string,
  selectedIndices: number[],
): Promise<number> {
  const owned = await requireOwnedCollection(collectionId)

  const selected = new Set(selectedIndices)
  const existing = existingHashes(collectionId)
  const toInsert: (typeof games.$inferInsert)[] = []

  splitPgnGames(pgnText).forEach((gameText, index) => {
    if (!selected.has(index)) return
    const parsed = parsePgnGame(gameText)
    if (!parsed) return
    if (existing.has(parsed.importHash)) return
    existing.add(parsed.importHash) // guard against duplicates within this same file
    toInsert.push(transformPgnGame(parsed, collectionId))
  })

  if (toInsert.length > 0) {
    db.insert(games).values(toInsert).run()
  }

  // Study collections surface a "last refreshed" time; stamp it on every refresh-from-study and
  // keep the collection named after the study in case it was renamed on Lichess.
  if (owned.studyId) {
    const studyName = extractStudyName(pgnText)
    db.update(collections)
      .set({
        lastRefreshed: new Date().toISOString(),
        ...(studyName ? {name: studyName} : {}),
      })
      .where(eq(collections.id, collectionId))
      .run()
  }

  if (toInsert.length > 0 || owned.studyId) {
    revalidatePath(`/collections/${collectionId}`)
  }

  return toInsert.length
}

/** Download a Lichess study's PGN so it can be run through the same preview/import flow. */
export async function getStudyPgn(collectionId: string): Promise<string> {
  const owned = await requireOwnedCollection(collectionId)
  if (!owned.studyId) throw new Error('Collection has no associated Lichess study')

  const url = `https://lichess.org/api/study/${owned.studyId}.pgn`
  const res = await fetch(url, {
    headers: {Authorization: 'Bearer ' + process.env.LICHESS_TOKEN},
  })

  if (!res.ok) {
    throw new Error(`Lichess study API returned ${res.status}`)
  }

  return res.text()
}
