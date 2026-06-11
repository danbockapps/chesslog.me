'use client'

import {FC, MouseEvent, useTransition} from 'react'
import {restoreCollection} from './[id]/actions/crudActions'

interface Props {
  id: string
}

const CollectionCardMenu: FC<Props> = ({id}) => {
  const [isPending, startTransition] = useTransition()

  const handleRestore = (e: MouseEvent) => {
    // Stop the surrounding card Link from navigating
    e.preventDefault()
    e.stopPropagation()
    startTransition(() => restoreCollection(id))
  }

  return (
    <button
      type="button"
      onClick={handleRestore}
      disabled={isPending}
      className="btn btn-xs btn-ghost absolute top-2 right-2 z-10"
    >
      {isPending ? 'Restoring…' : 'Restore'}
    </button>
  )
}

export default CollectionCardMenu
