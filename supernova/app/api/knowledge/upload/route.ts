import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '../../../../lib/prisma'
import { parseDocument } from '../../../../lib/document-processor'
import { chunkText } from '../../../../lib/text-chunker'
import { generateEmbeddings, estimateTokenCount, calculateEmbeddingCost } from '../../../../lib/embedding-service'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const pillar = formData.get('pillar') as string // BODY, BRAIN, BUSINESS, GENERAL
    const topicsStr = formData.get('topics') as string
    const level = formData.get('level') as string // beginner, intermediate, advanced

    if (!file || !title || !pillar) {
      return NextResponse.json(
        { error: 'File, title, and pillar are required' },
        { status: 400 }
      )
    }

    const topics = topicsStr ? topicsStr.split(',').map((t) => t.trim()) : []

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/markdown',
      'text/plain',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 }
      )
    }

    // Save file temporarily
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `knowledge-${timestamp}-${randomString}.${extension}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'knowledge')
    const filePath = path.join(uploadDir, filename)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Parse document
    console.log('Parsing document...')
    const parsed = await parseDocument(filePath)

    // Chunk text
    console.log('Chunking text...')
    const chunks = chunkText(parsed.text, { title })

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No content could be extracted from document' },
        { status: 400 }
      )
    }

    console.log(`Created ${chunks.length} chunks`)

    // Generate embeddings for all chunks
    console.log('Generating embeddings...')
    const chunkTexts = chunks.map((c) => c.content)
    const embeddings = await generateEmbeddings(chunkTexts)

    // Calculate cost
    const totalTokens = chunkTexts.reduce(
      (sum, text) => sum + estimateTokenCount(text),
      0
    )
    const cost = calculateEmbeddingCost(totalTokens)

    console.log(`Generated ${embeddings.length} embeddings (cost: $${cost.toFixed(4)})`)

    // Create KnowledgeProgram
    const program = await prisma.knowledgeProgram.create({
      data: {
        title,
        description: `Uploaded document: ${file.name}`,
        sourceFile: `/uploads/knowledge/${filename}`,
        pillar,
        topics,
        level: level || 'intermediate',
        totalChunks: chunks.length,
        wordCount: parsed.metadata.wordCount,
        metadata: {
          originalFilename: file.name,
          fileType: extension,
          uploadedAt: new Date().toISOString(),
          pages: parsed.metadata.pages,
        },
      },
    })

    // Create ContentChunks with embeddings
    const chunkRecords = chunks.map((chunk, index) => ({
      programId: program.id,
      content: chunk.content,
      chunkIndex: index,
      embeddingJson: JSON.stringify(embeddings[index]), // Store as JSON for now
      chunkType: chunk.chunkType,
      topics: chunk.topics,
      pillar,
    }))

    await prisma.contentChunk.createMany({
      data: chunkRecords,
    })

    console.log(`Created ${chunkRecords.length} content chunks`)

    return NextResponse.json({
      success: true,
      programId: program.id,
      chunksCreated: chunks.length,
      wordCount: parsed.metadata.wordCount,
      embeddingCost: cost,
      message: `Successfully processed "${title}" into ${chunks.length} chunks`,
    })
  } catch (error) {
    console.error('Knowledge upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process knowledge upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
