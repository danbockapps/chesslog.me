'use client'

import {useRouter} from 'next/navigation'
import {FC, useState} from 'react'
import {getStudyPgn, importPgnGames, previewPgnImport} from '../actions/pgnImportActions'
import type {PgnImportPreviewItem} from '@/lib/pgnImport'

interface Props {
  collectionId: string
  /** 'file' shows a file/paste input; 'study' downloads the linked Lichess study's PGN. */
  mode: 'file' | 'study'
  triggerLabel: string
  triggerClassName?: string
}

const ImportPgnModal: FC<Props> = ({collectionId, mode, triggerLabel, triggerClassName}) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [pgnText, setPgnText] = useState('')
  const [preview, setPreview] = useState<PgnImportPreviewItem[] | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setPgnText('')
    setPreview(null)
    setSelected(new Set())
    setShowDuplicates(false)
    setLoading(false)
    setImporting(false)
    setError(null)
  }

  const close = () => {
    reset()
    setIsOpen(false)
  }

  const runPreview = async (text: string) => {
    setLoading(true)
    setError(null)
    try {
      const items = await previewPgnImport(collectionId, text)
      if (items.length === 0) {
        setError('No valid games found in this PGN.')
        setLoading(false)
        return
      }
      setPgnText(text)
      setPreview(items)
      // New games checked by default; duplicates unchecked.
      setSelected(new Set(items.filter((i) => !i.isDuplicate).map((i) => i.index)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read PGN')
    } finally {
      setLoading(false)
    }
  }

  const open = async () => {
    setIsOpen(true)
    if (mode === 'study') {
      setLoading(true)
      try {
        const text = await getStudyPgn(collectionId)
        await runPreview(text)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load study')
        setLoading(false)
      }
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    await runPreview(await file.text())
  }

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    try {
      await importPgnGames(collectionId, pgnText, [...selected])
      close()
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import games')
      setImporting(false)
    }
  }

  const newGames = preview?.filter((i) => !i.isDuplicate) ?? []
  const duplicates = preview?.filter((i) => i.isDuplicate) ?? []

  const renderGame = (item: PgnImportPreviewItem) => {
    // Duplicates can't be imported (the server skips them), so they get no checkbox.
    const Wrapper = item.isDuplicate ? 'div' : 'label'
    return (
      <Wrapper
        key={item.index}
        className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
          item.isDuplicate ? 'opacity-60' : 'hover:bg-base-200 cursor-pointer' }`}
      >
        {!item.isDuplicate && (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={selected.has(item.index)}
            onChange={() => toggle(item.index)}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">
            {item.white} vs. {item.black}
            <span className="text-base-content/60"> · {item.result}</span>
          </div>
          <div className="text-xs text-base-content/50 truncate">
            {item.event && <>{item.event} · </>}
            {item.date ?? 'No date'} · {item.moveCount} moves
          </div>
        </div>
      </Wrapper>
    )
  }

  return (
    <>
      <button className={triggerClassName ?? 'btn btn-sm'} onClick={open}>
        {triggerLabel}
      </button>

      <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl">
          <button
            onClick={close}
            className="btn btn-ghost btn-circle btn-sm absolute top-2 right-2"
            aria-label="close"
            disabled={importing}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-4">Import PGN</h3>

          {/* Input stage (file mode, before a PGN is loaded) */}
          {mode === 'file' && !preview && (
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept=".pgn,application/x-chess-pgn,text/plain"
                className="file-input file-input-bordered w-full"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={loading}
              />
              <div className="divider text-xs text-base-content/50">or paste PGN</div>
              <textarea
                className="textarea textarea-bordered w-full h-32 font-mono text-xs"
                placeholder='[Event "..."]&#10;1. e4 e5 ...'
                value={pgnText}
                onChange={(e) => setPgnText(e.target.value)}
                disabled={loading}
              />
              <button
                className="btn btn-primary btn-sm self-end"
                onClick={() => runPreview(pgnText)}
                disabled={loading || !pgnText.trim()}
              >
                {loading && <span className="loading loading-spinner loading-sm" />}
                Load games
              </button>
            </div>
          )}

          {/* Loading (study mode fetch, or preview) */}
          {loading && !preview && mode === 'study' && (
            <div className="flex items-center gap-3 py-8 justify-center text-base-content/60">
              <span className="loading loading-spinner" />
              Loading study…
            </div>
          )}

          {/* Preview stage */}
          {preview && (
            <div className="flex flex-col gap-3">
              {newGames.length > 0 ? (
                <div>
                  <div className="text-sm font-medium mb-1">New games ({newGames.length})</div>
                  <div className="max-h-64 overflow-y-auto">{newGames.map(renderGame)}</div>
                </div>
              ) : (
                <p className="text-sm text-base-content/60 py-2">
                  No new games — everything in this PGN is already in the collection.
                </p>
              )}

              {duplicates.length > 0 && (
                <div className="border-t border-base-300 pt-2">
                  <button
                    className="flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content"
                    onClick={() => setShowDuplicates((v) => !v)}
                  >
                    <span>{showDuplicates ? '▾' : '▸'}</span>
                    Duplicates detected ({duplicates.length})
                  </button>
                  {showDuplicates && (
                    <div className="max-h-64 overflow-y-auto mt-1">
                      {duplicates.map(renderGame)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-error text-sm mt-3">{error}</p>}

          {preview && (
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={close} disabled={importing}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={importing || selected.size === 0}
              >
                {importing && <span className="loading loading-spinner loading-sm" />}
                Import {selected.size} game{selected.size === 1 ? '' : 's'}
              </button>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop backdrop-blur-sm" onClick={close}>
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}

export default ImportPgnModal
