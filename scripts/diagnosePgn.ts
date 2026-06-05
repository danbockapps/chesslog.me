/**
 * Diagnostic for PGN import troubleshooting.
 *
 * Usage: npx tsx scripts/diagnosePgn.ts /path/to/file.pgn
 *
 * Reports how many games the splitter produced and, for each one, whether chess.js can parse it
 * (with the real error message instead of the silent null that the import path returns).
 */
import {readFileSync} from 'fs'
import {derivePlayers, parsePgnGame, splitPgnGames} from '../lib/pgnImport'

const path = process.argv[2]
if (!path) {
  console.error('Usage: npx tsx scripts/diagnosePgn.ts /path/to/file.pgn')
  process.exit(1)
}

const text = readFileSync(path, 'utf8')
console.log(`File length: ${text.length} chars`)

const chunks = splitPgnGames(text)
console.log(`Split into ${chunks.length} game chunk(s)\n`)

let ok = 0
let failed = 0

chunks.forEach((chunk, i) => {
  const parsed = parsePgnGame(chunk)
  if (!parsed) {
    failed++
    const firstLine = chunk.split('\n').find((l) => l.startsWith('[Event')) ?? chunk.slice(0, 60)
    console.log(`#${i}: ❌ could not parse\n     ${firstLine}`)
    return
  }
  ok++
  const {white, black} = derivePlayers(parsed.headers)
  console.log(`#${i}: ok  ${parsed.sanMoves.length} moves  [${white} vs ${black}]`)
})

console.log(`\nParsed OK: ${ok}   Failed/empty: ${failed}   Total chunks: ${chunks.length}`)
