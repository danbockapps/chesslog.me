import {describe, expect, it} from 'vitest'
import {ExportGame, ExportTag, formatCollectionExport, getScore} from './exportFormat'

const baseGame: ExportGame = {
  url: null,
  gameDttm: null,
  whiteUsername: 'alice',
  blackUsername: 'bob',
  whiteRating: null,
  blackRating: null,
  whiteResult: null,
  blackResult: null,
  winner: null,
  eco: null,
  timeControl: null,
  tags: [],
  notes: null,
}

const format = (games: ExportGame[], tags: ExportTag[] = []) =>
  formatCollectionExport({
    name: 'Test',
    username: 'alice',
    exportedAt: new Date('2026-09-29T12:00:00Z'),
    tags,
    games,
  })

describe('getScore', () => {
  it('reads Chess.com per-side results', () => {
    expect(getScore({...baseGame, whiteResult: 'win', blackResult: 'resigned'})).toBe('1-0')
    expect(getScore({...baseGame, whiteResult: 'timeout', blackResult: 'win'})).toBe('0-1')
    expect(getScore({...baseGame, whiteResult: 'stalemate', blackResult: 'stalemate'})).toBe(
      '1/2-1/2',
    )
  })

  it('reads the winner field', () => {
    expect(getScore({...baseGame, winner: 'white'})).toBe('1-0')
    expect(getScore({...baseGame, winner: 'black'})).toBe('0-1')
    expect(getScore({...baseGame, winner: 'draw'})).toBe('1/2-1/2')
  })

  it('returns null when unknown', () => {
    expect(getScore(baseGame)).toBeNull()
  })
})

describe('formatCollectionExport', () => {
  it('includes header details', () => {
    const out = format([{...baseGame, notes: 'x'}])
    expect(out).toContain('# Test')
    expect(out).toContain('Player: alice')
    expect(out).toContain('Exported: 2026-09-29')
    expect(out).toContain('Games with tags or notes: 1')
  })

  it('omits empty fields', () => {
    const out = format([{...baseGame, tags: ['Missed tactic']}])
    expect(out).toContain('Tags: Missed tactic')
    expect(out).not.toContain('Notes:')
    expect(out).not.toContain('Link:')
    expect(out).not.toContain('Opening')
    expect(out).not.toContain('Result:')
  })

  it('formats notes-only games and trims whitespace', () => {
    const out = format([{...baseGame, notes: '  Blundered the queen  '}])
    expect(out).toContain('Notes:\nBlundered the queen')
    expect(out).not.toContain('Tags:')
  })

  it('formats a full game', () => {
    const out = format([
      {
        ...baseGame,
        url: 'https://example.com/g/1',
        gameDttm: '2026-09-01T10:00:00.000Z',
        whiteRating: 1500,
        blackRating: 1520,
        winner: 'black',
        eco: 'B12',
        timeControl: '600+0',
        tags: ['Played too fast', 'Loose pieces'],
        notes: 'Rushed.',
      },
    ])
    expect(out).toContain(
      '## Game 1: alice (1500) (White) vs bob (1520) (Black) — Result: 0-1 — Date: 2026-09-01',
    )
    expect(out).toContain('Opening (ECO): B12')
    expect(out).toContain('Time control: 600+0')
    expect(out).toContain('Link: https://example.com/g/1')
    expect(out).toContain('Tags: Played too fast, Loose pieces')
  })

  it('includes a tags section with names and descriptions', () => {
    const out = format(
      [{...baseGame, tags: ['Missed tactic', 'Loose pieces']}],
      [
        {name: 'Loose pieces', description: 'Left pieces undefended.'},
        {name: 'Missed tactic', description: 'Missed a winning combination.'},
        {name: 'Unused tag', description: 'Not on any game.'},
      ],
    )
    expect(out).toContain('## Tags')
    expect(out).toContain('- Missed tactic\n  Missed a winning combination.')
    expect(out).toContain('- Loose pieces\n  Left pieces undefended.')
    expect(out).not.toContain('Unused tag')
    // Section comes before the games
    expect(out.indexOf('## Tags')).toBeLessThan(out.indexOf('## Game 1:'))
  })

  it('omits blank tag descriptions and the section when no tags are used', () => {
    const out = format(
      [{...baseGame, tags: ['Missed tactic'], notes: 'x'}],
      [{name: 'Missed tactic', description: null}],
    )
    expect(out).toContain('- Missed tactic')
    expect(out).not.toContain('  ')

    const noTags = format([{...baseGame, notes: 'x'}], [{name: 'Unused', description: 'd'}])
    expect(noTags).not.toContain('## Tags')
  })
})
