# chesslog.me

A Next.js application for importing, organizing, and analyzing your chess games from Chess.com and Lichess. Create collections of games, add notes and tags, and review positions with an interactive chess board.

## Features

- **Import Games** from Chess.com and Lichess via their public APIs
- **Organize** games into collections by username and platform
- **Analyze** games with an interactive chess board (move-by-move navigation)
- **Annotate** games with personal notes and reusable tags/takeaways
- **Tag System** with private and public tags for categorizing games. Public tags are not editable by the user. A selection of default public tags is included in the database by default.
- **Automatic Deduplication** when refreshing collections

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (better-sqlite3 + Drizzle ORM)
- **Authentication:** Lucia Auth
- **Styling:** Tailwind CSS + Material-UI
- **Chess:** chess.js + react-chessboard
- **Package Manager:** Yarn
- **Code Quality:** ESLint + Prettier (with pre-commit hooks via Husky)

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22.22+
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

This will also automatically set up git hooks for code formatting.

3. Set up environment variables:

Create `.env.local` file in the root directory:

```bash
DATABASE_PATH=./data/database.db
LICHESS_TOKEN=your_lichess_api_token
```

4. Set up the database:

The database will be automatically created on first run. To manually run migrations:

```bash
yarn drizzle-kit migrate
```

To generate new migrations after schema changes in `lib/schema.ts`:

```bash
yarn drizzle-kit generate
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
lib/
├── schema.ts           # Drizzle ORM schema definitions
├── db.ts               # SQLite database initialization
└── auth.ts             # Lucia auth + helper functions

drizzle/
└── *.sql               # Database migrations

app/
├── login/              # Login page and actions
├── signup/             # Signup page and actions
├── collections/        # Collections list and detail pages
│   └── [id]/           # Dynamic collection route
│       ├── actions/    # Server actions for game import/CRUD
│       ├── chesscom/   # Chess.com specific components
│       └── lichess/    # Lichess specific components
├── ui/                 # Reusable UI components
└── utils/              # Utility functions
```

## Environment Variables

| Variable        | Required | Description                                                  |
| --------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_PATH` | No       | Path to SQLite database file (default: `./data/database.db`) |
| `LICHESS_TOKEN` | Yes\*    | Lichess API token for importing games                        |

\* Only required if importing Lichess games

### Getting a Lichess API Token

1. Go to https://lichess.org/account/oauth/token
2. Create a new personal access token
3. No special scopes needed (read public games is default)

## Database

The application uses SQLite with Drizzle ORM and the following main tables:

- **users** - User accounts (email + hashed password)
- **sessions** - Active user sessions (Lucia Auth)
- **profiles** - User profile information
- **collections** - Game collections by platform/username
- **games** - Individual chess games with metadata
- **tags** - Reusable tags for categorizing games
- **game_tags** - Many-to-many relationship between games and tags

The schema is defined in `lib/schema.ts` with foreign key constraints and cascade deletes for data integrity.

## API Integrations

### Chess.com

- Archives: `https://api.chess.com/pub/player/{username}/games/{year}/{month}`
- Move data: `https://www.chess.com/callback/live/game/{gameId}`

### Lichess

- Games: `https://lichess.org/api/games/user/{username}`
- Requires bearer token authentication

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and development guidelines.

### Code Formatting

This project uses **Prettier** for automatic code formatting with a **pre-commit hook** powered by Husky and lint-staged:

- Code is automatically formatted on every commit
- Only staged files are formatted (fast and efficient)
- Formats: TypeScript, JavaScript, JSON, CSS, and Markdown files

**Manual formatting:**

```bash
yarn prettier --write .   # Format all files
yarn prettier --check .   # Check formatting without changes
```

The pre-commit hook runs automatically - no action needed from developers!

### Useful Commands

```bash
yarn dev                  # Start development server
yarn lint                 # Run ESLint
yarn drizzle-kit generate # Generate migration from schema changes
yarn drizzle-kit migrate  # Run migrations
yarn drizzle-kit studio   # Open Drizzle Studio (database GUI)
```

## License

This project is private and not licensed for public use.

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Lucia Auth Documentation](https://lucia-auth.com/)
- [Chess.com API](https://www.chess.com/news/view/published-data-api)
- [Lichess API](https://lichess.org/api)
