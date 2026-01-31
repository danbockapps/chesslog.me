# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

chesslog.me is a Next.js 16 application for tracking and analyzing chess games from Chess.com and Lichess. Users can import games, add notes, create tags, and review game positions using an interactive chess board.

## Development Commands

**Package Manager:** This project uses Yarn 1.22.22 (configured in `packageManager` field)

```bash
# Development
yarn dev                    # Start dev server on http://localhost:3000
yarn build                  # Build production bundle
yarn start                  # Start production server
yarn lint                   # Run ESLint

# Database (Drizzle ORM)
yarn drizzle-kit generate   # Generate migration from schema changes
yarn drizzle-kit migrate    # Run migrations
yarn drizzle-kit studio     # Open Drizzle Studio (database GUI)

# Docker
docker build -t chesslog.me .
docker run -p 3000:3000 chesslog.me
```

## Architecture Overview

### Tech Stack

- **Framework:** Next.js 16.1.4 with App Router
- **React:** 19.2.3
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + daisyUI
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **Authentication:** Lucia Auth (session-based, cookie sessions)
- **Chess Logic:** chess.js + react-chessboard
- **Deployment:** Docker container with standalone output

### Server-First Architecture

This application heavily uses Next.js Server Components and Server Actions instead of traditional API routes:

- **Server Actions** located in `*/actions.ts` files handle all data mutations
- **Server Components** fetch data directly using Drizzle ORM (`db` from `lib/db.ts`)
- **Authentication** uses Lucia helpers (`requireAuth()`, `getUser()` from `lib/auth.ts`)
- **Client Components** (`'use client'`) are only used for interactive UI (modals, forms, chess board)
- Minimal client-side state management (React hooks only, no Redux/Zustand)

### Directory Structure

```
lib/
├── schema.ts              # Drizzle ORM schema definitions
├── db.ts                  # SQLite database initialization
└── auth.ts                # Lucia auth + helper functions

drizzle/
└── *.sql                  # Database migration files

app/
├── login/                 # Login page + server actions
├── signup/                # Signup page + server actions
├── collections/           # Collections list page
│   ├── [id]/              # Collection detail (dynamic route)
│   │   ├── actions/       # Server actions for game import/CRUD
│   │   ├── chesscom/      # Chess.com game components
│   │   └── lichess/       # Lichess game components
│   └── context.tsx        # User context for child components
├── ui/                    # Reusable UI components
│   ├── createNew/         # Collection creation modal flow
│   └── *.tsx              # Accordion, Card, Modal, Spinner, Link, etc.
├── globals.css            # Global styles + Tailwind v4 + daisyUI configuration
└── utils/                 # Utility functions

postcss.config.mjs         # PostCSS configuration for Tailwind v4
```

### Database Schema

**Key Tables:**

- `users` - User accounts (email + hashed password)
- `sessions` - Active user sessions (managed by Lucia)
- `profiles` - User profiles (1:1 with users)
- `collections` - Game collections owned by users
  - `site`: 'lichess' | 'chess.com' (stored as text)
  - `username`: Chess platform username
  - `last_refreshed`: ISO8601 timestamp
- `games` - Individual chess games
  - Belongs to a collection (cascade delete)
  - Contains player info, ratings, ECO, FEN, time control
  - `url` (Chess.com) or `lichess_game_id` (unique constraints)
  - `notes`: User-written analysis
- `tags` - Reusable tags/takeaways
  - `public`: Boolean (if true, visible to all users)
  - `owner_id`: Creator of the tag
- `game_tags` - Many-to-many junction table

**Data Types:**

- IDs: UUIDs stored as text (except games.id and tags.id which are auto-increment integers)
- Timestamps: ISO8601 strings in text columns
- Booleans: Integers (0 = false, 1 = true)
- Foreign keys: CASCADE on delete for data integrity

**Database Migrations:** Located in `drizzle/*.sql`

**Schema Definition:** Defined in `lib/schema.ts` using Drizzle ORM

### Authentication Flow

1. User signs up via `/signup` → `signup()` server action
   - Creates user with bcrypt-hashed password
   - Creates Lucia session
   - Sets session cookie
2. User logs in via `/login` → `login()` server action
   - Verifies password with bcrypt
   - Creates Lucia session and sets cookie
3. Protected routes/actions call `requireAuth()` helper
   - Validates session from cookie
   - Auto-refreshes if session is fresh
   - Redirects to `/login` if invalid
4. Middleware (`middleware.ts`) handles session refresh on requests

**Helper Functions (from `lib/auth.ts`):**

- `requireAuth()` - Get authenticated user or redirect (for Server Components/Actions)
- `getUser()` - Get user without redirecting, returns null if not authenticated
- `requireOwnership(collectionId, userId)` - Verify user owns a collection

**Environment Variables Required:**

- `DATABASE_PATH` - Path to SQLite database file (default: `./data/database.db`)
- `LICHESS_TOKEN` - Bearer token for Lichess API (for importing games)

### Game Import Flow

1. User creates collection with Chess.com or Lichess username
2. User clicks "Refresh" button on collection detail page
3. Server action (`importChesscomGames` or `importLichessGames`) runs:
   - Fetches games from external API (Chess.com: monthly archives, Lichess: user games endpoint)
   - Transforms API response to match database schema
   - Upserts games (conflict handled by unique constraint on URL/game ID)
   - Updates `collections.last_refreshed` timestamp
4. Page automatically revalidates via `revalidatePath()`

**External API Endpoints:**

- Chess.com: `https://api.chess.com/pub/player/{username}/games/{year}/{month}`
- Chess.com moves: `https://www.chess.com/callback/live/game/{gameId}` (TCN format)
- Lichess: `https://lichess.org/api/games/user/{username}` (NDJSON, requires bearer token)

### Tag System

The application includes a comprehensive tag system for categorizing and organizing games:

**Tag Types:**

- **Private tags**: Created by users, visible only to the creator, fully editable
- **Public tags**: System-wide tags visible to all users, not editable by regular users

**Default Public Tags:**
The database includes default public tags owned by a system user (`system@chesslog.me`):

- "Played too slow" - Burned too much time early in the game and got in time trouble
- "Played too fast" - Made moves impatiently or without proper consideration
- "Opening theory" - Got a bad position early due to lack of opening knowledge
- "Middlegame strategy" - Didn't know the right strategy for my side in the middlegame
- "Endgame strategy" - Didn't know the right strategy for my side in the endgame
- "Loose pieces" - Left a piece unprotected and regretted it
- "King safety" - Allowed weaknesses around my king and regretted it
- "Allowed tactic" - Allowed a tactic by my opponent
- "Missed tactic" - Had a win but I missed it

**Tag Management:**

- Tags can be created inline when annotating games (via `CreatableSelect` component)
- Tags can be managed via the "Manage tags" modal
- Private tag descriptions are editable by their owners
- Public tag descriptions are read-only for regular users
- Tags are associated with games via the `game_tags` junction table

**Adding New Public Tags:**
To add more default public tags, create a new migration that:

1. Inserts tags with `owner_id = 'system-00000000-0000-0000-0000-000000000000'`
2. Sets `public = 1` (true in SQL boolean format)
3. Includes descriptive text in the `description` field

### Chess Board Component

- Located in `app/collections/[id]/chesscom/board.tsx`
- Uses `chess.js` for move validation and position tracking
- Uses `react-chessboard` for UI rendering
- **Lazy loading:** Moves are only fetched when user first clicks navigation buttons
- Supports forward/backward navigation through game moves
- Stores Chess instance in `useRef` to persist across renders

### TypeScript Path Aliases

- `@/*` maps to project root (configured in `tsconfig.json`)
- Example: `import {db} from '@/lib/db'`
- Example: `import {requireAuth} from '@/lib/auth'`

### Theme System

The application uses **Tailwind CSS v4** with **daisyUI** for automatic light/dark mode switching based on system preferences.

**Configuration:**

The project uses Tailwind CSS v4's new CSS-first configuration in `app/globals.css`:

```css
@import 'tailwindcss';
@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark;
}
```

Brand colors are defined inline in CSS using `@theme`:

```css
@theme {
  --color-chesscom: #2d2c28;
  --color-lichess: #000000;
}
```

PostCSS configuration in `postcss.config.mjs`:

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**How it works:**

1. **Theme Configuration**: daisyUI themes are configured directly in `app/globals.css` using Tailwind v4's `@plugin` directive
   - `light` theme is the default
   - `dark` theme is applied automatically when `prefers-color-scheme: dark`
   - No manual JavaScript required for theme switching
   - No separate `tailwind.config.ts` file needed (Tailwind v4 uses CSS-first configuration)

2. **daisyUI Semantic Classes**: daisyUI provides semantic color classes that automatically adapt to the active theme:
   - Background: `bg-base-100`, `bg-base-200`, `bg-base-300`
   - Text: `text-base-content`, `text-primary`, `text-secondary`
   - Components: `btn`, `modal`, `badge`, `toggle`, `divider`, etc.
   - All classes automatically adjust colors based on the active theme

3. **Brand Colors**: Chess.com and Lichess brand colors are defined in `app/globals.css` using `@theme` and remain constant across themes:
   - Chess.com: `#2d2c28` (accessed via `bg-chesscom` or `text-chesscom`)
   - Lichess: `#000000` (accessed via `bg-lichess` or `text-lichess`)

**Usage in Components:**

Use daisyUI semantic classes for theme-aware styling:

```tsx
// Good - uses daisyUI semantic classes
<div className="bg-base-200 text-base-content border-base-300">
<button className="btn btn-primary">Click me</button>

// Avoid - hardcoded colors don't respect theme
<div className="bg-white text-gray-900 border-gray-200">
```

**Component Examples:**

- Buttons: `btn`, `btn-primary`, `btn-outline`, `btn-ghost`
- Modals: `modal`, `modal-box`, `modal-open`
- Form elements: `toggle`, `input`, `textarea`
- Layout: `divider`, `badge`

**Icons**: Currently using emoji placeholders (🔒, 🌐, ✏️, ×). Can be replaced with a proper icon library in the future.

## Code Style Conventions

**Prettier Configuration:**

- No semicolons (`semi: false`)
- Single quotes (`singleQuote: true`)
- 100 character line width
- No bracket spacing
- Uses `prettier-plugin-classnames` for Tailwind class sorting

**Component Patterns:**

- Server Components by default (no `'use client'` directive)
- Client Components only when needed (forms, modals, interactive elements)
- Server Actions marked with `'use server'` at top of async functions
- Props interfaces defined inline or via `type` keyword
- Minimal prop drilling; use React Context where appropriate (`AppContext` for user state)

## Important Development Notes

### Database & Auth Usage

**Server Components (reading data):**

```typescript
import {db} from '@/lib/db'
import {requireAuth} from '@/lib/auth'
import {collections} from '@/lib/schema'
import {eq} from 'drizzle-orm'

export default async function Page() {
  const user = await requireAuth()

  const userCollections = db
    .select()
    .from(collections)
    .where(eq(collections.ownerId, user.id))
    .all()

  // ...
}
```

**Server Actions (mutations):**

```typescript
'use server'
import {db} from '@/lib/db'
import {requireAuth} from '@/lib/auth'
import {games} from '@/lib/schema'
import {revalidatePath} from 'next/cache'

export async function deleteGame(gameId: number) {
  const user = await requireAuth()

  // Delete game
  db.delete(games).where(eq(games.id, gameId)).run()

  // Refresh UI
  revalidatePath('/collections')
}
```

**Authentication:**

```typescript
import {lucia, requireAuth, getUser} from '@/lib/auth'
import bcrypt from 'bcrypt'
import {cookies} from 'next/headers'

// Sign up
const hashedPassword = await bcrypt.hash(password, 10)
// Create user, then:
const session = await lucia.createSession(userId, {})
const sessionCookie = lucia.createSessionCookie(session.id)
// Note: cookies() is async in Next.js 16
const cookieStore = await cookies()
cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

// Protected route
const user = await requireAuth() // Redirects if not authenticated

// Optional auth
const user = await getUser() // Returns null if not authenticated
```

### Data Fetching Patterns

- Use Server Components for initial data loading
- Use Server Actions for mutations (create, update, delete)
- Call `revalidatePath()` after mutations to refresh UI
- Avoid client-side fetching unless necessary (e.g., lazy loading)

### Drizzle ORM Patterns

**Query Building:**

```typescript
import {db} from '@/lib/db'
import {games, collections} from '@/lib/schema'
import {eq, and, desc} from 'drizzle-orm'

// Select with conditions
const result = db
  .select()
  .from(games)
  .where(and(eq(games.collectionId, id), eq(games.site, 'chess.com')))
  .orderBy(desc(games.gameDttm))
  .all()

// Insert
db.insert(games).values({collectionId, url /* ... */}).run()

// Update
db.update(games).set({notes: 'New note'}).where(eq(games.id, gameId)).run()

// Delete
db.delete(games).where(eq(games.id, gameId)).run()

// Joins
const result = db
  .select()
  .from(games)
  .leftJoin(collections, eq(games.collectionId, collections.id))
  .all()
```

**Upsert Pattern (for game imports):**

```typescript
// SQLite doesn't have native UPSERT in Drizzle
// Use INSERT OR REPLACE or manual checking
db.insert(games).values(gameData).onConflictDoUpdate({target: games.url, set: gameData}).run()
```

### Chess.com vs Lichess Differences

**Chess.com:**

- Provides ECO codes, FEN, time control as "initial+increment"
- Moves require separate API call (TCN format in callback endpoint)
- Custom board component with navigation

**Lichess:**

- Provides clock_initial/clock_increment separately
- Uses `winner` field instead of white_result/black_result
- Games can be displayed in embedded iframe or custom board
- API requires bearer token authentication

### Docker Build

- Uses multi-stage build (deps → builder → runner)
- Output mode: `standalone` (configured in `next.config.mjs`)
- Exposes port 3000
- Runs as non-root user `nextjs`

### Common Gotchas

1. **Database Access:** Always import `db` from `@/lib/db` - never create multiple database instances
2. **Authentication:** Use `requireAuth()` for protected routes, `getUser()` for optional auth
3. **Query Methods:** Use `.all()` for multiple rows, `.get()` for single row, `.run()` for mutations
4. **SQLite Types:**
   - Timestamps are ISO8601 strings
   - Booleans are integers (0/1)
   - UUIDs are text strings
5. **Foreign Keys:** SQLite foreign keys are enabled via pragma - migrations include CASCADE deletes
6. **Next.js 16 cookies():** In Next.js 16, `cookies()` is async and must be awaited: `const cookieStore = await cookies()`. This changed from Next.js 14 where it was synchronous.
7. **Move Format:** Chess.com uses TCN (encoded), Lichess uses standard algebraic notation
8. **Unique Constraints:** Games are deduplicated by URL (Chess.com) or lichess_game_id (Lichess)
9. **Schema Changes:** After modifying `lib/schema.ts`, run `yarn drizzle-kit generate` to create migrations
