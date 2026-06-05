/**
 * Client-safe PGN helpers (no Node-only imports) so both the server import path and the
 * client board component can share them.
 */

/**
 * chess.js (through at least 1.4.0, the latest release) fails to parse two consecutive `{...}`
 * comments, which Lichess study exports routinely produce (one `{ [%eval ...] }` comment followed
 * by a `{ Mistake. ... }` annotation). Merge any run of adjacent comments into a single comment so
 * the movetext parses. This is not fixed by upgrading chess.js.
 */
export function preparePgnForChessJs(pgn: string): string {
  let prev: string
  let out = pgn
  do {
    prev = out
    out = out.replace(/\}\s*\{/g, ' ')
  } while (out !== prev)
  return out
}
