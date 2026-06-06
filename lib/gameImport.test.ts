import {describe, expect, it} from 'vitest'
import {
  ChesscomGame,
  LichessGame,
  transformChesscomGame,
  transformLichessGame,
} from '@/lib/gameImport'

function chesscomFixture(overrides: Partial<ChesscomGame> = {}): ChesscomGame {
  return {
    url: 'https://www.chess.com/game/live/123',
    pgn: '[Event "Live Chess"]',
    time_control: '300+5',
    end_time: 1_700_000_000, // unix seconds
    rated: true,
    tcn: 'mC0K',
    uuid: 'uuid-1',
    initial_setup: 'rnbqkbnr/...',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    time_class: 'blitz',
    rules: 'chess',
    white: {rating: 1500, result: 'win', '@id': 'w', username: 'alice', uuid: 'wa'},
    black: {rating: 1480, result: 'checkmated', '@id': 'b', username: 'bob', uuid: 'bb'},
    eco: 'C20',
    ...overrides,
  }
}

function lichessFixture(overrides: Partial<LichessGame> = {}): LichessGame {
  return {
    id: 'abc123',
    rated: true,
    variant: 'standard',
    speed: 'blitz',
    perf: 'blitz',
    createdAt: 1_700_000_000_000, // unix milliseconds
    lastMoveAt: 1_700_000_100_000,
    status: 'mate',
    source: 'pool',
    players: {
      white: {user: {name: 'Alice', id: 'alice'}, rating: 1600},
      black: {user: {name: 'Bob', id: 'bob'}, rating: 1590},
    },
    winner: 'white',
    opening: {eco: 'C20', name: "King's Pawn Game", ply: 2},
    clock: {initial: 300, increment: 3, totalTime: 480},
    lastFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    lastMove: 'e2e4',
    ...overrides,
  }
}

describe('transformChesscomGame', () => {
  it('maps a Chess.com API game to a games row', () => {
    const row = transformChesscomGame(chesscomFixture(), 'col-1')

    expect(row).toMatchObject({
      site: 'chess.com',
      collectionId: 'col-1',
      eco: 'C20',
      timeControl: '300+5',
      url: 'https://www.chess.com/game/live/123',
      whiteUsername: 'alice',
      blackUsername: 'bob',
      whiteRating: 1500,
      blackRating: 1480,
      whiteResult: 'win',
      blackResult: 'checkmated',
    })
  })

  it('converts end_time (unix seconds) to an ISO8601 string', () => {
    const row = transformChesscomGame(chesscomFixture({end_time: 1_700_000_000}), 'col-1')
    expect(row.gameDttm).toBe(new Date(1_700_000_000 * 1000).toISOString())
  })
})

describe('transformLichessGame', () => {
  it('maps a Lichess API game to a games row', () => {
    const row = transformLichessGame(lichessFixture(), 'col-1')

    expect(row).toMatchObject({
      site: 'lichess',
      collectionId: 'col-1',
      eco: "King's Pawn Game", // opening.name, not the ECO code
      lichessGameId: 'abc123',
      whiteUsername: 'Alice',
      blackUsername: 'Bob',
      whiteRating: 1600,
      blackRating: 1590,
      winner: 'white',
      clockInitial: 300,
      clockIncrement: 3,
    })
  })

  it('converts createdAt (unix milliseconds) to an ISO8601 string', () => {
    const row = transformLichessGame(lichessFixture({createdAt: 1_700_000_000_000}), 'col-1')
    expect(row.gameDttm).toBe(new Date(1_700_000_000_000).toISOString())
  })

  it('falls back to "Unknown" when a player has no user object', () => {
    const game = lichessFixture({
      players: {
        white: {rating: 1600},
        black: {user: {name: 'Bob', id: 'bob'}, rating: 1590},
      },
    })
    const row = transformLichessGame(game, 'col-1')
    expect(row.whiteUsername).toBe('Unknown')
    expect(row.blackUsername).toBe('Bob')
  })

  it('sets eco to null when there is no opening', () => {
    const row = transformLichessGame(lichessFixture({opening: undefined}), 'col-1')
    expect(row.eco).toBeNull()
  })
})
