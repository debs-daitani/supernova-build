import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/stripe/invoices/[id]
 * Get invoice details with download link
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: params.id,
        userId: auth.userId,
      },
      include: {
        subscription: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get latest details from Stripe
    const stripeInvoice = await stripe.invoices.retrieve(
      invoice.stripeInvoiceId
    );

    return NextResponse.json({
      invoice,
      stripeDetails: {
        hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
        invoicePdf: stripeInvoice.invoice_pdf,
        status: stripeInvoice.status,
        amountDue: stripeInvoice.amount_due,
        amountPaid: stripeInvoice.amount_paid,
        currency: stripeInvoice.currency,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/stripe/invoices/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice' },
      { status: 500 }
    );
  }
}
