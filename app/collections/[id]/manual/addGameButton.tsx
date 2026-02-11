'use client'

import {FC, useState} from 'react'
import {createManualGame} from '../actions/manualGameActions'

interface Props {
  collectionId: string
}

const AddGameButton: FC<Props> = ({collectionId}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [whitePlayer, setWhitePlayer] = useState('')
  const [blackPlayer, setBlackPlayer] = useState('')
  const [gameDttm, setGameDttm] = useState(() => new Date().toISOString().split('T')[0])
  const [winner, setWinner] = useState<'white' | 'black' | 'draw' | ''>('')
  const [timeControl, setTimeControl] = useState('')
  const [opening, setOpening] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setWhitePlayer('')
    setBlackPlayer('')
    setGameDttm(new Date().toISOString().split('T')[0])
    setWinner('')
    setTimeControl('')
    setOpening('')
    setUrl('')
  }

  const handleClose = () => {
    resetForm()
    setIsOpen(false)
  }

  const handleSubmit = async () => {
    if (!whitePlayer.trim() || !blackPlayer.trim() || !gameDttm) return
    setSaving(true)
    await createManualGame(collectionId, {
      whitePlayer: whitePlayer.trim(),
      blackPlayer: blackPlayer.trim(),
      gameDttm: new Date(gameDttm + 'T12:00:00').toISOString(),
      winner: winner === '' ? null : winner,
      timeControl: timeControl.trim() || null,
      opening: opening.trim() || null,
      url: url.trim() || null,
    })
    resetForm()
    setSaving(false)
    setIsOpen(false)
  }

  const canSubmit = whitePlayer.trim() && blackPlayer.trim() && gameDttm

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setIsOpen(true)}>
        + Add game
      </button>

      <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Add game</h3>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-circle absolute top-2 right-2"
            aria-label="close"
          >
            ✕
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Player name — white *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="White player"
                value={whitePlayer}
                onChange={(e) => setWhitePlayer(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Player name — black *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Black player"
                value={blackPlayer}
                onChange={(e) => setBlackPlayer(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={gameDttm}
                onChange={(e) => setGameDttm(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Result</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={winner}
                onChange={(e) => setWinner(e.target.value as 'white' | 'black' | 'draw' | '')}
              >
                <option value="">Not recorded</option>
                <option value="white">White wins</option>
                <option value="black">Black wins</option>
                <option value="draw">Draw</option>
              </select>
            </div>

            <div className="form-control sm:col-span-2">
              <label className="label">
                <span className="label-text">Opening</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Sicilian Defense"
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Time control</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. 5+3"
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">URL</span>
              </label>
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-action items-center">
            <p className="text-xs text-base-content/50 mr-auto">* Required fields</p>
            <button className="btn btn-ghost" onClick={handleClose} disabled={saving}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving || !canSubmit}
            >
              {saving && <span className="loading loading-spinner loading-sm" />}
              Add game
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop backdrop-blur-sm" onClick={handleClose}>
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}

export default AddGameButton
