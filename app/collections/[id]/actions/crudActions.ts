'use server'

import {getUser, requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {collections, games, gameTags, tags} from '@/lib/schema'
import {and, eq, inArray, or} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

export const getNotes = async (gameId: number) => {
  const result = db.select({notes: games.notes}).from(games).where(eq(games.id, gameId)).get()
  return result?.notes ?? ''
}

export const saveNotes = async (gameId: number, notes: string) => {
  const user = await requireAuth()

  // Verify ownership via join
  const game = db
    .select({
      gameId: games.id,
      collectionId: collections.id,
    })
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .where(and(eq(games.id, gameId), eq(collections.ownerId, user.id)))
    .get()

  if (!game) {
    throw new Error('Unauthorized: Game not found or access denied')
  }

  db.update(games).set({notes}).where(eq(games.id, gameId)).run()

  revalidatePath(`/collections/${game.collectionId}`)
}

export const insertTag = async (name: string) => {
  const user = await requireAuth()

  const result = db
    .insert(tags)
    .values({
      name,
      ownerId: user.id,
    })
    .returning({id: tags.id})
    .get()

  return result ? [result] : []
}

export const insertGameTag = async (tagId: number, gameId: number) => {
  const user = await requireAuth()

  // Verify user owns the game
  const game = db
    .select({
      gameId: games.id,
      collectionId: collections.id,
    })
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .where(and(eq(games.id, gameId), eq(collections.ownerId, user.id)))
    .get()

  if (!game) {
    throw new Error('Unauthorized: Game not found or access denied')
  }

  db.insert(gameTags).values({gameId, tagId}).run()

  // Alternative to making everything client rendered: revalidate the page so that
  // the new tag count is reflected in the UI
  revalidatePath(`/collections/${game.collectionId}`)
}

export const deleteGameTags = async (gameId: number, tagIds: number[]) => {
  const user = await requireAuth()

  // Verify ownership
  const game = db
    .select({
      gameId: games.id,
      collectionId: collections.id,
    })
    .from(games)
    .innerJoin(collections, eq(games.collectionId, collections.id))
    .where(and(eq(games.id, gameId), eq(collections.ownerId, user.id)))
    .get()

  if (!game) {
    throw new Error('Unauthorized: Game not found or access denied')
  }

  db.delete(gameTags)
    .where(and(eq(gameTags.gameId, gameId), inArray(gameTags.tagId, tagIds)))
    .run()

  revalidatePath(`/collections/${game.collectionId}`)
}

export const getTags = async () => {
  const user = await requireAuth()

  // Get tags owned by user or public tags
  const userTags = db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(tags)
    .where(or(eq(tags.ownerId, user.id), eq(tags.public, true)))
    .all()

  return userTags
}

export const getTagsWithDetails = async () => {
  const user = await getUser()

  const userTags = db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
      public: tags.public,
    })
    .from(tags)
    .where(user ? or(eq(tags.ownerId, user.id), eq(tags.public, true)) : eq(tags.public, true))
    .all()

  return userTags
}

export const getGameTags = async (gameId: number) => {
  const tagIds = db
    .select({tagId: gameTags.tagId})
    .from(gameTags)
    .where(eq(gameTags.gameId, gameId))
    .all()

  return tagIds.map((t) => t.tagId)
}

export const getGameTagsWithDetails = async (gameId: number) => {
  return db
    .select({id: tags.id, name: tags.name, public: tags.public})
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .where(eq(gameTags.gameId, gameId))
    .all()
}
