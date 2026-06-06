# PGN fixtures for duplicate-detection tests

`lib/pgnImportPreview.test.ts` exercises `buildPgnImportPreview` against real PGN exports.

Drop sample files here in **pairs**:

- `<name>.base.pgn` — the games already "in the collection"
- `<name>.full.pgn` — the same games as `.base`, **plus** a few extra games

The test auto-discovers every `*.base.pgn`, pairs it with the matching `*.full.pgn`, treats the base
file's games as the existing collection, and asserts that:

1. every game from the base file is flagged as a duplicate, and
2. every game present only in the full file is flagged as new.

Add as many pairs as you like (e.g. one from Lichess, one from ChessBase) — no test code changes
needed. Files placed here are test fixtures only and are not shipped with the app.
