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
  name: string,
) {
  const user = await requireAuth()

  const collectionId = crypto.randomUUID()

  db.insert(collections)
    .values({
      id: collectionId,
      ownerId: user.id,
      name: name.trim() || 'Untitled collection',
      username: username.trim() || null,
      site: type === 'lichess' || type === 'chess.com' ? type : null,
      timeClass: timeClass,
    })
    .run()

  revalidatePath('/collections')
  redirect(`/collections/${collectionId}`)
}
