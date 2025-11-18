# SUPERNova AI Memory System

## Overview

SUPERNova AI is an intelligent conversational AI system designed for the Wix platform. This repository contains the comprehensive memory system architecture that enables SUPERNova to maintain context, remember user preferences, and provide personalized experiences across sessions.

## Key Features

- **Multi-User Support**: Individual memory spaces for each user
- **Conversation History**: Complete conversation tracking with metadata
- **Context Awareness**: Short-term and long-term memory management
- **User Preferences**: Personalized settings and preferences storage
- **Knowledge Base**: Persistent knowledge and learned information
- **Session Management**: Active session tracking and management
- **Wix Data Integration**: Optimized for Wix Data Collections

## Architecture Components

1. **Database Schema** (`/schema`) - Wix Data Collections definitions
2. **Data Structures** (`/src/types`) - TypeScript type definitions
3. **Memory Manager** (`/src/memory`) - Core memory operations
4. **API Services** (`/src/services`) - Wix backend API endpoints
5. **Frontend Integration** (`/src/public`) - Client-side integration

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [API Reference](./docs/API_REFERENCE.md)

## Quick Start

See [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) for detailed setup instructions.

## Platform

Built for Wix with:
- Wix Data Collections
- Velo API (wix-data)
- Wix Backend
- Wix Secrets Manager (for API keys)
