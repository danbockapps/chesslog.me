'use client'

import {FC, useState} from 'react'
import CopyButton from './export/copyButton'

const ShareButton: FC<{collectionId: string}> = ({collectionId}) => {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')

  const openDialog = () => {
    setUrl(`${window.location.origin}/collections/${collectionId}`)
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        aria-label="Share collection"
        className="btn btn-sm btn-outline"
        onClick={openDialog}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.83 3.98" />
        </svg>
        Share
      </button>

      <dialog className={`modal ${open ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="text-lg font-semibold">Share this collection</h3>
          <p className="py-2 text-base-content/70">
            Anyone with this link can view the collection.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              className="input input-sm input-bordered w-full font-mono"
            />
          </div>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Close
            </button>
            <CopyButton text={url} />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setOpen(false)}>
          <button type="button">close</button>
        </form>
      </dialog>
    </>
  )
}

export default ShareButton
