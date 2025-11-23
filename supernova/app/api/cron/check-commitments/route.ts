import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getCommitmentsNeedingCheckIn, generateCheckInPrompt } from '../../../../lib/accountability-partner'

/**
 * Cron endpoint to check commitments
 * Run this hourly via Vercel Cron, AWS EventBridge, or similar
 *
 * For local testing: http://localhost:3001/api/cron/check-commitments
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    })

    const results = []

    for (const user of users) {
      // Get commitments needing check-in
      const needCheckIn = await getCommitmentsNeedingCheckIn(user.id)

      if (needCheckIn.length > 0) {
        // Create check-in prompt
        const checkInPrompt = generateCheckInPrompt(needCheckIn)

        // Create a system message in their most recent conversation
        // Or create a new conversation for check-ins
        const latestConversation = await prisma.conversation.findFirst({
          where: { userId: user.id },
          orderBy: { lastMessageAt: 'desc' },
        })

        if (latestConversation) {
          // Add check-in as a system message (you could also send email/SMS)
          await prisma.message.create({
            data: {
              conversationId: latestConversation.id,
              userId: user.id,
              role: 'assistant',
              content: `# 🔔 ACCOUNTABILITY CHECK-IN\n\n${checkInPrompt}`,
              modelUsed: 'system',
            },
          })

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: latestConversation.id },
            data: { lastMessageAt: new Date() },
          })

          results.push({
            userId: user.id,
            email: user.email,
            commitmentsChecked: needCheckIn.length,
            conversationId: latestConversation.id,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersProcessed: users.length,
      checkInsCreated: results.length,
      results,
    })
  } catch (error) {
    console.error('Check-in cron error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process check-ins',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req)
}
