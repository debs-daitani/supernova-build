import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/social/accounts/[id] - Get single account
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const account = await prisma.socialAccount.findFirst({
      where: { id, userId: auth.userId },
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

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...account,
      tokenExpired: account.expiresAt ? new Date(account.expiresAt) < new Date() : false,
    })
  } catch (error) {
    console.error('Error fetching social account:', error)
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
  }
}

// PATCH /api/social/accounts/[id] - Update account
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Check ownership
    const existing = await prisma.socialAccount.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const account = await prisma.socialAccount.update({
      where: { id },
      data: {
        ...(body.accountName && { accountName: body.accountName }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.accessToken && { accessToken: body.accessToken }),
        ...(body.refreshToken && { refreshToken: body.refreshToken }),
        ...(body.expiresAt && { expiresAt: new Date(body.expiresAt) }),
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating social account:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

// DELETE /api/social/accounts/[id] - Disconnect account
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check ownership
    const existing = await prisma.socialAccount.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.socialAccount.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting social account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
