'use client'

import Accordion from '@/app/ui/accordion'
import {gameAccordionClassNames} from '@/app/ui/accordionClassNames'
import {FC, useState} from 'react'
import Board from '../chesscom/board'
import GameAccordionHeader from '../gameAccordionHeader'
import Notes from '../notes'
import Tags from '../tags'

interface Props {
  id: number
  username: string // Our user's username
  whiteUsername: string
  blackUsername: string
  winner: 'white' | 'black' | 'draw'
  gameDttm: Date
  eco: string
  clockInitial: number
  clockIncrement: number
  lichessGameId: string
  fen: string
  tagCount: number
  hasNotes: boolean
  isOwner: boolean
}

const {cardClassName, headerClassName, contentClassName, lichessClassName} = gameAccordionClassNames

const LichessGameAccordion: FC<Props> = (props) => {
  const [embed, setEmbed] = useState(true)
  const [tagCount, setTagCount] = useState(props.tagCount)
  const [hasNotes, setHasNotes] = useState(props.hasNotes)
  const ourColor = props.whiteUsername === props.username ? 'white' : 'black'

  const ourResult =
    !props.winner || props.winner === 'draw' ? 0.5 : props.winner === ourColor ? 1 : 0

  const header = (
    <GameAccordionHeader
      whiteUsername={props.whiteUsername}
      blackUsername={props.blackUsername}
      timeControl={`${props.clockInitial / 60}+${props.clockIncrement}`}
      opening={props.eco}
      gameDttm={props.gameDttm}
      points={ourResult}
      tagCount={tagCount}
      hasNotes={hasNotes}
    />
  )

  return (
    <Accordion
      {...{header, cardClassName, headerClassName}}
      contentClassName={`${embed ? lichessClassName : ''} ${contentClassName}`}
    >
      <div>
        <label className="label">
          <input
            type="checkbox"
            className="toggle"
            checked={embed}
            onChange={() => setEmbed(!embed)}
          />
          Lichess embedded board
        </label>

        {embed ? (
          <iframe
            className="lichess-iframe"
            src={`https://lichess.org/embed/game/${props.lichessGameId}/${ourColor}`}
          />
        ) : (
          <Board
            type="lichess"
            lichessGameId={props.lichessGameId}
            fen={props.fen}
            orientation={ourColor}
          />
        )}
      </div>

      <Tags gameId={props.id} isOwner={props.isOwner} onTagCountChange={setTagCount} />
      <Notes gameId={props.id} isOwner={props.isOwner} onNotesChange={setHasNotes} />
    </Accordion>
  )
}

export default LichessGameAccordion
