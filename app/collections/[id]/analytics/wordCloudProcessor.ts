// wordCloudProcessor.ts
// Text processing utilities for word cloud generation

export interface WordData {
  text: string
  value: number
}

// Minimal stop words list for chess notes
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
  'but',
  'not',
  'are',
  'were',
  'been',
  'has',
  'will',
  'can',
  'just',
  'when',
  'what',
  'than',
  'so',
  'if',
  'did',
  'do',
  'does',
  'then',
  'about',
  'all',
  'also',
  'after',
  'any',
  'their',
  'there',
  'them',
  'they',
  'these',
  'those',
  'which',
  'who',
  'how',
  'up',
  'out',
  'into',
])

/**
 * Process notes to generate word cloud data
 * @param notes Array of note strings
 * @param minFrequency Minimum times a word must appear (default: 1)
 * @returns Array of {text, value} objects for word cloud
 */
export function processNotesToWordCloud(notes: string[], minFrequency = 1): WordData[] {
  const wordFrequency = new Map<string, number>()

  // Tokenize and count words
  for (const note of notes) {
    // Split on whitespace and punctuation, then process each word
    const words = note
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/) // Split on whitespace
      .filter((word) => word.length > 2) // Filter very short words
      .filter((word) => !STOP_WORDS.has(word)) // Filter stop words

    for (const word of words) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1)
    }
  }

  // Convert to array and filter by minimum frequency
  const wordData = Array.from(wordFrequency.entries())
    .filter(([_, count]) => count >= minFrequency)
    .map(([text, value]) => ({text, value}))
    .sort((a, b) => b.value - a.value) // Sort by frequency (descending)
    .slice(0, 25) // Limit to top 25 words for better layout

  return wordData
}
