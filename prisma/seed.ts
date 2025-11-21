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
