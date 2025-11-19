# SUPERNova AI Memory System & The dAItaniverse Platform

## Overview

SUPERNova AI is an intelligent conversational AI system designed for the Wix platform. This repository contains:

1. **SUPERNova AI Memory System** - Comprehensive memory architecture for conversational AI
2. **The dAItaniverse Platform** - Complete business coaching and book writing platform
3. **Book Writing Suite** - Premium add-on for fiction and non-fiction authors

## Key Features

### SUPERNova AI Memory System

- **Multi-User Support**: Individual memory spaces for each user
- **Conversation History**: Complete conversation tracking with metadata
- **Context Awareness**: Short-term and long-term memory management
- **User Preferences**: Personalized settings and preferences storage
- **Knowledge Base**: Persistent knowledge and learned information
- **Session Management**: Active session tracking and management
- **Wix Data Integration**: Optimized for Wix Data Collections

### Pinterest Integration

- **Account Connection**: OAuth 2.0 Pinterest integration
- **Pin Creation & Publishing**: Create, edit, and publish pins to Pinterest
- **Smart Scheduling**: Auto-schedule pins at optimal times based on analytics
- **Queue Management**: Add pins to queue for automatic distribution
- **Analytics Dashboard**: Track impressions, saves, clicks, and engagement rates
- **Board Management**: Create and organize Pinterest boards
- **Top Performers**: Identify best performing pins and boards
- **RSS Auto-Pinning**: Automatically create pins from blog RSS feeds
- **Repinning Automation**: Recycle top-performing content
- **Bulk Operations**: Create multiple pins at once
- **Content Templates**: Pre-designed pin templates
- **Trend Analysis**: Growth metrics and engagement trends

### Book Writing Suite (Premium Add-On - £10/month)

- **Project Management**: Track multiple book projects simultaneously
- **Chapter & Scene Organization**: Structure your book with chapters and scenes
- **Character Development**: Comprehensive character profiles and relationship mapping (fiction)
- **World Building**: Organize locations, magic systems, cultures, and more (fiction)
- **Plot Thread Tracking**: Monitor main plots, subplots, and character arcs
- **Timeline Management**: Ensure chronological consistency
- **Research Organization**: Manage sources, case studies, and expert interviews (non-fiction)
- **Book Proposal Generator**: Create professional book proposals (non-fiction)
- **Mind Mapping**: Visual brainstorming and story planning
- **Writing Sessions**: Track productivity, word count goals, and writing streaks
- **Distraction-Free Writing**: Focused writing mode with auto-save
- **Analysis Tools**: Plot hole detection, pacing analysis, readability scores
- **Publishing Prep**: Query letters, agent tracking, publishing checklists
- **Manuscript Export**: Format and export your completed manuscript

## Architecture Components

1. **Database Schema** (`/schema`) - Wix Data Collections definitions
2. **Data Structures** (`/src/types`) - TypeScript type definitions
3. **Memory Manager** (`/src/memory`) - Core memory operations
4. **API Services** (`/src/services`) - Wix backend API endpoints
5. **Frontend Integration** (`/src/public`) - Client-side integration

## Documentation

### SUPERNova AI Memory System
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [API Reference](./docs/API_REFERENCE.md)

### Pinterest Integration
- [Pinterest Integration Guide](./docs/PINTEREST_INTEGRATION.md) - Complete implementation guide
- [Example Implementation](./examples/pinterest-implementation.js) - Full code examples

### Book Writing Suite
- [Book Writing Suite Guide](./docs/BOOK_WRITING_SUITE.md) - Complete implementation guide
- [Example Implementation](./examples/book-writing-implementation.js) - Full code examples

## Quick Start

See [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) for detailed setup instructions.

## Platform

Built for Wix with:
- Wix Data Collections
- Velo API (wix-data)
- Wix Backend
- Wix Secrets Manager (for API keys)
