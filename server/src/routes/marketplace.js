import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireMember } from '../middleware/auth.js';
import { validateListing } from '../utils/validators.js';
import stripe from '../config/stripe.js';
import { sendMarketplaceSaleBuyer, sendMarketplaceSaleSeller } from '../services/emailService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/marketplace - Browse listings
router.get('/', async (req, res) => {
  try {
    const { search, niche, status = 'ACTIVE', limit = 20, offset = 0 } = req.query;

    const where = { status };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (niche) {
      where.niche = { contains: niche, mode: 'insensitive' };
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    res.json({ listings, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// POST /api/marketplace - Create listing
router.post('/', requireMember, validateListing, async (req, res) => {
  try {
    const {
      title,
      description,
      niche,
      price,
      includedItems,
      progressLevel,
      needsHelp,
      images,
      status = 'DRAFT',
    } = req.body;

    const listing = await prisma.marketplaceListing.create({
      data: {
        userId: req.user.id,
        title,
        description,
        niche,
        price: parseInt(price),
        includedItems: includedItems || [],
        progressLevel: parseInt(progressLevel) || 50,
        needsHelp,
        images: images || [],
        status,
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// GET /api/marketplace/:id - Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment view count
    await prisma.marketplaceListing.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// PATCH /api/marketplace/:id - Update listing
router.patch('/:id', async (req, res) => {
  try {
    // Verify ownership
    const listing = await prisma.marketplaceListing.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or access denied' });
    }

    const updated = await prisma.marketplaceListing.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/marketplace/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.marketplaceListing.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// POST /api/marketplace/:id/purchase - Purchase listing
router.post('/:id/purchase', async (req, res) => {
  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Listing not available' });
    }

    if (listing.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot purchase your own listing' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: listing.price,
      currency: 'gbp',
      metadata: {
        listingId: listing.id,
        buyerId: req.user.id,
        sellerId: listing.userId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: listing.price,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// POST /api/marketplace/:id/messages - Send message to seller
router.post('/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const message = await prisma.marketplaceMessage.create({
      data: {
        listingId: req.params.id,
        senderId: req.user.id,
        sellerId: listing.userId,
        content,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/marketplace/:id/messages - Get messages for listing
router.get('/:id/messages', async (req, res) => {
  try {
    const listing = await prisma.marketplaceListing.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { messages: { some: { senderId: req.user.id } } },
        ],
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Access denied' });
    }

    const messages = await prisma.marketplaceMessage.findMany({
      where: { listingId: req.params.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/marketplace/my/listings - Get user's listings
router.get('/my/listings', async (req, res) => {
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

export default router;
