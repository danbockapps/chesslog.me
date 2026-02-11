import {sqliteTable, text, integer, primaryKey, unique, index} from 'drizzle-orm/sqlite-core'

// Users table - for authentication
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID as text
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// Sessions table - for Lucia auth
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade'}),
    expiresAt: integer('expires_at').notNull(), // Unix timestamp
  },
  (table) => ({
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
  }),
)

// Profiles table - user profile data
export const profiles = sqliteTable('profiles', {
  id: text('id')
    .primaryKey()
    .references(() => users.id, {onDelete: 'cascade'}),
  firstName: text('first_name'),
  lastName: text('last_name'),
})

// Collections table - chess game collections
export const collections = sqliteTable(
  'collections',
  {
    id: text('id').primaryKey(), // UUID as text
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade'}),
    name: text('name'),
    site: text('site').$type<'lichess' | 'chess.com'>(), // ENUM as text with type assertion
    username: text('username'),
    timeClass: text('time_class').$type<
      'ultraBullet' | 'bullet' | 'blitz' | 'rapid' | 'classical' | null
    >(), // Time class filter
    lastRefreshed: text('last_refreshed'), // ISO8601 timestamp
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    ownerIdIdx: index('idx_collections_owner_id').on(table.ownerId),
  }),
)

// Games table - individual chess games
export const games = sqliteTable(
  'games',
  {
    id: integer('id').primaryKey({autoIncrement: true}),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, {onDelete: 'cascade'}),
    site: text('site').$type<'lichess' | 'chess.com'>(),
    url: text('url'), // Chess.com game URL
    lichessGameId: text('lichess_game_id'), // Lichess game ID
    gameDttm: text('game_dttm'), // ISO8601 timestamp
    eco: text('eco'),
    fen: text('fen'),
    timeControl: text('time_control'),
    clockInitial: integer('clock_initial'),
    clockIncrement: integer('clock_increment'),
    whiteUsername: text('white_username'),
    blackUsername: text('black_username'),
    whiteRating: integer('white_rating'),
    blackRating: integer('black_rating'),
    whiteResult: text('white_result'),
    blackResult: text('black_result'),
    winner: text('winner'),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    // Composite unique constraints - same game can exist in multiple collections
    uniqueLichessGame: unique().on(table.collectionId, table.lichessGameId),
    uniqueChesscomGame: unique().on(table.collectionId, table.url),
    // Indexes for analytics queries
    collectionDttmIdx: index('idx_games_collection_dttm').on(table.collectionId, table.gameDttm),
  }),
)

// Tags table - reusable tags/takeaways
export const tags = sqliteTable(
  'tags',
  {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    description: text('description'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade'}),
    public: integer('public', {mode: 'boolean'}).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    ownerIdIdx: index('idx_tags_owner_id').on(table.ownerId),
  }),
)

// Game-Tag junction table - many-to-many relationship
export const gameTags = sqliteTable(
  'game_tags',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, {onDelete: 'cascade'}),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, {onDelete: 'cascade'}),
  },
  (table) => ({
    pk: primaryKey({columns: [table.gameId, table.tagId]}),
    // Indexes for analytics queries
    gameIdIdx: index('idx_game_tags_game').on(table.gameId),
    tagIdIdx: index('idx_game_tags_tag').on(table.tagId),
  }),
)

// Type exports for use in queries
export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type Profile = typeof profiles.$inferSelect
export type Collection = typeof collections.$inferSelect
export type Game = typeof games.$inferSelect
export type Tag = typeof tags.$inferSelect
export type GameTag = typeof gameTags.$inferSelect
