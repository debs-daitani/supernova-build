import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.contentCategory.upsert({
      where: { slug: 'anti-branding' },
      update: {},
      create: {
        name: 'Anti-Branding',
        slug: 'anti-branding',
        description:
          'Break free from traditional branding rules and create authentic connections',
        icon: '🎨',
        order: 1,
      },
    }),
    prisma.contentCategory.upsert({
      where: { slug: 'business-frameworks' },
      update: {},
      create: {
        name: 'Business Frameworks',
        slug: 'business-frameworks',
        description: 'Proven frameworks to structure and grow your business',
        icon: '📊',
        order: 2,
      },
    }),
    prisma.contentCategory.upsert({
      where: { slug: 'social-media' },
      update: {},
      create: {
        name: 'Social Media Strategy',
        slug: 'social-media',
        description: 'Master social media marketing and content creation',
        icon: '📱',
        order: 3,
      },
    }),
    prisma.contentCategory.upsert({
      where: { slug: 'neurodivergent-systems' },
      update: {},
      create: {
        name: 'Neurodivergent Systems',
        slug: 'neurodivergent-systems',
        description: 'Business systems designed for ADHD and neurodivergent entrepreneurs',
        icon: '🧠',
        order: 4,
      },
    }),
    prisma.contentCategory.upsert({
      where: { slug: 'personal-branding' },
      update: {},
      create: {
        name: 'Personal Branding',
        slug: 'personal-branding',
        description: 'Build a powerful personal brand that attracts your ideal clients',
        icon: '✨',
        order: 5,
      },
    }),
  ])

  console.log('✅ Categories created')

  // Create content items
  const contentItems = [
    // Anti-Branding Content
    {
      title: 'The Anti-Branding Manifesto',
      slug: 'anti-branding-manifesto',
      description:
        'Discover why breaking traditional branding rules creates more authentic and profitable businesses. This framework shows you how to stand out by being yourself.',
      thumbnail: null,
      type: 'FRAMEWORK',
      categoryId: categories[0].id,
      tags: ['branding', 'authenticity', 'marketing'],
      isPremium: false,
      requiredRole: 'FREE',
      content: `# The Anti-Branding Manifesto

## What is Anti-Branding?

Anti-branding is about rejecting cookie-cutter business advice and creating a brand that's authentically YOU.

## The 5 Principles:

1. **Authenticity Over Perfection** - Show the real you, not a polished facade
2. **Connection Over Conversion** - Build relationships before selling
3. **Story Over Strategy** - Your unique story is your biggest asset
4. **Imperfection Over Image** - Flaws make you relatable and trustworthy
5. **Purpose Over Profit** - Lead with impact, profit follows

## How to Apply This:

- Share behind-the-scenes content
- Talk about your failures, not just successes
- Use your natural voice, not corporate speak
- Build a community, not just an audience
- Let your personality shine through

This approach creates deeper connections and attracts clients who truly resonate with you.`,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'Content Creation Template Pack',
      slug: 'content-creation-templates',
      description:
        'Ready-to-use templates for social media posts, email campaigns, and blog articles. Save hours of planning time.',
      thumbnail: null,
      type: 'TEMPLATE',
      categoryId: categories[2].id,
      tags: ['templates', 'social-media', 'content'],
      isPremium: false,
      requiredRole: 'FREE',
      fileUrl: '/downloads/content-templates.pdf',
      content: `# Content Creation Template Pack

## What's Included:

### Social Media Templates
- Instagram carousel templates
- LinkedIn post structures
- Twitter thread frameworks
- TikTok script outlines

### Email Templates
- Welcome sequence (5 emails)
- Newsletter formats
- Launch campaign structure
- Re-engagement emails

### Blog Templates
- How-to article structure
- Listicle framework
- Personal story template
- Case study format

## How to Use:

1. Choose the template that fits your content goal
2. Customize with your brand voice and message
3. Add your unique examples and stories
4. Schedule and publish

These templates save you hours of staring at a blank page!`,
      isPublished: true,
      publishedAt: new Date(),
    },

    // Business Frameworks
    {
      title: 'The Revenue Roadmap Framework',
      slug: 'revenue-roadmap-framework',
      description:
        'A step-by-step framework to map your path from where you are to your revenue goals. Includes planning worksheets.',
      thumbnail: null,
      type: 'FRAMEWORK',
      categoryId: categories[1].id,
      tags: ['business-planning', 'revenue', 'strategy'],
      isPremium: true,
      requiredRole: 'UPGRADE',
      content: `# The Revenue Roadmap Framework

## Overview

This framework helps you create a clear path from your current revenue to your goals.

## Step 1: Current State Assessment
- What's your monthly revenue now?
- What are your current offers?
- Who are your existing clients?

## Step 2: Goal Setting
- Where do you want to be in 6 months?
- What about 12 months?
- What's your dream revenue target?

## Step 3: Gap Analysis
- What's the difference between now and your goal?
- What needs to change?
- What's holding you back?

## Step 4: Strategy Selection
- More clients at current prices?
- Higher prices with same client volume?
- New offers or services?
- Multiple income streams?

## Step 5: Action Planning
- Break down big goals into monthly targets
- Create weekly action items
- Set up accountability systems

## Member Resources:
- Revenue tracking spreadsheet
- Goal-setting worksheet
- Monthly planning template
- Progress tracking dashboard`,
      isPublished: true,
      publishedAt: new Date(),
    },

    // Social Media
    {
      title: '30-Day Social Media Content Calendar',
      slug: 'social-media-calendar',
      description:
        "Never run out of content ideas again! A full month of post ideas, hooks, and engagement strategies.",
      thumbnail: null,
      type: 'TEMPLATE',
      categoryId: categories[2].id,
      tags: ['social-media', 'content-calendar', 'planning'],
      isPremium: true,
      requiredRole: 'MEMBER',
      fileUrl: '/downloads/30-day-calendar.pdf',
      content: `# 30-Day Social Media Content Calendar

## How to Use This Calendar:

This calendar gives you a complete month of content ideas organized by themes.

### Week 1: Educational Content
- Monday: Share a tip
- Tuesday: Teach a framework
- Wednesday: Answer a FAQ
- Thursday: Break a myth
- Friday: Quick tutorial

### Week 2: Behind-the-Scenes
- Monday: Your morning routine
- Tuesday: Workspace tour
- Wednesday: Tool you're loving
- Thursday: Lesson learned
- Friday: Week in review

### Week 3: Community Building
- Monday: Ask a question
- Tuesday: Share client wins
- Wednesday: Poll your audience
- Thursday: Feature a follower
- Friday: Live Q&A

### Week 4: Promotional
- Monday: Share testimonial
- Tuesday: Highlight an offer
- Wednesday: Case study
- Thursday: Limited time offer
- Friday: Weekly recap + CTA

### Bonus Weekend Content Ideas:
- Inspirational quotes
- Personal stories
- Industry news commentary
- Fun/relatable content

## Customization Tips:
- Adapt topics to your niche
- Use your brand voice
- Add your own examples
- Mix up the format (carousel, reel, static post)`,
      isPublished: true,
      publishedAt: new Date(),
    },

    // Neurodivergent Systems
    {
      title: 'ADHD-Friendly Business Systems',
      slug: 'adhd-business-systems',
      description:
        'Business systems designed specifically for ADHD brains. Work with your brain, not against it.',
      thumbnail: null,
      type: 'FRAMEWORK',
      categoryId: categories[3].id,
      tags: ['adhd', 'systems', 'productivity'],
      isPremium: true,
      requiredRole: 'MEMBER',
      content: `# ADHD-Friendly Business Systems

## Why Standard Business Advice Doesn't Work

Traditional business systems assume:
- Linear thinking
- Consistent energy levels
- Good memory
- Natural organization
- Easy focus on boring tasks

But ADHD brains work differently!

## The ADHD-Friendly Approach:

### 1. Batch Your Brain Work
- Do similar tasks together
- Ride your hyperfocus waves
- Don't fight your brain's natural flow

### 2. External Brain Systems
- Write EVERYTHING down
- Use visual reminders
- Automate repetitive decisions
- Set up fail-safes

### 3. Energy-Based Planning
- Schedule hard tasks for peak energy times
- Build in buffer time
- Plan for bad brain days
- Honor your need for variety

### 4. Accountability Without Shame
- Body doubling sessions
- External deadlines
- Progress tracking (not perfection)
- Celebrate small wins

### 5. Systems That Forgive
- Assume you'll forget
- Build in redundancy
- Make restarting easy
- No shame spirals

## Specific Systems:

**Client Management:**
- Automated reminders
- Template responses
- Checklist workflows
- Visual progress tracking

**Content Creation:**
- Ideas parking lot
- Batch filming days
- Easy repurposing system
- Publishing automation

**Financial Management:**
- Automatic transfers
- Simple tracking
- Regular money dates
- Professional support

Remember: The best system is the one you'll actually use!`,
      isPublished: true,
      publishedAt: new Date(),
    },

    // Personal Branding
    {
      title: 'Your Magnetic Message Formula',
      slug: 'magnetic-message-formula',
      description:
        'Craft a personal brand message that attracts your ideal clients like a magnet. Includes fill-in-the-blank templates.',
      thumbnail: null,
      type: 'WORKSHEET',
      categoryId: categories[4].id,
      tags: ['branding', 'messaging', 'positioning'],
      isPremium: false,
      requiredRole: 'FREE',
      content: `# Your Magnetic Message Formula

## What Makes a Message Magnetic?

A magnetic message:
- Speaks directly to your ideal client
- Addresses their specific problem
- Shows your unique approach
- Makes them feel understood
- Inspires them to take action

## The Formula:

### Part 1: The Problem
What specific struggle does your ideal client face?

Example: "You're tired of creating content that gets no engagement"

### Part 2: The Transformation
What will be different after working with you?

Example: "Imagine having a content strategy that fills your calendar"

### Part 3: Your Unique Approach
What makes your method different?

Example: "I help you create anti-corporate content that actually converts"

### Part 4: Who You Help
Get specific about your ideal client

Example: "Perfect for service providers who hate traditional marketing"

## Your Magnetic Message:

"I help [ideal client] [achieve transformation] through [unique approach] so they can [ultimate benefit]."

## Examples:

"I help neurodivergent entrepreneurs build sustainable businesses through ADHD-friendly systems so they can work with their brain, not against it."

"I help coaches who hate selling attract premium clients through authentic content so they can grow their business without feeling sleazy."

## Your Turn:

Fill in each section:
- Who you help:
- Their problem:
- Your approach:
- Their transformation:

Then combine into your magnetic message!`,
      isPublished: true,
      publishedAt: new Date(),
    },
  ]

  for (const item of contentItems) {
    await prisma.contentItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item as any,
    })
  }

  console.log('✅ Content items created')

  // Create Programs
  const antiBrandingProgram = await prisma.program.upsert({
    where: { slug: 'anti-branding-masterclass' },
    update: {},
    create: {
      title: 'Anti-Branding Masterclass',
      slug: 'anti-branding-masterclass',
      description:
        'Master the art of anti-branding and learn how to build an authentic business that stands out by being yourself. This comprehensive programme covers everything from mindset shifts to practical implementation strategies.',
      instructor: 'Debs Daitani',
      durationMinutes: 240,
      requiredRole: 'UPGRADE',
      isPremium: true,
      isPublished: true,
      publishedAt: new Date(),
      order: 1,
    },
  })

  const menopreneurProgram = await prisma.program.upsert({
    where: { slug: 'menopreneur-framework' },
    update: {},
    create: {
      title: 'The Menopreneur Framework',
      slug: 'menopreneur-framework',
      description:
        'Navigate menopause whilst building a thriving business. Learn strategies specifically designed for women experiencing perimenopause and menopause, covering energy management, business systems, and sustainable growth.',
      instructor: 'Debs Daitani',
      durationMinutes: 180,
      requiredRole: 'MEMBER',
      isPremium: true,
      isPublished: true,
      publishedAt: new Date(),
      order: 2,
    },
  })

  const adhdBusinessProgram = await prisma.program.upsert({
    where: { slug: 'adhd-business-systems' },
    update: {},
    create: {
      title: 'ADHD-Friendly Business Systems',
      slug: 'adhd-business-systems',
      description:
        'Build a business that works with your ADHD brain, not against it. Discover systems, workflows, and strategies designed specifically for neurodivergent entrepreneurs.',
      instructor: 'Debs Daitani',
      durationMinutes: 150,
      requiredRole: 'FREE',
      isPremium: false,
      isPublished: true,
      publishedAt: new Date(),
      order: 3,
    },
  })

  console.log('✅ Programs created')

  // Create Modules and Lessons for Anti-Branding Masterclass
  const abModule1 = await prisma.module.create({
    data: {
      programId: antiBrandingProgram.id,
      title: 'Module 1: Foundations of Anti-Branding',
      description: 'Understand the core principles and mindset shifts required for anti-branding',
      order: 1,
      lessons: {
        create: [
          {
            title: 'Welcome to Anti-Branding',
            description: 'Introduction to the programme and what you can expect',
            type: 'VIDEO',
            videoUrl: 'https://player.vimeo.com/video/example',
            duration: 15,
            order: 1,
            content: '<p>Welcome to the Anti-Branding Masterclass! In this lesson, we\'ll explore why traditional branding fails and how being authentically yourself is your biggest competitive advantage.</p>',
          },
          {
            title: 'The Problem with Traditional Branding',
            description: 'Why cookie-cutter branding advice doesn\'t work',
            type: 'TEXT',
            duration: 20,
            order: 2,
            content: '<h2>Traditional Branding vs Anti-Branding</h2><p>Traditional branding tells you to create a polished, perfect image. Anti-branding embraces authenticity, imperfection, and realness.</p><p>Key differences:</p><ul><li>Traditional: Hide your flaws</li><li>Anti-Branding: Share your truth</li><li>Traditional: Follow the rules</li><li>Anti-Branding: Break the mould</li></ul>',
          },
          {
            title: 'Finding Your Authentic Voice',
            description: 'Discover and embrace your unique voice',
            type: 'MIXED',
            videoUrl: 'https://player.vimeo.com/video/example2',
            duration: 25,
            order: 3,
            content: '<p>Your authentic voice is already within you. This lesson helps you uncover it and use it confidently in your business.</p>',
          },
        ],
      },
    },
  })

  const abModule2 = await prisma.module.create({
    data: {
      programId: antiBrandingProgram.id,
      title: 'Module 2: Building Your Anti-Brand',
      description: 'Practical strategies for creating an authentic brand presence',
      order: 2,
      lessons: {
        create: [
          {
            title: 'Your Story is Your Strategy',
            description: 'How to use your personal story to connect with your ideal clients',
            type: 'VIDEO',
            videoUrl: 'https://player.vimeo.com/video/example3',
            duration: 30,
            order: 1,
            content: '<p>Learn how to craft and share your story in a way that resonates deeply with your audience.</p>',
          },
          {
            title: 'Content That Breaks the Rules',
            description: 'Creating content that stands out by being real',
            type: 'TEXT',
            duration: 20,
            order: 2,
            content: '<h2>Anti-Branding Content Principles</h2><p>1. Share behind the scenes<br/>2. Be polarising (it\'s okay if not everyone likes you)<br/>3. Use your natural language<br/>4. Show your process, not just results</p>',
          },
        ],
      },
    },
  })

  // Create Modules for ADHD Business Programme
  const adhdModule1 = await prisma.module.create({
    data: {
      programId: adhdBusinessProgram.id,
      title: 'Understanding Your ADHD Brain',
      description: 'Learn how your ADHD brain works and how to leverage its strengths',
      order: 1,
      lessons: {
        create: [
          {
            title: 'Welcome to ADHD-Friendly Business',
            description: 'Introduction and overview',
            type: 'VIDEO',
            videoUrl: 'https://player.vimeo.com/video/adhd1',
            duration: 10,
            order: 1,
            content: '<p>Welcome! This programme is designed specifically for entrepreneurs with ADHD. You\'ll learn to work WITH your brain, not against it.</p>',
          },
          {
            title: 'ADHD Strengths in Business',
            description: 'Discover your superpowers',
            type: 'TEXT',
            duration: 15,
            order: 2,
            content: '<h2>Your ADHD Advantages</h2><p>ADHD isn\'t a deficit - it\'s a different way of thinking that comes with unique strengths:</p><ul><li>Hyperfocus: Deep concentration on interesting tasks</li><li>Creativity: Unique perspectives and ideas</li><li>Energy: Enthusiasm and passion</li><li>Problem-solving: Thinking outside the box</li></ul>',
          },
        ],
      },
    },
  })

  console.log('✅ Modules and lessons created')

  // Create Tier Quotas
  const features = [
    'supernovaMessages',
    'emailSubscribers',
    'socialPostsScheduled',
    'contentVideosRepurposed',
    'aiImagesGenerated',
    'aiVideosGenerated',
    'storageUsedBytes',
    'coursesHosted',
    'productsListed',
  ]

  const tierLimits = {
    FREE: {
      supernovaMessages: 0, // No access - view quiz results only
      emailSubscribers: 0,
      socialPostsScheduled: 0,
      contentVideosRepurposed: 0,
      aiImagesGenerated: 0,
      aiVideosGenerated: 0,
      storageUsedBytes: 0,
      coursesHosted: 0, // View only
      productsListed: 0,
    },
    UPGRADE: {
      supernovaMessages: 100, // 100 messages per month
      emailSubscribers: 300, // Max 300 subscribers
      socialPostsScheduled: 20, // 20 posts per month
      contentVideosRepurposed: 0, // Not available
      aiImagesGenerated: 0,
      aiVideosGenerated: 0,
      storageUsedBytes: 0,
      coursesHosted: 0,
      productsListed: 0,
    },
    MEMBER: {
      supernovaMessages: 300, // 300 messages per month
      emailSubscribers: 1000, // Max 1000 subscribers
      socialPostsScheduled: 60, // 60 posts per month
      contentVideosRepurposed: 4, // 4 videos per month
      aiImagesGenerated: 10, // 10 images per month
      aiVideosGenerated: 2, // 2 videos per month
      storageUsedBytes: 5368709120, // 5GB in bytes
      coursesHosted: 6, // Max 6 courses
      productsListed: 50, // Max 50 products
    },
    ADMIN: {
      supernovaMessages: -1, // Unlimited
      emailSubscribers: -1,
      socialPostsScheduled: -1,
      contentVideosRepurposed: -1,
      aiImagesGenerated: -1,
      aiVideosGenerated: -1,
      storageUsedBytes: -1,
      coursesHosted: -1,
      productsListed: -1,
    },
  }

  for (const tier of Object.keys(tierLimits)) {
    for (const feature of features) {
      await prisma.tierQuota.upsert({
        where: {
          tier_feature: {
            tier,
            feature,
          },
        },
        update: {
          monthlyLimit: tierLimits[tier as keyof typeof tierLimits][
            feature as keyof (typeof tierLimits)['FREE']
          ],
        },
        create: {
          tier,
          feature,
          monthlyLimit: tierLimits[tier as keyof typeof tierLimits][
            feature as keyof (typeof tierLimits)['FREE']
          ],
        },
      })
    }
  }

  console.log('✅ Tier quotas created')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
