import TagBadge from '@/app/ui/tagBadge'
import {FC, useState} from 'react'

interface Props {
  id: number
  name: string | null
  description: string | null
  isPublic: boolean
  isDeleted?: boolean
  onEditDescription?: (tagId: number) => void
  onDelete?: (tagId: number) => Promise<void> | void
  onRestore?: (tagId: number) => Promise<void> | void
  onRename?: (tagId: number, name: string) => Promise<void> | void
}

const TagCard: FC<Props> = ({
  id,
  name,
  description,
  isPublic,
  isDeleted,
  onEditDescription,
  onDelete,
  onRestore,
  onRename,
}) => {
  const [confirming, setConfirming] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(name ?? '')
  const [busy, setBusy] = useState(false)

  const handleDelete = async () => {
    setBusy(true)
    try {
      await onDelete?.(id)
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  const handleRestore = async () => {
    setBusy(true)
    try {
      await onRestore?.(id)
    } finally {
      setBusy(false)
    }
  }

  const startRename = () => {
    setNewName(name ?? '')
    setRenaming(true)
  }

  const handleRename = async () => {
    if (!newName.trim()) return
    setBusy(true)
    try {
      await onRename?.(id, newName.trim())
      setRenaming(false)
    } finally {
      setBusy(false)
    }
  }

  // Soft-deleted tag: muted card with a Restore action
  if (isDeleted) {
    return (
      <div className="p-4 bg-base-200 rounded-2xl border border-base-300 flex items-center gap-2">
        <div className="opacity-60">
          <TagBadge name={name || ''} isPublic={false} maxWidth="none" />
        </div>
        <button
          className="btn btn-xs btn-outline btn-primary ml-auto"
          onClick={handleRestore}
          disabled={busy}
        >
          {busy ? 'Restoring…' : 'Restore'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-base-200 rounded-2xl border border-base-300">
      <div className="flex items-center gap-2 mb-2">
        <TagBadge name={name || ''} isPublic={isPublic} maxWidth="none" />

        {!isPublic && onDelete && !confirming && !renaming && (
          <div className="dropdown dropdown-end ml-auto">
            <button
              tabIndex={0}
              type="button"
              aria-label="Tag options"
              className="btn btn-ghost btn-xs btn-circle text-base-content/60"
            >
              {/* Vertical ellipsis */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu z-10 mt-1 w-40 rounded-box bg-base-100 p-2 shadow-md
                border border-base-200"
            >
              {onRename && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      // Close the dropdown before showing the inline rename input
                      ;(document.activeElement as HTMLElement | null)?.blur()
                      startRename()
                    }}
                  >
                    Edit name
                  </button>
                </li>
              )}
              {onEditDescription && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      // Close the dropdown before showing the description dialog
                      ;(document.activeElement as HTMLElement | null)?.blur()
                      onEditDescription(id)
                    }}
                  >
                    Edit description
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  className="text-error"
                  onClick={() => {
                    // Close the dropdown before showing the inline confirmation
                    ;(document.activeElement as HTMLElement | null)?.blur()
                    setConfirming(true)
                  }}
                >
                  Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {renaming ? (
        <div className="pl-1 flex flex-col gap-3">
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setRenaming(false)
            }}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setRenaming(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              className="btn btn-xs btn-primary"
              onClick={handleRename}
              disabled={!newName.trim() || busy}
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : confirming ? (
        <div className="pl-1 flex flex-col gap-3">
          <p className="text-sm text-base-content/70">
            Delete this tag? Deleted tags can be restored later.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="btn btn-xs btn-error" onClick={handleDelete} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        <div className="pl-1">
          <p className="text-sm text-base-content/70 leading-relaxed">
            {description || 'No description available'}
          </p>
        </div>
      )}
    </div>
  )
}

export default TagCard
