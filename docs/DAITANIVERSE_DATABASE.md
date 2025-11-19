# The dAItaniverse - Database Architecture & Schema

## Table of Contents
1. [Overview](#overview)
2. [Database Design Principles](#database-design-principles)
3. [Schema Overview](#schema-overview)
4. [Complete Table Definitions](#complete-table-definitions)
5. [Indexes & Performance](#indexes--performance)
6. [Data Relationships](#data-relationships)
7. [Migrations Strategy](#migrations-strategy)
8. [Backup & Recovery](#backup--recovery)

---

## Overview

### Database Selection: PostgreSQL 15+

**Why PostgreSQL?**
- ✅ ACID compliance and data integrity
- ✅ Advanced features (JSON, full-text search, vector extensions)
- ✅ Excellent performance for complex queries
- ✅ Strong ecosystem and tooling
- ✅ pgvector extension for AI embeddings
- ✅ Mature replication and backup solutions

### Extensions Used
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram text search
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance tracking
```

---

## Database Design Principles

### Design Patterns
1. **Normalization**: Third normal form (3NF) with selective denormalization
2. **Soft Deletes**: Critical data uses `deleted_at` instead of hard deletes
3. **Timestamps**: All tables include `created_at` and `updated_at`
4. **UUIDs**: Primary keys use UUID v4 for distributed systems
5. **Audit Trails**: Critical operations logged in audit tables
6. **Immutability**: Historical data (messages, payments) never updated

### Naming Conventions
- **Tables**: Plural, snake_case (e.g., `users`, `conversations`)
- **Columns**: snake_case (e.g., `user_id`, `created_at`)
- **Indexes**: `idx_<table>_<column(s)>` (e.g., `idx_users_email`)
- **Foreign Keys**: `fk_<table>_<referenced_table>` (e.g., `fk_messages_users`)
- **Unique Constraints**: `uq_<table>_<column(s)>` (e.g., `uq_users_email`)

---

## Schema Overview

### Entity Relationship Overview

```
┌─────────────┐
│    users    │──────────────┐
└─────────────┘              │
       │                     │
       │ 1:N                 │ 1:1
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│   agents    │      │subscriptions│
└─────────────┘      └─────────────┘
       │                     │
       │ 1:N                 │ 1:N
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│conversations│      │  payments   │
└─────────────┘      └─────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐      ┌─────────────┐
│  messages   │──N:1─│  embeddings │
└─────────────┘      └─────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐
│ attachments │
└─────────────┘
```

### Table Summary

| Table | Purpose | Estimated Size |
|-------|---------|----------------|
| `users` | User accounts and profiles | ~10K rows |
| `agents` | AI agent configurations | ~50K rows |
| `conversations` | Conversation metadata | ~100K rows |
| `messages` | Individual messages | ~10M rows |
| `subscriptions` | User subscriptions | ~10K rows |
| `payments` | Payment history | ~50K rows |
| `embeddings` | Vector embeddings | ~5M rows |
| `sessions` | Active user sessions | ~5K rows |
| `api_keys` | API key management | ~1K rows |
| `audit_logs` | System audit trail | ~1M rows |
| `analytics_events` | Usage analytics | ~50M rows |

---

## Complete Table Definitions

### 1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  password_hash VARCHAR(255), -- NULL for OAuth-only users

  -- Profile
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,

  -- OAuth
  google_id VARCHAR(255) UNIQUE,
  github_id VARCHAR(255) UNIQUE,

  -- Preferences
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  theme VARCHAR(20) DEFAULT 'light',

  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, business, enterprise
  subscription_status VARCHAR(20) DEFAULT 'active', -- active, past_due, canceled

  -- Usage tracking
  message_count INTEGER DEFAULT 0,
  message_limit INTEGER DEFAULT 50,
  last_message_at TIMESTAMP,

  -- Security
  last_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Agents Table

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,

  -- Configuration
  model VARCHAR(50) DEFAULT 'claude-3-5-sonnet-20241022',
  system_prompt TEXT NOT NULL,
  temperature DECIMAL(3,2) DEFAULT 1.0 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 4096 CHECK (max_tokens > 0 AND max_tokens <= 200000),

  -- Features
  streaming_enabled BOOLEAN DEFAULT TRUE,
  memory_enabled BOOLEAN DEFAULT TRUE,
  function_calling_enabled BOOLEAN DEFAULT FALSE,

  -- Personality
  personality_traits JSONB DEFAULT '{}',
  -- Example: {"tone": "professional", "verbosity": "concise", "creativity": "high"}

  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  clone_count INTEGER DEFAULT 0,

  -- Usage tracking
  conversation_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,

  -- Metadata
  tags VARCHAR(50)[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_agents_user_id ON agents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_is_public ON agents(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_agents_is_template ON agents(is_template) WHERE is_template = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);

-- Trigger
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Conversations Table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Basic Info
  title VARCHAR(255),

  -- State
  status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted

  -- Message tracking
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,

  -- Summary (generated periodically)
  summary TEXT,
  summary_generated_at TIMESTAMP,

  -- Context management
  context_window_size INTEGER DEFAULT 20, -- Number of messages to include in context

  -- Metadata
  metadata JSONB DEFAULT '{}',
  -- Example: {"source": "web", "ip": "192.168.1.1", "userAgent": "..."}

  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Composite indexes
CREATE INDEX idx_conversations_user_status ON conversations(user_id, status) WHERE deleted_at IS NULL;

-- Trigger
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Message data
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Token usage
  token_count INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,

  -- AI metadata (for assistant messages)
  model VARCHAR(50),
  temperature DECIMAL(3,2),
  finish_reason VARCHAR(20), -- stop, length, content_filter

  -- Streaming
  is_streaming BOOLEAN DEFAULT FALSE,
  streamed_at TIMESTAMP,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Feedback
  user_feedback VARCHAR(20), -- thumbs_up, thumbs_down
  user_feedback_comment TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Partial index for assistant messages with errors
CREATE INDEX idx_messages_errors ON messages(conversation_id) WHERE error_message IS NOT NULL;

-- Trigger
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 5. Embeddings Table (pgvector)

```sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Embedding data
  embedding vector(1536), -- Dimension depends on embedding model
  embedding_model VARCHAR(50) DEFAULT 'text-embedding-ada-002',

  -- Text content (for reference)
  text_content TEXT NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX idx_embeddings_conversation_id ON embeddings(conversation_id);
CREATE INDEX idx_embeddings_message_id ON embeddings(message_id);

-- Vector similarity index (IVFFlat for fast approximate search)
CREATE INDEX idx_embeddings_vector ON embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Alternative: HNSW index (more accurate but slower inserts)
-- CREATE INDEX idx_embeddings_vector ON embeddings
--   USING hnsw (embedding vector_cosine_ops);
```

### 6. Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe data
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),

  -- Subscription details
  plan VARCHAR(20) NOT NULL, -- free, pro, business, enterprise
  status VARCHAR(20) NOT NULL, -- active, past_due, canceled, trialing

  -- Billing
  billing_interval VARCHAR(20), -- month, year
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Usage limits
  message_limit INTEGER,
  agent_limit INTEGER,
  api_access BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,

  -- Dates
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  canceled_at TIMESTAMP,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 7. Payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Stripe data
  stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_invoice_id VARCHAR(255),

  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL, -- succeeded, pending, failed, refunded

  -- Payment method
  payment_method VARCHAR(50), -- card, bank_transfer
  last4 VARCHAR(4), -- Last 4 digits of card

  -- Dates
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,

  -- Metadata
  description TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_stripe_payment_id ON payments(stripe_payment_id);

-- Trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 8. Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session data
  refresh_token_hash VARCHAR(255) NOT NULL,

  -- Device info
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),

  -- Geolocation
  country VARCHAR(2),
  city VARCHAR(100),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Dates
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_sessions_refresh_token_hash ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_last_activity_at ON sessions(last_activity_at DESC);

-- Cleanup old sessions
CREATE INDEX idx_sessions_cleanup ON sessions(expires_at) WHERE is_active = FALSE;
```

### 9. API Keys Table

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Key data
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(10) NOT NULL, -- First 8 chars for identification
  name VARCHAR(100) NOT NULL,

  -- Permissions
  scopes VARCHAR(50)[] DEFAULT '{}',
  -- Example: ['conversations:read', 'conversations:write', 'agents:read']

  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,

  -- Usage tracking
  last_used_at TIMESTAMP,
  usage_count BIGINT DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

-- Trigger
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 10. Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- What
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- user, agent, conversation, payment
  entity_id UUID,

  -- Details
  changes JSONB, -- Before/after values
  metadata JSONB DEFAULT '{}',

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- When
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Partition by month for better performance
-- CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 11. Analytics Events Table

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User (nullable for anonymous events)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Event data
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),

  -- Properties
  properties JSONB DEFAULT '{}',

  -- Session tracking
  session_id UUID,

  -- Device info
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),

  -- Geolocation
  country VARCHAR(2),
  city VARCHAR(100),

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- GIN index for JSONB queries
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- Consider partitioning by date for large datasets
```

### 12. Attachments Table

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- File data
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,

  -- Storage
  storage_provider VARCHAR(50) DEFAULT 's3', -- s3, gcs, azure
  storage_key TEXT NOT NULL, -- S3 key or path
  storage_url TEXT NOT NULL,

  -- Processing
  is_processed BOOLEAN DEFAULT FALSE,
  processing_status VARCHAR(20), -- pending, processing, completed, failed
  processing_error TEXT,

  -- Thumbnails (for images)
  thumbnail_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_attachments_message_id ON attachments(message_id);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);
CREATE INDEX idx_attachments_created_at ON attachments(created_at DESC);

-- Trigger
CREATE TRIGGER update_attachments_updated_at
  BEFORE UPDATE ON attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Indexes & Performance

### Index Strategy

#### Primary Indexes
- All primary keys are automatically indexed (UUID)
- Foreign keys are indexed for join performance

#### Query-Based Indexes
```sql
-- User lookup by email (login)
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Conversation list for user
CREATE INDEX idx_conversations_user_status ON conversations(user_id, status)
  WHERE deleted_at IS NULL;

-- Message retrieval for conversation
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at);

-- Recent conversations
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC NULLS LAST);
```

#### Partial Indexes (Conditional)
```sql
-- Only index active users
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;

-- Only index public agents
CREATE INDEX idx_agents_public ON agents(id, name)
  WHERE is_public = TRUE AND deleted_at IS NULL;

-- Only index failed messages
CREATE INDEX idx_messages_errors ON messages(conversation_id)
  WHERE error_message IS NOT NULL;
```

#### GIN Indexes (JSONB, Arrays)
```sql
-- Search in JSONB metadata
CREATE INDEX idx_agents_metadata ON agents USING GIN(metadata);

-- Search in array tags
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);

-- Full-text search on message content
CREATE INDEX idx_messages_content_search ON messages
  USING GIN(to_tsvector('english', content));
```

### Query Optimization Examples

#### Efficient Conversation List Query
```sql
-- BAD: N+1 query problem
SELECT * FROM conversations WHERE user_id = $1;
-- Then fetch messages for each conversation separately

-- GOOD: Single query with aggregation
SELECT
  c.*,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.user_id = $1 AND c.deleted_at IS NULL
GROUP BY c.id
ORDER BY last_message_at DESC NULLS LAST
LIMIT 20;
```

#### Vector Similarity Search
```sql
-- Find similar messages for context
SELECT
  m.content,
  1 - (e.embedding <=> $1::vector) AS similarity
FROM embeddings e
JOIN messages m ON m.id = e.message_id
WHERE e.user_id = $2
  AND 1 - (e.embedding <=> $1::vector) > 0.7  -- Similarity threshold
ORDER BY e.embedding <=> $1::vector
LIMIT 10;
```

---

## Data Relationships

### Foreign Key Constraints

```sql
-- Cascade deletes: When user is deleted, delete all related data
ALTER TABLE agents
  ADD CONSTRAINT fk_agents_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversations
  ADD CONSTRAINT fk_conversations_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Set NULL: Keep record but remove reference
ALTER TABLE audit_logs
  ADD CONSTRAINT fk_audit_logs_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

### Data Integrity Constraints

```sql
-- Check constraints
ALTER TABLE agents
  ADD CONSTRAINT check_temperature
  CHECK (temperature >= 0 AND temperature <= 2);

ALTER TABLE agents
  ADD CONSTRAINT check_max_tokens
  CHECK (max_tokens > 0 AND max_tokens <= 200000);

-- Enum constraints
ALTER TABLE messages
  ADD CONSTRAINT check_role
  CHECK (role IN ('user', 'assistant', 'system'));

ALTER TABLE payments
  ADD CONSTRAINT check_amount
  CHECK (amount >= 0);
```

---

## Migrations Strategy

### Migration Tools
- **Tool**: Prisma Migrate or node-pg-migrate
- **Versioning**: Sequential numbering (001, 002, 003...)
- **Rollback**: Every migration has a down/rollback script

### Migration Example (Prisma)
```typescript
// prisma/migrations/001_initial_schema/migration.sql

-- CreateExtensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  // ...rest of schema
);

// ...rest of tables
```

### Migration Best Practices

1. **Never modify existing migrations** - Always create new ones
2. **Test migrations** - On staging before production
3. **Backup before migrate** - Always backup production DB
4. **Lock during migration** - Use advisory locks for concurrent safety
5. **Monitor migration time** - Some operations lock tables

### Safe Migration Patterns

```sql
-- SAFE: Add nullable column
ALTER TABLE users ADD COLUMN new_field VARCHAR(100);

-- SAFE: Add index concurrently
CREATE INDEX CONCURRENTLY idx_users_new_field ON users(new_field);

-- UNSAFE: Add NOT NULL column without default
-- ALTER TABLE users ADD COLUMN required_field VARCHAR(100) NOT NULL;

-- SAFE: Add NOT NULL in steps
ALTER TABLE users ADD COLUMN required_field VARCHAR(100);
UPDATE users SET required_field = 'default_value' WHERE required_field IS NULL;
ALTER TABLE users ALTER COLUMN required_field SET NOT NULL;
```

---

## Backup & Recovery

### Backup Strategy

#### Automated Backups (RDS)
- **Frequency**: Daily automated snapshots
- **Retention**: 35 days
- **Type**: Full database snapshot
- **Window**: 3:00 AM - 4:00 AM UTC (low traffic)

#### Point-in-Time Recovery (PITR)
- **Enabled**: Yes (via RDS)
- **Retention**: 35 days
- **Granularity**: 5-minute intervals
- **Use Case**: Recover from accidental data deletion

#### Manual Backups
```bash
# Full database backup
pg_dump -h localhost -U postgres -F c -b -v -f "backup_$(date +%Y%m%d_%H%M%S).backup" daitaniverse

# Schema-only backup
pg_dump -h localhost -U postgres -s -f "schema_$(date +%Y%m%d).sql" daitaniverse

# Specific table backup
pg_dump -h localhost -U postgres -t messages -F c -f "messages_backup.backup" daitaniverse
```

### Recovery Procedures

#### Full Database Restore
```bash
# Restore from backup file
pg_restore -h localhost -U postgres -d daitaniverse -v backup_20240115_120000.backup

# Restore from SQL dump
psql -h localhost -U postgres -d daitaniverse -f schema_20240115.sql
```

#### Point-in-Time Recovery
```sql
-- Using AWS RDS Console
-- 1. Select DB instance
-- 2. Choose "Restore to point in time"
-- 3. Select timestamp
-- 4. Create new DB instance
```

### Disaster Recovery Plan

| Scenario | Recovery Method | RTO | RPO |
|----------|----------------|-----|-----|
| Accidental table drop | PITR | 30 min | 5 min |
| Database corruption | Snapshot restore | 1 hour | 24 hours |
| Region failure | Multi-region replica | 2 hours | 1 hour |
| Ransomware | Offsite backup | 4 hours | 24 hours |

---

## Performance Monitoring

### Key Metrics to Track

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Slow queries (requires pg_stat_statements)
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  n_dead_tup as dead_tuples
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### Maintenance Tasks

```sql
-- Regular VACUUM (prevents bloat)
VACUUM ANALYZE users;
VACUUM ANALYZE messages;

-- Reindex (if index bloat detected)
REINDEX TABLE messages;

-- Update statistics
ANALYZE users;
```

---

## Summary

This database architecture provides:

✅ **Scalable Schema**: Handles millions of messages and users
✅ **High Performance**: Optimized indexes and query patterns
✅ **Data Integrity**: Foreign keys, constraints, and validation
✅ **AI-Ready**: pgvector for semantic search
✅ **Audit Trail**: Complete audit logging system
✅ **Security**: Encryption, soft deletes, secure sessions
✅ **Analytics**: Comprehensive event tracking
✅ **Backup**: Automated backups with PITR

**Total Tables**: 12 core tables
**Estimated Database Size**: ~50GB at 10K users, ~500GB at 100K users
**Expected Query Performance**: P95 < 50ms with proper indexes
