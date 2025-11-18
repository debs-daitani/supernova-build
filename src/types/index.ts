/**
 * SUPERNova AI Memory System - Type Definitions
 *
 * This file contains all TypeScript type definitions for the memory system
 */

// ============================================================================
// Base Types
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'suspended';
export type ConversationStatus = 'active' | 'paused' | 'ended' | 'archived';
export type SessionStatus = 'active' | 'expired' | 'ended';
export type MessageRole = 'user' | 'assistant' | 'system';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type KnowledgeCategory = 'fact' | 'preference' | 'goal' | 'interest' | 'habit' | 'relationship' | 'other';
export type MetadataType = 'summary' | 'analytics' | 'system' | 'custom';
export type EntityType = 'user' | 'conversation' | 'message' | 'session';
export type Theme = 'light' | 'dark' | 'auto';
export type ConversationStyle = 'formal' | 'casual' | 'technical' | 'friendly';
export type ResponseLength = 'short' | 'medium' | 'long';

// ============================================================================
// User Types
// ============================================================================

export interface User {
  _id: string;
  userId: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  lastActiveAt: Date;
  totalConversations: number;
  totalMessages: number;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  status: UserStatus;
}

export interface UserCreateInput {
  userId: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UserUpdateInput {
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  lastActiveAt?: Date;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  status?: UserStatus;
}

// ============================================================================
// Conversation Types
// ============================================================================

export interface Conversation {
  _id: string;
  conversationId: string;
  userId: string;
  title?: string;
  summary?: string;
  startedAt: Date;
  lastMessageAt: Date;
  endedAt?: Date;
  messageCount: number;
  status: ConversationStatus;
  tags?: string[];
  sentiment?: Sentiment;
  metadata?: Record<string, any>;
  context?: string;
  isArchived: boolean;
}

export interface ConversationCreateInput {
  userId: string;
  title?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ConversationUpdateInput {
  title?: string;
  summary?: string;
  lastMessageAt?: Date;
  endedAt?: Date;
  messageCount?: number;
  status?: ConversationStatus;
  tags?: string[];
  sentiment?: Sentiment;
  metadata?: Record<string, any>;
  context?: string;
  isArchived?: boolean;
}

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  _id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  tokenCount?: number;
  metadata?: Record<string, any>;
  embedding?: number[];
  attachments?: Attachment[];
  inReplyTo?: string;
  edited?: boolean;
  editedAt?: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface MessageCreateInput {
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  tokenCount?: number;
  metadata?: Record<string, any>;
  attachments?: Attachment[];
  inReplyTo?: string;
}

export interface MessageUpdateInput {
  content?: string;
  metadata?: Record<string, any>;
  edited?: boolean;
  editedAt?: Date;
}

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  _id: string;
  sessionId: string;
  userId: string;
  conversationId?: string;
  startedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  status: SessionStatus;
  deviceInfo?: DeviceInfo;
  workingMemory?: Message[];
  contextWindow?: string[];
  state?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  ip?: string;
}

export interface SessionCreateInput {
  userId: string;
  conversationId?: string;
  deviceInfo?: DeviceInfo;
  metadata?: Record<string, any>;
}

export interface SessionUpdateInput {
  conversationId?: string;
  lastActivityAt?: Date;
  expiresAt?: Date;
  status?: SessionStatus;
  workingMemory?: Message[];
  contextWindow?: string[];
  state?: Record<string, any>;
  metadata?: Record<string, any>;
}

// ============================================================================
// Preference Types
// ============================================================================

export interface Preferences {
  _id: string;
  userId: string;
  language?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  theme?: Theme;
  conversationStyle?: ConversationStyle;
  responseLength?: ResponseLength;
  memoryRetention?: number;
  personalInfo?: PersonalInfo;
  customSettings?: Record<string, any>;
  updatedAt: Date;
}

export interface PersonalInfo {
  name?: string;
  location?: string;
  occupation?: string;
  interests?: string[];
  birthday?: string;
  [key: string]: any;
}

export interface PreferencesCreateInput {
  userId: string;
  language?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  theme?: Theme;
  conversationStyle?: ConversationStyle;
  responseLength?: ResponseLength;
  memoryRetention?: number;
  personalInfo?: PersonalInfo;
  customSettings?: Record<string, any>;
}

export interface PreferencesUpdateInput {
  language?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  theme?: Theme;
  conversationStyle?: ConversationStyle;
  responseLength?: ResponseLength;
  memoryRetention?: number;
  personalInfo?: PersonalInfo;
  customSettings?: Record<string, any>;
}

// ============================================================================
// Knowledge Types
// ============================================================================

export interface Knowledge {
  _id: string;
  knowledgeId: string;
  userId: string;
  category: KnowledgeCategory;
  key: string;
  value: string;
  confidence?: number;
  source?: string;
  learnedAt: Date;
  lastConfirmedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface KnowledgeCreateInput {
  userId: string;
  category: KnowledgeCategory;
  key: string;
  value: string;
  confidence?: number;
  source?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface KnowledgeUpdateInput {
  value?: string;
  confidence?: number;
  lastConfirmedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
}

// ============================================================================
// Context Types
// ============================================================================

export interface Context {
  _id: string;
  contextId: string;
  conversationId: string;
  userId: string;
  messageIds: string[];
  summary?: string;
  entities?: Entity[];
  topics?: string[];
  sentiment?: Sentiment;
  createdAt: Date;
  expiresAt: Date;
  tokenCount?: number;
  metadata?: Record<string, any>;
}

export interface Entity {
  type: 'person' | 'place' | 'organization' | 'date' | 'event' | 'other';
  value: string;
  confidence?: number;
}

export interface ContextCreateInput {
  conversationId: string;
  userId: string;
  messageIds: string[];
  summary?: string;
  entities?: Entity[];
  topics?: string[];
  sentiment?: Sentiment;
  tokenCount?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Metadata Types
// ============================================================================

export interface Metadata {
  _id: string;
  metadataId: string;
  type: MetadataType;
  entityType: EntityType;
  entityId?: string;
  userId?: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}

export interface MetadataCreateInput {
  type: MetadataType;
  entityType: EntityType;
  entityId?: string;
  userId?: string;
  data: Record<string, any>;
  expiresAt?: Date;
}

// ============================================================================
// Memory System Types
// ============================================================================

export interface MemoryContext {
  // Short-term memory (current session)
  recentMessages: Message[];
  activeSession: Session | null;
  workingMemory: Message[];

  // Long-term memory (persistent)
  conversationHistory: Conversation[];
  userKnowledge: Knowledge[];
  userPreferences: Preferences | null;

  // Context
  currentConversation: Conversation | null;
  relevantContext: Context[];
}

export interface MemoryRetrievalOptions {
  userId: string;
  conversationId?: string;
  limit?: number;
  includeArchived?: boolean;
  timeRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface ConversationSearchOptions {
  userId: string;
  query?: string;
  tags?: string[];
  status?: ConversationStatus[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface MessageSearchOptions {
  userId: string;
  conversationId?: string;
  query?: string;
  role?: MessageRole;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: Date;
    requestId?: string;
    pagination?: PaginationInfo;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface IDGenerator {
  generateUserId(): string;
  generateConversationId(): string;
  generateMessageId(): string;
  generateSessionId(): string;
  generateKnowledgeId(): string;
  generateContextId(): string;
  generateMetadataId(): string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
}

export interface MemoryStats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  activeSessions: number;
  storageUsed: number;
  averageMessagesPerConversation: number;
  averageConversationsPerUser: number;
}
