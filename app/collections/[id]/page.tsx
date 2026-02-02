import {requireAuth, requireOwnership} from '@/lib/auth'
import {db} from '@/lib/db'
import {collections, games} from '@/lib/schema'
import {desc, eq} from 'drizzle-orm'
import Link from 'next/link'
import {FC} from 'react'
import {ChesscomResult} from './actions/importChesscomGames'
import AnalyticsHeroBanner from './analyticsHeroBanner'
import AnalyticsModalWrapper from './analytics/analyticsModalWrapper'
import AnalyticsView from './analytics/analyticsView'
import ChesscomGameAccordion from './chesscom/gameAccordion'
import LastRefreshedDisplay from './lastRefreshedDisplay'
import LichessGameAccordion from './lichess/gameAccordion'
import RefreshButton from './refreshButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{id: string}>
  searchParams: Promise<{page: string; analytics: string}>
}

const PAGE_SIZE = 50

const Collection: FC<Props> = async (props) => {
  const params = await props.params
  const searchParams = await props.searchParams
  const user = await requireAuth()
  await requireOwnership(params.id, user.id)
  const page = parseInt(searchParams.page) || 1

  const collection = db
    .select({
      name: collections.name,
      username: collections.username,
      site: collections.site,
      timeClass: collections.timeClass,
      last_refreshed: collections.lastRefreshed,
    })
    .from(collections)
    .where(eq(collections.id, params.id))
    .get()

  const {name, username, site, timeClass, last_refreshed} = collection ?? {}
  const lastRefreshed = last_refreshed ? new Date(last_refreshed) : null

  // Only fetch games if analytics modal is not open
  const isAnalyticsOpen = searchParams.analytics === 'open'
  const gamesData = isAnalyticsOpen
    ? []
    : db
        .select()
        .from(games)
        .where(eq(games.collectionId, params.id))
        .orderBy(desc(games.gameDttm))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE)
        .all()

  const gamesList =
    gamesData?.map((g) => ({
      id: g.id,
      url: g.url,
      lichessGameId: g.lichessGameId,
      gameDttm: g.gameDttm && new Date(g.gameDttm),
      whiteUsername: g.whiteUsername,
      blackUsername: g.blackUsername,
      whiteResult: g.whiteResult as ChesscomResult,
      blackResult: g.blackResult as ChesscomResult,
      winner: g.winner,
      eco: g.eco,
      timeControl: g.timeControl,
      clockInitial: g.clockInitial,
      clockIncrement: g.clockIncrement,
      fen: g.fen,
    })) ?? []

  return (
    <div className="p-4">
      <Link href="/collections">⬅ Collections</Link>
      <div className="py-6 flex justify-between items-center">
        <h1 className="text-xl">{name ?? ''}</h1>

        <div className="flex gap-2 items-center">
          {site && username && page === 1 && (
            <>
              <LastRefreshedDisplay lastRefreshed={lastRefreshed} />
              <RefreshButton
                collectionId={params.id}
                {...{site, username, timeClass, lastRefreshed}}
              />
            </>
          )}

          {page > 1 && (
            <Link className="underline" href={`/collections/${params.id}`}>
              Back to first page
            </Link>
          )}
        </div>
      </div>

      {/* Analytics Hero Banner */}
      {page === 1 && <AnalyticsHeroBanner collectionId={params.id} />}

      {/* Games List */}
      <div>
        {gamesList.map(
          (g) =>
            g.gameDttm &&
            (site === 'chess.com' ? (
              <ChesscomGameAccordion
                key={g.url ?? g.lichessGameId}
                id={g.id}
                username={username!}
                whiteUsername={g.whiteUsername!}
                blackUsername={g.blackUsername!}
                whiteResult={g.whiteResult}
                blackResult={g.blackResult}
                gameDttm={g.gameDttm}
                eco={g.eco!}
                timeControl={g.timeControl!}
                url={g.url!}
                fen={g.fen!}
              />
            ) : (
              <LichessGameAccordion
                key={g.lichessGameId}
                id={g.id}
                username={username!}
                whiteUsername={g.whiteUsername!}
                blackUsername={g.blackUsername!}
                winner={g.winner as 'white' | 'black' | 'draw'}
                gameDttm={g.gameDttm}
                eco={g.eco!}
                clockInitial={g.clockInitial!}
                clockIncrement={g.clockIncrement!}
                lichessGameId={g.lichessGameId!}
                fen={g.fen!}
              />
            )),
        )}
      </div>

      {/* Pagination */}
      <div className="py-6 flex gap-4 justify-center underline">
        {[...Array(page - 1)].map((_, i) => (
          <Link key={i} href={`/collections/${params.id}?page=${i + 1}`}>
            {i + 1}
          </Link>
        ))}

        <Link href={`/collections/${params.id}?page=${page + 1}`}>Next page</Link>
      </div>

      {/* Analytics Modal */}
      <AnalyticsModalWrapper collectionId={params.id}>
        {searchParams.analytics === 'open' && (
          <AnalyticsView
            collectionId={params.id}
            userId={user.id}
            username={username!}
            site={site as 'chess.com' | 'lichess'}
          />
        )}
      </AnalyticsModalWrapper>
    </div>
  )
}

export default Collection
