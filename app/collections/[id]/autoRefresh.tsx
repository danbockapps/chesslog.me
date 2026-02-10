'use client'

import {FC, useEffect, useState} from 'react'
import importChesscomGames from './actions/importChesscomGames'
import importLichessGames from './actions/importLichessGames'

interface Props {
  collectionId: string
  site: 'chess.com' | 'lichess'
  username: string
  timeClass: string | null | undefined
  lastRefreshed: Date | null
}

const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

const AutoRefresh: FC<Props> = ({collectionId, site, username, timeClass, lastRefreshed}) => {
  const [loading, setLoading] = useState(() => {
    if (!lastRefreshed) return true
    return Date.now() - lastRefreshed.getTime() > STALE_THRESHOLD_MS
  })

  useEffect(() => {
    const isStale = !lastRefreshed || Date.now() - lastRefreshed.getTime() > STALE_THRESHOLD_MS
    if (!isStale) return

    let cancelled = false

    const run = async () => {
      if (site === 'chess.com')
        await importChesscomGames(collectionId, lastRefreshed, username, timeClass ?? null)
      if (site === 'lichess')
        await importLichessGames(collectionId, lastRefreshed, username, timeClass ?? null)
      if (!cancelled) setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading) return null

  return (
    <div className="flex items-center gap-2 text-sm text-base-content/60 py-3">
      <span className="loading loading-spinner loading-xs"></span>
      Checking for new games...
    </div>
  )
}

export default AutoRefresh
