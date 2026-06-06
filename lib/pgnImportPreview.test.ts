import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'
import {describe, expect, it} from 'vitest'
import {buildPgnImportPreview, parsePgnGame, splitPgnGames} from '@/lib/pgnImport'

/** Map each split-index in a PGN file to the parsed game's import hash (skipping unparseable ones). */
function hashesByIndex(pgnText: string): Map<number, string> {
  const map = new Map<number, string>()
  splitPgnGames(pgnText).forEach((chunk, index) => {
    const parsed = parsePgnGame(chunk)
    if (parsed) map.set(index, parsed.importHash)
  })
  return map
}

/** The set of import hashes for every parseable game in a PGN file. */
function hashSet(pgnText: string): Set<string> {
  return new Set(hashesByIndex(pgnText).values())
}

/**
 * Treat `baseText` as the games already in the collection and `fullText` (base + extras) as the
 * file being imported, then assert the preview correctly separates duplicates from new games.
 */
function assertPreviewSeparatesDuplicates(baseText: string, fullText: string) {
  const baseHashes = hashSet(baseText)
  const fullByIndex = hashesByIndex(fullText)

  expect(baseHashes.size).toBeGreaterThan(0)

  const preview = buildPgnImportPreview(fullText, baseHashes)

  // Every preview item corresponds to a parseable game, so its index is always in the map.
  const duplicateHashes = new Set(
    preview.filter((p) => p.isDuplicate).map((p) => fullByIndex.get(p.index)!),
  )
  const newHashes = preview.filter((p) => !p.isDuplicate).map((p) => fullByIndex.get(p.index)!)

  // 1. Every game already in the collection is recognized as a duplicate.
  for (const hash of baseHashes) {
    expect(duplicateHashes.has(hash)).toBe(true)
  }

  // 2. Every game flagged as new is genuinely absent from the collection.
  for (const hash of newHashes) {
    expect(baseHashes.has(hash)).toBe(false)
  }

  // 3. The full file actually contained extra games beyond the base (otherwise the pair is trivial).
  expect(newHashes.length).toBeGreaterThan(0)
}

describe('buildPgnImportPreview — duplicate detection', () => {
  const base = `[Event "Game One"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Nf3 1-0

[Event "Game Two"]
[White "Carol"]
[Black "Dave"]
[Result "0-1"]

1. d4 d5 0-1`

  const full = `${base}

[Event "Game Three"]
[White "Eve"]
[Black "Frank"]
[Result "1/2-1/2"]

1. c4 c5 1/2-1/2`

  it('flags games already in the collection and passes through new ones (synthetic pair)', () => {
    assertPreviewSeparatesDuplicates(base, full)
  })

  it('flags everything as new against an empty collection', () => {
    const preview = buildPgnImportPreview(full, new Set())
    expect(preview).toHaveLength(3)
    expect(preview.every((p) => !p.isDuplicate)).toBe(true)
  })

  it('flags re-importing the identical file as all duplicates', () => {
    const preview = buildPgnImportPreview(full, hashSet(full))
    expect(preview.every((p) => p.isDuplicate)).toBe(true)
  })

  it('treats a game repeated within the same file as a duplicate on its second appearance', () => {
    const repeated = `${base}\n\n${base}`
    const preview = buildPgnImportPreview(repeated, new Set())
    // 4 games total: the first two are new, the second pair are within-file duplicates.
    expect(preview.map((p) => p.isDuplicate)).toEqual([false, false, true, true])
  })
})

// Any *.base.pgn / *.full.pgn pairs dropped into lib/__fixtures__/pgn are exercised automatically.
describe('buildPgnImportPreview — fixture file pairs', () => {
  const fixtureDir = join(__dirname, '__fixtures__', 'pgn')
  const basePairs = readdirSync(fixtureDir)
    .filter((f) => f.endsWith('.base.pgn'))
    .map((baseFile) => ({
      name: baseFile.replace(/\.base\.pgn$/, ''),
      baseFile,
      fullFile: baseFile.replace(/\.base\.pgn$/, '.full.pgn'),
    }))

  if (basePairs.length === 0) {
    it.skip('no fixture pairs present (add <name>.base.pgn / <name>.full.pgn to enable)', () => {})
  }

  for (const {name, baseFile, fullFile} of basePairs) {
    it(`separates duplicates from new games for "${name}"`, () => {
      const baseText = readFileSync(join(fixtureDir, baseFile), 'utf8')
      const fullText = readFileSync(join(fixtureDir, fullFile), 'utf8')
      assertPreviewSeparatesDuplicates(baseText, fullText)
    })
  }
})
