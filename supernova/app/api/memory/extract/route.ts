/**
 * API endpoint for memory extraction
 * Can be called manually or triggered automatically after conversations
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  extractMemoriesFromConversation,
  storeExtractedMemories,
  generateConversationSummary,
} from '@/lib/memory-extractor'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, userId, pillar = 'GENERAL' } = body

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'conversationId and userId are required' },
        { status: 400 }
      )
    }

    // Extract memories
    const extracted = await extractMemoriesFromConversation(conversationId, userId)

    if (!extracted) {
      return NextResponse.json(
        { message: 'No memories extracted (not enough conversation data)' },
        { status: 200 }
      )
    }

    // Store memories
    await storeExtractedMemories(userId, conversationId, extracted)

    // Generate summary
    await generateConversationSummary(conversationId, userId, pillar)

    return NextResponse.json({
      message: 'Memories extracted and stored successfully',
      extracted: {
        factCount: extracted.facts.length,
        preferenceCount: extracted.preferences.length,
        goalCount: extracted.goals.length,
        contextCount: extracted.context.length,
        struggleCount: extracted.struggles.length,
        strengthCount: extracted.strengths.length,
        entityCount: extracted.entities.length,
        patternCount: extracted.patterns.length,
      },
    })
  } catch (error) {
    console.error('Memory extraction API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to extract memories',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
