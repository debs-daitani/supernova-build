import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { transcribeAudio, saveVoiceMemo, formatTranscriptionForChat } from '../../../../lib/voice-transcriber'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const userId = formData.get('userId') as string
    const conversationId = formData.get('conversationId') as string | null

    if (!audioFile || !userId) {
      return NextResponse.json(
        { error: 'Audio file and userId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${audioFile.type}. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = audioFile.name.split('.').pop() || 'webm'
    const filename = `voice-memo-${timestamp}-${randomString}.${extension}`

    // Save file to public/uploads/voice-memos
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice-memos')
    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    const audioUrl = `/uploads/voice-memos/${filename}`

    // Transcribe with Whisper
    const transcription = await transcribeAudio(filePath)

    if (!transcription) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      )
    }

    // Get duration (estimate based on file size if needed)
    // For now, we'll estimate: ~1MB per minute for compressed audio
    const estimatedDuration = Math.floor((audioFile.size / (1024 * 1024)) * 60)

    // Save to database
    const voiceMemoId = await saveVoiceMemo(
      userId,
      conversationId,
      filePath,
      audioUrl,
      transcription,
      estimatedDuration
    )

    // If this is part of a conversation, add it as a message
    if (conversationId) {
      await prisma.message.create({
        data: {
          conversationId,
          userId,
          role: 'user',
          content: formatTranscriptionForChat(transcription, estimatedDuration),
        },
      })

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      voiceMemoId,
      transcription,
      audioUrl,
      duration: estimatedDuration,
      message: 'Voice memo uploaded and transcribed successfully',
    })
  } catch (error) {
    console.error('Voice upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process voice memo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Enable larger payload size for audio uploads
export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
}
