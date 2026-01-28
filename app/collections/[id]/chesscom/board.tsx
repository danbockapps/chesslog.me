import {Chess} from 'chess.js'
import {FC, useRef, useState} from 'react'
import {Chessboard} from 'react-chessboard'
import getSingleChesscomGame from '../actions/getSingleChesscomGame'
import getSingleLichessGame from '../actions/getSingleLichessGame'

interface BaseProps {
  orientation: 'white' | 'black'
  fen: string
}

type ChesscomProps = BaseProps & {
  type: 'chess.com'
  url: string
}

type LichessProps = BaseProps & {
  type: 'lichess'
  lichessGameId: string
}

const Board: FC<ChesscomProps | LichessProps> = (props) => {
  const chess = useRef<Chess>(new Chess())
  const [moves, setMoves] = useState<ChessJsMoveParam[]>()
  const [currentMove, setCurrentMove] = useState<number>()
  const [disabled, setDisabled] = useState(false)

  const getGame = () => {
    switch (props.type) {
      case 'chess.com':
        return getSingleChesscomGame(props.url)
      case 'lichess':
        return getSingleLichessGame(props.lichessGameId)
      default:
        throw new Error('Invalid game type')
    }
  }

  const loadGame = async () => {
    setDisabled(true)
    const res = await getGame()
    setMoves(res)
    setDisabled(false)
    return res
  }

  const backwardButtonsDisabled = disabled || currentMove === 0

  const forwardButtonsDisabled =
    disabled || !moves || currentMove === undefined || currentMove >= moves.length

  const [customDarkSquareStyle, customLightSquareStyle] =
    props.type === 'chess.com'
      ? [{backgroundColor: '#779955'}, {backgroundColor: '#e9eecd'}]
      : [undefined, undefined]

  return (
    <div>
      <Chessboard
        arePiecesDraggable={false}
        boardOrientation={props.orientation}
        position={moves ? chess.current.fen() : props.fen}
        {...{customDarkSquareStyle, customLightSquareStyle}}
      />

      <div className="py-2 flex">
        <button
          className={`flex-1 ${backwardButtonsDisabled ? 'text-text-muted' : 'text-text-primary'}`}
          disabled={backwardButtonsDisabled}
          onClick={async () => {
            if (!moves) await loadGame()
            setCurrentMove(0)
            chess.current.reset()
          }}
        >
          | &lt;
        </button>

        <button
          className={`flex-1 ${backwardButtonsDisabled ? 'text-text-muted' : 'text-text-primary'}`}
          disabled={backwardButtonsDisabled}
          onClick={async () => {
            if (moves && currentMove !== undefined && currentMove > 0) {
              chess.current.undo()
              setCurrentMove(currentMove - 1)
            } else {
              const correctMoves = await loadGame()
              const newCurrentMove = correctMoves.length - 1

              correctMoves.forEach((move, i) => {
                if (i < newCurrentMove) {
                  chess.current.move(move)
                }
              })

              setCurrentMove(newCurrentMove)
            }
          }}
        >
          &lt;
        </button>

        <button
          className={`flex-1 ${forwardButtonsDisabled ? 'text-text-muted' : 'text-text-primary'}`}
          disabled={forwardButtonsDisabled}
          onClick={() => {
            if (moves && currentMove !== undefined && currentMove < moves.length) {
              chess.current.move(moves[currentMove])
              setCurrentMove(currentMove + 1)
            }
          }}
        >
          &gt;
        </button>

        <button
          className={`flex-1 ${forwardButtonsDisabled ? 'text-text-muted' : 'text-text-primary'}`}
          disabled={forwardButtonsDisabled}
          onClick={() => {
            if (moves && currentMove !== undefined) {
              moves.forEach((move, i) => {
                if (i >= currentMove) chess.current.move(move)
              })

              setCurrentMove(moves.length)
            }
          }}
        >
          &gt; |
        </button>
      </div>
    </div>
  )
}

export type ChessJsMoveParam = string | {from: string; to: string; promotion?: string}

export default Board
