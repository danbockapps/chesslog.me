'use client'

import {FC, useState} from 'react'
import loadOlderGames from './actions/loadOlderGames'

interface Props {
  collectionId: string
}

const LoadOlderGamesButton: FC<Props> = ({collectionId}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noMore, setNoMore] = useState(false)

  const onClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loadOlderGames(collectionId)
      if ('error' in result) setError(result.error)
      else if (result.added === 0) setNoMore(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (noMore) {
    return <p className="text-center text-sm text-base-content/40 py-8">No older games found</p>
  }

  return (
    <div className="flex flex-col items-center gap-1 py-8">
      <button className="btn btn-outline btn-sm" onClick={onClick} disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm"></span>}
        Load older games
      </button>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  )
}

export default LoadOlderGamesButton
