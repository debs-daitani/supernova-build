/**
 * Migration Guide Seed Data
 * Pre-populated export guides for major platforms
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const guides = [
  {
    platform: 'SHOPIFY',
    title: 'Export Data from Shopify',
    description: 'Learn how to export your products, customers, and orders from Shopify',
    steps: [
      {
        title: 'Access Shopify Admin',
        description: 'Log into your Shopify admin panel at yourstorename.myshopify.com/admin',
        notes: ['Make sure you have admin access', 'Use your Shopify account credentials']
      },
      {
        title: 'Export Products',
        description: 'Navigate to Products > All Products\nClick "Export" button in the top right\nSelect "All products" and "CSV file"\nClick "Export products"',
        notes: [
          'The export will include all product variants',
          'Images will need to be downloaded separately',
          'You\'ll receive a download link via email if the export is large'
        ]
      },
      {
        title: 'Export Customers',
        description: 'Go to Customers section\nClick "Export" button\nSelect "All customers" and "CSV file"\nChoose what customer data to include\nClick "Export customers"',
        notes: ['Customer passwords cannot be exported for security', 'Export includes order history']
      },
      {
        title: 'Export Orders',
        description: 'Navigate to Orders\nClick "Export" button\nSelect date range or "All orders"\nChoose "CSV for Excel, Numbers, or other spreadsheet programs"\nClick "Export orders"',
        notes: ['Large order histories may take time to process']
      },
      {
        title: 'Download Files',
        description: 'Check your email for export links\nDownload all CSV files to your computer\nKeep files organized in a folder',
        notes: ['Export links expire after 14 days', 'Save files in a safe location']
      }
    ],
    tips: [
      'Export during off-peak hours to avoid impacting your store performance',
      'Create a checklist of all data you need to export',
      'Test with a small subset of data first',
      'Keep backups of all exported files',
      'Note any custom fields or metafields you\'re using'
    ],
    commonIssues: [
      {
        problem: 'Export button is grayed out',
        solution: 'You may not have the required permissions. Contact the store owner to grant you export permissions or use a staff account with full permissions.'
      },
      {
        problem: 'CSV file shows garbled text',
        solution: 'Open the CSV file in a text editor first, or import it into Excel/Google Sheets using UTF-8 encoding.'
      },
      {
        problem: 'Missing product images',
        solution: 'Product images must be exported separately. Use a bulk image downloader or export via Shopify API.'
      }
    ],
    officialDocsUrl: 'https://help.shopify.com/en/manual/products/import-export'
  },
  {
    platform: 'WORDPRESS',
    title: 'Export Data from WordPress',
    description: 'Export your WordPress content including posts, pages, and media',
    steps: [
      {
        title: 'Login to WordPress Admin',
        description: 'Access your WordPress dashboard at yoursite.com/wp-admin\nLogin with your administrator credentials'
      },
      {
        title: 'Export WordPress Content',
        description: 'Navigate to Tools > Export\nSelect "All content" or choose specific content types\nClick "Download Export File"',
        notes: [
          'Exports in WordPress XML format',
          'Includes posts, pages, comments, custom fields, and categories',
          'Media files are not included in the export'
        ]
      },
      {
        title: 'Export Media Files (if using WooCommerce)',
        description: 'For WooCommerce products:\nGo to WooCommerce > Products\nClick "Export"\nSelect product data to include\nChoose CSV format\nClick "Generate CSV"',
        notes: ['Product images need to be downloaded separately']
      },
      {
        title: 'Download Media Library',
        description: 'Use an FTP client (FileZilla, Cyberduck)\nConnect to your hosting server\nNavigate to /wp-content/uploads/\nDownload the entire uploads folder',
        notes: ['This folder contains all uploaded images and files', 'May be several GB in size']
      },
      {
        title: 'Export Database (Optional)',
        description: 'Access phpMyAdmin from your hosting control panel\nSelect your WordPress database\nClick "Export"\nUse "Quick" method with SQL format\nClick "Go" to download',
        notes: ['Only needed for complex custom data', 'Contains all WordPress data including settings']
      }
    ],
    tips: [
      'Install the "All-in-One WP Migration" plugin for easier exports',
      'Clean up spam comments and unused media before exporting',
      'Document any custom post types or taxonomies you use',
      'Export custom CSS/JavaScript if you have any',
      'Take note of active plugins and their settings'
    ],
    commonIssues: [
      {
        problem: 'Export file is too large',
        solution: 'Export content in batches by date range or post type. Use FTP for media files instead of trying to export them through WordPress.'
      },
      {
        problem: 'Cannot access Tools > Export',
        solution: 'You need administrator role. Contact the site owner or check your user role under Users > Your Profile.'
      },
      {
        problem: 'WooCommerce products not in export',
        solution: 'Use WooCommerce\'s built-in product export feature under WooCommerce > Products > Export, not the WordPress exporter.'
      }
    ],
    officialDocsUrl: 'https://wordpress.org/support/article/tools-export-screen/'
  },
  {
    platform: 'WIX',
    title: 'Export Data from Wix',
    description: 'Download your Wix site data and content',
    steps: [
      {
        title: 'Login to Wix Dashboard',
        description: 'Go to wix.com and login to your account\nSelect the site you want to export data from'
      },
      {
        title: 'Export Site Content',
        description: 'Unfortunately, Wix does not provide a direct export function.\nYou\'ll need to manually copy content from each page.\nGo to each page in the editor and copy the text content.',
        notes: [
          'Wix is a closed platform with limited export options',
          'Consider using a web scraper tool to save time',
          'You may need to recreate complex layouts manually'
        ]
      },
      {
        title: 'Export Wix Stores Products',
        description: 'If you have Wix Stores:\nGo to your site\'s dashboard\nClick on "Store Products"\nClick "More Actions" (3 dots)\nSelect "Export Products to CSV"',
        notes: ['Product images URLs will be included', 'You\'ll need to download images separately']
      },
      {
        title: 'Export Contacts/Customers',
        description: 'Navigate to Contacts in your dashboard\nClick "Filters" and select the contacts to export\nClick "More Actions"\nSelect "Export"',
        notes: ['Limited to 1000 contacts per export']
      },
      {
        title: 'Download Images',
        description: 'Right-click on images in your Wix editor\nSelect "Copy image URL"\nUse a bulk image downloader tool\nOr manually download each important image',
        notes: ['Save images with descriptive filenames', 'Maintain folder structure for organization']
      }
    ],
    tips: [
      'Take screenshots of your Wix site design for reference',
      'Document all Wix apps and integrations you use',
      'Export blog posts individually if you have a Wix blog',
      'Consider using Wix\'s "Site Audit" feature to get a content overview',
      'Make a list of all pages and their URLs'
    ],
    commonIssues: [
      {
        problem: 'No bulk export option',
        solution: 'Wix intentionally limits exports to keep users on their platform. You\'ll need to manually copy content or use third-party scraping tools.'
      },
      {
        problem: 'Cannot export site design/layout',
        solution: 'Wix layouts are proprietary and cannot be exported. Take detailed screenshots and notes to recreate the design on your new platform.'
      },
      {
        problem: 'Product export missing data',
        solution: 'Export multiple times and verify data. Some fields may need to be manually noted, especially custom fields or Wix-specific features.'
      }
    ],
    officialDocsUrl: 'https://support.wix.com/en/article/exporting-site-data'
  },
  {
    platform: 'MAILCHIMP',
    title: 'Export Data from Mailchimp',
    description: 'Export your email subscribers and campaign data from Mailchimp',
    steps: [
      {
        title: 'Login to Mailchimp',
        description: 'Go to mailchimp.com and login to your account'
      },
      {
        title: 'Export Audience/Subscribers',
        description: 'Click on "Audience" in the left menu\nClick "Audience dashboard"\nClick "Manage Audience" dropdown\nSelect "Export audience"\nChoose "Export as CSV"',
        notes: [
          'Includes email addresses, names, and custom fields',
          'Merge tags will be exported',
          'Subscriber status (subscribed, unsubscribed) is included'
        ]
      },
      {
        title: 'Export Multiple Lists',
        description: 'Repeat the export process for each list you have\nKeep files organized by list name\nNote which lists are active vs archived',
        notes: ['Export one list at a time', 'Check for duplicate subscribers across lists']
      },
      {
        title: 'Export Campaign Data (Optional)',
        description: 'Go to Campaigns\nClick "View Report" on each campaign\nClick "Export" to save campaign statistics\nSave as CSV',
        notes: ['Campaign content cannot be directly exported', 'You can view and copy email HTML']
      },
      {
        title: 'Download Email Templates',
        description: 'Go to Templates\nOpen each template you want to save\nCopy the HTML code or export as file\nSave template screenshots for reference',
        notes: ['Not all template features will transfer to other platforms']
      }
    ],
    tips: [
      'Clean your list before exporting to remove invalid emails',
      'Document automation workflows you want to recreate',
      'Export segment definitions for future reference',
      'Note any integrations with other services',
      'Save examples of your best-performing campaigns'
    ],
    commonIssues: [
      {
        problem: 'Export file is too large',
        solution: 'Break large audiences into segments and export them separately. Mailchimp may time out on very large exports.'
      },
      {
        problem: 'Cannot export automation workflows',
        solution: 'Automation workflows cannot be directly exported. Take screenshots and document the logic, triggers, and email content for each automation.'
      },
      {
        problem: 'Missing custom field data',
        solution: 'Ensure you\'re exporting with "Include all fields" option selected. Some data may be in merge tags that need special handling.'
      }
    ],
    officialDocsUrl: 'https://mailchimp.com/help/view-export-contacts/'
  },
  {
    platform: 'SQUARESPACE',
    title: 'Export Data from Squarespace',
    description: 'Export content and commerce data from Squarespace',
    steps: [
      {
        title: 'Login to Squarespace',
        description: 'Go to squarespace.com/login\nLogin with your credentials\nSelect your website'
      },
      {
        title: 'Export WordPress XML',
        description: 'Go to Settings > Advanced > Import / Export\nClick "Export"\nSelect "WordPress" format\nDownload the XML file',
        notes: [
          'Includes pages, blog posts, and galleries',
          'Media files are not included',
          'Commerce products require separate export'
        ]
      },
      {
        title: 'Export Commerce Products',
        description: 'Navigate to Commerce > Inventory\nClick "Import & Export"\nClick "Export All Products"\nDownload CSV file',
        notes: ['Includes product details, variants, and pricing', 'Images are referenced by URL']
      },
      {
        title: 'Export Customer Orders',
        description: 'Go to Commerce > Orders\nUse filters to select orders\nClick "Export"\nChoose CSV format\nDownload file',
        notes: ['Can export by date range', 'Includes order details and customer info']
      },
      {
        title: 'Download Images',
        description: 'Squarespace doesn\'t provide bulk image download\nYou can:\n- Use browser extensions to download images\n- Use a website downloader tool\n- Manually download critical images',
        notes: ['Image URLs are included in exports', 'Original image quality is maintained']
      }
    ],
    tips: [
      'Export before canceling your Squarespace subscription',
      'Document custom CSS and JavaScript code',
      'Save form submissions separately if needed',
      'Take screenshots of your site design',
      'Note any third-party integrations'
    ],
    commonIssues: [
      {
        problem: 'WordPress export missing content',
        solution: 'The WordPress export only includes certain content types. You may need to manually copy or screenshot some pages, especially Index pages or custom sections.'
      },
      {
        problem: 'Cannot export site design',
        solution: 'Squarespace templates are proprietary. Take detailed screenshots, document fonts and colors, and note layout structures to recreate elsewhere.'
      },
      {
        problem: 'Product export missing images',
        solution: 'Images are referenced by URL in the CSV. Use the URLs to download images, or use a bulk downloader tool with the provided URLs.'
      }
    ],
    officialDocsUrl: 'https://support.squarespace.com/hc/en-us/articles/206566687'
  }
];

async function seedMigrationGuides() {
  console.log('Seeding migration guides...');

  for (const guide of guides) {
    try {
      await prisma.migrationGuide.upsert({
        where: { platform: guide.platform },
        update: guide,
        create: guide
      });
      console.log(`✓ Seeded guide for ${guide.platform}`);
    } catch (error) {
      console.error(`✗ Error seeding guide for ${guide.platform}:`, error.message);
    }
  }

  console.log('Migration guides seeded successfully!');
}

// Run if called directly
if (require.main === module) {
  seedMigrationGuides()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { seedMigrationGuides, guides };
