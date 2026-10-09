'use server'

import {getUser, requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {gameComments, games, users} from '@/lib/schema'
import {and, asc, eq} from 'drizzle-orm'
import {revalidatePath} from 'next/cache'

export const getComments = async (gameId: number) => {
  return db
    .select({
      id: gameComments.id,
      text: gameComments.text,
      createdAt: gameComments.createdAt,
      userId: gameComments.userId,
      authorLichessUsername: users.lichessUsername,
      authorEmail: users.email,
    })
    .from(gameComments)
    .innerJoin(users, eq(gameComments.userId, users.id))
    .where(eq(gameComments.gameId, gameId))
    .orderBy(asc(gameComments.createdAt), asc(gameComments.id))
    .all()
}

export const addComment = async (gameId: number, text: string) => {
  const user = await requireAuth()

  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Comment cannot be empty')
  }

  const game = db
    .select({collectionId: games.collectionId})
    .from(games)
    .where(eq(games.id, gameId))
    .get()

  if (!game) {
    throw new Error('Game not found')
  }

  db.insert(gameComments)
    .values({
      gameId,
      userId: user.id,
      text: trimmed,
    })
    .run()

  revalidatePath(`/collections/${game.collectionId}`)
}

export const deleteComment = async (commentId: number) => {
  const user = await requireAuth()

  // Only the comment's author may delete it
  const deleted = db
    .delete(gameComments)
    .where(and(eq(gameComments.id, commentId), eq(gameComments.userId, user.id)))
    .returning({gameId: gameComments.gameId})
    .get()

  if (!deleted) {
    return
  }

  const game = db
    .select({collectionId: games.collectionId})
    .from(games)
    .where(eq(games.id, deleted.gameId))
    .get()

  if (game) {
    revalidatePath(`/collections/${game.collectionId}`)
  }
}
