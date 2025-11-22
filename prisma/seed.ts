import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@daitaniverse.com' },
    update: {},
    create: {
      email: 'demo@daitaniverse.com',
      name: 'Demo User',
      username: 'demo',
    },
  })

  console.log('Created user:', user.email)

  // Create templates
  const templates = [
    {
      name: 'Landing Page',
      category: 'landing-page',
      description: 'Perfect for product launches and marketing campaigns',
      isPublic: true,
      isFeatured: true,
      theme: {
        primaryColor: '#ec4899',
        secondaryColor: '#8b5cf6',
        accentColor: '#f59e0b',
      },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          seoTitle: 'Welcome to Our Product',
          seoDescription: 'The best solution for your business needs',
          content: [
            {
              type: 'hero',
              variant: 'centered',
              headline: 'Launch Your Product with Impact',
              subheadline: 'The perfect landing page to showcase your amazing product',
              ctaText: 'Get Started Free',
              ctaLink: '#',
              backgroundColor: '#f8f9fa',
            },
            {
              type: 'features',
              variant: '3-column',
              title: 'Everything You Need',
              description: 'Powerful features to help you succeed',
              features: [
                {
                  icon: '⚡',
                  title: 'Lightning Fast',
                  description: 'Optimized for speed and performance',
                },
                {
                  icon: '🔒',
                  title: 'Secure',
                  description: 'Enterprise-grade security built-in',
                },
                {
                  icon: '📱',
                  title: 'Mobile Ready',
                  description: 'Looks great on any device',
                },
              ],
            },
            {
              type: 'pricing',
              variant: '3-tier',
              title: 'Simple, Transparent Pricing',
              description: 'Choose the plan that works for you',
              plans: [
                {
                  name: 'Starter',
                  price: '$9',
                  period: 'per month',
                  features: ['Up to 1,000 visitors', 'Basic analytics', 'Email support'],
                  ctaText: 'Start Free Trial',
                  ctaLink: '#',
                },
                {
                  name: 'Professional',
                  price: '$29',
                  period: 'per month',
                  features: [
                    'Up to 10,000 visitors',
                    'Advanced analytics',
                    'Priority support',
                    'Custom domain',
                  ],
                  ctaText: 'Start Free Trial',
                  ctaLink: '#',
                  featured: true,
                },
                {
                  name: 'Enterprise',
                  price: '$99',
                  period: 'per month',
                  features: [
                    'Unlimited visitors',
                    'Enterprise analytics',
                    'Dedicated support',
                    'White label',
                  ],
                  ctaText: 'Contact Sales',
                  ctaLink: '#',
                },
              ],
            },
            {
              type: 'cta',
              variant: 'centered',
              headline: 'Ready to Get Started?',
              description: 'Join thousands of satisfied customers today',
              ctaText: 'Sign Up Now',
              ctaLink: '#',
              backgroundColor: '#ec4899',
            },
          ],
        },
      ],
    },
    {
      name: 'Portfolio',
      category: 'portfolio',
      description: 'Showcase your work and skills professionally',
      isPublic: true,
      isFeatured: true,
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#06b6d4',
      },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          seoTitle: 'My Portfolio',
          seoDescription: 'View my latest work and projects',
          content: [
            {
              type: 'hero',
              variant: 'centered',
              headline: 'Creative Designer & Developer',
              subheadline: 'Crafting beautiful digital experiences',
              ctaText: 'View My Work',
              ctaLink: '#',
              backgroundColor: '#f0f9ff',
            },
            {
              type: 'gallery',
              variant: 'grid',
              title: 'Featured Projects',
              images: [
                {
                  url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                  alt: 'Project 1',
                },
                {
                  url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
                  alt: 'Project 2',
                },
                {
                  url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
                  alt: 'Project 3',
                },
              ],
            },
            {
              type: 'contact',
              variant: 'simple',
              title: 'Let's Work Together',
              description: 'Have a project in mind? Get in touch!',
              formFields: ['name', 'email', 'message'],
              submitText: 'Send Message',
            },
          ],
        },
      ],
    },
    {
      name: 'Business',
      category: 'business',
      description: 'Professional template for businesses and agencies',
      isPublic: true,
      isFeatured: true,
      theme: {
        primaryColor: '#0ea5e9',
        secondaryColor: '#1e293b',
        accentColor: '#f59e0b',
      },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          seoTitle: 'Your Business Name',
          seoDescription: 'Professional business services',
          content: [
            {
              type: 'hero',
              variant: 'split',
              headline: 'Grow Your Business',
              subheadline: 'Professional services tailored to your needs',
              ctaText: 'Get Started',
              ctaLink: '#',
              image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984',
            },
            {
              type: 'features',
              variant: '4-column',
              title: 'Why Choose Us',
              features: [
                {
                  icon: '🎯',
                  title: 'Expert Team',
                  description: 'Experienced professionals',
                },
                {
                  icon: '💼',
                  title: 'Proven Results',
                  description: 'Track record of success',
                },
                {
                  icon: '⚙️',
                  title: 'Custom Solutions',
                  description: 'Tailored to your needs',
                },
                {
                  icon: '🤝',
                  title: 'Dedicated Support',
                  description: 'Always here to help',
                },
              ],
            },
            {
              type: 'testimonials',
              variant: 'grid',
              title: 'What Our Clients Say',
              testimonials: [
                {
                  quote: 'Outstanding service and results!',
                  author: 'Sarah Johnson',
                  role: 'CEO, Tech Corp',
                  avatar: '',
                },
                {
                  quote: 'Highly professional and reliable.',
                  author: 'Michael Chen',
                  role: 'Director, Innovation Inc',
                  avatar: '',
                },
              ],
            },
            {
              type: 'contact',
              variant: 'with-info',
              title: 'Contact Us',
              description: 'Get in touch with our team',
              formFields: ['name', 'email', 'phone', 'message'],
              contactInfo: {
                email: 'hello@business.com',
                phone: '+1 (555) 123-4567',
                address: '123 Business St, Suite 100',
              },
              submitText: 'Send Message',
            },
          ],
        },
      ],
    },
    {
      name: 'Restaurant',
      category: 'restaurant',
      description: 'Appetizing template for restaurants and cafes',
      isPublic: true,
      theme: {
        primaryColor: '#ef4444',
        secondaryColor: '#f59e0b',
        accentColor: '#14b8a6',
      },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          seoTitle: 'Delicious Restaurant',
          seoDescription: 'Experience amazing food and atmosphere',
          content: [
            {
              type: 'hero',
              variant: 'centered',
              headline: 'Exquisite Dining Experience',
              subheadline: 'Fresh ingredients, authentic flavors',
              ctaText: 'Reserve a Table',
              ctaLink: '#',
              backgroundColor: '#fef2f2',
            },
            {
              type: 'gallery',
              variant: 'grid',
              title: 'Our Signature Dishes',
              images: [
                {
                  url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
                  alt: 'Dish 1',
                },
                {
                  url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
                  alt: 'Dish 2',
                },
              ],
            },
            {
              type: 'contact',
              variant: 'with-info',
              title: 'Visit Us',
              description: 'We look forward to serving you',
              formFields: ['name', 'email', 'phone', 'message'],
              contactInfo: {
                email: 'reservations@restaurant.com',
                phone: '+1 (555) 987-6543',
                address: '456 Food Street, City',
              },
              submitText: 'Make Reservation',
            },
          ],
        },
      ],
    },
    {
      name: 'Agency',
      category: 'agency',
      description: 'Modern template for creative agencies',
      isPublic: true,
      theme: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#ec4899',
        accentColor: '#f59e0b',
      },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          seoTitle: 'Creative Agency',
          seoDescription: 'We bring your ideas to life',
          content: [
            {
              type: 'hero',
              variant: 'centered',
              headline: 'Creative Solutions for Bold Brands',
              subheadline: 'We transform ideas into remarkable digital experiences',
              ctaText: 'Start a Project',
              ctaLink: '#',
              backgroundColor: '#faf5ff',
            },
            {
              type: 'features',
              variant: '3-column',
              title: 'Our Services',
              description: 'Full-service digital agency',
              features: [
                {
                  icon: '🎨',
                  title: 'Brand Design',
                  description: 'Create memorable brand identities',
                },
                {
                  icon: '💻',
                  title: 'Web Development',
                  description: 'Build powerful web applications',
                },
                {
                  icon: '📱',
                  title: 'Digital Marketing',
                  description: 'Grow your online presence',
                },
              ],
            },
            {
              type: 'team',
              variant: 'grid',
              title: 'Meet Our Team',
              description: 'Talented individuals passionate about creativity',
              members: [
                {
                  name: 'Emma Wilson',
                  role: 'Creative Director',
                  photo: '',
                  bio: 'Leading creative vision',
                },
                {
                  name: 'James Lee',
                  role: 'Tech Lead',
                  photo: '',
                  bio: 'Building great products',
                },
              ],
            },
            {
              type: 'cta',
              variant: 'centered',
              headline: 'Ready to Start Your Project?',
              description: 'Let's create something amazing together',
              ctaText: 'Get in Touch',
              ctaLink: '#',
              backgroundColor: '#8b5cf6',
            },
          ],
        },
      ],
    },
  ]

  for (const template of templates) {
    await prisma.websiteTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    })
    console.log('Created template:', template.name)
  }

  console.log('Seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
