import {getGamesWithNotes, getTagDistribution} from './actions'
import NotesWordCloud from './charts/notesWordCloud'
import TagDistributionChart from './charts/tagDistribution'
import {processNotesToWordCloud} from './wordCloudProcessor'

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
  // Fetch analytics data in parallel
  const [tagStats, notesData] = await Promise.all([
    getTagDistribution(collectionId, userId),
    getGamesWithNotes(collectionId),
  ])

  // Process notes for word cloud
  const wordCloudData = processNotesToWordCloud(notesData)

  return (
    <div className="space-y-8 py-4">
      <section>
        <h2 className="text-lg font-semibold mb-3">Tag Distribution</h2>
        <TagDistributionChart data={tagStats} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Common Themes in Notes</h2>
        <NotesWordCloud data={wordCloudData} />
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
