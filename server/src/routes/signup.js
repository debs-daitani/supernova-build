/**
 * Phase 2BF: Signup Flow
 * Backend API - Signup flow management
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
// import Stripe from 'stripe'; // Uncomment when Stripe is configured
// import { sendEmail } from '../utils/email.js'; // Uncomment when email service is ready

const router = express.Router();
const prisma = new PrismaClient();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Uncomment when configured

// ============================================
// SIGNUP SESSION MANAGEMENT
// ============================================

/**
 * Start new signup session
 * POST /api/signup/start
 */
router.post('/start', async (req, res) => {
  try {
    const {
      sessionId,
      visitorId,
      utmSource,
      utmMedium,
      utmCampaign,
      landingPage
    } = req.body;

    // Check if session already exists
    let session = await prisma.signupFlowSession.findUnique({
      where: { sessionId }
    });

    if (session) {
      return res.json({ session });
    }

    // Create new session
    session = await prisma.signupFlowSession.create({
      data: {
        sessionId,
        visitorId,
        utmSource,
        utmMedium,
        utmCampaign,
        landingPage,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({ session });
  } catch (error) {
    console.error('Start signup session error:', error);
    res.status(500).json({ error: 'Failed to start signup session' });
  }
});

/**
 * Update signup session progress
 * PATCH /api/signup/session/:sessionId
 */
router.patch('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updateData = { ...req.body };

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update last active timestamp
    updateData.lastActiveAt = new Date();

    const session = await prisma.signupFlowSession.update({
      where: { sessionId },
      data: updateData
    });

    res.json({ session });
  } catch (error) {
    console.error('Update signup session error:', error);
    res.status(500).json({ error: 'Failed to update signup session' });
  }
});

/**
 * Get signup session
 * GET /api/signup/session/:sessionId
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.signupFlowSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get signup session error:', error);
    res.status(500).json({ error: 'Failed to get signup session' });
  }
});

// ============================================
// COMPLETE SIGNUP
// ============================================

/**
 * Complete signup flow (create user account)
 * POST /api/signup/complete
 */
router.post('/complete', async (req, res) => {
  try {
    const {
      sessionId,
      email,
      firstName,
      lastName,
      password,
      primaryGoal,
      industry,
      referralSource,
      planType, // 'trial' or 'pro'
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Calculate trial dates for trial users
    const now = new Date();
    const trialStartDate = planType === 'trial' ? now : null;
    const trialEndDate = planType === 'trial'
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      : null;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: `${firstName} ${lastName}`,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,

        // Plan details
        planType: planType || 'trial',
        planStatus: 'active',
        trialStartDate,
        trialEndDate,

        // Onboarding data
        signupGoal: primaryGoal,
        signupIndustry: industry,
        referralSource: referralSource || utmSource || 'direct',

        // Create onboarding progress
        onboardingProgress: {
          create: {
            currentStep: 1,
            completedSteps: [],
            totalSteps: 5
          }
        }
      },
      include: {
        onboardingProgress: true
      }
    });

    // Update signup session
    if (sessionId) {
      await prisma.signupFlowSession.update({
        where: { sessionId },
        data: {
          userId: user.id,
          isCompleted: true,
          convertedAt: new Date()
        }
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail signup if email fails
    }

    // Send welcome email (after verification)
    // Will be sent by verification endpoint

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
        trialEndDate: user.trialEndDate
      },
      token
    });
  } catch (error) {
    console.error('Complete signup error:', error);
    res.status(500).json({ error: 'Failed to complete signup' });
  }
});

// ============================================
// PAYMENT (FOR PAID PLANS)
// ============================================

/**
 * Process payment and create subscription
 * POST /api/signup/step-5-payment
 */
router.post('/step-5-payment', async (req, res) => {
  try {
    const {
      sessionId,
      email,
      firstName,
      lastName,
      password,
      primaryGoal,
      industry,
      referralSource,
      planType,
      paymentMethod
    } = req.body;

    // TODO: Integrate with Stripe
    // For now, create user without Stripe

    // Create user first (similar to complete signup)
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: `${firstName} ${lastName}`,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,

        planType: planType || 'pro',
        planStatus: 'active',
        trialStartDate: null, // No trial for paid
        trialEndDate: null,

        signupGoal: primaryGoal,
        signupIndustry: industry,
        referralSource,

        onboardingProgress: {
          create: {
            currentStep: 1,
            completedSteps: [],
            totalSteps: 5
          }
        }
      }
    });

    // TODO: Create Stripe customer and subscription
    /*
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      payment_method: paymentMethod.id,
      invoice_settings: {
        default_payment_method: paymentMethod.id
      }
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID_PRO }],
      expand: ['latest_invoice.payment_intent']
    });

    // Update user with Stripe IDs
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id
      }
    });
    */

    // Update signup session
    if (sessionId) {
      await prisma.signupFlowSession.update({
        where: { sessionId },
        data: {
          userId: user.id,
          isCompleted: true,
          convertedAt: new Date()
        }
      });
    }

    // Send emails
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType
      },
      token
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// ============================================
// EMAIL VERIFICATION
// ============================================

/**
 * Verify email with token
 * POST /api/signup/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name, user.planType, user.trialEndDate);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

/**
 * Resend verification email
 * POST /api/signup/resend-verification
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry
      }
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// ============================================
// TRIAL MANAGEMENT
// ============================================

/**
 * Get trial status
 * GET /api/signup/trial-status
 */
router.get('/trial-status', async (req, res) => {
  try {
    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const isTrialActive = user.planType === 'trial' &&
      user.trialEndDate &&
      user.trialEndDate > now;

    const daysLeft = user.trialEndDate
      ? Math.ceil((user.trialEndDate - now) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      planType: user.planType,
      planStatus: user.planStatus,
      trialStartDate: user.trialStartDate,
      trialEndDate: user.trialEndDate,
      isTrialActive,
      daysLeft
    });
  } catch (error) {
    console.error('Get trial status error:', error);
    res.status(500).json({ error: 'Failed to get trial status' });
  }
});

/**
 * Upgrade from trial to paid
 * POST /api/signup/upgrade-trial
 */
router.post('/upgrade-trial', async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.planType !== 'trial') {
      return res.status(400).json({ error: 'User is not on trial' });
    }

    // TODO: Create Stripe subscription
    /*
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      payment_method: paymentMethod.id,
      invoice_settings: {
        default_payment_method: paymentMethod.id
      }
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID_PRO }]
    });
    */

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType: 'pro',
        planStatus: 'active',
        trialStartDate: null,
        trialEndDate: null
        // stripeCustomerId: customer.id,
        // stripeSubscriptionId: subscription.id
      }
    });

    // Send upgrade confirmation email
    try {
      await sendUpgradeConfirmationEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send upgrade email:', emailError);
    }

    res.json({ message: 'Successfully upgraded to Pro' });
  } catch (error) {
    console.error('Upgrade trial error:', error);
    res.status(500).json({ error: 'Failed to upgrade trial' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Send verification email
 */
async function sendVerificationEmail(email, name, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  // TODO: Implement email sending
  console.log('Verification email would be sent to:', email);
  console.log('Verification URL:', verificationUrl);

  /*
  await sendEmail({
    to: email,
    subject: 'Verify your email for The dAItaniverse',
    html: `
      <h1>Hey ${name}!</h1>
      <p>Thanks for signing up!</p>
      <p>Click to verify your email and activate your account:</p>
      <p><a href="${verificationUrl}">VERIFY EMAIL →</a></p>
      <p>This link expires in 24 hours.</p>
      <p>Didn't sign up? Ignore this email.</p>
      <p>See you inside!<br>Debs 🤘</p>
    `
  });
  */
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(email, name, planType, trialEndDate) {
  // TODO: Implement email sending
  console.log('Welcome email would be sent to:', email);

  /*
  const isTrial = planType === 'trial';

  await sendEmail({
    to: email,
    subject: 'Welcome to The dAItaniverse! 🎉',
    html: `
      <h1>Hey ${name}!</h1>
      <p>You're officially in!</p>

      <h3>Your Details:</h3>
      <ul>
        <li>Email: ${email}</li>
        <li>Plan: ${isTrial ? '7-Day Free Trial' : 'PRO'}</li>
        ${isTrial ? `<li>Trial ends: ${trialEndDate}</li>` : ''}
      </ul>

      <h3>QUICK START:</h3>
      <ol>
        <li>Log in: https://app.daitaniverse.com</li>
        <li>Watch this 2-minute tour: [Video]</li>
        <li>Build something!</li>
      </ol>

      <p>Need help? Just reply to this email.</p>

      <p>Let's build your empire!</p>

      <p>Debs<br>Founder, The dAItaniverse</p>

      <p>P.S. Stuck? I read every email. Reply anytime.</p>
    `
  });
  */
}

/**
 * Send upgrade confirmation email
 */
async function sendUpgradeConfirmationEmail(email, name) {
  // TODO: Implement email sending
  console.log('Upgrade confirmation email would be sent to:', email);
}

export default router;
