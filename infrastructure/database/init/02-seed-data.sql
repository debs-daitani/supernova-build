-- SUPERNova AI Memory System - Seed Data
-- Initial data for development and testing
-- Version: 1.0.0

-- ============================================
-- Seed Test Users
-- ============================================

-- Admin/Test User
INSERT INTO supernova_users (
    user_id,
    email,
    display_name,
    first_name,
    last_name,
    preferences,
    metadata,
    status
) VALUES (
    'user_test_admin',
    'admin@supernova-ai.com',
    'Admin User',
    'Admin',
    'User',
    '{"theme": "dark", "notifications": true}'::jsonb,
    '{"role": "admin", "test_account": true}'::jsonb,
    'active'
) ON CONFLICT (user_id) DO NOTHING;

-- Demo User
INSERT INTO supernova_users (
    user_id,
    email,
    display_name,
    first_name,
    last_name,
    preferences,
    metadata,
    status
) VALUES (
    'user_demo_001',
    'demo@supernova-ai.com',
    'Demo User',
    'Demo',
    'User',
    '{"theme": "auto", "notifications": true}'::jsonb,
    '{"demo_account": true}'::jsonb,
    'active'
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- Seed Test Preferences
-- ============================================

INSERT INTO supernova_preferences (
    user_id,
    language,
    timezone,
    notifications_enabled,
    email_notifications,
    theme,
    conversation_style,
    response_length,
    memory_retention,
    personal_info,
    custom_settings
) VALUES (
    'user_test_admin',
    'en',
    'America/New_York',
    true,
    true,
    'dark',
    'technical',
    'medium',
    90,
    '{"occupation": "Software Developer"}'::jsonb,
    '{"advanced_features": true}'::jsonb
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO supernova_preferences (
    user_id,
    language,
    timezone,
    notifications_enabled,
    email_notifications,
    theme,
    conversation_style,
    response_length,
    memory_retention
) VALUES (
    'user_demo_001',
    'en',
    'UTC',
    true,
    false,
    'auto',
    'casual',
    'medium',
    30
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- Seed Sample Conversation
-- ============================================

INSERT INTO supernova_conversations (
    conversation_id,
    user_id,
    title,
    summary,
    started_at,
    last_message_at,
    message_count,
    status,
    tags,
    sentiment
) VALUES (
    'conv_demo_001',
    'user_demo_001',
    'Getting Started with SUPERNova',
    'Introduction to SUPERNova AI capabilities and features',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    4,
    'active',
    ARRAY['introduction', 'demo', 'getting-started'],
    'positive'
) ON CONFLICT (conversation_id) DO NOTHING;

-- ============================================
-- Seed Sample Messages
-- ============================================

INSERT INTO supernova_messages (
    message_id,
    conversation_id,
    user_id,
    role,
    content,
    timestamp,
    token_count
) VALUES
(
    'msg_demo_001',
    'conv_demo_001',
    'user_demo_001',
    'user',
    'Hello! I would like to learn more about SUPERNova AI.',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    12
),
(
    'msg_demo_002',
    'conv_demo_001',
    'user_demo_001',
    'assistant',
    'Hello! I''m SUPERNova AI, your intelligent conversational assistant. I''m designed to remember our conversations, understand your preferences, and provide personalized responses. I can help you with various tasks, answer questions, and maintain context across multiple sessions. What would you like to know more about?',
    CURRENT_TIMESTAMP - INTERVAL '59 minutes',
    62
),
(
    'msg_demo_003',
    'conv_demo_001',
    'user_demo_001',
    'user',
    'How does your memory system work?',
    CURRENT_TIMESTAMP - INTERVAL '45 minutes',
    8
),
(
    'msg_demo_004',
    'conv_demo_001',
    'user_demo_001',
    'assistant',
    'My memory system works on multiple levels:

1. **Short-term memory**: I remember the current conversation and recent exchanges
2. **Long-term memory**: I store important information from our past conversations
3. **User preferences**: I learn and remember your preferences over time
4. **Knowledge base**: I retain facts and information you share with me

This allows me to provide contextual, personalized responses and maintain continuity across our conversations. Is there anything specific about the memory system you''d like to explore?',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    108
) ON CONFLICT (message_id) DO NOTHING;

-- ============================================
-- Seed Sample Knowledge
-- ============================================

INSERT INTO supernova_knowledge (
    knowledge_id,
    user_id,
    category,
    key,
    value,
    confidence,
    source,
    learned_at,
    tags
) VALUES
(
    'know_demo_001',
    'user_demo_001',
    'preferences',
    'preferred_greeting',
    'casual_hello',
    0.95,
    'conv_demo_001',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    ARRAY['greeting', 'communication-style']
),
(
    'know_demo_002',
    'user_demo_001',
    'interests',
    'topic_interest',
    'artificial_intelligence',
    0.90,
    'conv_demo_001',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    ARRAY['interests', 'topics']
) ON CONFLICT (knowledge_id) DO NOTHING;

-- ============================================
-- Seed Sample Context
-- ============================================

INSERT INTO supernova_context (
    context_id,
    conversation_id,
    user_id,
    message_ids,
    summary,
    entities,
    topics,
    sentiment,
    created_at,
    expires_at,
    token_count
) VALUES (
    'ctx_demo_001',
    'conv_demo_001',
    'user_demo_001',
    '["msg_demo_001", "msg_demo_002", "msg_demo_003", "msg_demo_004"]'::jsonb,
    'User learning about SUPERNova AI memory system capabilities',
    '{"user_intent": "learning", "topics": ["memory", "AI"]}'::jsonb,
    ARRAY['introduction', 'memory-system', 'capabilities'],
    'positive',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '24 hours',
    190
) ON CONFLICT (context_id) DO NOTHING;

-- ============================================
-- Seed Sample Session
-- ============================================

INSERT INTO supernova_sessions (
    session_id,
    user_id,
    conversation_id,
    started_at,
    last_activity_at,
    expires_at,
    status,
    device_info,
    working_memory,
    state
) VALUES (
    'sess_demo_001',
    'user_demo_001',
    'conv_demo_001',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP - INTERVAL '5 minutes',
    CURRENT_TIMESTAMP + INTERVAL '23 hours',
    'active',
    '{"browser": "Chrome", "os": "macOS", "device_type": "desktop"}'::jsonb,
    '{"current_topic": "memory_system", "context_loaded": true}'::jsonb,
    '{"conversation_active": true, "messages_count": 4}'::jsonb
) ON CONFLICT (session_id) DO NOTHING;

-- ============================================
-- Seed System Metadata
-- ============================================

INSERT INTO supernova_metadata (
    metadata_id,
    type,
    entity_type,
    entity_id,
    user_id,
    data,
    created_at
) VALUES
(
    'meta_system_001',
    'system',
    'database',
    'main',
    NULL,
    '{"schema_version": "1.0.0", "initialized_at": "' || CURRENT_TIMESTAMP || '", "seed_data": true}'::jsonb,
    CURRENT_TIMESTAMP
),
(
    'meta_config_001',
    'configuration',
    'system',
    'main',
    NULL,
    '{"max_conversation_age_days": 90, "max_session_duration_hours": 24, "cleanup_interval_hours": 1}'::jsonb,
    CURRENT_TIMESTAMP
) ON CONFLICT (metadata_id) DO NOTHING;

-- ============================================
-- Statistics and Verification
-- ============================================

-- Update user statistics
UPDATE supernova_users
SET total_conversations = (
    SELECT COUNT(*)
    FROM supernova_conversations
    WHERE supernova_conversations.user_id = supernova_users.user_id
),
total_messages = (
    SELECT COUNT(*)
    FROM supernova_messages
    WHERE supernova_messages.user_id = supernova_users.user_id
);

-- Display seed data summary
SELECT
    'Seed Data Summary' as info,
    (SELECT COUNT(*) FROM supernova_users) as users_count,
    (SELECT COUNT(*) FROM supernova_conversations) as conversations_count,
    (SELECT COUNT(*) FROM supernova_messages) as messages_count,
    (SELECT COUNT(*) FROM supernova_sessions) as active_sessions,
    (SELECT COUNT(*) FROM supernova_knowledge) as knowledge_entries,
    (SELECT COUNT(*) FROM supernova_preferences) as user_preferences;

-- Seed data insertion complete
SELECT 'SUPERNova AI Seed Data loaded successfully!' as status;
