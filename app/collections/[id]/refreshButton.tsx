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

  const onClick = async () => {
    setLoading(true)
    if (site === 'chess.com')
      await importChesscomGames(collectionId, lastRefreshed, username, timeClass ?? null)
    if (site === 'lichess')
      await importLichessGames(collectionId, lastRefreshed, username, timeClass ?? null)
    setLoading(false)
  }

  return (
    <button className="btn" {...{onClick}}>
      {loading && <span className="loading loading-spinner"></span>}
      Refresh
    </button>
  )
}

export default RefreshButton
