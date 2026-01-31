'use client'
import {FC} from 'react'

interface Props {
  whiteUsername: string
  blackUsername: string
  timeControl: string
  opening: string
  gameDttm: Date
  points: 0 | 0.5 | 1
}

const GameAccordionHeader: FC<Props> = (props) => (
  <>
    {/* flex-none prevents the dot from getting squeezed when the usernames are long */}
    <div className={`flex-none h-2 w-2 rounded ${getDotColor(props.points)}`} />

    <div className="truncate">
      {props.whiteUsername} vs. {props.blackUsername}
    </div>

    <div className="text-base-content/70">{props.timeControl}</div>
    <div className="hidden md:block ml-auto truncate max-w-sm text-base-content/70">
      {props.opening}
    </div>
    <div className="ml-auto md:ml-0 text-base-content/70">{getRelativeTime(props.gameDttm)}</div>
  </>
)

const getRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

const getDotColor = (points: 0 | 0.5 | 1) => {
  switch (points) {
    case 1:
      return 'bg-success'
    case 0.5:
      return 'bg-base-content/70'
    case 0:
      return 'bg-error'
  }
}

export default GameAccordionHeader
