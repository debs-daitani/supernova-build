import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrate = async () => {
  console.log('🚀 Starting database migration...\n');

  try {
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Database migration completed successfully!\n');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - conversations');
    console.log('   - messages');
    console.log('   - memories');
    console.log('   - content_library');
    console.log('   - user_content_progress');
    console.log('   - marketplace_listings');
    console.log('   - marketplace_messages');
    console.log('   - marketplace_reviews');
    console.log('   - direct_messages');
    console.log('   - forum_categories');
    console.log('   - forum_posts');
    console.log('   - forum_comments');
    console.log('   - forum_post_likes');
    console.log('   - forum_comment_likes');
    console.log('   - notifications');
    console.log('   - payments');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
