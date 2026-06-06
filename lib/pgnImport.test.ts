import {describe, expect, it} from 'vitest'
import {
  computeImportHash,
  derivePlayers,
  extractStudyName,
  parsePgnGame,
  splitPgnGames,
  transformPgnGame,
} from '@/lib/pgnImport'

const game1 = `[Event "Game One"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Nf3 1-0`

const game2 = `[Event "Game Two"]
[White "Carol"]
[Black "Dave"]
[Result "0-1"]

1. d4 d5 0-1`

describe('splitPgnGames', () => {
  it('returns a single chunk for one game', () => {
    expect(splitPgnGames(game1)).toHaveLength(1)
  })

  it('splits games separated by blank lines', () => {
    const chunks = splitPgnGames(`${game1}\n\n${game2}`)
    expect(chunks).toHaveLength(2)
    expect(chunks[0]).toContain('Game One')
    expect(chunks[1]).toContain('Game Two')
  })

  it('splits games with no blank line between them (tag after movetext)', () => {
    const chunks = splitPgnGames(`${game1}\n${game2}`)
    expect(chunks).toHaveLength(2)
    expect(chunks[1]).toContain('Game Two')
  })

  it('trims surrounding whitespace and ignores empty input', () => {
    expect(splitPgnGames('   \n\n  ')).toEqual([])
    expect(splitPgnGames('')).toEqual([])
  })
})

describe('parsePgnGame', () => {
  it('parses a valid game into headers, moves, fen and hash', () => {
    const parsed = parsePgnGame(game1)
    expect(parsed).not.toBeNull()
    expect(parsed!.headers.White).toBe('Alice')
    expect(parsed!.sanMoves).toEqual(['e4', 'e5', 'Nf3'])
    expect(parsed!.fen).toMatch(/^rnbqkb/)
    expect(parsed!.importHash).toHaveLength(64) // sha256 hex
  })

  it('returns null when there are no moves', () => {
    expect(parsePgnGame('[Event "Empty"]\n[White "A"]\n[Black "B"]\n')).toBeNull()
  })

  it('returns null for illegal/malformed movetext', () => {
    expect(parsePgnGame('[Event "Bad"]\n\n1. e9 e5')).toBeNull()
  })

  it('parses a chapter with adjacent eval/annotation comments (sanitizer integration)', () => {
    const pgn = `[Event "Study Chapter"]
[White "Alice"]
[Black "Bob"]
[Result "*"]

1. e4 {[%eval 0.2]} {Mistake. e5 was better.} e5 *`
    const parsed = parsePgnGame(pgn)
    expect(parsed).not.toBeNull()
    expect(parsed!.sanMoves).toEqual(['e4', 'e5'])
  })
})

describe('computeImportHash', () => {
  const headers = {White: 'Alice', Black: 'Bob', Date: '2025.01.01', Result: '1-0', Event: 'E'}

  it('is stable for identical games', () => {
    expect(computeImportHash(headers, ['e4', 'e5'])).toBe(computeImportHash(headers, ['e4', 'e5']))
  })

  it('differs when the moves differ', () => {
    expect(computeImportHash(headers, ['e4', 'e5'])).not.toBe(
      computeImportHash(headers, ['d4', 'd5']),
    )
  })

  it('ignores headers that do not identify the game (dedup contract)', () => {
    const withAnnotations = {...headers, Annotator: 'someone', TimeControl: '300+5'}
    expect(computeImportHash(withAnnotations, ['e4', 'e5'])).toBe(
      computeImportHash(headers, ['e4', 'e5']),
    )
  })

  it('falls back from Date to UTCDate', () => {
    const withDate = {White: 'A', Black: 'B', Date: '2025.01.01', Result: '1-0', Event: 'E'}
    const withUtcDate = {White: 'A', Black: 'B', UTCDate: '2025.01.01', Result: '1-0', Event: 'E'}
    expect(computeImportHash(withDate, ['e4'])).toBe(computeImportHash(withUtcDate, ['e4']))
  })
})

describe('derivePlayers', () => {
  it('uses the White/Black tags when present', () => {
    expect(derivePlayers({White: 'Alice', Black: 'Bob'})).toEqual({white: 'Alice', black: 'Bob'})
  })

  it('treats "?" placeholders as missing', () => {
    expect(derivePlayers({White: '?', Black: '?'})).toEqual({white: 'Unknown', black: 'Unknown'})
  })

  it('falls back to "X vs. Y" in ChapterName when tags are missing', () => {
    expect(derivePlayers({ChapterName: 'Magnus vs. Hikaru'})).toEqual({
      white: 'Magnus',
      black: 'Hikaru',
    })
  })

  it('strips a trailing date from the second name', () => {
    expect(derivePlayers({Event: 'Alice vs Dan 11/9/2025'})).toEqual({white: 'Alice', black: 'Dan'})
    expect(derivePlayers({Event: 'Alice vs Dan 2025.11.09'})).toEqual({
      white: 'Alice',
      black: 'Dan',
    })
  })

  it('strips a leading label prefix from the first name', () => {
    expect(derivePlayers({ChapterName: 'Round 1: Alice vs Bob'})).toEqual({
      white: 'Alice',
      black: 'Bob',
    })
  })

  it('returns Unknown when nothing can be derived', () => {
    expect(derivePlayers({})).toEqual({white: 'Unknown', black: 'Unknown'})
  })
})

describe('extractStudyName', () => {
  it('extracts a present StudyName header', () => {
    expect(extractStudyName('[StudyName "My Openings"]\n[White "A"]')).toBe('My Openings')
  })

  it('returns null when the header is absent', () => {
    expect(extractStudyName('[Event "x"]')).toBeNull()
  })

  it('returns null for an empty value', () => {
    expect(extractStudyName('[StudyName ""]')).toBeNull()
  })
})

describe('transformPgnGame', () => {
  it('maps a parsed game to a games row', () => {
    const parsed = parsePgnGame(game1)!
    const row = transformPgnGame(parsed, 'col-1')

    expect(row).toMatchObject({
      collectionId: 'col-1',
      whiteUsername: 'Alice',
      blackUsername: 'Bob',
      winner: 'white',
      importHash: parsed.importHash,
    })
  })

  it('maps result strings to winners', () => {
    const make = (result: string) =>
      transformPgnGame(parsePgnGame(game1.replace(/1-0/g, result))!, 'col-1').winner

    expect(transformPgnGame(parsePgnGame(game1)!, 'c').winner).toBe('white')
    expect(make('0-1')).toBe('black')
    expect(make('1/2-1/2')).toBe('draw')
  })

  it('parses ratings, leaving non-numeric/absent as null', () => {
    const pgn = `[Event "E"]
[White "Alice"]
[Black "Bob"]
[WhiteElo "1500"]
[Result "1-0"]

1. e4 e5 1-0`
    const row = transformPgnGame(parsePgnGame(pgn)!, 'c')
    expect(row.whiteRating).toBe(1500)
    expect(row.blackRating).toBeNull()
  })

  it('parses a PGN date into an ISO8601 timestamp', () => {
    const pgn = `[Event "E"]
[White "Alice"]
[Black "Bob"]
[Date "2025.01.15"]
[UTCTime "10:30:00"]
[Result "1-0"]

1. e4 e5 1-0`
    const row = transformPgnGame(parsePgnGame(pgn)!, 'c')
    expect(row.gameDttm).toBe('2025-01-15T10:30:00.000Z')
  })

  it('yields a null date when the date contains "?"', () => {
    const pgn = `[Event "E"]
[White "Alice"]
[Black "Bob"]
[Date "????.??.??"]
[Result "1-0"]

1. e4 e5 1-0`
    const row = transformPgnGame(parsePgnGame(pgn)!, 'c')
    expect(row.gameDttm).toBeNull()
  })
})
