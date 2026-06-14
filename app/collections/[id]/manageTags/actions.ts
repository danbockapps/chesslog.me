'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {tags} from '@/lib/schema'
import {eq, and, isNull, isNotNull} from 'drizzle-orm'

export const createTag = async (name: string, description: string) => {
  const user = await requireAuth()

  db.insert(tags)
    .values({name, description: description || null, ownerId: user.id})
    .run()
}

export const saveTagDescription = async (tagId: number, description: string) => {
  const user = await requireAuth()

  // Verify user owns this tag
  const tag = db
    .select()
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.ownerId, user.id)))
    .get()

  if (!tag) {
    throw new Error('Unauthorized: Tag not found or access denied')
  }

  db.update(tags).set({description}).where(eq(tags.id, tagId)).run()
}

export const renameTag = async (tagId: number, name: string) => {
  const user = await requireAuth()

  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('Tag name cannot be empty')
  }

  // Verify user owns this tag
  const tag = db
    .select({id: tags.id})
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.ownerId, user.id)))
    .get()

  if (!tag) {
    throw new Error('Unauthorized: Tag not found or access denied')
  }

  db.update(tags).set({name: trimmed}).where(eq(tags.id, tagId)).run()
}

// Returns the current user's soft-deleted private tags
export const getDeletedTags = async () => {
  const user = await requireAuth()

  return db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
      public: tags.public,
    })
    .from(tags)
    .where(and(eq(tags.ownerId, user.id), isNotNull(tags.deletedAt)))
    .all()
}

export const deleteTag = async (tagId: number) => {
  const user = await requireAuth()

  // Verify the user owns this (private) tag and it isn't already deleted
  const tag = db
    .select({id: tags.id})
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.ownerId, user.id), isNull(tags.deletedAt)))
    .get()

  if (!tag) {
    throw new Error('Unauthorized: Tag not found or access denied')
  }

  db.update(tags).set({deletedAt: new Date().toISOString()}).where(eq(tags.id, tagId)).run()
}

export const restoreTag = async (tagId: number) => {
  const user = await requireAuth()

  // Verify the user owns this tag
  const tag = db
    .select({id: tags.id})
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.ownerId, user.id)))
    .get()

  if (!tag) {
    throw new Error('Unauthorized: Tag not found or access denied')
  }

  db.update(tags).set({deletedAt: null}).where(eq(tags.id, tagId)).run()
}
