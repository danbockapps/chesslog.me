import {PieceSymbol, Square} from 'chess.js'
import type {ChessJsMoveParam} from '@/app/collections/[id]/chesscom/board'

/**
 * Decode Chess.com's proprietary TCN move encoding into chess.js move params.
 *
 * TCN packs each move into two characters: the first indexes the from-square (or a drop piece),
 * the second the to-square (with values > 63 signalling a promotion). The charset below is the
 * fixed alphabet Chess.com uses for that indexing.
 */
const T = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?{~}(^)[_]@#$,./&-*++='

export const decodeTcn = (n: string) => {
  let i,
    o,
    s,
    move: Partial<ChessJsMoveParam> & {drop?: PieceSymbol},
    w = n.length,
    C = []
  for (i = 0; i < w; i += 2)
    ((move = {}),
      (o = T.indexOf(n[i])),
      (s = T.indexOf(n[i + 1])) > 63 &&
        ((move.promotion = 'qnrbkp'[Math.floor((s - 64) / 3)] as PieceSymbol),
        (s = o + (o < 16 ? -8 : 8) + ((s - 1) % 3) - 1)),
      o > 75
        ? (move.drop = 'qnrbkp'[o - 79] as PieceSymbol)
        : (move.from = (T[o % 8] + (Math.floor(o / 8) + 1)) as Square),
      (move.to = (T[s % 8] + (Math.floor(s / 8) + 1)) as Square),
      C.push(move))
  return C as ChessJsMoveParam[]
}
