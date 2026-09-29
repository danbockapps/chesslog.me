# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Last trimmed: 2026-09-29. Details omitted here (schema, directory layout, API shapes) live in the code: see `lib/schema.ts`, `drizzle/*.sql`, and `app/`.

## Project Overview

chesslog.me is a Next.js 16 app (App Router, React 19, TypeScript strict) for tracking and analyzing chess games from Chess.com and Lichess: import games, add notes, tag them, and review positions on an interactive board. Stack: Tailwind v4 + daisyUI, SQLite (better-sqlite3) + Drizzle ORM, Lucia Auth (cookie sessions), chess.js + react-chessboard. Deployed as a standalone Docker container.

## Development

**Package manager:** Yarn 1.22.22. The dev and start servers run on **port 3002** (matches the server).

```bash
yarn dev                    # http://localhost:3002
yarn build / yarn start / yarn lint
yarn drizzle-kit generate   # after editing lib/schema.ts
yarn drizzle-kit migrate
```

**Env vars:** `DATABASE_PATH` (default `./data/database.db`), `LICHESS_TOKEN` (Lichess API bearer token).

## Architecture

- Server-first: Server Components read data via Drizzle (`db` from `@/lib/db`); mutations are Server Actions in `*/actions.ts` files. `'use client'` only for interactive UI. Call `revalidatePath()` after mutations.
- Path alias: `@/*` maps to the project root.
- Next.js 16: middleware is `proxy.ts` (export named `proxy`). `cookies()` is async.
- Auth helpers in `lib/auth.ts`: `requireAuth()` (redirects to `/login`) and `getUser()` (null if signed out). `proxy.ts` only redirects logged-in users away from `/login` and `/signup`; pages enforce their own auth.

### Access model

- `/collections` requires login (`requireAuth()` in the page).
- `/collections/[id]` is public and read-only for non-owners. Compute `isOwner = user?.id === collection.ownerId` and pass it as a prop to gate edit UI.
- Mutations call `requireAuth()` and verify ownership with an inline join check.

### Data conventions

- Timestamps are ISO8601 text; booleans are 0/1 integers; IDs are UUID text, except `games.id` and `tags.id` (auto-increment integers).
- Games are deduplicated by `url` (Chess.com) or `lichess_game_id` (Lichess) and upserted on import.
- Chess.com moves are TCN-encoded (separate callback API, lazy-loaded by the board); Lichess uses standard algebraic notation.
- Always import `db` from `@/lib/db`; never create another instance.
- Use `.all()` for many rows, `.get()` for one, `.run()` for mutations.

### Tags

Private tags are editable only by their owner but visible in shared collections. Public tags (`public = 1`) are owned by the system user `system-00000000-0000-0000-0000-000000000000` and read-only for users. To add default public tags, write a migration inserting rows with that `owner_id`, `public = 1`, and a `description`.

## Style

- Prettier: no semicolons, single quotes, 100 columns, no bracket spacing; `prettier-plugin-classnames` sorts Tailwind classes.
- Server Components by default; minimal prop drilling (`AppContext` for user state).
- Theming is automatic light/dark via daisyUI themes in `app/globals.css` (teal primary). Use semantic classes (`bg-base-100`, `text-base-content`, `btn-primary`, `bg-primary/20`), not raw colors like `bg-white` or `text-amber-600`. Platform colors: `bg-chesscom`, `bg-lichess`.
