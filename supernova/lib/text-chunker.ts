export interface TextChunk {
  content: string
  chunkIndex: number
  chunkType: 'framework' | 'exercise' | 'example' | 'concept' | 'general'
  topics: string[]
  startPosition: number
  endPosition: number
}

const TARGET_CHUNK_SIZE = 800 // tokens (roughly 600-1000 words)
const MIN_CHUNK_SIZE = 400
const MAX_CHUNK_SIZE = 1200

/**
 * Detect chunk type based on keywords and structure
 */
function detectChunkType(text: string): TextChunk['chunkType'] {
  const lower = text.toLowerCase()

  // Framework indicators
  if (
    lower.includes('framework') ||
    lower.includes('model') ||
    lower.includes('system') ||
    lower.includes('process') ||
    /step \d+/i.test(text)
  ) {
    return 'framework'
  }

  // Exercise indicators
  if (
    lower.includes('exercise') ||
    lower.includes('try this') ||
    lower.includes('action:') ||
    lower.includes('do this') ||
    lower.includes('reflection')
  ) {
    return 'exercise'
  }

  // Example indicators
  if (
    lower.includes('for example') ||
    lower.includes('case study') ||
    lower.includes('story:') ||
    lower.includes('imagine')
  ) {
    return 'example'
  }

  // Concept indicators
  if (
    lower.includes('what is') ||
    lower.includes('definition') ||
    lower.includes('means that') ||
    lower.includes('refers to')
  ) {
    return 'concept'
  }

  return 'general'
}

/**
 * Extract topics from text using keyword matching
 */
function extractTopics(text: string): string[] {
  const topics: string[] = []
  const lower = text.toLowerCase()

  // Business topics
  if (/pricing|charge|money|revenue/.test(lower)) topics.push('pricing')
  if (/brand|identity|positioning/.test(lower)) topics.push('branding')
  if (/market|launch|sell/.test(lower)) topics.push('marketing')
  if (/sales|close|pitch/.test(lower)) topics.push('sales')
  if (/offer|product|service/.test(lower)) topics.push('offers')
  if (/niche|audience|target/.test(lower)) topics.push('audience')

  // Body topics
  if (/body|physical|appearance/.test(lower)) topics.push('body-image')
  if (/weight|size|shape/.test(lower)) topics.push('body-acceptance')
  if (/eat|food|nutrition/.test(lower)) topics.push('nutrition')
  if (/move|exercise|workout/.test(lower)) topics.push('movement')

  // Brain topics
  if (/adhd|neurodivergent|neurovariance/.test(lower)) topics.push('adhd')
  if (/focus|attention|concentrate/.test(lower)) topics.push('focus')
  if (/executive|dysfunction|overwhelm/.test(lower)) topics.push('executive-function')
  if (/time|procrastinat|deadline/.test(lower)) topics.push('time-management')
  if (/energy|burnout|exhaust/.test(lower)) topics.push('energy')

  // Mindset topics
  if (/imposter|fraud|not good enough/.test(lower)) topics.push('imposter-syndrome')
  if (/fear|afraid|scary/.test(lower)) topics.push('fear')
  if (/perfect|ideal|flawless/.test(lower)) topics.push('perfectionism')
  if (/authentic|real|genuine/.test(lower)) topics.push('authenticity')

  return topics.length > 0 ? topics : ['general']
}

/**
 * Split text into semantic chunks
 * Respects paragraphs, headings, and semantic boundaries
 */
export function chunkText(text: string, metadata?: { title?: string }): TextChunk[] {
  const chunks: TextChunk[] = []

  // Split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\s*\n/)

  let currentChunk = ''
  let currentPosition = 0
  let chunkIndex = 0

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim()
    if (!paragraph) continue

    const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph
    const wordCount = potentialChunk.split(/\s+/).length

    // If adding this paragraph would exceed max size and we have content, save current chunk
    if (wordCount > MAX_CHUNK_SIZE && currentChunk) {
      chunks.push({
        content: currentChunk,
        chunkIndex,
        chunkType: detectChunkType(currentChunk),
        topics: extractTopics(currentChunk),
        startPosition: currentPosition,
        endPosition: currentPosition + currentChunk.length,
      })

      currentPosition += currentChunk.length
      currentChunk = paragraph
      chunkIndex++
    }
    // If we're at a good size, save chunk
    else if (wordCount >= TARGET_CHUNK_SIZE && wordCount <= MAX_CHUNK_SIZE) {
      chunks.push({
        content: potentialChunk,
        chunkIndex,
        chunkType: detectChunkType(potentialChunk),
        topics: extractTopics(potentialChunk),
        startPosition: currentPosition,
        endPosition: currentPosition + potentialChunk.length,
      })

      currentPosition += potentialChunk.length
      currentChunk = ''
      chunkIndex++
    }
    // Otherwise, keep accumulating
    else {
      currentChunk = potentialChunk
    }
  }

  // Don't forget the last chunk
  if (currentChunk && currentChunk.split(/\s+/).length >= MIN_CHUNK_SIZE) {
    chunks.push({
      content: currentChunk,
      chunkIndex,
      chunkType: detectChunkType(currentChunk),
      topics: extractTopics(currentChunk),
      startPosition: currentPosition,
      endPosition: currentPosition + currentChunk.length,
    })
  }

  return chunks
}

/**
 * Preview chunks (for testing/debugging)
 */
export function previewChunks(chunks: TextChunk[]): string {
  return chunks
    .map((chunk, i) => {
      return `
--- CHUNK ${i + 1} ---
Type: ${chunk.chunkType}
Topics: ${chunk.topics.join(', ')}
Words: ${chunk.content.split(/\s+/).length}
Preview: ${chunk.content.substring(0, 150)}...
`
    })
    .join('\n')
}
