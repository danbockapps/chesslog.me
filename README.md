# chesslog.me

A Next.js application for importing, organizing, and analyzing your chess games from Chess.com and Lichess. Create collections of games, add notes and tags, and review positions with an interactive chess board.

## Features

- **Import Games** from Chess.com and Lichess via their public APIs
- **Organize** games into collections by username and platform
- **Analyze** games with an interactive chess board (move-by-move navigation)
- **Annotate** games with personal notes and reusable tags/takeaways
- **Tag System** with private and public tags for categorizing games
- **Automatic Deduplication** when refreshing collections

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS + Material-UI
- **Chess:** chess.js + react-chessboard
- **Package Manager:** Yarn

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22.22+
- Supabase account (or local Supabase instance)
- Chess.com account (to import Chess.com games)
- Lichess API token (to import Lichess games)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/danbockapps/chesslog.me.git
cd chesslog.me
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:

Create `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
LICHESS_TOKEN=your_lichess_api_token
```

Optional:
```bash
INTERNAL_SUPABASE_URL=your_internal_url  # If different from public URL
```

4. Set up the database:

If using local Supabase:
```bash
supabase start
supabase db reset
```

If using hosted Supabase, run the migrations in `supabase/migrations/` in order.

5. Generate TypeScript types from your database:
```bash
# Local Supabase
supabase gen types typescript --local > app/database.types.ts

# Hosted Supabase
supabase gen types typescript --project-id your_project_id > app/database.types.ts
```

### Running the Application

**Development:**
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production:**
```bash
yarn build
yarn start
```

**Docker:**
```bash
docker build -t chesslog.me .
docker run -p 3000:3000 chesslog.me
```

## Usage

1. **Sign up** for an account at `/signup`
2. **Create a collection** by providing:
   - Collection name
   - Platform (Chess.com or Lichess)
   - Your username on that platform
3. **Import games** by clicking the "Refresh" button on a collection
4. **Review games** by expanding the game accordion
5. **Navigate moves** using the First/Previous/Next/Last buttons on the chess board
6. **Add notes** to document your analysis
7. **Tag games** with takeaways or themes for future reference

## Project Structure

```
app/
├── lib/supabase/       # Supabase client creation
├── login/              # Login page and actions
├── signup/             # Signup page and actions
├── collections/        # Collections list and detail pages
│   └── [id]/           # Dynamic collection route
│       ├── actions/    # Server actions for game import/CRUD
│       ├── chesscom/   # Chess.com specific components
│       └── lichess/    # Lichess specific components
├── ui/                 # Reusable UI components
└── utils/              # Utility functions

supabase/
└── migrations/         # Database schema migrations
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `LICHESS_TOKEN` | Yes* | Lichess API token for importing games |
| `INTERNAL_SUPABASE_URL` | No | Server-side Supabase URL (if different) |

\* Only required if importing Lichess games

### Getting a Lichess API Token

1. Go to https://lichess.org/account/oauth/token
2. Create a new personal access token
3. No special scopes needed (read public games is default)

## Database

The application uses PostgreSQL via Supabase with the following main tables:

- **profiles** - User profile information
- **collections** - Game collections by platform/username
- **games** - Individual chess games with metadata
- **tags** - Reusable tags for categorizing games
- **game_tag** - Many-to-many relationship between games and tags

Row Level Security (RLS) is enabled to ensure users can only access their own data.

## API Integrations

### Chess.com
- Archives: `https://api.chess.com/pub/player/{username}/games/{year}/{month}`
- Move data: `https://www.chess.com/callback/live/game/{gameId}`

### Lichess
- Games: `https://lichess.org/api/games/user/{username}`
- Requires bearer token authentication

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and development guidelines.

**Useful commands:**
```bash
yarn dev                # Start development server
yarn lint               # Run ESLint
supabase start          # Start local Supabase
supabase db reset       # Reset and migrate database
```

## License

This project is private and not licensed for public use.

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Chess.com API](https://www.chess.com/news/view/published-data-api)
- [Lichess API](https://lichess.org/api)
