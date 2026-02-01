import {getTagDistribution, getResultStats, getGamesWithNotes} from './actions'
import TagDistributionChart from './charts/tagDistribution'

export default async function AnalyticsView({
  collectionId,
  userId,
  username,
  site,
}: {
  collectionId: string
  userId: string
  username: string
  site: 'chess.com' | 'lichess'
}) {
  // Fetch tag distribution data
  const tagStats = await getTagDistribution(collectionId, userId)

  return (
    <div className="space-y-8 py-4">
      <section>
        <h2 className="text-lg font-semibold mb-3">Tag Distribution</h2>
        <TagDistributionChart data={tagStats} />
      </section>

      {/* Placeholder sections for future phases */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Performance Overview</h2>
        <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
          <p className="text-base-content/70">Coming soon</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Common Themes in Notes</h2>
        <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
          <p className="text-base-content/70">Coming soon</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Game Summary</h2>
        <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
          <p className="text-base-content/70">Coming soon</p>
        </div>
      </section>
    </div>
  )
}
