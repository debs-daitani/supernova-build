import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/social/accounts - List connected accounts
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await prisma.socialAccount.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        profileImage: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
      }
    })

    // Check if any tokens are expired
    const accountsWithStatus = accounts.map(account => ({
      ...account,
      tokenExpired: account.expiresAt ? new Date(account.expiresAt) < new Date() : false,
    }))

    return NextResponse.json(accountsWithStatus)
  } catch (error) {
    console.error('Error fetching social accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

// POST /api/social/accounts - Manually add account (for demo/testing)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, accountId, accountName, accessToken, refreshToken, profileImage, expiresAt } = body

    if (!platform || !accountId || !accountName || !accessToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already exists
    const existing = await prisma.socialAccount.findFirst({
      where: {
        userId: auth.userId,
        platform,
        accountId
      }
    })

    if (existing) {
      // Update existing account
      const updated = await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accountName,
          accessToken,
          refreshToken,
          profileImage,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: true,
        }
      })
      return NextResponse.json(updated)
    }

    const account = await prisma.socialAccount.create({
      data: {
        userId: auth.userId,
        platform,
        accountId,
        accountName,
        accessToken,
        refreshToken,
        profileImage,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating social account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
