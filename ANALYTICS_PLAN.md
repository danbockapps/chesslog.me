# Analytics & Data Visualization Implementation Plan

## Overview

Add a data visualization and analytics dashboard to collection pages with:

- **Tag distribution visualizations** (bar/pie charts) - PRIMARY FOCUS
- **Word cloud** from game notes
- **Read-only summary view** of all games with tags/notes (no chessboard)

## UI Design

### Tab-Based Navigation

Add a tab switcher at the top of the collection detail page (`app/collections/[id]/page.tsx`):

```
┌────────────────────────────────────────────┐
│ ⬅ Collections    [Collection Name]  🔄    │
│ [ Games ] [ Analytics ]                    │
├────────────────────────────────────────────┤
│ GAMES VIEW (current implementation)       │
│   - Paginated game accordions              │
│                                            │
│ ANALYTICS VIEW (new)                       │
│   - Tag Distribution Chart                 │
│   - Notes Word Cloud                       │
│   - Read-only Summary (scrollable)         │
└────────────────────────────────────────────┘
```

**Implementation**: Use daisyUI tabs component (lightweight, theme-aware):

```tsx
<div className="tabs tabs-boxed mb-4">
  <button
    className={`tab ${view === 'games' ? 'tab-active' : ''}`}
    onClick={() => setView('games')}
  >
    Games
  </button>
  <button
    className={`tab ${view === 'analytics' ? 'tab-active' : ''}`}
    onClick={() => setView('analytics')}
  >
    Analytics
  </button>
</div>
```

## Technology Choices

### Charting Library: Recharts

**Why Recharts:**

- TypeScript-first with excellent type safety
- React-native API (declarative components)
- SVG rendering works seamlessly with daisyUI theme CSS variables
- Mature, well-maintained, widely adopted
- Bundle: ~139kB gzipped (acceptable, lazy-loaded)

**Installation:**

```bash
yarn add recharts
```

### Word Cloud: react-d3-cloud

**Why react-d3-cloud:**

- Compatible with React 19
- Lighter than react-wordcloud (~30kB vs ~80kB)
- D3-based layout algorithm
- Customizable colors, rotation, sizing

**Installation:**

```bash
yarn add react-d3-cloud
```

## Data Visualizations

### 1. Tag Distribution Bar Chart (PRIORITY)

**Purpose**: Show which takeaways/tags appear most frequently

**Data Query** (server action):

```sql
SELECT tags.name, COUNT(game_tags.game_id) as count, tags.public
FROM tags
JOIN game_tags ON tags.id = game_tags.tag_id
JOIN games ON game_tags.game_id = games.id
WHERE games.collection_id = ? AND (tags.owner_id = ? OR tags.public = 1)
GROUP BY tags.id
ORDER BY count DESC
LIMIT 15
```

**Visual Design**:

- Horizontal bar chart (better for tag name labels)
- X-axis: Count of games
- Y-axis: Tag names
- Colors: Distinguish public tags (primary color) vs private tags (neutral)
- Tooltip showing exact count

**Recharts Implementation**:

```tsx
<BarChart layout="vertical" data={tagData} height={400} margin={{left: 100}}>
  <XAxis type="number" stroke="hsl(var(--bc))" />
  <YAxis type="category" dataKey="name" width={150} stroke="hsl(var(--bc))" />
  <Bar dataKey="count" fill="hsl(var(--p))" />
  <Tooltip
    contentStyle={{
      backgroundColor: 'hsl(var(--b1))',
      border: '1px solid hsl(var(--bc) / 0.2)',
      borderRadius: '0.5rem',
    }}
  />
</BarChart>
```

### 2. Notes Word Cloud

**Purpose**: Surface common themes/words in user's game analysis

**Data Processing**:

1. Fetch all games with notes: `SELECT notes FROM games WHERE collection_id = ? AND notes IS NOT NULL AND notes != ''`
2. Tokenize: Split on whitespace, lowercase, remove punctuation
3. Filter stop words: Remove common words (the, and, is, to, in, etc.)
4. Count frequency
5. Filter minimum: Only show words appearing 2+ times
6. Format for react-d3-cloud: `[{text: 'mistake', value: 5}, {text: 'endgame', value: 3}, ...]`

**Stop Words List** (minimal):

```typescript
const STOP_WORDS = new Set([
  'the',
  'and',
  'is',
  'to',
  'in',
  'of',
  'a',
  'for',
  'on',
  'with',
  'as',
  'was',
  'at',
  'by',
  'from',
  'or',
  'an',
  'be',
  'this',
  'that',
  'it',
  'my',
  'i',
  'me',
  'should',
  'have',
  'had',
  'could',
  'would',
])
```

**Word Cloud Component**:

```tsx
<WordCloud
  data={wordData}
  width={600}
  height={400}
  font="inherit"
  spiral="rectangular"
  padding={2}
  rotate={() => 0} // No rotation for readability
  fill={() => `hsl(var(--p))`} // Theme-aware primary color
/>
```

### 3. Read-Only Summary View

**Purpose**: Scrollable overview of all games showing tags and notes without chessboards

**Layout**: Card-based list within Analytics tab, below charts

**Component Structure**:

```tsx
<div className="space-y-3">
  <h2 className="text-lg font-semibold">Game Summary</h2>
  {allGames.map((game) => (
    <Card key={game.id} className="p-4">
      <div className="flex items-center gap-3 text-sm mb-2">
        <span className={`w-2 h-2 rounded-full ${getResultColor(game)}`} />
        <span className="font-medium">
          {game.whiteUsername} vs {game.blackUsername}
        </span>
        <span className="text-base-content/70">•</span>
        <span>{game.timeControl}</span>
        <span className="text-base-content/70">•</span>
        <span>{formatRelativeTime(game.gameDttm)}</span>
      </div>

      {game.eco && <div className="text-xs text-base-content/70 mb-2">Opening: {game.eco}</div>}

      {game.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {game.tags.map((tag) => (
            <span
              key={tag.id}
              className={`badge badge-sm ${tag.public ? 'badge-primary' : 'badge-neutral'}`}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {game.notes && (
        <div className="text-sm text-base-content/80">
          {game.notes.length > 200 ? game.notes.slice(0, 200) + '...' : game.notes}
        </div>
      )}
    </Card>
  ))}
</div>
```

**Data Fetching** (optimized for N+1 prevention):

```typescript
// Fetch all games for collection
const allGames = db
  .select()
  .from(games)
  .where(eq(games.collectionId, collectionId))
  .orderBy(desc(games.gameDttm))
  .all()

// Fetch all tags for these games in one query
const gameTagData = db
  .select({
    gameId: gameTags.gameId,
    tagId: tags.id,
    tagName: tags.name,
    tagPublic: tags.public,
  })
  .from(gameTags)
  .innerJoin(tags, eq(gameTags.tagId, tags.id))
  .where(
    inArray(
      gameTags.gameId,
      allGames.map((g) => g.id),
    ),
  )
  .all()

// Group tags by game ID client-side
const tagsByGame = gameTagData.reduce(
  (acc, row) => {
    if (!acc[row.gameId]) acc[row.gameId] = []
    acc[row.gameId].push({id: row.tagId, name: row.tagName, public: row.tagPublic})
    return acc
  },
  {} as Record<number, {id: number; name: string; public: boolean}[]>,
)
```

## Theme Integration

All visualizations use daisyUI CSS variables for automatic light/dark mode:

```typescript
// chartTheme.ts
export const chartColors = {
  primary: 'hsl(var(--p))', // Primary brand color
  success: 'hsl(var(--su))', // Green (wins)
  error: 'hsl(var(--er))', // Red (losses)
  neutral: 'hsl(var(--n))', // Gray (draws)
  baseContent: 'hsl(var(--bc))', // Text color
  base100: 'hsl(var(--b1))', // Background
}
```

## Architecture

### File Structure

```
app/collections/[id]/
├── page.tsx                          # MODIFY: Add tab toggle state, conditional rendering
├── analytics/
│   ├── analyticsView.tsx             # NEW: Main server component for analytics tab
│   ├── readOnlySummary.tsx           # NEW: Scrollable game summary cards
│   ├── actions.ts                    # NEW: Server actions for analytics queries
│   ├── chartTheme.ts                 # NEW: Theme configuration constants
│   ├── wordCloudProcessor.ts         # NEW: Text processing utilities
│   └── charts/
│       ├── tagDistribution.tsx       # NEW: Tag bar chart (client component)
│       └── notesWordCloud.tsx        # NEW: Word cloud (client component)
```

### Server Component Pattern

**Main Analytics View** (server component):

```typescript
// app/collections/[id]/analytics/analyticsView.tsx
import {db} from '@/lib/db'
import {getTagDistribution} from './actions'
import TagDistributionChart from './charts/tagDistribution'
import NotesWordCloud from './charts/notesWordCloud'
import ReadOnlySummary from './readOnlySummary'

export default async function AnalyticsView({
  collectionId,
  userId,
}: {
  collectionId: string
  userId: string
}) {
  // Fetch all analytics data in parallel
  const [tagStats, gamesWithNotes] = await Promise.all([
    getTagDistribution(collectionId, userId),
    getGamesWithNotes(collectionId),
  ])

  const wordCloudData = processNotes(gamesWithNotes)

  return (
    <div className="space-y-8 py-4">
      <section>
        <h2 className="text-lg font-semibold mb-3">Tag Distribution</h2>
        <TagDistributionChart data={tagStats} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Common Themes in Notes</h2>
        <NotesWordCloud data={wordCloudData} />
      </section>

      <section>
        <ReadOnlySummary collectionId={collectionId} />
      </section>
    </div>
  )
}
```

### Client Component Boundary

Only chart rendering needs `'use client'`:

```typescript
// app/collections/[id]/analytics/charts/tagDistribution.tsx
'use client'
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts'
import {chartColors} from '../chartTheme'

interface TagStat {
  name: string
  count: number
  public: boolean
}

export default function TagDistributionChart({data}: {data: TagStat[]}) {
  if (data.length === 0) {
    return <div className="text-center text-base-content/70 py-8">No tags found</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart layout="vertical" data={data} margin={{left: 120, right: 30}}>
        <XAxis type="number" stroke={chartColors.baseContent} />
        <YAxis type="category" dataKey="name" width={150} stroke={chartColors.baseContent} />
        <Bar dataKey="count" fill={chartColors.primary} />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.base100,
            border: `1px solid ${chartColors.baseContent}33`,
            borderRadius: '0.5rem',
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

## Performance Optimizations

### 1. Lazy Loading

Use dynamic imports for analytics view (loaded only when tab clicked):

```typescript
import dynamic from 'next/dynamic'

const AnalyticsView = dynamic(() => import('./analytics/analyticsView'), {
  loading: () => (
    <div className="flex justify-center p-8">
      <span className="loading loading-spinner"></span>
    </div>
  ),
  ssr: false, // Optional: skip SSR if data fetching is slow
})
```

### 2. Database Indexes

Add indexes for analytics queries:

```sql
-- drizzle/XXXX_add_analytics_indexes.sql
CREATE INDEX IF NOT EXISTS idx_games_collection_dttm ON games(collection_id, game_dttm DESC);
CREATE INDEX IF NOT EXISTS idx_game_tags_game ON game_tags(game_id);
CREATE INDEX IF NOT EXISTS idx_game_tags_tag ON game_tags(tag_id);
```

Generate migration: `yarn drizzle-kit generate`

### 3. Large Dataset Handling

**For collections with 500+ games:**

- Tag/result charts: Pre-aggregated server-side (already efficient)
- Word cloud: Sample notes if total exceeds 100KB (take every Nth game)
- Read-only summary: Implement virtual scrolling with `react-window` if needed:

```bash
yarn add react-window
yarn add -D @types/react-window
```

```tsx
import {FixedSizeList} from 'react-window'
;<FixedSizeList
  height={600}
  itemCount={games.length}
  itemSize={150} // Estimated card height
  width="100%"
>
  {({index, style}) => (
    <div style={style}>
      <GameSummaryCard game={games[index]} />
    </div>
  )}
</FixedSizeList>
```

## Implementation Phases

### Phase 1: Foundation & Tag Distribution (Primary Focus) ✅ COMPLETE

**Goal**: Set up architecture and implement tag chart

1. ✅ Install dependencies: `yarn add recharts react-d3-cloud`
2. ✅ Create `app/collections/[id]/analytics/` folder structure
3. ✅ Create `chartTheme.ts` with daisyUI color mappings
4. ✅ Modify `page.tsx`: Add tab toggle state and conditional rendering
5. ✅ Create `analytics/actions.ts` with `getTagDistribution()` server action
6. ✅ Create `analytics/charts/tagDistribution.tsx` client component
7. ✅ Create `analytics/analyticsView.tsx` server component (skeleton)
8. ✅ Generate and run database indexes migration
9. ✅ Test tag distribution chart with various datasets

**Success Criteria**:

- ✅ Tab navigation works
- ✅ Tag distribution bar chart displays correctly
- ✅ Dark/light mode theming works
- ✅ No performance issues with 100+ games

### Phase 2: Word Cloud

**Goal**: Notes text analysis

1. Create `analytics/wordCloudProcessor.ts` utility
2. Implement tokenization, stop word filtering, frequency counting
3. Create `analytics/charts/notesWordCloud.tsx` client component
4. Add to `analyticsView.tsx`
5. Test with large note datasets
6. Add sampling if performance issues

### Phase 3: Read-Only Summary

**Goal**: Scrollable game overview

1. Create `analytics/readOnlySummary.tsx` component
2. Implement optimized data fetching (avoid N+1 queries)
3. Create game summary card layout
4. Add to bottom of `analyticsView.tsx`
5. Test scrolling performance with 200+ games
6. Add virtual scrolling if needed

### Phase 4: Polish & Optimization

**Goal**: Production readiness

1. Add empty states for all charts
2. Responsive design testing (mobile, tablet, desktop)
3. Accessibility: ARIA labels, keyboard navigation
4. Loading states and error handling
5. Bundle size analysis
6. Documentation and code comments

## Verification Plan

### Testing Checklist

**Data Scenarios**:

- [ ] Collection with 0 games → Show empty states
- [ ] Collection with 1-10 games → Charts render
- [ ] Collection with 100+ games → Performance acceptable
- [ ] Collection with no tags → Tag chart shows empty state
- [ ] Collection with no notes → Word cloud shows empty state
- [ ] Chess.com collection → Win/loss calculation correct
- [ ] Lichess collection → Win/loss calculation correct

**Visual Testing**:

- [ ] Light mode: All charts readable
- [ ] Dark mode: All charts readable
- [ ] Theme switch while on analytics tab works
- [ ] Mobile (375px width): Charts responsive
- [ ] Tablet (768px width): Layout optimal
- [ ] Desktop (1920px width): Good use of space

**Interaction Testing**:

- [ ] Tab switching smooth
- [ ] Chart tooltips work
- [ ] Summary cards display all info
- [ ] Long tag names don't break layout
- [ ] Long notes truncate properly

**Performance Testing**:

- [ ] Initial page load (Games tab) unaffected
- [ ] Analytics tab loads within 2 seconds
- [ ] Bundle size increase acceptable (<200KB)
- [ ] Scroll performance smooth (read-only summary)

**Accessibility**:

- [ ] Tab buttons keyboard accessible
- [ ] Charts have ARIA labels
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Screen reader announces tab changes

## Critical Files

1. `/app/collections/[id]/page.tsx` - Add tab toggle and conditional view rendering
2. `/app/collections/[id]/analytics/analyticsView.tsx` - Main analytics orchestrator
3. `/app/collections/[id]/analytics/actions.ts` - Server actions for data queries
4. `/app/collections/[id]/analytics/charts/tagDistribution.tsx` - Tag bar chart (PRIORITY)
5. `/lib/schema.ts` - Reference for data structure
6. `/drizzle/XXXX_add_analytics_indexes.sql` - Performance indexes
