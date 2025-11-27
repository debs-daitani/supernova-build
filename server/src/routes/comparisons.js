import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// PUBLIC ROUTES - Comparison Data
// ============================================

// Get all competitor tools
router.get('/tools', async (req, res) => {
  try {
    const { category } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;

    const tools = await prisma.competitorTool.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Calculate total monthly cost
    const totalMonthly = tools.reduce((sum, tool) => sum + tool.priceMonthly, 0);
    const daitaniverseCost = 26;
    const savings = totalMonthly - daitaniverseCost;

    res.json({
      tools,
      summary: {
        totalMonthly,
        daitaniverseCost,
        monthlySavings: savings,
        yearlySavings: savings * 12,
        percentageSaved: ((savings / totalMonthly) * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error fetching competitor tools:', error);
    res.status(500).json({ error: 'Failed to fetch competitor tools' });
  }
});

// Get tools by category
router.get('/tools/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const tools = await prisma.competitorTool.findMany({
      where: {
        category,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools by category:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Get feature comparison matrix
router.get('/features', async (req, res) => {
  try {
    const { category } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;

    const features = await prisma.featureComparison.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { feature: 'asc' }
      ]
    });

    res.json(features);
  } catch (error) {
    console.error('Error fetching feature comparisons:', error);
    res.status(500).json({ error: 'Failed to fetch feature comparisons' });
  }
});

// Get comparison data for specific competitor
router.get('/vs/:competitor', async (req, res) => {
  try {
    const { competitor } = req.params;

    // Get the competitor tool
    const tool = await prisma.competitorTool.findFirst({
      where: {
        name: {
          contains: competitor,
          mode: 'insensitive'
        },
        isActive: true
      }
    });

    if (!tool) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    // Get features where this competitor is mentioned
    const features = await prisma.featureComparison.findMany({
      where: {
        OR: [
          { competitor1: tool.name },
          { competitor2: tool.name },
          { competitor3: tool.name },
          { competitor4: tool.name }
        ],
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    res.json({
      competitor: tool,
      features,
      savings: {
        monthly: tool.priceMonthly - 26,
        yearly: (tool.priceMonthly - 26) * 12
      }
    });
  } catch (error) {
    console.error('Error fetching competitor comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

// Calculate ROI
router.post('/calculate-roi', optionalAuth, async (req, res) => {
  try {
    const {
      currentTools, // [{tool: "Wix", monthly: 30}, ...]
      email,
      name
    } = req.body;

    if (!currentTools || !Array.isArray(currentTools)) {
      return res.status(400).json({ error: 'Current tools array is required' });
    }

    // Calculate costs
    const currentCost = currentTools.reduce((sum, tool) => sum + (tool.monthly || 0), 0);
    const daitaniverseCost = 26;
    const monthlySavings = currentCost - daitaniverseCost;
    const yearlySavings = monthlySavings * 12;

    // Save calculation to database
    const calculation = await prisma.rOICalculation.create({
      data: {
        userId: req.user?.id,
        currentTools,
        currentCost,
        daitaniverseCost,
        monthlySavings,
        yearlySavings,
        email,
        name,
        referrer: req.headers.referer
      }
    });

    res.json({
      id: calculation.id,
      currentCost,
      daitaniverseCost,
      monthlySavings,
      yearlySavings,
      fiveYearSavings: yearlySavings * 5,
      percentageSaved: ((monthlySavings / currentCost) * 100).toFixed(1),
      toolsReplaced: currentTools.length
    });
  } catch (error) {
    console.error('Error calculating ROI:', error);
    res.status(500).json({ error: 'Failed to calculate ROI' });
  }
});

// Get ROI calculation by ID (for sharing)
router.get('/roi/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const calculation = await prisma.rOICalculation.findUnique({
      where: { id }
    });

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    res.json({
      currentCost: calculation.currentCost,
      daitaniverseCost: calculation.daitaniverseCost,
      monthlySavings: calculation.monthlySavings,
      yearlySavings: calculation.yearlySavings,
      fiveYearSavings: calculation.yearlySavings * 5,
      toolsReplaced: calculation.currentTools.length,
      calculatedAt: calculation.calculatedAt
    });
  } catch (error) {
    console.error('Error fetching ROI calculation:', error);
    res.status(500).json({ error: 'Failed to fetch calculation' });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.competitorTool.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true
    });

    res.json(categories.map(c => ({
      category: c.category,
      count: c._count
    })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ============================================
// ADMIN ROUTES - Manage Comparisons
// ============================================

// Get all tools (including inactive)
router.get('/admin/tools', authenticate, requireAdmin, async (req, res) => {
  try {
    const tools = await prisma.competitorTool.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(tools);
  } catch (error) {
    console.error('Error fetching admin tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Create competitor tool
router.post('/admin/tools', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      logo,
      website,
      priceMonthly,
      priceYearly,
      features,
      limitations,
      ourEquivalent,
      order
    } = req.body;

    if (!name || !category || !priceMonthly || !ourEquivalent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tool = await prisma.competitorTool.create({
      data: {
        name,
        category,
        logo,
        website,
        priceMonthly: parseFloat(priceMonthly),
        priceYearly: priceYearly ? parseFloat(priceYearly) : null,
        features,
        limitations: limitations || [],
        ourEquivalent,
        order: order || 0
      }
    });

    res.json(tool);
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ error: 'Failed to create tool' });
  }
});

// Update competitor tool
router.patch('/admin/tools/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert prices to floats if present
    if (updateData.priceMonthly) {
      updateData.priceMonthly = parseFloat(updateData.priceMonthly);
    }
    if (updateData.priceYearly) {
      updateData.priceYearly = parseFloat(updateData.priceYearly);
    }

    const tool = await prisma.competitorTool.update({
      where: { id },
      data: updateData
    });

    res.json(tool);
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(500).json({ error: 'Failed to update tool' });
  }
});

// Delete competitor tool
router.delete('/admin/tools/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.competitorTool.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({ error: 'Failed to delete tool' });
  }
});

// Get all features (including inactive)
router.get('/admin/features', authenticate, requireAdmin, async (req, res) => {
  try {
    const features = await prisma.featureComparison.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { feature: 'asc' }
      ]
    });

    res.json(features);
  } catch (error) {
    console.error('Error fetching admin features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

// Create feature comparison
router.post('/admin/features', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      feature,
      category,
      competitor1,
      competitor1Has,
      competitor2,
      competitor2Has,
      competitor3,
      competitor3Has,
      competitor4,
      competitor4Has,
      ourImplementation,
      notes,
      order,
      highlighted
    } = req.body;

    if (!feature) {
      return res.status(400).json({ error: 'Feature name is required' });
    }

    const featureComparison = await prisma.featureComparison.create({
      data: {
        feature,
        category,
        competitor1,
        competitor1Has,
        competitor2,
        competitor2Has,
        competitor3,
        competitor3Has,
        competitor4,
        competitor4Has,
        ourImplementation,
        notes,
        order: order || 0,
        highlighted: highlighted || false
      }
    });

    res.json(featureComparison);
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

// Update feature comparison
router.patch('/admin/features/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const feature = await prisma.featureComparison.update({
      where: { id },
      data: req.body
    });

    res.json(feature);
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

// Delete feature comparison
router.delete('/admin/features/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.featureComparison.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
});

// Get ROI calculations (analytics)
router.get('/admin/roi-calculations', authenticate, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const calculations = await prisma.rOICalculation.findMany({
      orderBy: { calculatedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.rOICalculation.count();

    // Calculate aggregate stats
    const stats = await prisma.rOICalculation.aggregate({
      _avg: {
        monthlySavings: true,
        yearlySavings: true
      },
      _sum: {
        monthlySavings: true,
        yearlySavings: true
      },
      _count: true
    });

    res.json({
      calculations,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      stats: {
        totalCalculations: stats._count,
        avgMonthlySavings: stats._avg.monthlySavings,
        avgYearlySavings: stats._avg.yearlySavings,
        totalPotentialSavings: stats._sum.yearlySavings
      }
    });
  } catch (error) {
    console.error('Error fetching ROI calculations:', error);
    res.status(500).json({ error: 'Failed to fetch calculations' });
  }
});

export default router;
