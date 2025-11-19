-- SUPERNova AI Memory System - Database Initialization Script
-- PostgreSQL Database Schema
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- Set timezone
SET timezone = 'UTC';

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_conversations INTEGER DEFAULT 0 NOT NULL,
    total_messages INTEGER DEFAULT 0 NOT NULL,
    preferences JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,

    CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'deleted'))
);

-- Indexes for users
CREATE INDEX idx_users_email ON supernova_users(email);
CREATE INDEX idx_users_last_active ON supernova_users(last_active_at DESC);
CREATE INDEX idx_users_status ON supernova_users(status);
CREATE INDEX idx_users_preferences ON supernova_users USING GIN(preferences);

-- ============================================
-- Conversations Table
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_conversations (
    id BIGSERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    summary TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    tags TEXT[],
    sentiment VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    context TEXT,
    is_archived BOOLEAN DEFAULT FALSE,

    CONSTRAINT conversations_status_check CHECK (status IN ('active', 'ended', 'archived')),
    CONSTRAINT conversations_sentiment_check CHECK (sentiment IN ('positive', 'neutral', 'negative', NULL)),
    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE CASCADE
);

-- Indexes for conversations
CREATE INDEX idx_conversations_user_id ON supernova_conversations(user_id);
CREATE INDEX idx_conversations_last_message ON supernova_conversations(last_message_at DESC);
CREATE INDEX idx_conversations_status ON supernova_conversations(status);
CREATE INDEX idx_conversations_user_last_message ON supernova_conversations(user_id, last_message_at DESC);
CREATE INDEX idx_conversations_tags ON supernova_conversations USING GIN(tags);
CREATE INDEX idx_conversations_is_archived ON supernova_conversations(is_archived);

-- ============================================
-- Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    token_count INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(1536), -- For vector similarity search (requires pgvector extension)
    attachments JSONB DEFAULT '[]'::jsonb,
    in_reply_to VARCHAR(255),
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT messages_role_check CHECK (role IN ('user', 'assistant', 'system')),
    FOREIGN KEY (conversation_id) REFERENCES supernova_conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (in_reply_to) REFERENCES supernova_messages(message_id) ON DELETE SET NULL
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation ON supernova_messages(conversation_id);
CREATE INDEX idx_messages_user ON supernova_messages(user_id);
CREATE INDEX idx_messages_timestamp ON supernova_messages(timestamp DESC);
CREATE INDEX idx_messages_conversation_timestamp ON supernova_messages(conversation_id, timestamp DESC);
CREATE INDEX idx_messages_role ON supernova_messages(role);
CREATE INDEX idx_messages_content_search ON supernova_messages USING GIN(to_tsvector('english', content));

-- ============================================
-- Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    conversation_id VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    device_info JSONB DEFAULT '{}'::jsonb,
    working_memory JSONB DEFAULT '{}'::jsonb,
    context_window JSONB DEFAULT '[]'::jsonb,
    state JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT sessions_status_check CHECK (status IN ('active', 'expired', 'ended')),
    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES supernova_conversations(conversation_id) ON DELETE SET NULL
);

-- Indexes for sessions
CREATE INDEX idx_sessions_user ON supernova_sessions(user_id);
CREATE INDEX idx_sessions_conversation ON supernova_sessions(conversation_id);
CREATE INDEX idx_sessions_expires_at ON supernova_sessions(expires_at);
CREATE INDEX idx_sessions_status ON supernova_sessions(status);
CREATE INDEX idx_sessions_last_activity ON supernova_sessions(last_activity_at DESC);

-- ============================================
-- Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(100),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT FALSE,
    theme VARCHAR(50) DEFAULT 'auto',
    conversation_style VARCHAR(50) DEFAULT 'casual',
    response_length VARCHAR(50) DEFAULT 'medium',
    memory_retention INTEGER DEFAULT 90,
    personal_info JSONB DEFAULT '{}'::jsonb,
    custom_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT preferences_theme_check CHECK (theme IN ('light', 'dark', 'auto')),
    CONSTRAINT preferences_style_check CHECK (conversation_style IN ('formal', 'casual', 'technical')),
    CONSTRAINT preferences_length_check CHECK (response_length IN ('short', 'medium', 'long')),
    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE CASCADE
);

-- Indexes for preferences
CREATE INDEX idx_preferences_user ON supernova_preferences(user_id);
CREATE INDEX idx_preferences_updated ON supernova_preferences(updated_at DESC);

-- ============================================
-- Knowledge Base Table
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_knowledge (
    id BIGSERIAL PRIMARY KEY,
    knowledge_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    key VARCHAR(500) NOT NULL,
    value TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    source VARCHAR(500),
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_confirmed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    tags TEXT[],

    CONSTRAINT knowledge_confidence_check CHECK (confidence >= 0 AND confidence <= 1),
    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE CASCADE
);

-- Indexes for knowledge
CREATE INDEX idx_knowledge_user ON supernova_knowledge(user_id);
CREATE INDEX idx_knowledge_category ON supernova_knowledge(category);
CREATE INDEX idx_knowledge_key ON supernova_knowledge(key);
CREATE INDEX idx_knowledge_user_category ON supernova_knowledge(user_id, category);
CREATE INDEX idx_knowledge_expires ON supernova_knowledge(expires_at);
CREATE INDEX idx_knowledge_tags ON supernova_knowledge USING GIN(tags);
CREATE INDEX idx_knowledge_value_search ON supernova_knowledge USING GIN(to_tsvector('english', value));

-- ============================================
-- Context Snapshots Table
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_context (
    id BIGSERIAL PRIMARY KEY,
    context_id VARCHAR(255) UNIQUE NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    message_ids JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    entities JSONB DEFAULT '{}'::jsonb,
    topics TEXT[],
    sentiment VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    token_count INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT context_sentiment_check CHECK (sentiment IN ('positive', 'neutral', 'negative', NULL)),
    FOREIGN KEY (conversation_id) REFERENCES supernova_conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE CASCADE
);

-- Indexes for context
CREATE INDEX idx_context_conversation ON supernova_context(conversation_id);
CREATE INDEX idx_context_user ON supernova_context(user_id);
CREATE INDEX idx_context_created ON supernova_context(created_at DESC);
CREATE INDEX idx_context_expires ON supernova_context(expires_at);
CREATE INDEX idx_context_topics ON supernova_context USING GIN(topics);

-- ============================================
-- Metadata Table (Generic key-value store)
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_metadata (
    id BIGSERIAL PRIMARY KEY,
    metadata_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    user_id VARCHAR(255),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE CASCADE
);

-- Indexes for metadata
CREATE INDEX idx_metadata_type ON supernova_metadata(type);
CREATE INDEX idx_metadata_entity ON supernova_metadata(entity_type, entity_id);
CREATE INDEX idx_metadata_user ON supernova_metadata(user_id);
CREATE INDEX idx_metadata_expires ON supernova_metadata(expires_at);
CREATE INDEX idx_metadata_data ON supernova_metadata USING GIN(data);

-- ============================================
-- Audit Log Table (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS supernova_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (user_id) REFERENCES supernova_users(user_id) ON DELETE SET NULL
);

-- Indexes for audit log
CREATE INDEX idx_audit_user ON supernova_audit_log(user_id);
CREATE INDEX idx_audit_action ON supernova_audit_log(action);
CREATE INDEX idx_audit_entity ON supernova_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON supernova_audit_log(created_at DESC);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for preferences updated_at
CREATE TRIGGER update_preferences_updated_at
    BEFORE UPDATE ON supernova_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment message count in conversations
CREATE OR REPLACE FUNCTION increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE supernova_conversations
    SET message_count = message_count + 1,
        last_message_at = NEW.timestamp
    WHERE conversation_id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation message count
CREATE TRIGGER update_conversation_message_count
    AFTER INSERT ON supernova_messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_conversation_message_count();

-- Function to update user last activity
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE supernova_users
    SET last_active_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user activity on message insert
CREATE TRIGGER update_user_activity_on_message
    AFTER INSERT ON supernova_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- ============================================
-- Views for Common Queries
-- ============================================

-- Active sessions view
CREATE OR REPLACE VIEW active_sessions AS
SELECT
    s.session_id,
    s.user_id,
    u.email,
    u.display_name,
    s.conversation_id,
    s.started_at,
    s.last_activity_at,
    s.expires_at,
    EXTRACT(EPOCH FROM (s.expires_at - CURRENT_TIMESTAMP)) as seconds_until_expiry
FROM supernova_sessions s
JOIN supernova_users u ON s.user_id = u.user_id
WHERE s.status = 'active' AND s.expires_at > CURRENT_TIMESTAMP;

-- Recent conversations view
CREATE OR REPLACE VIEW recent_conversations AS
SELECT
    c.conversation_id,
    c.user_id,
    u.display_name,
    c.title,
    c.message_count,
    c.started_at,
    c.last_message_at,
    c.status,
    c.sentiment,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - c.last_message_at)) as seconds_since_last_message
FROM supernova_conversations c
JOIN supernova_users u ON c.user_id = u.user_id
WHERE c.is_archived = FALSE
ORDER BY c.last_message_at DESC;

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT
    u.user_id,
    u.email,
    u.display_name,
    u.total_conversations,
    u.total_messages,
    u.created_at,
    u.last_active_at,
    COUNT(DISTINCT c.conversation_id) as active_conversations,
    COALESCE(SUM(c.message_count), 0) as total_conversation_messages
FROM supernova_users u
LEFT JOIN supernova_conversations c ON u.user_id = c.user_id AND c.status = 'active'
GROUP BY u.id, u.user_id, u.email, u.display_name, u.total_conversations, u.total_messages, u.created_at, u.last_active_at;

-- ============================================
-- Grant Permissions (adjust as needed)
-- ============================================

-- Grant necessary permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO supernova_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO supernova_app;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE supernova_users IS 'Stores user profiles and metadata';
COMMENT ON TABLE supernova_conversations IS 'Stores conversation metadata and summaries';
COMMENT ON TABLE supernova_messages IS 'Stores individual messages in conversations';
COMMENT ON TABLE supernova_sessions IS 'Stores active user sessions';
COMMENT ON TABLE supernova_preferences IS 'Stores user preferences and settings';
COMMENT ON TABLE supernova_knowledge IS 'Stores learned knowledge about users';
COMMENT ON TABLE supernova_context IS 'Stores context snapshots for conversations';
COMMENT ON TABLE supernova_metadata IS 'Generic metadata storage for various entities';
COMMENT ON TABLE supernova_audit_log IS 'Audit trail for important actions';

-- Database initialization complete
SELECT 'SUPERNova AI Database initialized successfully!' as status;
