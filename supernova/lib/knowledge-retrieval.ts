import { prisma } from './prisma'
import { generateEmbedding, cosineSimilarity } from './embedding-service'

export interface RetrievedChunk {
  id: string
  content: string
  chunkType: string
  topics: string[]
  similarity: number
  programTitle: string
  pillar: string
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
      include: {
        program: {
          select: {
            title: true,
            pillar: true,
          },
        },
      },
    })

    if (chunks.length === 0) {
      return []
    }

    // Calculate similarities
    const results = chunks
      .map((chunk) => {
        // Parse embedding from JSON
        const embedding = JSON.parse(chunk.embeddingJson || '[]') as number[]

        if (embedding.length === 0) {
          return null
        }

        const similarity = cosineSimilarity(queryEmbedding, embedding)

        return {
          id: chunk.id,
          content: chunk.content,
          chunkType: chunk.chunkType,
          topics: chunk.topics,
          similarity,
          programTitle: chunk.program.title,
          pillar: chunk.program.pillar,
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
 * Search by topics (keyword-based fallback)
 */
export async function searchByTopics(
  topics: string[],
  pillar?: string,
  limit: number = 10
): Promise<RetrievedChunk[]> {
  try {
    const chunks = await prisma.contentChunk.findMany({
      where: {
        AND: [
          pillar ? { pillar } : {},
          {
            topics: {
              hasSome: topics,
            },
          },
        ],
      },
      include: {
        program: {
          select: {
            title: true,
            pillar: true,
          },
        },
      },
      take: limit,
      orderBy: {
        chunkIndex: 'asc',
      },
    })

    return chunks.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      chunkType: chunk.chunkType,
      topics: chunk.topics,
      similarity: 0.8, // Estimate for topic matches
      programTitle: chunk.program.title,
      pillar: chunk.program.pillar,
    }))
  } catch (error) {
    console.error('Topic search error:', error)
    return []
  }
}

/**
 * Get chunks by chunk type (framework, exercise, example)
 */
export async function getChunksByType(
  chunkType: string,
  pillar?: string,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  try {
    const chunks = await prisma.contentChunk.findMany({
      where: {
        chunkType,
        ...(pillar ? { pillar } : {}),
      },
      include: {
        program: {
          select: {
            title: true,
            pillar: true,
          },
        },
      },
      take: limit,
    })

    return chunks.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      chunkType: chunk.chunkType,
      topics: chunk.topics,
      similarity: 0.75,
      programTitle: chunk.program.title,
      pillar: chunk.program.pillar,
    }))
  } catch (error) {
    console.error('Chunk type search error:', error)
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
  // Extract potential topics from query
  const queryLower = query.toLowerCase()
  const topicMatches: string[] = []

  const topicKeywords = {
    pricing: ['pricing', 'price', 'charge', 'money'],
    branding: ['brand', 'identity', 'positioning'],
    marketing: ['market', 'launch', 'sell', 'promote'],
    adhd: ['adhd', 'neurodiverge', 'focus', 'executive'],
    'body-image': ['body', 'weight', 'size', 'appearance'],
    authenticity: ['authentic', 'real', 'genuine'],
  }

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((kw) => queryLower.includes(kw))) {
      topicMatches.push(topic)
    }
  }

  // Get semantic results
  const semanticResults = await searchKnowledge(query, pillar, topN, 0.65)

  // If we have topic matches, boost those results
  if (topicMatches.length > 0) {
    const topicResults = await searchByTopics(topicMatches, pillar, 3)

    // Merge and dedupe
    const combined = [...semanticResults, ...topicResults]
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
## CHUNK ${i + 1}: ${chunk.chunkType.toUpperCase()}
**From**: ${chunk.programTitle}
**Topics**: ${chunk.topics.join(', ')}
**Relevance**: ${(chunk.similarity * 100).toFixed(0)}%

${chunk.content}

---
`
    })
    .join('\n')
}
