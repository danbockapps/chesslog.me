const TIME_CLASS_LABELS: Record<string, string> = {
  ultraBullet: 'ultrabullet',
  bullet: 'bullet',
  blitz: 'blitz',
  rapid: 'rapid',
  classical: 'classical',
}

export function getCollectionDisplayName(collection: {
  name: string | null
  site?: string | null
  username?: string | null
  timeClass?: string | null
}): string {
  if (collection.site && collection.username) {
    const siteName = collection.site === 'chess.com' ? 'Chess.com' : 'Lichess'
    const timeClassLabel = collection.timeClass
      ? (TIME_CLASS_LABELS[collection.timeClass] ?? collection.timeClass)
      : null
    return timeClassLabel
      ? `${siteName} ${timeClassLabel} games — ${collection.username}`
      : `${siteName} games — ${collection.username}`
  }

  return collection.name || 'Untitled collection'
}
