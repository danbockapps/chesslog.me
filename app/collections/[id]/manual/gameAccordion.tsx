'use client'

import Accordion from '@/app/ui/accordion'
import {gameAccordionClassNames} from '@/app/ui/accordionClassNames'
import {FC, useState} from 'react'
import {deleteManualGame, updateManualGame} from '../actions/manualGameActions'
import Notes from '../notes'
import Tags from '../tags'

interface Props {
  id: number
  whitePlayer: string
  blackPlayer: string
  gameDttm: Date
  winner: 'white' | 'black' | 'draw' | null
  timeControl: string | null
  opening: string | null
  url: string | null
  tagCount: number
  hasNotes: boolean
  isOwner: boolean
}

const {cardClassName, headerClassName} = gameAccordionClassNames

type Winner = 'white' | 'black' | 'draw' | null

const ManualGameAccordion: FC<Props> = (props) => {
  const [tagCount, setTagCount] = useState(props.tagCount)
  const [hasNotes, setHasNotes] = useState(props.hasNotes)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Current saved state (updated on save)
  const [current, setCurrent] = useState({
    whitePlayer: props.whitePlayer,
    blackPlayer: props.blackPlayer,
    gameDttm: props.gameDttm,
    winner: props.winner,
    timeControl: props.timeControl,
    opening: props.opening,
    url: props.url,
  })

  // Draft state while editing
  const [draft, setDraft] = useState({
    whitePlayer: props.whitePlayer,
    blackPlayer: props.blackPlayer,
    gameDttm: props.gameDttm.toISOString().split('T')[0],
    winner: (props.winner ?? '') as 'white' | 'black' | 'draw' | '',
    timeControl: props.timeControl ?? '',
    opening: props.opening ?? '',
    url: props.url ?? '',
  })

  const startEdit = () => {
    setDraft({
      whitePlayer: current.whitePlayer,
      blackPlayer: current.blackPlayer,
      gameDttm: current.gameDttm.toISOString().split('T')[0],
      winner: current.winner ?? '',
      timeControl: current.timeControl ?? '',
      opening: current.opening ?? '',
      url: current.url ?? '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!draft.whitePlayer.trim() || !draft.blackPlayer.trim() || !draft.gameDttm) return
    setSaving(true)
    const newWinner: Winner = draft.winner === '' ? null : draft.winner
    await updateManualGame(props.id, {
      whitePlayer: draft.whitePlayer.trim(),
      blackPlayer: draft.blackPlayer.trim(),
      gameDttm: new Date(draft.gameDttm + 'T12:00:00').toISOString(),
      winner: newWinner,
      timeControl: draft.timeControl.trim() || null,
      opening: draft.opening.trim() || null,
      url: draft.url.trim() || null,
    })
    setCurrent({
      whitePlayer: draft.whitePlayer.trim(),
      blackPlayer: draft.blackPlayer.trim(),
      gameDttm: new Date(draft.gameDttm + 'T12:00:00'),
      winner: newWinner,
      timeControl: draft.timeControl.trim() || null,
      opening: draft.opening.trim() || null,
      url: draft.url.trim() || null,
    })
    setSaving(false)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this game? This cannot be undone.')) return
    await deleteManualGame(props.id)
  }

  const canSave = draft.whitePlayer.trim() && draft.blackPlayer.trim() && draft.gameDttm

  const points =
    current.winner === 'white'
      ? 1
      : current.winner === 'black'
        ? 0
        : current.winner === 'draw'
          ? 0.5
          : null

  const badges = (
    <>
      {tagCount > 0 && (
        <div className="badge badge-sm badge-primary gap-1">
          {tagCount} {tagCount === 1 ? 'tag' : 'tags'}
        </div>
      )}
      {hasNotes && <div className="badge badge-sm badge-secondary">notes</div>}
    </>
  )

  const header = (
    <div className="flex flex-col gap-1 w-full min-w-0">
      <div className="flex items-center gap-4">
        <div className={`flex-none h-2 w-2 rounded ${getDotColor(points)}`} />
        <div className="truncate">
          {current.whitePlayer} vs. {current.blackPlayer}
        </div>
        {current.timeControl && <div className="text-base-content/70">{current.timeControl}</div>}
        <div className="hidden md:flex items-center gap-2 ml-auto">{badges}</div>
        <div className="hidden md:block text-base-content/70">
          {getRelativeTime(current.gameDttm)}
        </div>
      </div>
      <div className="flex md:hidden items-center gap-2 pl-6">
        {badges}
        <div className="ml-auto text-base-content/70">{getRelativeTime(current.gameDttm)}</div>
      </div>
    </div>
  )

  return (
    <Accordion {...{header, cardClassName, headerClassName}}>
      <div className="p-4 flex flex-col gap-8">
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Player name — white *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={draft.whitePlayer}
                  onChange={(e) => setDraft((d) => ({...d, whitePlayer: e.target.value}))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Player name — black *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={draft.blackPlayer}
                  onChange={(e) => setDraft((d) => ({...d, blackPlayer: e.target.value}))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date *</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={draft.gameDttm}
                  onChange={(e) => setDraft((d) => ({...d, gameDttm: e.target.value}))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Result</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={draft.winner}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      winner: e.target.value as 'white' | 'black' | 'draw' | '',
                    }))
                  }
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
                  value={draft.opening}
                  onChange={(e) => setDraft((d) => ({...d, opening: e.target.value}))}
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
                  value={draft.timeControl}
                  onChange={(e) => setDraft((d) => ({...d, timeControl: e.target.value}))}
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
                  value={draft.url}
                  onChange={(e) => setDraft((d) => ({...d, url: e.target.value}))}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-between items-center">
              <button
                className="btn btn-outline btn-error btn-sm"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete game
              </button>
              <div className="flex items-center gap-3">
                <p className="text-xs text-base-content/50">* Required fields</p>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving || !canSave}
                >
                  {saving && <span className="loading loading-spinner loading-xs" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              <span className="text-base-content/60">White</span>
              <span>{current.whitePlayer}</span>
              <span className="text-base-content/60">Black</span>
              <span>{current.blackPlayer}</span>
              <span className="text-base-content/60">Date</span>
              <span>{current.gameDttm.toLocaleDateString()}</span>
              <span className="text-base-content/60">Result</span>
              <span>{getResultLabel(current.winner)}</span>
              {current.opening && (
                <>
                  <span className="text-base-content/60">Opening</span>
                  <span>{current.opening}</span>
                </>
              )}
              {current.timeControl && (
                <>
                  <span className="text-base-content/60">Time control</span>
                  <span>{current.timeControl}</span>
                </>
              )}
              {current.url && (
                <>
                  <span className="text-base-content/60">URL</span>
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary truncate"
                  >
                    {current.url}
                  </a>
                </>
              )}
            </div>
            {props.isOwner && (
              <div className="flex justify-end">
                <button className="btn btn-ghost btn-xs" onClick={startEdit}>
                  ✏️ Edit game
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-x-4 gap-y-12 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          <Tags gameId={props.id} isOwner={props.isOwner} onTagCountChange={setTagCount} />
          <Notes gameId={props.id} isOwner={props.isOwner} onNotesChange={setHasNotes} />
        </div>
      </div>
    </Accordion>
  )
}

const getDotColor = (points: 0 | 0.5 | 1 | null) => {
  switch (points) {
    case 1:
      return 'bg-success'
    case 0.5:
      return 'bg-base-content/70'
    case 0:
      return 'bg-error'
    default:
      return 'bg-base-content/20'
  }
}

const getResultLabel = (winner: Winner) => {
  switch (winner) {
    case 'white':
      return 'White wins'
    case 'black':
      return 'Black wins'
    case 'draw':
      return 'Draw'
    default:
      return '—'
  }
}

const getRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

export default ManualGameAccordion
