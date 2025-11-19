import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// INVOICES
// ============================================

// Get all invoices
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    const where = { userId: req.user.id };

    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        contact: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/invoices', authMiddleware, async (req, res) => {
  try {
    // Generate invoice number if not provided
    let invoiceNumber = req.body.invoiceNumber;

    if (!invoiceNumber) {
      const lastInvoice = await prisma.invoice.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      const year = new Date().getFullYear();
      const lastNum = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) || 0 : 0;
      invoiceNumber = `INV-${year}-${String(lastNum + 1).padStart(4, '0')}`;
    }

    const invoice = await prisma.invoice.create({
      data: {
        ...req.body,
        invoiceNumber,
        userId: req.user.id
      },
      include: {
        contact: true
      }
    });

    // Log activity if contact linked
    if (invoice.contactId) {
      await prisma.activity.create({
        data: {
          userId: req.user.id,
          contactId: invoice.contactId,
          type: 'invoice_created',
          title: 'Invoice sent',
          description: `Invoice ${invoice.invoiceNumber} for £${invoice.total} sent`
        }
      });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message || 'Failed to create invoice' });
  }
});

// Update invoice
router.patch('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body,
      include: { contact: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Mark invoice as paid
router.post('/invoices/:id/paid', authMiddleware, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: req.body.paymentMethod || null
      },
      include: { contact: true }
    });

    // Auto-create income entry
    await prisma.incomeEntry.create({
      data: {
        userId: req.user.id,
        description: `Payment for invoice ${invoice.invoiceNumber}`,
        amount: invoice.total,
        currency: invoice.currency,
        category: 'service',
        invoiceId: invoice.id,
        source: updated.contact?.company || updated.contact?.firstName || 'Unknown',
        date: new Date()
      }
    });

    // Log activity
    if (invoice.contactId) {
      await prisma.activity.create({
        data: {
          userId: req.user.id,
          contactId: invoice.contactId,
          type: 'invoice_paid',
          title: 'Invoice paid',
          description: `Invoice ${invoice.invoiceNumber} marked as paid`
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
});

// Delete invoice
router.delete('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await prisma.invoice.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// ============================================
// EXPENSES
// ============================================

// Get all expenses
router.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const { category, from, to } = req.query;

    const where = { userId: req.user.id };

    if (category) {
      where.category = category;
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
router.post('/expenses', authMiddleware, async (req, res) => {
  try {
    const expense = await prisma.expense.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });

    res.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.patch('/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updated = await prisma.expense.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// ============================================
// INCOME
// ============================================

// Get all income entries
router.get('/income', authMiddleware, async (req, res) => {
  try {
    const { category, from, to } = req.query;

    const where = { userId: req.user.id };

    if (category) {
      where.category = category;
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const income = await prisma.incomeEntry.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

// Create income entry
router.post('/income', authMiddleware, async (req, res) => {
  try {
    const income = await prisma.incomeEntry.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });

    res.json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Failed to create income' });
  }
});

// Delete income entry
router.delete('/income/:id', authMiddleware, async (req, res) => {
  try {
    const income = await prisma.incomeEntry.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!income) {
      return res.status(404).json({ error: 'Income entry not found' });
    }

    await prisma.incomeEntry.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Income entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

// ============================================
// REPORTS
// ============================================

// Profit & Loss Report
router.get('/reports/profit-loss', authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;

    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    // Get income
    const income = await prisma.incomeEntry.findMany({
      where: {
        userId: req.user.id,
        ...(from || to ? { date: dateFilter } : {})
      }
    });

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        ...(from || to ? { date: dateFilter } : {})
      }
    });

    // Calculate totals
    const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Group by category
    const incomeByCategory = income.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {});

    const expensesByCategory = expenses.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {});

    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      incomeByCategory,
      expensesByCategory,
      profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Error generating P&L report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Tax Report (UK-specific)
router.get('/reports/tax', authMiddleware, async (req, res) => {
  try {
    const { year } = req.query;
    const taxYear = year ? parseInt(year) : new Date().getFullYear();

    // UK tax year: April 6 to April 5
    const taxYearStart = new Date(taxYear, 3, 6); // April 6
    const taxYearEnd = new Date(taxYear + 1, 3, 5); // April 5 next year

    // Get income
    const income = await prisma.incomeEntry.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: taxYearStart,
          lte: taxYearEnd
        }
      }
    });

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        taxDeductible: true,
        date: {
          gte: taxYearStart,
          lte: taxYearEnd
        }
      }
    });

    const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);
    const deductibleExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);

    // UK Tax Calculation (2024/25)
    const personalAllowance = 12570;
    const basicRateLimit = 50270;
    const higherRateLimit = 125140;

    let incomeTax = 0;

    if (taxableIncome > personalAllowance) {
      const taxableAboveAllowance = taxableIncome - personalAllowance;

      // Basic rate: 20% (£12,571 to £50,270)
      const basicRateTaxable = Math.min(taxableAboveAllowance, basicRateLimit - personalAllowance);
      incomeTax += basicRateTaxable * 0.20;

      // Higher rate: 40% (£50,271 to £125,140)
      if (taxableIncome > basicRateLimit) {
        const higherRateTaxable = Math.min(taxableAboveAllowance - (basicRateLimit - personalAllowance), higherRateLimit - basicRateLimit);
        incomeTax += higherRateTaxable * 0.40;
      }

      // Additional rate: 45% (above £125,140)
      if (taxableIncome > higherRateLimit) {
        const additionalRateTaxable = taxableIncome - higherRateLimit;
        incomeTax += additionalRateTaxable * 0.45;
      }
    }

    // National Insurance (Class 4 - self-employed)
    const niLowerLimit = 12570;
    const niUpperLimit = 50270;

    let nationalInsurance = 0;

    if (taxableIncome > niLowerLimit) {
      const niableAboveLower = taxableIncome - niLowerLimit;
      const niable9Percent = Math.min(niableAboveLower, niUpperLimit - niLowerLimit);
      nationalInsurance += niable9Percent * 0.09;

      if (taxableIncome > niUpperLimit) {
        const niable2Percent = taxableIncome - niUpperLimit;
        nationalInsurance += niable2Percent * 0.02;
      }
    }

    // VAT
    const totalVAT = expenses.reduce((sum, entry) => sum + (entry.vatAmount || 0), 0);

    const totalTax = incomeTax + nationalInsurance;
    const takeHomePay = taxableIncome - totalTax;

    res.json({
      taxYear,
      totalIncome,
      deductibleExpenses,
      taxableIncome,
      incomeTax,
      nationalInsurance,
      totalTax,
      takeHomePay,
      effectiveTaxRate: taxableIncome > 0 ? ((totalTax / taxableIncome) * 100).toFixed(2) : 0,
      vatPaid: totalVAT
    });
  } catch (error) {
    console.error('Error generating tax report:', error);
    res.status(500).json({ error: 'Failed to generate tax report' });
  }
});

// Dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // This month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get income this month
    const incomeThisMonth = await prisma.incomeEntry.findMany({
      where: {
        userId,
        date: { gte: monthStart }
      }
    });

    const totalIncomeThisMonth = incomeThisMonth.reduce((sum, entry) => sum + entry.amount, 0);

    // Get expenses this month
    const expensesThisMonth = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: monthStart }
      }
    });

    const totalExpensesThisMonth = expensesThisMonth.reduce((sum, entry) => sum + entry.amount, 0);

    const netProfitThisMonth = totalIncomeThisMonth - totalExpensesThisMonth;

    // Outstanding invoices
    const outstandingInvoices = await prisma.invoice.count({
      where: {
        userId,
        status: 'unpaid'
      }
    });

    const outstandingAmount = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'unpaid'
      }
    });

    const totalOutstanding = outstandingAmount.reduce((sum, inv) => sum + inv.total, 0);

    // Tax estimate (simple)
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const incomeYTD = await prisma.incomeEntry.findMany({
      where: {
        userId,
        date: { gte: yearStart }
      }
    });

    const expensesYTD = await prisma.expense.findMany({
      where: {
        userId,
        taxDeductible: true,
        date: { gte: yearStart }
      }
    });

    const totalIncomeYTD = incomeYTD.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpensesYTD = expensesYTD.reduce((sum, entry) => sum + entry.amount, 0);
    const taxableIncome = Math.max(0, totalIncomeYTD - totalExpensesYTD - 12570); // Personal allowance
    const estimatedTax = taxableIncome * 0.20; // Basic rate estimate

    res.json({
      totalIncomeThisMonth,
      totalExpensesThisMonth,
      netProfitThisMonth,
      outstandingInvoices,
      totalOutstanding,
      estimatedTaxOwed: estimatedTax
    });
  } catch (error) {
    console.error('Error fetching accounting stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
