import OpenAI from 'openai'
import { prisma } from './prisma'
import { extractMemoriesFromConversation, storeExtractedMemories } from './memory-extractor'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

/**
 * Transcribe audio file using OpenAI Whisper
 */
export async function transcribeAudio(
  audioFilePath: string
): Promise<string> {
  try {
    const audioFile = fs.createReadStream(audioFilePath)

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Can be auto-detected, but explicit is faster
      response_format: 'verbose_json', // Get detailed info including duration
    })

    return transcription.text
  } catch (error) {
    console.error('Whisper transcription error:', error)
    throw error
  }
}

/**
 * Get audio duration in seconds
 */
export async function getAudioDuration(audioFilePath: string): Promise<number> {
  try {
    const audioFile = fs.createReadStream(audioFilePath)

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    // @ts-ignore - verbose_json includes duration
    return Math.floor(transcription.duration || 0)
  } catch (error) {
    console.error('Error getting audio duration:', error)
    return 0
  }
}

/**
 * Save voice memo to database and extract memories
 */
export async function saveVoiceMemo(
  userId: string,
  conversationId: string | null,
  audioFilePath: string,
  audioUrl: string,
  transcription: string,
  duration: number
): Promise<string> {
  // Create voice memo record
  const voiceMemo = await prisma.voiceMemo.create({
    data: {
      userId,
      conversationId,
      audioUrl,
      duration,
      transcription,
      extractedMemories: [],
    },
  })

  // Extract memories from transcription in background
  // We treat the transcription as a user message for memory extraction
  if (conversationId) {
    extractMemoriesFromVoiceMemo(voiceMemo.id, userId, conversationId, transcription)
      .catch((error) => {
        console.error('Failed to extract memories from voice memo:', error)
      })
  }

  return voiceMemo.id
}

/**
 * Extract memories specifically from voice memo transcription
 */
async function extractMemoriesFromVoiceMemo(
  voiceMemoId: string,
  userId: string,
  conversationId: string,
  transcription: string
): Promise<void> {
  // Use the same extraction logic but with voice memo context
  const extraction = await extractMemoriesFromConversation(conversationId, userId)

  if (extraction) {
    await storeExtractedMemories(userId, conversationId, extraction)

    // Link extracted memory IDs to voice memo
    const memories = await prisma.userMemory.findMany({
      where: {
        userId,
        sourceConversationId: conversationId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Get recent memories that were likely from this memo
    })

    await prisma.voiceMemo.update({
      where: { id: voiceMemoId },
      data: {
        extractedMemories: memories.map((m) => m.id),
      },
    })
  }
}

/**
 * Get voice memos for a user
 */
export async function getUserVoiceMemos(
  userId: string,
  limit: number = 20
) {
  return await prisma.voiceMemo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Format transcription for chat display
 */
export function formatTranscriptionForChat(
  transcription: string,
  duration: number
): string {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return `
🎤 **Voice Memo (${minutes}:${seconds.toString().padStart(2, '0')})**

"${transcription}"

---
*Transcribed and ready to process. I've captured this for your memory bank.*
`
}

/**
 * Clean up old audio files (optional maintenance function)
 */
export async function cleanupOldAudioFiles(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const oldMemos = await prisma.voiceMemo.findMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })

  let deletedCount = 0

  for (const memo of oldMemos) {
    try {
      // Delete file from disk if it's a local path
      if (memo.audioUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', memo.audioUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          deletedCount++
        }
      }
    } catch (error) {
      console.error(`Failed to delete audio file: ${memo.audioUrl}`, error)
    }
  }

  return deletedCount
}
