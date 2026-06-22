import {preparePgnForChessJs} from '@/lib/pgnSanitize'
import {Chess} from 'chess.js'
import {FC, useEffect, useRef, useState} from 'react'
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

type PgnProps = BaseProps & {
  type: 'pgn'
  pgn: string
}

const Board: FC<ChesscomProps | LichessProps | PgnProps> = (props) => {
  const chess = useRef<Chess>(new Chess())
  const containerRef = useRef<HTMLDivElement>(null)
  const [moves, setMoves] = useState<ChessJsMoveParam[]>()
  const [currentMove, setCurrentMove] = useState<number>()
  const [currentFen, setCurrentFen] = useState<string>()
  const [disabled, setDisabled] = useState(false)

  // Focus the board on mount so arrow keys work as soon as it appears (on
  // accordion expand, or when the Lichess embedded board is toggled off).
  useEffect(() => {
    containerRef.current?.focus({preventScroll: true})
  }, [])

  const getGame = (): Promise<ChessJsMoveParam[]> => {
    switch (props.type) {
      case 'chess.com':
        return getSingleChesscomGame(props.url)
      case 'lichess':
        return getSingleLichessGame(props.lichessGameId)
      case 'pgn': {
        // Moves are stored locally in the PGN — no server fetch needed.
        const parser = new Chess()
        parser.loadPgn(preparePgnForChessJs(props.pgn))
        return Promise.resolve(parser.history())
      }
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

  const goToStart = async () => {
    if (!moves) await loadGame()
    chess.current.reset()
    setCurrentFen(chess.current.fen())
    setCurrentMove(0)
  }

  const goBack = async () => {
    if (moves && currentMove !== undefined && currentMove > 0) {
      chess.current.undo()
      setCurrentFen(chess.current.fen())
      setCurrentMove(currentMove - 1)
    } else {
      const correctMoves = await loadGame()
      const newCurrentMove = correctMoves.length - 1

      correctMoves.forEach((move, i) => {
        if (i < newCurrentMove) {
          chess.current.move(move)
        }
      })

      setCurrentFen(chess.current.fen())
      setCurrentMove(newCurrentMove)
    }
  }

  const goForward = () => {
    if (moves && currentMove !== undefined && currentMove < moves.length) {
      chess.current.move(moves[currentMove])
      setCurrentFen(chess.current.fen())
      setCurrentMove(currentMove + 1)
    }
  }

  const goToEnd = () => {
    if (moves && currentMove !== undefined) {
      moves.forEach((move, i) => {
        if (i >= currentMove) chess.current.move(move)
      })

      setCurrentFen(chess.current.fen())
      setCurrentMove(moves.length)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowLeft':
        if (backwardButtonsDisabled) return
        e.preventDefault()
        goBack()
        break
      case 'ArrowRight':
        if (forwardButtonsDisabled) return
        e.preventDefault()
        goForward()
        break
      case 'Home':
        if (backwardButtonsDisabled) return
        e.preventDefault()
        goToStart()
        break
      case 'End':
        if (forwardButtonsDisabled) return
        e.preventDefault()
        goToEnd()
        break
    }
  }

  const [customDarkSquareStyle, customLightSquareStyle] =
    props.type === 'chess.com'
      ? [{backgroundColor: '#779955'}, {backgroundColor: '#e9eecd'}]
      : [undefined, undefined]

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={onKeyDown} className="outline-none">
      <Chessboard
        arePiecesDraggable={false}
        boardOrientation={props.orientation}
        position={currentFen ?? props.fen}
        {...{customDarkSquareStyle, customLightSquareStyle}}
      />

      <div className="py-2 flex">
        <button
          className={`flex-1
            ${backwardButtonsDisabled ? 'text-base-content/50' : 'text-base-content'}`}
          disabled={backwardButtonsDisabled}
          onClick={goToStart}
        >
          | &lt;
        </button>

        <button
          className={`flex-1
            ${backwardButtonsDisabled ? 'text-base-content/50' : 'text-base-content'}`}
          disabled={backwardButtonsDisabled}
          onClick={goBack}
        >
          &lt;
        </button>

        <button
          className={`flex-1
            ${forwardButtonsDisabled ? 'text-base-content/50' : 'text-base-content'}`}
          disabled={forwardButtonsDisabled}
          onClick={goForward}
        >
          &gt;
        </button>

        <button
          className={`flex-1
            ${forwardButtonsDisabled ? 'text-base-content/50' : 'text-base-content'}`}
          disabled={forwardButtonsDisabled}
          onClick={goToEnd}
        >
          &gt; |
        </button>
      </div>
    </div>
  )
}

export type ChessJsMoveParam = string | {from: string; to: string; promotion?: string}

export default Board
