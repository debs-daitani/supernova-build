import { prisma } from './prisma'
import { generateEmbedding, cosineSimilarity } from './embedding-service'

export interface RetrievedChunk {
  id: string
  content: string
  sourceType: string
  keywords: string[]
  similarity: number
  sourceName: string
  pillar: string | null
}

/**
 * Semantic search across knowledge base
 * Returns most relevant chunks for a given query
 */
export async function searchKnowledge(
  query: string,
  pillar?: string,
  topN: number = 5,
  minSimilarity: number = 0.7
): Promise<RetrievedChunk[]> {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Fetch all chunks (with optional pillar filter)
    const chunks = await prisma.contentChunk.findMany({
      where: pillar ? { pillar } : undefined,
    })

    if (chunks.length === 0) {
      return []
    }

    // Calculate similarities
    const results = chunks
      .map((chunk) => {
        // Use the embedding array directly
        const embedding = chunk.embedding || []

        if (embedding.length === 0) {
          return null
        }

        const similarity = cosineSimilarity(queryEmbedding, embedding)

        return {
          id: chunk.id,
          content: chunk.content,
          sourceType: chunk.sourceType,
          keywords: chunk.keywords,
          similarity,
          sourceName: chunk.sourceName || 'Unknown',
          pillar: chunk.pillar,
        }
      })
      .filter((result): result is RetrievedChunk => result !== null && result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN)

    return results
  } catch (error) {
    console.error('Knowledge search error:', error)
    return []
  }
}

/**
 * Search by keywords (keyword-based fallback)
 */
export async function searchByKeywords(
  keywords: string[],
  pillar?: string,
  limit: number = 10
): Promise<RetrievedChunk[]> {
  try {
    const chunks = await prisma.contentChunk.findMany({
      where: {
        AND: [
          pillar ? { pillar } : {},
          {
            keywords: {
              hasSome: keywords,
            },
          },
        ],
      },
      take: limit,
    })

    return chunks.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      sourceType: chunk.sourceType,
      keywords: chunk.keywords,
      similarity: 0.8, // Estimate for keyword matches
      sourceName: chunk.sourceName || 'Unknown',
      pillar: chunk.pillar,
    }))
  } catch (error) {
    console.error('Keyword search error:', error)
    return []
  }
}

/**
 * Get chunks by source type
 */
export async function getChunksByType(
  sourceType: string,
  pillar?: string,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  try {
    const chunks = await prisma.contentChunk.findMany({
      where: {
        sourceType,
        ...(pillar ? { pillar } : {}),
      },
      take: limit,
    })

    return chunks.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      sourceType: chunk.sourceType,
      keywords: chunk.keywords,
      similarity: 0.75,
      sourceName: chunk.sourceName || 'Unknown',
      pillar: chunk.pillar,
    }))
  } catch (error) {
    console.error('Source type search error:', error)
    return []
  }
}

/**
 * Hybrid search: Combines semantic search with keyword matching
 */
export async function hybridSearch(
  query: string,
  pillar?: string,
  topN: number = 5
): Promise<RetrievedChunk[]> {
  // Extract potential keywords from query
  const queryLower = query.toLowerCase()
  const keywordMatches: string[] = []

  const keywordMap = {
    pricing: ['pricing', 'price', 'charge', 'money'],
    branding: ['brand', 'identity', 'positioning'],
    marketing: ['market', 'launch', 'sell', 'promote'],
    adhd: ['adhd', 'neurodiverge', 'focus', 'executive'],
    'body-image': ['body', 'weight', 'size', 'appearance'],
    authenticity: ['authentic', 'real', 'genuine'],
  }

  for (const [keyword, terms] of Object.entries(keywordMap)) {
    if (terms.some((term) => queryLower.includes(term))) {
      keywordMatches.push(keyword)
    }
  }

  // Get semantic results
  const semanticResults = await searchKnowledge(query, pillar, topN, 0.65)

  // If we have keyword matches, boost those results
  if (keywordMatches.length > 0) {
    const keywordResults = await searchByKeywords(keywordMatches, pillar, 3)

    // Merge and dedupe
    const combined = [...semanticResults, ...keywordResults]
    const seen = new Set<string>()
    const deduped = combined.filter((chunk) => {
      if (seen.has(chunk.id)) return false
      seen.add(chunk.id)
      return true
    })

    return deduped.slice(0, topN)
  }

  return semanticResults
}

/**
 * Format chunks for system prompt
 */
export function formatChunksForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return ''

  return chunks
    .map((chunk, i) => {
      return `
## CHUNK ${i + 1}: ${chunk.sourceType.toUpperCase()}
**From**: ${chunk.sourceName}
**Keywords**: ${chunk.keywords.join(', ')}
**Relevance**: ${(chunk.similarity * 100).toFixed(0)}%

${chunk.content}

---
`
    })
    .join('\n')
}
