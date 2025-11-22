import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// PRODUCTS
// ============================================

// Get all products for shop owner
router.get('/products', authenticate, async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const where = { userId: req.user.id };

    if (status === 'published') where.published = true;
    if (status === 'draft') where.published = false;
    if (type) where.productType = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variations: true,
        _count: { select: { reviews: true, orderItems: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/products/:id', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        variations: true,
        reviews: { where: { approved: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/products', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      productType,
      price,
      compareAtPrice,
      currency,
      sku,
      trackInventory,
      inventoryCount,
      lowStockAlert,
      downloadUrl,
      downloadLimit,
      subscriptionInterval,
      hasVariations,
      variations,
      images,
      seoTitle,
      seoDescription,
      published,
      featured,
      requiresShipping,
      weight,
      category,
      tags
    } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        userId: req.user.id,
        name,
        slug,
        description,
        productType,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        currency: currency || 'GBP',
        sku,
        trackInventory: trackInventory || false,
        inventoryCount: trackInventory ? parseInt(inventoryCount) : null,
        lowStockAlert: trackInventory && lowStockAlert ? parseInt(lowStockAlert) : null,
        downloadUrl: productType === 'digital' ? downloadUrl : null,
        downloadLimit: productType === 'digital' && downloadLimit ? parseInt(downloadLimit) : null,
        subscriptionInterval: productType === 'subscription' ? subscriptionInterval : null,
        hasVariations: hasVariations || false,
        images: images || [],
        seoTitle,
        seoDescription,
        published: published || false,
        featured: featured || false,
        requiresShipping: productType === 'physical' ? (requiresShipping || true) : false,
        weight: productType === 'physical' && weight ? parseFloat(weight) : null,
        category,
        tags: tags || [],
        variations: hasVariations && variations ? {
          create: variations.map(v => ({
            name: v.name,
            options: v.options,
            price: v.price ? parseFloat(v.price) : null,
            sku: v.sku,
            inventoryCount: v.inventoryCount ? parseInt(v.inventoryCount) : null,
            image: v.image
          }))
        } : undefined
      },
      include: { variations: true }
    });

    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.patch('/products/:id', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : undefined
      },
      include: { variations: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Publish/unpublish product
router.patch('/products/:id/publish', authenticate, async (req, res) => {
  try {
    const { published } = req.body;

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { published }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// ============================================
// ORDERS
// ============================================

// Get all orders
router.get('/orders', authenticate, async (req, res) => {
  try {
    const { paymentStatus, fulfillmentStatus, search } = req.query;
    const where = { userId: req.user.id };

    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/orders/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Mark order as fulfilled
router.patch('/orders/:id/fulfill', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        fulfillmentStatus: 'fulfilled'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error fulfilling order:', error);
    res.status(500).json({ error: 'Failed to fulfill order' });
  }
});

// Add tracking and mark as shipped
router.patch('/orders/:id/ship', authenticate, async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        fulfillmentStatus: 'shipped',
        trackingNumber,
        shippedAt: new Date()
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error shipping order:', error);
    res.status(500).json({ error: 'Failed to ship order' });
  }
});

// Update internal notes
router.patch('/orders/:id/notes', authenticate, async (req, res) => {
  try {
    const { internalNotes } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { internalNotes }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});

// ============================================
// DISCOUNT CODES
// ============================================

// Get all discount codes
router.get('/discounts', authenticate, async (req, res) => {
  try {
    const { active } = req.query;
    const where = { userId: req.user.id };

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const discounts = await prisma.discountCode.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
});

// Create discount code
router.post('/discounts', authenticate, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxUses,
      startDate,
      endDate,
      active
    } = req.body;

    const discount = await prisma.discountCode.create({
      data: {
        userId: req.user.id,
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        active: active !== undefined ? active : true
      }
    });

    res.json(discount);
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ error: 'Failed to create discount' });
  }
});

// Update discount code
router.patch('/discounts/:id', authenticate, async (req, res) => {
  try {
    const discount = await prisma.discountCode.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    const updated = await prisma.discountCode.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({ error: 'Failed to update discount' });
  }
});

// Delete discount code
router.delete('/discounts/:id', authenticate, async (req, res) => {
  try {
    const discount = await prisma.discountCode.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    await prisma.discountCode.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Discount deleted' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

// ============================================
// REVIEWS
// ============================================

// Get all reviews for shop owner's products
router.get('/reviews', authenticate, async (req, res) => {
  try {
    const { approved, productId } = req.query;
    const where = {
      product: {
        userId: req.user.id
      }
    };

    if (approved !== undefined) {
      where.approved = approved === 'true';
    }
    if (productId) {
      where.productId = productId;
    }

    const reviews = await prisma.productReview.findMany({
      where,
      include: {
        product: { select: { name: true, id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Approve review
router.patch('/reviews/:id/approve', authenticate, async (req, res) => {
  try {
    const review = await prisma.productReview.findFirst({
      where: {
        id: req.params.id,
        product: { userId: req.user.id }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updated = await prisma.productReview.update({
      where: { id: req.params.id },
      data: { approved: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// Delete review
router.delete('/reviews/:id', authenticate, async (req, res) => {
  try {
    const review = await prisma.productReview.findFirst({
      where: {
        id: req.params.id,
        product: { userId: req.user.id }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.productReview.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ============================================
// SHOP STATS
// ============================================

// Get shop statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Total products
    const totalProducts = await prisma.product.count({
      where: { userId: req.user.id }
    });

    const publishedProducts = await prisma.product.count({
      where: { userId: req.user.id, published: true }
    });

    // Total orders
    const totalOrders = await prisma.order.count({
      where: { userId: req.user.id }
    });

    // Orders this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const ordersThisMonth = await prisma.order.count({
      where: {
        userId: req.user.id,
        createdAt: { gte: startOfMonth },
        paymentStatus: 'paid'
      }
    });

    // Total revenue
    const allOrders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        paymentStatus: 'paid'
      },
      select: { total: true }
    });

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);

    // Revenue this month
    const ordersThisMonthData = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        paymentStatus: 'paid',
        createdAt: { gte: startOfMonth }
      },
      select: { total: true }
    });

    const revenueThisMonth = ordersThisMonthData.reduce((sum, order) => sum + order.total, 0);

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        userId: req.user.id,
        paymentStatus: 'pending'
      }
    });

    // Unfulfilled orders
    const unfulfilledOrders = await prisma.order.count({
      where: {
        userId: req.user.id,
        paymentStatus: 'paid',
        fulfillmentStatus: { in: ['unfulfilled', 'processing'] }
      }
    });

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        userId: req.user.id,
        trackInventory: true,
        published: true,
        inventoryCount: { lte: prisma.product.fields.lowStockAlert }
      }
    });

    res.json({
      totalProducts,
      publishedProducts,
      totalOrders,
      ordersThisMonth,
      totalRevenue,
      revenueThisMonth,
      averageOrderValue,
      pendingOrders,
      unfulfilledOrders,
      lowStockCount: lowStockProducts.length
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
