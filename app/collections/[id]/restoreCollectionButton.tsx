'use client'

import {useRouter} from 'next/navigation'
import {FC, useTransition} from 'react'
import {restoreCollection} from './actions/crudActions'

interface Props {
  collectionId: string
}

const RestoreCollectionButton: FC<Props> = ({collectionId}) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRestore = () => {
    startTransition(async () => {
      await restoreCollection(collectionId)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      disabled={isPending}
      onClick={handleRestore}
    >
      {isPending ? 'Restoring…' : 'Restore collection'}
    </button>
  )
}

export default RestoreCollectionButton
