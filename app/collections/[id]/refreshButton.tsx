'use client'

import {FC, useState} from 'react'
import importChesscomGames from './actions/importChesscomGames'
import importLichessGames from './actions/importLichessGames'

interface Props {
  collectionId: string
  site: 'chess.com' | 'lichess'
  username: string
  timeClass: string | null | undefined
  lastRefreshed: Date | null
}

const RefreshButton: FC<Props> = ({collectionId, site, username, timeClass, lastRefreshed}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async () => {
    setLoading(true)
    setError(null)
    try {
      let result
      if (site === 'chess.com')
        result = await importChesscomGames(collectionId, lastRefreshed, username, timeClass ?? null)
      if (site === 'lichess')
        result = await importLichessGames(collectionId, lastRefreshed, username, timeClass ?? null)
      if (result?.error) setError(result.error)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button className="btn" onClick={onClick}>
        {loading && <span className="loading loading-spinner"></span>}
        Refresh
      </button>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  )
}

export default RefreshButton
