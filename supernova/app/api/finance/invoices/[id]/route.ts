import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/finance/invoices/[id] - Get invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = await prisma.financeInvoice.findUnique({
      where: { id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true, phone: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

// PATCH /api/finance/invoices/[id] - Update invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contactId, issueDate, dueDate, lineItems, notes, tax, status } = body

    // Calculate totals if lineItems provided
    let updateData: any = {}

    if (lineItems && Array.isArray(lineItems)) {
      const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)
      const taxAmount = tax !== undefined ? (subtotal * tax / 100) : undefined
      const total = taxAmount !== undefined ? subtotal + taxAmount : undefined

      updateData = {
        ...updateData,
        lineItems,
        subtotal,
        ...(taxAmount !== undefined && { tax: taxAmount }),
        ...(total !== undefined && { total }),
      }
    }

    if (contactId !== undefined) updateData.contactId = contactId || null
    if (issueDate) updateData.issueDate = new Date(issueDate)
    if (dueDate) updateData.dueDate = new Date(dueDate)
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status

    const invoice = await prisma.financeInvoice.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// DELETE /api/finance/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.financeInvoice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
