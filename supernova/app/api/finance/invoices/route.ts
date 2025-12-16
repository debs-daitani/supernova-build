import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/finance/invoices - List invoices
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { userId }

    if (status && status !== 'ALL') {
      where.status = status
    }

    const invoices = await prisma.financeInvoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
      },
    })

    // Calculate totals by status
    const totals = await prisma.financeInvoice.groupBy({
      by: ['status'],
      where: { userId },
      _sum: { total: true },
      _count: true,
    })

    return NextResponse.json({
      invoices,
      totals: totals.reduce((acc, t) => ({
        ...acc,
        [t.status]: { amount: t._sum.total || 0, count: t._count },
      }), {}),
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST /api/finance/invoices - Create invoice
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const { contactId, issueDate, dueDate, lineItems, notes, tax, status } = body

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)
    const taxAmount = tax ? (subtotal * tax / 100) : 0
    const total = subtotal + taxAmount

    // Generate invoice number
    const lastInvoice = await prisma.financeInvoice.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    })

    let nextNumber = 1
    if (lastInvoice?.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    const invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`

    const invoice = await prisma.financeInvoice.create({
      data: {
        userId,
        contactId: contactId || null,
        invoiceNumber,
        status: status || 'DRAFT',
        issueDate: new Date(issueDate || new Date()),
        dueDate: new Date(dueDate),
        subtotal,
        tax: taxAmount,
        total,
        notes,
        lineItems,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

// DELETE /api/finance/invoices - Bulk delete invoices
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const result = await prisma.financeInvoice.deleteMany({
      where: { id: { in: ids }, userId },
    })

    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Error deleting invoices:', error)
    return NextResponse.json({ error: 'Failed to delete invoices' }, { status: 500 })
  }
}
