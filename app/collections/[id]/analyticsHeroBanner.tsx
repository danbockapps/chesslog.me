import Link from 'next/link'
import DismissBannerButton from './dismissBannerButton'

interface Props {
  collectionId: string
  annotatedCount: number
  dismissed: boolean
}

export const ANALYTICS_UNLOCK_COUNT = 5
// Past this many logged games the collection is no longer "new", so the unlock banner is retired
const UNLOCK_BANNER_MAX = 10

export default function AnalyticsHeroBanner({collectionId, annotatedCount, dismissed}: Props) {
  if (annotatedCount < ANALYTICS_UNLOCK_COUNT) {
    return (
      <div className="mb-6 rounded-lg border border-base-300 bg-base-200 p-4">
        <h2 className="font-semibold">Log {ANALYTICS_UNLOCK_COUNT} games to unlock analytics</h2>
        <p className="mt-1 text-sm text-base-content/70">
          Add tags or notes to a game and it counts as logged.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <progress
            className="progress progress-primary w-48"
            value={annotatedCount}
            max={ANALYTICS_UNLOCK_COUNT}
          />
          <span className="text-sm text-base-content/70">
            {annotatedCount} of {ANALYTICS_UNLOCK_COUNT} games logged
          </span>
        </div>
      </div>
    )
  }

  if (dismissed || annotatedCount >= UNLOCK_BANNER_MAX) return null

  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4
        py-3"
    >
      <p className="text-sm">
        <span className="font-semibold">Analytics unlocked.</span>{' '}
        <span className="text-base-content/70">
          See which tags and themes show up most across your games.
        </span>
      </p>
      <Link
        href={`/collections/${collectionId}?analytics=open`}
        className="btn btn-sm btn-primary ml-auto shrink-0"
      >
        View analytics
      </Link>
      <DismissBannerButton collectionId={collectionId} />
    </div>
  )
}
