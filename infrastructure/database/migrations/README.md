# Database Migrations

This directory contains database migration scripts for the SUPERNova AI Memory System.

## Migration Strategy

We use sequential numbered migrations to track database schema changes over time.

### Naming Convention

```
YYYYMMDD_HHMMSS_description.sql
```

Example: `20250118_120000_add_user_timezone.sql`

## Running Migrations

### Manual Execution

```bash
# Connect to PostgreSQL
psql -h localhost -U supernova -d supernova_db

# Run a migration
\i /path/to/migration/file.sql
```

### Docker Environment

```bash
# Migrations in init folder run automatically on first container start
docker-compose up -d postgres

# For manual migrations
docker exec -i supernova-postgres psql -U supernova -d supernova_db < migration_file.sql
```

### Production Deployment

For production, use a migration tool like:
- Flyway
- Liquibase
- node-pg-migrate
- Knex.js migrations

## Migration Best Practices

1. **Always test migrations** in development before production
2. **Write rollback scripts** for each migration
3. **Use transactions** where possible
4. **Avoid destructive changes** without data backup
5. **Document complex migrations** with comments
6. **Version control** all migration scripts

## Example Migration

```sql
-- Migration: Add user timezone support
-- Date: 2025-01-18
-- Author: DevOps Team

BEGIN;

-- Add timezone column
ALTER TABLE supernova_users
ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC';

-- Create index
CREATE INDEX idx_users_timezone ON supernova_users(timezone);

-- Update existing users
UPDATE supernova_users
SET timezone = 'UTC'
WHERE timezone IS NULL;

COMMIT;
```

## Rollback Example

```sql
-- Rollback: Remove user timezone support
-- Date: 2025-01-18

BEGIN;

-- Drop index
DROP INDEX IF EXISTS idx_users_timezone;

-- Remove column
ALTER TABLE supernova_users
DROP COLUMN IF EXISTS timezone;

COMMIT;
```

## Migration Status Tracking

Consider creating a migrations table:

```sql
CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE
);
```

## Current Schema Version

**Version**: 1.0.0
**Last Updated**: 2025-01-18
**Initialized**: See `init/01-init-database.sql`
