import {describe, expect, it} from 'vitest'
import {decodeTcn} from '@/lib/tcn'

describe('decodeTcn', () => {
  it('decodes a basic move sequence (1. e4 e5)', () => {
    // "mC" -> e2-e4, "0K" -> e7-e5 (derived from Chess.com's TCN charset indexing).
    expect(decodeTcn('mC0K')).toEqual([
      {from: 'e2', to: 'e4'},
      {from: 'e7', to: 'e5'},
    ])
  })

  it('decodes a promotion (second char > 63 sets the promotion piece)', () => {
    // "W~" -> a7-a8 promoting to queen.
    expect(decodeTcn('W~')).toEqual([{from: 'a7', to: 'a8', promotion: 'q'}])
  })

  it('produces one move per two input characters', () => {
    const tcn = 'mC0K'
    expect(decodeTcn(tcn)).toHaveLength(tcn.length / 2)
  })

  it('returns an empty array for empty input', () => {
    expect(decodeTcn('')).toEqual([])
  })
})
