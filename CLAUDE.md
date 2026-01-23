# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

chesslog.me is a Next.js 14 application for tracking and analyzing chess games from Chess.com and Lichess. Users can import games, add notes, create tags, and review game positions using an interactive chess board.

## Development Commands

**Package Manager:** This project uses Yarn 1.22.22 (configured in `packageManager` field)

```bash
# Development
yarn dev                    # Start dev server on http://localhost:3000
yarn build                  # Build production bundle
yarn start                  # Start production server
yarn lint                   # Run ESLint

# Supabase local development
supabase start             # Start local Supabase (DB, Auth, Storage, Studio)
supabase stop              # Stop local services
supabase db reset          # Reset database and run migrations
supabase migration new <name>  # Create new migration file
supabase gen types typescript --local > app/database.types.ts  # Regenerate types

# Docker
docker build -t chesslog.me .
docker run -p 3000:3000 chesslog.me
```

## Architecture Overview

### Tech Stack

- **Framework:** Next.js 14.2.7 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Material-UI components
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth (JWT-based, cookie sessions)
- **Chess Logic:** chess.js + react-chessboard
- **Deployment:** Docker container with standalone output

### Server-First Architecture

This application heavily uses Next.js Server Components and Server Actions instead of traditional API routes:

- **Server Actions** located in `*/actions.ts` files handle all data mutations
- **Server Components** fetch data directly from Supabase using `createClient()` from `app/lib/supabase/server.ts`
- **Client Components** (`'use client'`) are only used for interactive UI (modals, forms, chess board)
- Minimal client-side state management (React hooks only, no Redux/Zustand)

### Directory Structure

```
app/
├── lib/supabase/          # Supabase client factories
│   ├── server.ts          # Server-side client (with cookie handling)
│   ├── client.ts          # Browser client
│   └── middleware.ts      # Session refresh middleware
├── auth/                  # Email confirmation route
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
│   └── *.tsx              # Accordion, Button, Card, Modal, Spinner, etc.
└── utils/                 # Utility functions
```

### Database Schema

**Key Tables:**
- `profiles` - User profiles (1:1 with auth.users)
- `collections` - Game collections owned by users
  - `site`: 'chess.com' | 'lichess'
  - `username`: Chess platform username
  - `last_refreshed`: Timestamp of last import
- `games` - Individual chess games
  - Belongs to a collection
  - Contains player info, ratings, ECO, FEN, time control
  - `url` (Chess.com) or `lichess_game_id` (unique constraints)
  - `notes`: User-written analysis
- `tags` - Reusable tags/takeaways
  - `public`: If true, visible to all users
  - `owner_id`: Creator of the tag
- `game_tag` - Many-to-many junction table

**Row Level Security (RLS):** Enabled on all tables. Users can only access their own collections and games.

**Database Migrations:** Located in `supabase/migrations/*.sql`

### Authentication Flow

1. User signs up via `/signup` → `signup()` server action → Supabase Auth
2. Trigger function `handle_new_user()` creates profile entry
3. User logs in via `/login` → `login()` server action → session cookies set
4. Middleware (`middleware.ts`) refreshes session on every request
5. Protected routes check session; redirect to `/login` if unauthenticated

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon/public key for browser
- `INTERNAL_SUPABASE_URL` - Optional server-side URL (defaults to public URL)
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

### Chess Board Component

- Located in `app/collections/[id]/chesscom/board.tsx`
- Uses `chess.js` for move validation and position tracking
- Uses `react-chessboard` for UI rendering
- **Lazy loading:** Moves are only fetched when user first clicks navigation buttons
- Supports forward/backward navigation through game moves
- Stores Chess instance in `useRef` to persist across renders

### TypeScript Path Aliases

- `@/*` maps to project root (configured in `tsconfig.json`)
- Example: `import {createClient} from '@/app/lib/supabase/server'`

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

### Supabase Client Usage

**Server-side:**
```typescript
import {createClient} from '@/app/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const {data} = await supabase.from('collections').select()
  // ...
}
```

**Client-side:**
```typescript
import {createClient} from '@/app/lib/supabase/client'

const supabase = createClient()
const {data} = await supabase.from('games').select()
```

**Server Actions:**
```typescript
'use server'
import {createClient} from '@/app/lib/supabase/server'

export async function myAction() {
  const supabase = await createClient()
  // ...
}
```

### Data Fetching Patterns

- Use Server Components for initial data loading
- Use Server Actions for mutations (create, update, delete)
- Call `revalidatePath()` after mutations to refresh UI
- Avoid client-side fetching unless necessary (e.g., lazy loading)

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

1. **Session Management:** Always use `createClient()` from correct location (server vs client)
2. **RLS Policies:** If queries fail with empty results, check RLS policies in Supabase Studio
3. **Move Format:** Chess.com uses TCN (encoded), Lichess uses standard algebraic notation
4. **Unique Constraints:** Games are deduplicated by URL (Chess.com) or lichess_game_id (Lichess)
5. **Type Safety:** Regenerate `database.types.ts` after schema migrations
