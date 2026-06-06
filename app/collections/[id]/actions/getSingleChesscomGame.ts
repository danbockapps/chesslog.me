'use server'

import {decodeTcn} from '@/lib/tcn'

const getSingleChesscomGame = async (url: string) => {
  const response = await fetch(`https://www.chess.com/callback/live/game/${url.split('/').pop()}`)
  const result = await response.json()
  return decodeTcn(result.game.moveList)
}

export default getSingleChesscomGame
