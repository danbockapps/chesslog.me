import ArrowLeftIcon from '@/app/ui/icons/arrowLeft'
import ChessBoardIcon from '@/app/ui/icons/chessBoard'
import ChevronLeftIcon from '@/app/ui/icons/chevronLeft'
import ChevronRightIcon from '@/app/ui/icons/chevronRight'
import {requireAuth, requireOwnership} from '@/lib/auth'
import {getCollectionDisplayName} from '@/lib/collectionUtils'
import {db} from '@/lib/db'
import {collections, games, gameTags} from '@/lib/schema'
import {and, desc, eq, isNotNull, ne, or, sql} from 'drizzle-orm'
import Link from 'next/link'
import {FC} from 'react'
import {ChesscomResult} from './actions/importChesscomGames'
import AnalyticsModalWrapper from './analytics/analyticsModalWrapper'
import AnalyticsView from './analytics/analyticsView'
import AnalyticsHeroBanner from './analyticsHeroBanner'
import AutoRefresh from './autoRefresh'
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

  const {username, site, timeClass, last_refreshed} = collection ?? {}
  const displayName = collection ? getCollectionDisplayName(collection) : ''
  const lastRefreshed = last_refreshed ? new Date(last_refreshed) : null

  const annotatedCount =
    db
      .select({count: sql<number>`count(distinct ${games.id})`})
      .from(games)
      .leftJoin(gameTags, eq(games.id, gameTags.gameId))
      .where(
        and(
          eq(games.collectionId, params.id),
          or(and(isNotNull(games.notes), ne(games.notes, '')), isNotNull(gameTags.gameId)),
        ),
      )
      .get()?.count ?? 0

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

  // Fetch tag counts for the current page's games
  const gameIds = gamesData.map((g) => g.id)
  const tagCounts =
    gameIds.length > 0
      ? db
          .select({
            gameId: gameTags.gameId,
            count: sql<number>`count(*)`,
          })
          .from(gameTags)
          .where(
            sql`${gameTags.gameId} in (${sql.join(
              gameIds.map((id) => sql`${id}`),
              sql`,`,
            )})`,
          )
          .groupBy(gameTags.gameId)
          .all()
      : []

  const tagCountMap = new Map(tagCounts.map((t) => [t.gameId, t.count]))

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
      tagCount: tagCountMap.get(g.id) ?? 0,
      hasNotes: !!g.notes && g.notes.trim() !== '',
    })) ?? []

  const totalGames =
    db
      .select({count: sql<number>`count(*)`})
      .from(games)
      .where(eq(games.collectionId, params.id))
      .get()?.count ?? 0

  const totalPages = Math.max(1, Math.ceil(totalGames / PAGE_SIZE))
  const hasNextPage = page < totalPages
  const siteName = site === 'chess.com' ? 'Chess.com' : 'Lichess'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
      {/* Back link */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content
          transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Collections
      </Link>

      {/* Page header */}
      <div className="mt-4 mb-6 flex items-center gap-3">
        {site && (
          <span
            className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-white
            ${site === 'chess.com' ? 'bg-chesscom' : 'bg-lichess'}`}
          >
            {siteName}
          </span>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          {displayName}
        </h1>
      </div>

      {/* Analytics Hero Banner */}
      {page === 1 && (
        <AnalyticsHeroBanner collectionId={params.id} annotatedCount={annotatedCount} />
      )}

      {/* Refresh button */}
      {site && username && (
        <div className="flex items-center gap-3 sm:ml-auto shrink-0 rounded-lg px-3 py-2">
          <LastRefreshedDisplay lastRefreshed={lastRefreshed} />
          <RefreshButton collectionId={params.id} {...{site, username, timeClass, lastRefreshed}} />
        </div>
      )}

      {/* Auto-refresh: fetch new games in the background */}
      {site && username && (
        <AutoRefresh collectionId={params.id} {...{site, username, timeClass, lastRefreshed}} />
      )}

      {/* Games List */}
      {gamesList.length > 0 ? (
        <div className="mt-6">
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
                  tagCount={g.tagCount}
                  hasNotes={g.hasNotes}
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
                  tagCount={g.tagCount}
                  hasNotes={g.hasNotes}
                />
              )),
          )}
        </div>
      ) : (
        !isAnalyticsOpen && (
          <div className="mt-12 flex flex-col items-center text-center py-16">
            <ChessBoardIcon className="w-12 h-12 text-base-content/20 mb-4" />
            <p className="text-base-content/50 text-lg mb-1">No games yet</p>
            <p className="text-base-content/40 text-sm">
              Click <span className="font-medium text-base-content/60">Refresh</span> to import
              games from {siteName}
            </p>
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="py-8 flex justify-center">
          <div className="join">
            <Link
              href={`/collections/${params.id}?page=${Math.max(1, page - 1)}`}
              className={`join-item btn btn-sm ${page === 1 ? 'btn-disabled' : ''}`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Link>

            {getPaginationRange(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="join-item btn btn-sm btn-disabled">
                  ...
                </span>
              ) : (
                <Link
                  key={p}
                  href={`/collections/${params.id}?page=${p}`}
                  className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
                >
                  {p}
                </Link>
              ),
            )}

            <Link
              href={`/collections/${params.id}?page=${Math.min(totalPages, page + 1)}`}
              className={`join-item btn btn-sm ${!hasNextPage ? 'btn-disabled' : ''}`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

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

/** Returns an array like [1, 2, '...', 5, 6, 7, '...', 12, 13] for pagination display */
function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1)

  const pages: (number | '...')[] = []

  // Always show first page
  pages.push(1)

  if (current > 3) pages.push('...')

  // Show pages around current
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  // Always show last page
  pages.push(total)

  return pages
}

export default Collection
