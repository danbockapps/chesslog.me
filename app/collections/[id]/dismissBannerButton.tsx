'use client'

import {FC, useTransition} from 'react'
import {dismissInsightsBanner} from './actions/crudActions'

const DismissBannerButton: FC<{collectionId: string}> = ({collectionId}) => {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs btn-circle"
      aria-label="Dismiss"
      disabled={isPending}
      onClick={() => startTransition(() => dismissInsightsBanner(collectionId))}
    >
      ✕
    </button>
  )
}

export default DismissBannerButton
