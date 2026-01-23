import {requireAuth, requireOwnership} from '@/lib/auth'
import {db} from '@/lib/db'
import {collections, games} from '@/lib/schema'
import {eq, desc} from 'drizzle-orm'
import {captionClassNames} from '@/app/ui/SectionHeader'
import Link from 'next/link'
import {FC} from 'react'
import {ChesscomResult} from './actions/importChesscomGames'
import ChesscomGameAccordion from './chesscom/gameAccordion'
import LichessGameAccordion from './lichess/gameAccordion'
import RefreshButton from './refreshButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: {id: string}
  searchParams: {page: string}
}

const PAGE_SIZE = 50

const Collection: FC<Props> = async (props) => {
  const user = await requireAuth()
  await requireOwnership(props.params.id, user.id)
  const page = parseInt(props.searchParams.page) || 1

  const collection = db
    .select({
      name: collections.name,
      username: collections.username,
      site: collections.site,
      last_refreshed: collections.lastRefreshed,
    })
    .from(collections)
    .where(eq(collections.id, props.params.id))
    .get()

  const gamesData = db
    .select()
    .from(games)
    .where(eq(games.collectionId, props.params.id))
    .orderBy(desc(games.gameDttm))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .all()

  const {name, username, site, last_refreshed} = collection ?? {}
  const lastRefreshed = last_refreshed ? new Date(last_refreshed) : null

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

        {site && username && page === 1 && (
          <>
            <p className={`${captionClassNames} ml-auto mr-4`}>
              Last refreshed: {lastRefreshed?.toLocaleString() ?? 'Never'}
            </p>
            <RefreshButton collectionId={props.params.id} {...{site, username, lastRefreshed}} />
          </>
        )}

        {page > 1 && (
          <Link className="underline" href={`/collections/${props.params.id}`}>
            Back to first page
          </Link>
        )}
      </div>
      <div>
        {gamesList.map(
          (g) =>
            g.gameDttm &&
            (site === 'chess.com' ? (
              <ChesscomGameAccordion
                key={g.url ?? g.lichessGameId}
                id={g.id}
                username={username!}
                whiteUsername={g.whiteUsername!} // TODO
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
                whiteUsername={g.whiteUsername!} // TODO
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

      <div className="py-6 flex gap-4 justify-center underline">
        {[...Array(page - 1)].map((_, i) => (
          <Link key={i} href={`/collections/${props.params.id}?page=${i + 1}`}>
            {i + 1}
          </Link>
        ))}

        <Link href={`/collections/${props.params.id}?page=${page + 1}`}>Next page</Link>
      </div>
    </div>
  )
}

export default Collection
