'use client'

import Accordion from '@/app/ui/accordion'
import {gameAccordionClassNames} from '@/app/ui/accordionClassNames'
import {FC, useState} from 'react'
import {deleteManualGame} from '../actions/manualGameActions'
import Board from '../chesscom/board'
import GameAccordionHeader from '../gameAccordionHeader'
import Notes from '../notes'
import Tags from '../tags'

interface Props {
  id: number
  whiteUsername: string
  blackUsername: string
  winner: 'white' | 'black' | 'draw' | null
  gameDttm: Date
  eco: string | null
  timeControl: string | null
  fen: string
  pgn: string
  tagCount: number
  hasNotes: boolean
  isOwner: boolean
  initialOpen?: boolean
}

const {cardClassName, headerClassName} = gameAccordionClassNames
const contentClassName = `${gameAccordionClassNames.contentClassName} min-h-96`

const PgnGameAccordion: FC<Props> = (props) => {
  const [tagCount, setTagCount] = useState(props.tagCount)
  const [hasNotes, setHasNotes] = useState(props.hasNotes)

  const resultText =
    props.winner === 'white'
      ? '1-0'
      : props.winner === 'black'
        ? '0-1'
        : props.winner === 'draw'
          ? '½-½'
          : '—'

  const handleDelete = async () => {
    if (!confirm('Delete this game? This cannot be undone.')) return
    await deleteManualGame(props.id)
  }

  const header = (
    <GameAccordionHeader
      whiteUsername={props.whiteUsername}
      blackUsername={props.blackUsername}
      timeControl={props.timeControl ?? ''}
      opening={props.eco ?? ''}
      gameDttm={props.gameDttm}
      resultText={resultText}
      dateOnly
      tagCount={tagCount}
      hasNotes={hasNotes}
    />
  )

  return (
    <Accordion
      {...{header, cardClassName, headerClassName, contentClassName}}
      initialOpen={props.initialOpen}
    >
      <div>
        <Board type="pgn" pgn={props.pgn} fen={props.fen} orientation="white" />
        {props.isOwner && (
          <div className="flex justify-end pt-2">
            <button className="btn btn-ghost btn-xs text-error" onClick={handleDelete}>
              Delete game
            </button>
          </div>
        )}
      </div>

      <Tags gameId={props.id} isOwner={props.isOwner} onTagCountChange={setTagCount} />
      <Notes gameId={props.id} isOwner={props.isOwner} onNotesChange={setHasNotes} />
    </Accordion>
  )
}

export default PgnGameAccordion
