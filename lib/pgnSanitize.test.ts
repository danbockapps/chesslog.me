import {describe, expect, it} from 'vitest'
import {preparePgnForChessJs} from '@/lib/pgnSanitize'

describe('preparePgnForChessJs', () => {
  it('merges two adjacent comments into one', () => {
    const pgn = '1. e4 {[%eval 0.2]} {Good move} e5'
    expect(preparePgnForChessJs(pgn)).toBe('1. e4 {[%eval 0.2] Good move} e5')
  })

  it('collapses a run of three or more adjacent comments', () => {
    const pgn = '1. e4 {a} {b} {c} e5'
    // Every `}<ws>{` boundary is removed, leaving a single comment span.
    expect(preparePgnForChessJs(pgn)).toBe('1. e4 {a b c} e5')
  })

  it('leaves a single comment untouched', () => {
    const pgn = '1. e4 {only one} e5'
    expect(preparePgnForChessJs(pgn)).toBe(pgn)
  })

  it('leaves movetext with no comments untouched', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6'
    expect(preparePgnForChessJs(pgn)).toBe(pgn)
  })
})
