import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      encoding_format: 'float',
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 * OpenAI allows up to 2048 inputs per request
 */
export async function generateEmbeddings(
  texts: string[],
  batchSize: number = 100
): Promise<number[][]> {
  const embeddings: number[][] = []

  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
        encoding_format: 'float',
      })

      const batchEmbeddings = response.data.map((item) => item.embedding)
      embeddings.push(...batchEmbeddings)
    } catch (error) {
      console.error(`Error generating embeddings for batch ${i}:`, error)
      throw error
    }
  }

  return embeddings
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must be same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  if (magnitude === 0) return 0

  return dotProduct / magnitude
}

/**
 * Find top N most similar vectors using cosine similarity
 */
export function findTopSimilar(
  queryEmbedding: number[],
  candidateEmbeddings: Array<{ id: string; embedding: number[]; metadata?: any }>,
  topN: number = 10
): Array<{ id: string; similarity: number; metadata?: any }> {
  const similarities = candidateEmbeddings.map((candidate) => ({
    id: candidate.id,
    similarity: cosineSimilarity(queryEmbedding, candidate.embedding),
    metadata: candidate.metadata,
  }))

  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity)

  return similarities.slice(0, topN)
}

/**
 * Estimate token count (rough approximation)
 * 1 token ≈ 4 characters for English text
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Calculate embedding cost
 * text-embedding-3-small: $0.02 per 1M tokens
 */
export function calculateEmbeddingCost(tokenCount: number): number {
  const COST_PER_MILLION_TOKENS = 0.02
  return (tokenCount / 1_000_000) * COST_PER_MILLION_TOKENS
}
