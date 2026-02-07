'use server'

import {requireAuth} from '@/lib/auth'
import {db} from '@/lib/db'
import {collections} from '@/lib/schema'
import {Type, TimeClass} from './createNewModal'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

export async function createCollection(
  type: Type,
  username: string,
  timeClass: TimeClass,
  name: string | null,
) {
  const user = await requireAuth()

  const isPlatform = type === 'lichess' || type === 'chess.com'

  if (isPlatform && !timeClass) {
    throw new Error('Time class is required for platform collections')
  }

  const collectionId = crypto.randomUUID()

  db.insert(collections)
    .values({
      id: collectionId,
      ownerId: user.id,
      name: isPlatform ? null : name?.trim() || 'Untitled collection',
      username: username.trim() || null,
      site: isPlatform ? type : null,
      timeClass: timeClass,
    })
    .run()

  revalidatePath('/collections')
  redirect(`/collections/${collectionId}`)
}
