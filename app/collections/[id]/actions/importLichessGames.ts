'use server'

import {requireAuth, requireOwnership} from '@/lib/auth'
import {fetchLichessGames, saveGames, transformLichessGame} from '@/lib/gameImport'
import {revalidatePath} from 'next/cache'

const importLichessGames = async (
  collectionId: string,
  lastRefreshed: Date | null,
  username: string,
  timeClass: string | null = null,
) => {
  // Verify user owns this collection
  const user = await requireAuth()
  await requireOwnership(collectionId, user.id)

  console.log('importLichessGames')
  console.time('importLichessGames')

  const params: Record<string, string> = {
    max: '20',
    since: `${lastRefreshed?.getTime() ?? ''}`,
    moves: 'false',
    opening: 'true',
    lastFen: 'true',
  }

  // Add perfType filter if timeClass is specified
  if (timeClass) {
    params.perfType = timeClass
  }

  const data = await fetchLichessGames(username, params)

  console.timeLog('importLichessGames', `fetched ${data.length} games`)

  if (data.length > 0) {
    try {
      const gamesData = data.map((g) => transformLichessGame(g, collectionId))

      saveGames(gamesData, collectionId, 'lichess')

      console.timeLog('importLichessGames', 'inserted')
    } catch (e) {
      console.log('Caught error inserting games for Lichess')
      console.error(e)
    }
  }

  console.timeEnd('importLichessGames')
  revalidatePath(`/collections/${collectionId}`)
}

export default importLichessGames
