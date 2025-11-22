// Pre-built sections library for the website builder

export interface Section {
  id: string
  name: string
  category: string
  thumbnail?: string
  content: any
}

export const sections: Section[] = [
  // Hero Sections
  {
    id: 'hero-centered',
    name: 'Hero - Centered',
    category: 'hero',
    content: {
      type: 'hero',
      variant: 'centered',
      headline: 'Welcome to Our Amazing Product',
      subheadline: 'The best solution for your business needs',
      ctaText: 'Get Started',
      ctaLink: '#',
      backgroundImage: '',
      backgroundColor: '#f8f9fa',
    },
  },
  {
    id: 'hero-split',
    name: 'Hero - Split',
    category: 'hero',
    content: {
      type: 'hero',
      variant: 'split',
      headline: 'Build Something Amazing',
      subheadline: 'Transform your ideas into reality',
      ctaText: 'Learn More',
      ctaLink: '#',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      imagePosition: 'right',
    },
  },

  // Features Sections
  {
    id: 'features-3col',
    name: 'Features - 3 Columns',
    category: 'features',
    content: {
      type: 'features',
      variant: '3-column',
      title: 'Amazing Features',
      description: 'Everything you need to succeed',
      features: [
        { icon: '⚡', title: 'Fast', description: 'Lightning-fast performance' },
        { icon: '🔒', title: 'Secure', description: 'Bank-level security' },
        { icon: '📱', title: 'Responsive', description: 'Works on all devices' },
      ],
    },
  },
  {
    id: 'features-4col',
    name: 'Features - 4 Columns',
    category: 'features',
    content: {
      type: 'features',
      variant: '4-column',
      title: 'Why Choose Us',
      features: [
        { icon: '🎨', title: 'Beautiful Design', description: 'Stunning visuals' },
        { icon: '⚙️', title: 'Easy to Use', description: 'Intuitive interface' },
        { icon: '🚀', title: 'Fast Setup', description: 'Get started in minutes' },
        { icon: '💰', title: 'Affordable', description: 'Great value for money' },
      ],
    },
  },

  // Testimonials
  {
    id: 'testimonials-grid',
    name: 'Testimonials - Grid',
    category: 'testimonials',
    content: {
      type: 'testimonials',
      variant: 'grid',
      title: 'What Our Customers Say',
      testimonials: [
        {
          quote: 'This product changed my life!',
          author: 'John Doe',
          role: 'CEO, Company Inc',
          avatar: '',
        },
        {
          quote: 'Amazing service and support!',
          author: 'Jane Smith',
          role: 'Marketing Director',
          avatar: '',
        },
        {
          quote: 'Highly recommended!',
          author: 'Bob Johnson',
          role: 'Freelancer',
          avatar: '',
        },
      ],
    },
  },

  // Pricing
  {
    id: 'pricing-3tier',
    name: 'Pricing - 3 Tiers',
    category: 'pricing',
    content: {
      type: 'pricing',
      variant: '3-tier',
      title: 'Simple Pricing',
      description: 'Choose the plan that fits your needs',
      plans: [
        {
          name: 'Basic',
          price: '$9',
          period: 'per month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          ctaText: 'Get Started',
          ctaLink: '#',
        },
        {
          name: 'Pro',
          price: '$29',
          period: 'per month',
          features: ['Everything in Basic', 'Feature 4', 'Feature 5', 'Feature 6'],
          ctaText: 'Get Started',
          ctaLink: '#',
          featured: true,
        },
        {
          name: 'Enterprise',
          price: '$99',
          period: 'per month',
          features: ['Everything in Pro', 'Feature 7', 'Feature 8', 'Priority Support'],
          ctaText: 'Contact Us',
          ctaLink: '#',
        },
      ],
    },
  },

  // Contact
  {
    id: 'contact-simple',
    name: 'Contact - Simple Form',
    category: 'contact',
    content: {
      type: 'contact',
      variant: 'simple',
      title: 'Get in Touch',
      description: 'We would love to hear from you',
      formFields: ['name', 'email', 'message'],
      submitText: 'Send Message',
    },
  },
  {
    id: 'contact-with-info',
    name: 'Contact - With Info',
    category: 'contact',
    content: {
      type: 'contact',
      variant: 'with-info',
      title: 'Contact Us',
      description: 'Reach out and we will get back to you',
      formFields: ['name', 'email', 'phone', 'message'],
      contactInfo: {
        email: 'hello@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345',
      },
      submitText: 'Send Message',
    },
  },

  // CTA
  {
    id: 'cta-centered',
    name: 'CTA - Centered',
    category: 'cta',
    content: {
      type: 'cta',
      variant: 'centered',
      headline: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers today',
      ctaText: 'Sign Up Now',
      ctaLink: '#',
      backgroundColor: '#ec4899',
    },
  },

  // Gallery
  {
    id: 'gallery-grid',
    name: 'Gallery - Grid',
    category: 'gallery',
    content: {
      type: 'gallery',
      variant: 'grid',
      title: 'Our Work',
      images: [
        { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', alt: 'Image 1' },
        { url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', alt: 'Image 2' },
        { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475', alt: 'Image 3' },
        { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6', alt: 'Image 4' },
      ],
    },
  },

  // Team
  {
    id: 'team-grid',
    name: 'Team - Grid',
    category: 'team',
    content: {
      type: 'team',
      variant: 'grid',
      title: 'Meet Our Team',
      description: 'The talented people behind our success',
      members: [
        {
          name: 'Alice Johnson',
          role: 'CEO & Founder',
          photo: '',
          bio: 'Passionate about innovation',
        },
        {
          name: 'Bob Smith',
          role: 'CTO',
          photo: '',
          bio: 'Tech enthusiast and leader',
        },
        {
          name: 'Carol Williams',
          role: 'Head of Design',
          photo: '',
          bio: 'Creative design expert',
        },
      ],
    },
  },

  // FAQ
  {
    id: 'faq-accordion',
    name: 'FAQ - Accordion',
    category: 'faq',
    content: {
      type: 'faq',
      variant: 'accordion',
      title: 'Frequently Asked Questions',
      questions: [
        {
          question: 'How does it work?',
          answer: 'Our platform is easy to use and intuitive.',
        },
        {
          question: 'What is the pricing?',
          answer: 'We offer flexible pricing plans to suit your needs.',
        },
        {
          question: 'Do you offer support?',
          answer: 'Yes, we provide 24/7 customer support.',
        },
      ],
    },
  },

  // Footer
  {
    id: 'footer-3col',
    name: 'Footer - 3 Columns',
    category: 'footer',
    content: {
      type: 'footer',
      variant: '3-column',
      logo: '',
      columns: [
        {
          title: 'Product',
          links: [
            { text: 'Features', url: '#' },
            { text: 'Pricing', url: '#' },
            { text: 'FAQ', url: '#' },
          ],
        },
        {
          title: 'Company',
          links: [
            { text: 'About', url: '#' },
            { text: 'Blog', url: '#' },
            { text: 'Contact', url: '#' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { text: 'Privacy', url: '#' },
            { text: 'Terms', url: '#' },
          ],
        },
      ],
      socialLinks: [
        { platform: 'twitter', url: '#' },
        { platform: 'facebook', url: '#' },
        { platform: 'linkedin', url: '#' },
      ],
      copyright: '© 2025 Your Company. All rights reserved.',
    },
  },
]

export function getSectionsByCategory(category: string): Section[] {
  return sections.filter((s) => s.category === category)
}

export function getSectionById(id: string): Section | undefined {
  return sections.find((s) => s.id === id)
}
