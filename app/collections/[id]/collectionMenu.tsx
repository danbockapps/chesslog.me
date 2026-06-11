'use client'

import {useRouter} from 'next/navigation'
import {FC, useState, useTransition} from 'react'
import {deleteCollection} from './actions/crudActions'

interface Props {
  collectionId: string
}

const CollectionMenu: FC<Props> = ({collectionId}) => {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCollection(collectionId)
      router.push('/collections')
    })
  }

  return (
    <>
      <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          type="button"
          aria-label="Collection options"
          className="btn btn-ghost btn-sm btn-circle text-base-content/60"
        >
          {/* Vertical ellipsis */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-10 mt-1 w-48 rounded-box bg-base-100 p-2 shadow-md
            border border-base-200"
        >
          <li>
            <button
              type="button"
              className="text-error"
              onClick={() => {
                // Close the dropdown by removing focus before opening the dialog
                ;(document.activeElement as HTMLElement | null)?.blur()
                setConfirmOpen(true)
              }}
            >
              Delete collection
            </button>
          </li>
        </ul>
      </div>

      <dialog className={`modal ${confirmOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="text-lg font-semibold">Delete this collection?</h3>
          <p className="py-4 text-base-content/70">
            This collection will be moved to the{' '}
            <span className="font-medium">Deleted collections</span> section. You can restore it any
            time — nothing is permanently removed.
          </p>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={isPending}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? 'Deleting…' : 'Delete collection'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setConfirmOpen(false)}>
          <button type="button">close</button>
        </form>
      </dialog>
    </>
  )
}

export default CollectionMenu
