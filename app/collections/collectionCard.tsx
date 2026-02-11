import Link from 'next/link'
import {FC} from 'react'

interface Props {
  id: string
  title: string
  site?: string | null
  username?: string | null
  timeClass?: string | null
  totalGameCount: number
  loggedGameCount: number
  className?: string
}

const TIME_CLASS_LABELS: Record<string, string> = {
  ultraBullet: 'ultrabullet',
  bullet: 'bullet',
  blitz: 'blitz',
  rapid: 'rapid',
  classical: 'classical',
}

const CollectionCard: FC<Props> = ({
  id,
  title,
  site,
  username,
  timeClass,
  totalGameCount,
  loggedGameCount,
  className,
}) => {
  const isChessCom = site === 'chess.com'
  const timeClassLabel = timeClass ? (TIME_CLASS_LABELS[timeClass] ?? timeClass) : null

  return (
    <Link href={`/collections/${id}`}>
      <div
        className={`group w-full md:w-80 h-48 flex flex-col rounded-xl bg-base-100 shadow-sm border border-base-200
          hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden
          ${className ?? ''}`}
      >
        {/* Top accent bar */}
        <div className="h-1 shrink-0 bg-primary" />

        <div className="p-4 flex flex-col flex-1">
          {/* Platform badge */}
          {site ? (
            <div
              className="self-start inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md mb-3 bg-base-300
                text-base-content/70"
            >
              {isChessCom ? 'Chess.com' : 'Lichess'}
            </div>
          ) : null}

          {/* Title */}
          <div className="flex-1 text-center">
            {username ? (
              <>
                <div className="font-semibold text-base-content text-lg leading-tight">
                  {username}
                </div>
                <div className="text-sm text-base-content/50 mt-0.5">
                  {timeClassLabel ? `${timeClassLabel} games` : 'All games'}
                </div>
              </>
            ) : (
              <div className="font-semibold text-base-content">{title}</div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-between pt-3 md:px-4 border-t border-base-200">
            <div className="text-center">
              <div className="text-xl font-bold text-base-content">{totalGameCount}</div>
              <div className="text-xs text-base-content/50">games</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{loggedGameCount}</div>
              <div className="text-xs text-base-content/50">logged</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CollectionCard
