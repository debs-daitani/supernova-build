/**
 * Sample Data Service
 * Generates demo data when a new user opts in during onboarding
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate all sample data for a new user based on their goal
 */
async function generateAllSampleData(userId, goal, prisma) {
  const sampleItems = [];

  // Generate based on their goal
  if (goal === 'website' || goal === 'all') {
    sampleItems.push(...await generateSamplePages(userId, prisma));
    sampleItems.push(...await generateSampleBlogPosts(userId, prisma));
  }

  if (goal === 'ecommerce' || goal === 'all') {
    sampleItems.push(...await generateSampleProducts(userId, prisma));
  }

  if (goal === 'course' || goal === 'all') {
    sampleItems.push(...await generateSampleCourse(userId, prisma));
  }

  if (goal === 'crm' || goal === 'all') {
    sampleItems.push(...await generateSampleContacts(userId, prisma));
  }

  // Always generate email templates
  sampleItems.push(...await generateSampleEmailTemplates(userId, prisma));

  // Track all sample data in the SampleData table
  if (prisma && prisma.sampleData) {
    await prisma.sampleData.createMany({
      data: sampleItems.map(item => ({
        userId,
        itemType: item.type,
        itemId: item.id,
        description: item.description,
        createdAt: new Date()
      }))
    });

    // Update onboarding progress
    if (prisma.onboardingProgress) {
      await prisma.onboardingProgress.update({
        where: { userId },
        data: { sampleDataCreated: true }
      });
    }
  }

  return sampleItems;
}

/**
 * Generate 3 sample website pages
 */
async function generateSamplePages(userId, prisma) {
  const pages = [
    {
      id: uuidv4(),
      userId,
      title: '🏠 Home Page - SAMPLE',
      slug: 'sample-home',
      content: JSON.stringify({
        sections: [
          {
            type: 'hero',
            heading: 'Welcome to My Business',
            subheading: 'This is a sample page - replace with your content!',
            cta: { text: 'Get Started', link: '/contact' }
          },
          {
            type: 'features',
            heading: 'What We Do',
            items: [
              { icon: '⭐', title: 'Feature 1', description: 'Replace with your feature' },
              { icon: '🚀', title: 'Feature 2', description: 'Replace with your feature' },
              { icon: '💡', title: 'Feature 3', description: 'Replace with your feature' }
            ]
          }
        ]
      }),
      published: true,
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      title: '📖 About - SAMPLE',
      slug: 'sample-about',
      content: JSON.stringify({
        sections: [
          {
            type: 'text',
            heading: 'About Us',
            body: 'This is a sample about page. Replace this with your story, mission, and team information.'
          }
        ]
      }),
      published: true,
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      title: '📧 Contact - SAMPLE',
      slug: 'sample-contact',
      content: JSON.stringify({
        sections: [
          {
            type: 'form',
            heading: 'Get In Touch',
            fields: ['name', 'email', 'message']
          }
        ]
      }),
      published: true,
      isSample: true,
      createdAt: new Date()
    }
  ];

  // Create pages if prisma is available
  if (prisma && prisma.page) {
    for (const page of pages) {
      await prisma.page.create({ data: page });
    }
  }

  return pages.map(p => ({
    type: 'page',
    id: p.id,
    description: `Sample Page: ${p.title}`
  }));
}

/**
 * Generate 3 sample blog posts
 */
async function generateSampleBlogPosts(userId, prisma) {
  const posts = [
    {
      id: uuidv4(),
      userId,
      title: '🎉 Welcome to My Blog - SAMPLE',
      slug: 'welcome-sample',
      excerpt: 'This is a sample blog post. Delete or edit when ready!',
      content: 'Welcome! This is your first blog post. Replace this content with your own thoughts, insights, and stories.',
      published: true,
      isSample: true,
      publishedAt: new Date(),
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      title: '🚀 Getting Started with Your Business - SAMPLE',
      slug: 'getting-started-sample',
      excerpt: 'Tips for launching your business online',
      content: 'Starting a business can be overwhelming. Here are some tips to get you started... (Replace with your content)',
      published: true,
      isSample: true,
      publishedAt: new Date(),
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      title: '💡 5 Tips for Success - SAMPLE',
      slug: 'tips-for-success-sample',
      excerpt: 'Learn the secrets to building a successful business',
      content: '1. Be consistent\n2. Provide value\n3. Listen to customers\n4. Stay focused\n5. Never give up\n\n(Replace with your tips)',
      published: true,
      isSample: true,
      publishedAt: new Date(),
      createdAt: new Date()
    }
  ];

  if (prisma && prisma.blogPost) {
    for (const post of posts) {
      await prisma.blogPost.create({ data: post });
    }
  }

  return posts.map(p => ({
    type: 'blog_post',
    id: p.id,
    description: `Sample Blog Post: ${p.title}`
  }));
}

/**
 * Generate 5 sample products
 */
async function generateSampleProducts(userId, prisma) {
  const products = [
    {
      id: uuidv4(),
      userId,
      name: '📦 Physical Product Example - SAMPLE',
      description: 'A sample physical product. Replace with your actual product.',
      price: 29.99,
      type: 'physical',
      category: 'Sample Category',
      stock: 100,
      image: 'https://via.placeholder.com/400x400?text=Product+1',
      isSample: true,
      active: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      name: '💎 Premium Product - SAMPLE',
      description: 'A sample premium product with higher price point.',
      price: 99.99,
      type: 'physical',
      category: 'Premium',
      stock: 50,
      image: 'https://via.placeholder.com/400x400?text=Premium',
      isSample: true,
      active: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      name: '📱 Digital Download - SAMPLE',
      description: 'A sample digital product (ebook, template, etc.)',
      price: 19.99,
      type: 'digital',
      category: 'Digital',
      downloadUrl: 'https://example.com/sample',
      isSample: true,
      active: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      name: '🎯 Service Package - SAMPLE',
      description: 'A sample service offering.',
      price: 149.99,
      type: 'service',
      category: 'Services',
      isSample: true,
      active: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      name: '🆓 Free Sample Product',
      description: 'A free lead magnet or sample.',
      price: 0,
      type: 'digital',
      category: 'Free',
      isSample: true,
      active: true,
      createdAt: new Date()
    }
  ];

  if (prisma && prisma.product) {
    for (const product of products) {
      await prisma.product.create({ data: product });
    }
  }

  return products.map(p => ({
    type: 'product',
    id: p.id,
    description: `Sample Product: ${p.name}`
  }));
}

/**
 * Generate 10 sample CRM contacts
 */
async function generateSampleContacts(userId, prisma) {
  const contacts = [
    {
      id: uuidv4(),
      userId,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      company: 'Tech Innovations Inc',
      status: 'lead',
      tags: ['potential-customer', 'tech'],
      notes: 'Interested in premium package',
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@example.com',
      company: 'Digital Marketing Pro',
      status: 'customer',
      tags: ['active-customer'],
      notes: 'Purchased starter package',
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.r@example.com',
      company: 'Creative Studios',
      status: 'lead',
      tags: ['design', 'follow-up'],
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'David',
      lastName: 'Thompson',
      email: 'dthompson@example.com',
      company: 'Thompson Consulting',
      status: 'customer',
      tags: ['vip', 'referral'],
      notes: 'Referred 3 customers',
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'Jessica',
      lastName: 'Williams',
      email: 'jwilliams@example.com',
      status: 'prospect',
      tags: ['newsletter'],
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'Robert',
      lastName: 'Martinez',
      email: 'rmartinez@example.com',
      company: 'Martinez & Associates',
      status: 'customer',
      tags: ['repeat-customer'],
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'Amanda',
      lastName: 'Taylor',
      email: 'ataylor@example.com',
      company: 'Taylor Enterprises',
      status: 'lead',
      tags: ['high-value'],
      notes: 'Interested in enterprise solution',
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'James',
      lastName: 'Anderson',
      email: 'janderson@example.com',
      status: 'prospect',
      tags: ['webinar-attendee'],
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'Lisa',
      lastName: 'Brown',
      email: 'lbrown@example.com',
      company: 'Brown Digital',
      status: 'customer',
      tags: ['active-customer', 'testimonial'],
      notes: 'Happy customer - good for case study',
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      firstName: 'Christopher',
      lastName: 'Davis',
      email: 'cdavis@example.com',
      company: 'Davis Solutions',
      status: 'lead',
      tags: ['cold-lead'],
      isSample: true,
      createdAt: new Date()
    }
  ];

  if (prisma && prisma.contact) {
    for (const contact of contacts) {
      await prisma.contact.create({ data: contact });
    }
  }

  return contacts.map(c => ({
    type: 'contact',
    id: c.id,
    description: `Sample Contact: ${c.firstName} ${c.lastName}`
  }));
}

/**
 * Generate 1 sample course
 */
async function generateSampleCourse(userId, prisma) {
  const courseId = uuidv4();

  const course = {
    id: courseId,
    userId,
    title: '🎓 Example Course - Replace with Yours - SAMPLE',
    description: 'This is a sample course structure. Replace with your actual course content.',
    price: 297,
    published: true,
    isSample: true,
    createdAt: new Date()
  };

  const modules = [
    {
      id: uuidv4(),
      courseId,
      title: 'Module 1: Getting Started',
      order: 1,
      isSample: true
    },
    {
      id: uuidv4(),
      courseId,
      title: 'Module 2: Core Concepts',
      order: 2,
      isSample: true
    },
    {
      id: uuidv4(),
      courseId,
      title: 'Module 3: Advanced Techniques',
      order: 3,
      isSample: true
    }
  ];

  const lessons = [
    {
      id: uuidv4(),
      moduleId: modules[0].id,
      title: 'Lesson 1: Introduction',
      type: 'video',
      content: JSON.stringify({
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Replace with your video'
      }),
      order: 1,
      isSample: true
    },
    {
      id: uuidv4(),
      moduleId: modules[0].id,
      title: 'Lesson 2: Setup',
      type: 'text',
      content: JSON.stringify({
        markdown: '# Setup Instructions\n\nReplace with your content...'
      }),
      order: 2,
      isSample: true
    },
    {
      id: uuidv4(),
      moduleId: modules[1].id,
      title: 'Lesson 3: Core Concept 1',
      type: 'video',
      content: JSON.stringify({
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }),
      order: 1,
      isSample: true
    },
    {
      id: uuidv4(),
      moduleId: modules[1].id,
      title: 'Lesson 4: Core Concept 2',
      type: 'text',
      content: JSON.stringify({
        markdown: '# Core Concept\n\nYour lesson content here...'
      }),
      order: 2,
      isSample: true
    },
    {
      id: uuidv4(),
      moduleId: modules[2].id,
      title: 'Lesson 5: Advanced Strategy',
      type: 'video',
      content: JSON.stringify({
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }),
      order: 1,
      isSample: true
    }
  ];

  const items = [];

  if (prisma && prisma.course) {
    await prisma.course.create({ data: course });
    items.push({ type: 'course', id: courseId, description: `Sample Course: ${course.title}` });

    if (prisma.courseModule) {
      for (const module of modules) {
        await prisma.courseModule.create({ data: module });
        items.push({ type: 'course_module', id: module.id, description: `Sample Module: ${module.title}` });
      }
    }

    if (prisma.lesson) {
      for (const lesson of lessons) {
        await prisma.lesson.create({ data: lesson });
        items.push({ type: 'lesson', id: lesson.id, description: `Sample Lesson: ${lesson.title}` });
      }
    }
  }

  return items;
}

/**
 * Generate 3 sample email templates
 */
async function generateSampleEmailTemplates(userId, prisma) {
  const templates = [
    {
      id: uuidv4(),
      userId,
      name: '✉️ Welcome Email - SAMPLE',
      subject: 'Welcome to {{businessName}}!',
      body: 'Hi {{firstName}},\n\nWelcome! We\'re so glad you\'re here.\n\nReplace this with your welcome message.\n\nBest,\n{{senderName}}',
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      name: '📰 Newsletter Template - SAMPLE',
      subject: '{{businessName}} Newsletter - {{month}}',
      body: 'Hi {{firstName}},\n\nHere\'s what\'s new this month...\n\n- Update 1\n- Update 2\n- Update 3\n\nReplace with your content!\n\nBest,\n{{senderName}}',
      isSample: true,
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      userId,
      name: '🎁 Promotional Email - SAMPLE',
      subject: 'Special Offer Just for You!',
      body: 'Hi {{firstName}},\n\nWe have a special offer for you...\n\n[Replace with your promotion]\n\nUse code: SAVE20\n\nBest,\n{{senderName}}',
      isSample: true,
      createdAt: new Date()
    }
  ];

  if (prisma && prisma.emailTemplate) {
    for (const template of templates) {
      await prisma.emailTemplate.create({ data: template });
    }
  }

  return templates.map(t => ({
    type: 'email_template',
    id: t.id,
    description: `Sample Email Template: ${t.name}`
  }));
}

/**
 * Delete all sample data for a user
 */
async function deleteAllSampleData(userId, prisma) {
  if (!prisma || !prisma.sampleData) {
    return { deleted: 0 };
  }

  const sampleItems = await prisma.sampleData.findMany({
    where: { userId }
  });

  let deletedCount = 0;

  // Delete each item from its respective table
  for (const item of sampleItems) {
    try {
      switch (item.itemType) {
        case 'page':
          if (prisma.page) {
            await prisma.page.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
        case 'blog_post':
          if (prisma.blogPost) {
            await prisma.blogPost.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
        case 'product':
          if (prisma.product) {
            await prisma.product.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
        case 'contact':
          if (prisma.contact) {
            await prisma.contact.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
        case 'course':
          if (prisma.course) {
            await prisma.course.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
        case 'course_module':
          if (prisma.courseModule) {
            await prisma.courseModule.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
        case 'lesson':
          if (prisma.lesson) {
            await prisma.lesson.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
        case 'email_template':
          if (prisma.emailTemplate) {
            await prisma.emailTemplate.delete({ where: { id: item.itemId } });
            deletedCount++;
          }
          break;
      }
    } catch (error) {
      console.error(`Error deleting ${item.itemType} ${item.itemId}:`, error);
    }
  }

  // Delete tracking records
  await prisma.sampleData.deleteMany({
    where: { userId }
  });

  return { deleted: deletedCount };
}

/**
 * Check if user has sample data
 */
async function hasSampleData(userId, prisma) {
  if (!prisma || !prisma.sampleData) {
    return false;
  }

  const count = await prisma.sampleData.count({
    where: { userId }
  });

  return count > 0;
}

module.exports = {
  generateAllSampleData,
  deleteAllSampleData,
  hasSampleData,
  generateSamplePages,
  generateSampleBlogPosts,
  generateSampleProducts,
  generateSampleContacts,
  generateSampleCourse,
  generateSampleEmailTemplates
};
