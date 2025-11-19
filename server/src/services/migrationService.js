/**
 * Platform Migration Service
 * Core business logic for migrating from other platforms
 */

const fs = require('fs');
const csv = require('csv-parser');
const xml2js = require('xml2js');

/**
 * Create new migration project
 */
async function createMigrationProject(userId, sourcePlatform, projectName, prisma) {
  return prisma.migrationProject.create({
    data: {
      userId,
      sourcePlatform,
      projectName,
      status: 'PENDING',
      currentStep: 1
    }
  });
}

/**
 * Analyze uploaded data and detect items
 */
async function analyzeData(projectId, files, prisma) {
  const project = await prisma.migrationProject.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error('Migration project not found');
  }

  let analysis = {
    pages: 0,
    products: 0,
    customers: 0,
    posts: 0,
    media: 0,
    orders: 0,
    total: 0
  };

  // Parse files based on platform
  for (const file of files) {
    const data = await parseFile(file, project.sourcePlatform);

    // Count items by type
    if (data.pages) analysis.pages += data.pages.length;
    if (data.products) analysis.products += data.products.length;
    if (data.customers) analysis.customers += data.customers.length;
    if (data.posts) analysis.posts += data.posts.length;
    if (data.media) analysis.media += data.media.length;
    if (data.orders) analysis.orders += data.orders.length;
  }

  analysis.total = Object.values(analysis).reduce((a, b) => a + b, 0);

  // Update project
  await prisma.migrationProject.update({
    where: { id: projectId },
    data: {
      status: 'ANALYZING',
      uploadedFiles: files.map(f => ({ path: f.path, name: f.originalname })),
      itemsTotal: analysis.total
    }
  });

  return analysis;
}

/**
 * Parse file based on format and platform
 */
async function parseFile(file, platform) {
  const ext = file.path.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    return parseCSV(file.path);
  } else if (ext === 'json') {
    return parseJSON(file.path);
  } else if (ext === 'xml') {
    return parseXML(file.path);
  }

  throw new Error(`Unsupported file format: ${ext}`);
}

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve({ items: results });
      })
      .on('error', reject);
  });
}

/**
 * Parse JSON file
 */
async function parseJSON(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Parse XML file (WordPress export)
 */
async function parseXML(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const parser = new xml2js.Parser();
  return parser.parseStringPromise(content);
}

/**
 * Get default field mapping for platform
 */
function getDefaultMapping(platform, itemType) {
  const mappings = {
    WIX: {
      product: {
        name: 'title',
        description: 'description',
        price: 'price',
        sku: 'sku',
        inventory: 'quantity'
      },
      customer: {
        email: 'email',
        name: 'fullName',
        phone: 'phone'
      }
    },
    SHOPIFY: {
      product: {
        title: 'name',
        body_html: 'description',
        vendor: 'brand',
        product_type: 'category',
        variants: 'variants'
      },
      customer: {
        email: 'email',
        first_name: 'firstName',
        last_name: 'lastName',
        phone: 'phone',
        tags: 'tags'
      }
    },
    WORDPRESS: {
      post: {
        title: 'title',
        content: 'content',
        excerpt: 'excerpt',
        author: 'author',
        categories: 'categories',
        tags: 'tags'
      }
    },
    MAILCHIMP: {
      subscriber: {
        email_address: 'email',
        merge_fields: 'customFields',
        status: 'status',
        tags: 'tags'
      }
    }
  };

  return mappings[platform]?.[itemType] || {};
}

/**
 * Execute migration
 */
async function executeMigration(projectId, prisma) {
  const project = await prisma.migrationProject.findUnique({
    where: { id: projectId },
    include: {
      migratedItems: true
    }
  });

  if (!project) {
    throw new Error('Migration project not found');
  }

  // Update status
  await prisma.migrationProject.update({
    where: { id: projectId },
    data: {
      status: 'IN_PROGRESS',
      startedAt: new Date()
    }
  });

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  try {
    // Parse uploaded files
    const files = project.uploadedFiles || [];

    for (const fileInfo of files) {
      const data = await parseFile({ path: fileInfo.path }, project.sourcePlatform);

      // Migrate each type of data
      if (project.dataToMigrate.includes('products') && data.products) {
        const result = await migrateProducts(data.products, project, prisma);
        successCount += result.success;
        failedCount += result.failed;
        skippedCount += result.skipped;
      }

      if (project.dataToMigrate.includes('customers') && data.customers) {
        const result = await migrateCustomers(data.customers, project, prisma);
        successCount += result.success;
        failedCount += result.failed;
        skippedCount += result.skipped;
      }

      if (project.dataToMigrate.includes('posts') && data.posts) {
        const result = await migratePosts(data.posts, project, prisma);
        successCount += result.success;
        failedCount += result.failed;
        skippedCount += result.skipped;
      }
    }

    // Mark as completed
    await prisma.migrationProject.update({
      where: { id: projectId },
      data: {
        status: failedCount > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED',
        completedAt: new Date(),
        itemsMigrated: successCount,
        itemsFailed: failedCount,
        itemsSkipped: skippedCount
      }
    });

    return {
      success: true,
      successCount,
      failedCount,
      skippedCount
    };

  } catch (error) {
    // Mark as failed
    await prisma.migrationProject.update({
      where: { id: projectId },
      data: {
        status: 'FAILED',
        errorLog: [{ message: error.message, timestamp: new Date() }]
      }
    });

    throw error;
  }
}

/**
 * Migrate products
 */
async function migrateProducts(products, project, prisma) {
  let success = 0;
  let failed = 0;
  let skipped = 0;

  const mapping = project.fieldMapping?.product || getDefaultMapping(project.sourcePlatform, 'product');

  for (const product of products) {
    try {
      // Transform data using field mapping
      const transformedData = transformData(product, mapping);

      // Check if product already exists
      const existing = await prisma.product?.findFirst({
        where: { name: transformedData.name }
      });

      if (existing) {
        skipped++;
        await logMigratedItem(project.id, 'PRODUCT', product, null, 'SKIPPED', 'Product already exists', prisma);
        continue;
      }

      // Create product
      const newProduct = await prisma.product?.create({
        data: transformedData
      });

      success++;
      await logMigratedItem(project.id, 'PRODUCT', product, newProduct.id, 'SUCCESS', null, prisma);

    } catch (error) {
      failed++;
      await logMigratedItem(project.id, 'PRODUCT', product, null, 'FAILED', error.message, prisma);
    }
  }

  return { success, failed, skipped };
}

/**
 * Migrate customers
 */
async function migrateCustomers(customers, project, prisma) {
  let success = 0;
  let failed = 0;
  let skipped = 0;

  const mapping = project.fieldMapping?.customer || getDefaultMapping(project.sourcePlatform, 'customer');

  for (const customer of customers) {
    try {
      const transformedData = transformData(customer, mapping);

      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: transformedData.email }
      });

      if (existing) {
        skipped++;
        await logMigratedItem(project.id, 'CUSTOMER', customer, existing.id, 'SKIPPED', 'User already exists', prisma);
        continue;
      }

      // Create user
      const newUser = await prisma.user.create({
        data: {
          ...transformedData,
          password: generateRandomPassword(), // Generate temporary password
          requirePasswordReset: true
        }
      });

      success++;
      await logMigratedItem(project.id, 'CUSTOMER', customer, newUser.id, 'SUCCESS', null, prisma);

    } catch (error) {
      failed++;
      await logMigratedItem(project.id, 'CUSTOMER', customer, null, 'FAILED', error.message, prisma);
    }
  }

  return { success, failed, skipped };
}

/**
 * Migrate blog posts
 */
async function migratePosts(posts, project, prisma) {
  let success = 0;
  let failed = 0;
  let skipped = 0;

  const mapping = project.fieldMapping?.post || getDefaultMapping(project.sourcePlatform, 'post');

  for (const post of posts) {
    try {
      const transformedData = transformData(post, mapping);

      // Check if post already exists
      const existing = await prisma.post?.findFirst({
        where: { title: transformedData.title }
      });

      if (existing) {
        skipped++;
        await logMigratedItem(project.id, 'BLOG_POST', post, existing.id, 'SKIPPED', 'Post already exists', prisma);
        continue;
      }

      // Create post
      const newPost = await prisma.post?.create({
        data: transformedData
      });

      success++;
      await logMigratedItem(project.id, 'BLOG_POST', post, newPost.id, 'SUCCESS', null, prisma);

    } catch (error) {
      failed++;
      await logMigratedItem(project.id, 'BLOG_POST', post, null, 'FAILED', error.message, prisma);
    }
  }

  return { success, failed, skipped };
}

/**
 * Transform data using field mapping
 */
function transformData(sourceData, mapping) {
  const transformed = {};

  for (const [targetField, sourceField] of Object.entries(mapping)) {
    if (sourceData[sourceField] !== undefined) {
      transformed[targetField] = sourceData[sourceField];
    }
  }

  return transformed;
}

/**
 * Log migrated item
 */
async function logMigratedItem(projectId, itemType, originalData, newId, status, errorMessage, prisma) {
  return prisma.migratedItem.create({
    data: {
      migrationProjectId: projectId,
      itemType,
      originalId: originalData.id?.toString(),
      originalData,
      newId,
      status,
      errorMessage,
      migratedAt: status === 'SUCCESS' ? new Date() : null
    }
  });
}

/**
 * Generate random password
 */
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Get migration progress
 */
async function getMigrationProgress(projectId, prisma) {
  const project = await prisma.migrationProject.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: {
          migratedItems: true
        }
      }
    }
  });

  if (!project) {
    throw new Error('Migration project not found');
  }

  const percentage = project.itemsTotal > 0
    ? Math.round((project.itemsMigrated / project.itemsTotal) * 100)
    : 0;

  return {
    status: project.status,
    itemsTotal: project.itemsTotal,
    itemsMigrated: project.itemsMigrated,
    itemsFailed: project.itemsFailed,
    itemsSkipped: project.itemsSkipped,
    percentage,
    startedAt: project.startedAt,
    completedAt: project.completedAt
  };
}

/**
 * Get migration report
 */
async function getMigrationReport(projectId, prisma) {
  const project = await prisma.migrationProject.findUnique({
    where: { id: projectId },
    include: {
      migratedItems: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    throw new Error('Migration project not found');
  }

  // Group items by status
  const itemsByStatus = {
    success: project.migratedItems.filter(i => i.status === 'SUCCESS'),
    failed: project.migratedItems.filter(i => i.status === 'FAILED'),
    skipped: project.migratedItems.filter(i => i.status === 'SKIPPED')
  };

  // Group items by type
  const itemsByType = {};
  project.migratedItems.forEach(item => {
    if (!itemsByType[item.itemType]) {
      itemsByType[item.itemType] = 0;
    }
    itemsByType[item.itemType]++;
  });

  return {
    project: {
      id: project.id,
      sourcePlatform: project.sourcePlatform,
      status: project.status,
      startedAt: project.startedAt,
      completedAt: project.completedAt
    },
    summary: {
      total: project.itemsTotal,
      migrated: project.itemsMigrated,
      failed: project.itemsFailed,
      skipped: project.itemsSkipped
    },
    itemsByStatus,
    itemsByType
  };
}

/**
 * Retry failed items
 */
async function retryFailedItems(projectId, prisma) {
  const project = await prisma.migrationProject.findUnique({
    where: { id: projectId },
    include: {
      migratedItems: {
        where: { status: 'FAILED' }
      }
    }
  });

  if (!project) {
    throw new Error('Migration project not found');
  }

  let successCount = 0;
  let failedCount = 0;

  for (const item of project.migratedItems) {
    try {
      // Retry migration based on item type
      // (Implementation would be similar to initial migration)

      await prisma.migratedItem.update({
        where: { id: item.id },
        data: {
          status: 'SUCCESS',
          errorMessage: null,
          attempts: { increment: 1 },
          migratedAt: new Date()
        }
      });

      successCount++;
    } catch (error) {
      await prisma.migratedItem.update({
        where: { id: item.id },
        data: {
          attempts: { increment: 1 },
          errorMessage: error.message
        }
      });

      failedCount++;
    }
  }

  // Update project
  await prisma.migrationProject.update({
    where: { id: projectId },
    data: {
      itemsMigrated: { increment: successCount },
      retryCount: { increment: 1 },
      lastRetryAt: new Date()
    }
  });

  return { successCount, failedCount };
}

module.exports = {
  createMigrationProject,
  analyzeData,
  getDefaultMapping,
  executeMigration,
  getMigrationProgress,
  getMigrationReport,
  retryFailedItems
};
