export const gameAccordionClassNames = {
  cardClassName: 'mb-4',
  headerClassName: 'px-4 py-4 flex items-center gap-4 whitespace-nowrap',
  // Capped at 3 columns so the main sections (board/details, tags, notes) don't get
  // squeezed on wide screens; the full-width discussion section sits below them.
  contentClassName: 'p-4 grid gap-x-4 gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  lichessClassName: 'lg:grid-cols-[501px,1fr,1fr]', // for embedded board
}
