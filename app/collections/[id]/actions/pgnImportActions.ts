'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {
  buildPgnImportPreview,
  extractStudyName,
  parsePgnGame,
  splitPgnGames,
  transformPgnGame,
  type PgnImportPreviewItem,
} from '@/lib/pgnImport'
import {fetchLichessStudyPgn} from '@/lib/lichessStudy'
import {collections, games} from '@/lib/schema'
import {and, eq, isNotNull} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

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
  return buildPgnImportPreview(pgnText, existingHashes(collectionId))
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

  const res = await fetchLichessStudyPgn(owned.studyId)

  if (res.status === 401 || res.status === 403 || res.status === 404) {
    throw new Error(
      'That Lichess study is private or no longer exists. Studies must be unlisted or public to be imported.',
    )
  }
  if (!res.ok) {
    throw new Error(`Lichess returned an error (${res.status}) loading that study.`)
  }

  return res.text()
}
