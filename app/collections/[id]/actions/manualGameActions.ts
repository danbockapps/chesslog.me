'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {collections, games} from '@/lib/schema'
import {and, eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

type ManualGameData = {
  whitePlayer: string
  blackPlayer: string
  gameDttm: string
  winner: 'white' | 'black' | 'draw' | null
  timeControl: string | null
  opening: string | null
  url: string | null
}

export const createManualGame = async (collectionId: string, data: ManualGameData) => {
  const user = await requireAuth()
  const owned = db
    .select({id: collections.id})
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.ownerId, user.id)))
    .get()
  if (!owned) throw new Error('Unauthorized')

  db.insert(games)
    .values({
      collectionId,
      whiteUsername: data.whitePlayer,
      blackUsername: data.blackPlayer,
      gameDttm: data.gameDttm,
      winner: data.winner,
      timeControl: data.timeControl || null,
      eco: data.opening || null,
      url: data.url || null,
    })
    .run()

  revalidatePath(`/collections/${collectionId}`)
}

export const updateManualGame = async (gameId: number, data: ManualGameData) => {
  const user = await requireAuth()

  const game = db
    .select({collectionId: games.collectionId})
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .where(and(eq(games.id, gameId), eq(collections.ownerId, user.id)))
    .get()

  if (!game) throw new Error('Game not found or access denied')

  db.update(games)
    .set({
      whiteUsername: data.whitePlayer,
      blackUsername: data.blackPlayer,
      gameDttm: data.gameDttm,
      winner: data.winner,
      timeControl: data.timeControl || null,
      eco: data.opening || null,
      url: data.url || null,
    })
    .where(eq(games.id, gameId))
    .run()

  revalidatePath(`/collections/${game.collectionId}`)
}

export const deleteManualGame = async (gameId: number) => {
  const user = await requireAuth()

  const game = db
    .select({collectionId: games.collectionId})
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .where(and(eq(games.id, gameId), eq(collections.ownerId, user.id)))
    .get()

  if (!game) throw new Error('Game not found or access denied')

  db.delete(games).where(eq(games.id, gameId)).run()

  revalidatePath(`/collections/${game.collectionId}`)
}
