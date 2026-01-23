'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {tags} from '@/lib/schema'
import {eq, and} from 'drizzle-orm'

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
