import {requireAuth} from '@/lib/auth'
import {getCollectionDisplayName} from '@/lib/collectionUtils'
import {db} from '@/lib/db'
import {collections} from '@/lib/schema'
import {eq} from 'drizzle-orm'
import CreateNew from '../ui/createNew/createNew'
import CollectionCard from './collectionCard'

export const dynamic = 'force-dynamic'

export default async function PrivatePage() {
  const user = await requireAuth()

  const userCollections = db
    .select()
    .from(collections)
    .where(eq(collections.ownerId, user.id))
    .all()

  return (
    <div className="flex gap-4 p-4 flex-col md:flex-wrap md:flex-row">
      {userCollections?.map((c) => {
        const displayName = getCollectionDisplayName(c)
        return (
          <CollectionCard key={c.id} id={c.id} title={displayName}>
            {displayName}
          </CollectionCard>
        )
      })}

      <CreateNew />
    </div>
  )
}
