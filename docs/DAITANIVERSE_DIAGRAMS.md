# The dAItaniverse - System Diagrams

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Infrastructure Diagram](#infrastructure-diagram)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Component Diagrams](#component-diagrams)
6. [Deployment Diagram](#deployment-diagram)
7. [Network Architecture](#network-architecture)

---

## High-Level Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Web App     │  │  Mobile App  │  │  API Clients │                  │
│  │  (React)     │  │  (Future)    │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS/WSS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API Gateway / Load Balancer                      │
│                         (AWS ALB + API Gateway)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   REST API   │  │  WebSocket   │  │   Static     │
        │   Service    │  │   Service    │  │   Assets     │
        │              │  │              │  │   (CDN)      │
        └──────────────┘  └──────────────┘  └──────────────┘
                    │              │
                    └──────────────┤
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Application Services Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Auth       │  │   User       │  │  Conversation│                  │
│  │   Service    │  │   Service    │  │   Service    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Agent      │  │   Payment    │  │  Analytics   │                  │
│  │   Service    │  │   Service    │  │   Service    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Memory     │  │   AI         │  │  Email       │                  │
│  │   Service    │  │   Service    │  │   Service    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┬──────────────┐
                    ▼              ▼              ▼              ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
        │  PostgreSQL  │  │    Redis     │  │  S3      │  │ External │
        │  (Primary)   │  │    Cache     │  │  Storage │  │ Services │
        └──────────────┘  └──────────────┘  └──────────┘  └──────────┘
        ┌──────────────┐  ┌──────────────┐                      │
        │  PostgreSQL  │  │   Message    │                      ├─ Anthropic
        │  (Replica)   │  │   Queue      │                      ├─ Stripe
        └──────────────┘  │   (Bull)     │                      ├─ SendGrid
                          └──────────────┘                      └─ Mixpanel
```

---

## Infrastructure Diagram

### AWS Infrastructure
```
┌──────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud (us-east-1)                        │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         Route 53 (DNS)                            │   │
│  │                  daitaniverse.com → ALB                           │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                         │
│  ┌──────────────────────────────▼───────────────────────────────────┐   │
│  │              CloudFront CDN (Global Edge Locations)               │   │
│  │                   - Static assets (React build)                   │   │
│  │                   - SSL/TLS termination                           │   │
│  │                   - Caching & Compression                         │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                         │
│  ┌──────────────────────────────▼───────────────────────────────────┐   │
│  │              Application Load Balancer (Multi-AZ)                 │   │
│  │                   - Health checks                                 │   │
│  │                   - SSL/TLS termination                           │   │
│  │                   - Path-based routing                            │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                         │
│  ┌──────────────────────────────▼───────────────────────────────────┐   │
│  │              VPC (10.0.0.0/16) - 3 Availability Zones             │   │
│  │                                                                    │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │  Public Subnet  │  │  Public Subnet  │  │  Public Subnet  │  │   │
│  │  │   10.0.1.0/24   │  │   10.0.2.0/24   │  │   10.0.3.0/24   │  │   │
│  │  │   (NAT Gateway) │  │   (NAT Gateway) │  │   (NAT Gateway) │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  │                                                                    │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ Private Subnet  │  │ Private Subnet  │  │ Private Subnet  │  │   │
│  │  │  10.0.11.0/24   │  │  10.0.12.0/24   │  │  10.0.13.0/24   │  │   │
│  │  │                 │  │                 │  │                 │  │   │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │   │
│  │  │ │ EKS Cluster │ │  │ │ EKS Cluster │ │  │ │ EKS Cluster │ │  │   │
│  │  │ │             │ │  │ │             │ │  │ │             │ │  │   │
│  │  │ │  API Pods   │ │  │ │  API Pods   │ │  │ │  API Pods   │ │  │   │
│  │  │ │  WS Pods    │ │  │ │  WS Pods    │ │  │ │  WS Pods    │ │  │   │
│  │  │ │  Worker Pods│ │  │ │  Worker Pods│ │  │ │  Worker Pods│ │  │   │
│  │  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  │                                                                    │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │  Data Subnet    │  │  Data Subnet    │  │  Data Subnet    │  │   │
│  │  │  10.0.21.0/24   │  │  10.0.22.0/24   │  │  10.0.23.0/24   │  │   │
│  │  │                 │  │                 │  │                 │  │   │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │   │
│  │  │ │RDS Primary  │ │  │ │RDS Replica  │ │  │ │RDS Replica  │ │  │   │
│  │  │ │ PostgreSQL  │ │  │ │ PostgreSQL  │ │  │ │ PostgreSQL  │ │  │   │
│  │  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │  │   │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │   │
│  │  │ │ElastiCache  │ │  │ │ElastiCache  │ │  │ │ElastiCache  │ │  │   │
│  │  │ │   Redis     │ │  │ │   Redis     │ │  │ │   Redis     │ │  │   │
│  │  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                      Additional Services                         │   │
│  │                                                                  │   │
│  │  S3 Buckets:                 ECR (Container Registry)           │   │
│  │  - User uploads              - API images                       │   │
│  │  - Backups                   - WebSocket images                 │   │
│  │  - Static assets             - Worker images                    │   │
│  │                                                                  │   │
│  │  CloudWatch:                 Secrets Manager:                   │   │
│  │  - Logs                      - DB credentials                   │   │
│  │  - Metrics                   - API keys                         │   │
│  │  - Alarms                    - JWT secrets                      │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### User Authentication Flow
```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │  API    │                │  Auth   │
│         │                │ Gateway │                │ Service │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │  1. POST /auth/login     │                          │
     │  {email, password}       │                          │
     ├─────────────────────────>│                          │
     │                          │  2. Validate credentials │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  3. Query database       │
     │                          │     (PostgreSQL)         │
     │                          │                          │
     │                          │  4. Verify password      │
     │                          │     (bcrypt compare)     │
     │                          │                          │
     │                          │  5. Generate JWT tokens  │
     │                          │     - Access token       │
     │                          │     - Refresh token      │
     │                          │                          │
     │                          │  6. Create session       │
     │                          │     (Redis)              │
     │                          │                          │
     │                          │<─────────────────────────┤
     │  7. Return tokens        │  {user, tokens}          │
     │<─────────────────────────┤                          │
     │  {user, accessToken,     │                          │
     │   refreshToken}          │                          │
     │                          │                          │
     │  8. Store tokens         │                          │
     │     (secure cookie)      │                          │
     │                          │                          │
```

### Message Send & AI Response Flow
```
┌────────┐  ┌─────┐  ┌──────────┐  ┌──────┐  ┌──────────┐  ┌──────────┐
│ Client │  │ API │  │Conversation│  │  AI  │  │WebSocket │  │Anthropic │
│        │  │     │  │  Service   │  │Service│  │  Server  │  │   API    │
└───┬────┘  └──┬──┘  └─────┬────┘  └───┬──┘  └─────┬────┘  └─────┬────┘
    │          │           │            │           │             │
    │ 1. POST /messages    │            │           │             │
    │  {content}           │            │           │             │
    ├──────────>│          │            │           │             │
    │          │ 2. Create user message │           │             │
    │          ├──────────>│            │           │             │
    │          │           │ 3. Save to DB          │             │
    │          │           │  (PostgreSQL)          │             │
    │          │           │            │           │             │
    │          │<──────────┤            │           │             │
    │<──────────┤ 4. Return message     │           │             │
    │ {message}│           │            │           │             │
    │          │           │            │           │             │
    │          │ 5. Trigger AI generation           │             │
    │          ├───────────────────────>│           │             │
    │          │           │            │ 6. Build context        │
    │          │           │<───────────┤  (recent messages)      │
    │          │           │            │           │             │
    │          │           │            │ 7. Call Anthropic API   │
    │          │           │            ├──────────────────────────>
    │          │           │            │           │  {streaming} │
    │          │           │            │           │             │
    │ 8. WS: stream:start  │            │<──────────┤             │
    │<─────────────────────────────────────────────┤             │
    │          │           │            │ 9. Stream chunks        │
    │          │           │            │<─────────────────────────┤
    │ 10. WS: stream:chunk │            │           │  "Hello..."  │
    │<─────────────────────────────────────────────┤             │
    │ "Hello..." (repeat)  │            │           │             │
    │<─────────────────────────────────────────────┤             │
    │          │           │            │           │             │
    │          │           │            │ 11. Stream complete     │
    │          │           │            │<─────────────────────────┤
    │          │           │            │ 12. Save AI message     │
    │          │           │<───────────┤  to DB                  │
    │          │           │            │           │             │
    │ 13. WS: stream:end   │            │           │             │
    │<─────────────────────────────────────────────┤             │
    │ {messageId}          │            │           │             │
```

### Payment Subscription Flow
```
┌────────┐  ┌─────┐  ┌─────────┐  ┌────────┐  ┌──────────┐
│ Client │  │ API │  │ Payment │  │ Stripe │  │ Webhook  │
│        │  │     │  │ Service │  │        │  │ Handler  │
└───┬────┘  └──┬──┘  └────┬────┘  └───┬────┘  └─────┬────┘
    │          │          │            │             │
    │ 1. Click "Upgrade"  │            │             │
    │          │          │            │             │
    │ 2. POST /checkout   │            │             │
    │  {priceId}          │            │             │
    ├──────────>│         │            │             │
    │          │ 3. Get/Create customer│             │
    │          ├─────────>│            │             │
    │          │          │ 4. Create checkout       │
    │          │          ├───────────>│             │
    │          │          │            │             │
    │          │<─────────┤<───────────┤             │
    │<──────────┤ 5. Return checkout URL             │
    │ {url}    │          │            │             │
    │          │          │            │             │
    │ 6. Redirect to Stripe            │             │
    ├──────────────────────────────────>│             │
    │          │          │  Checkout  │             │
    │          │          │            │             │
    │ 7. Enter payment details          │             │
    ├───────────────────────────────────>│             │
    │          │          │            │             │
    │          │          │  8. Webhook: checkout.session.completed
    │          │          │            ├────────────>│
    │          │          │            │  9. Verify  │
    │          │          │            │     signature
    │          │          │<───────────────────────────┤
    │          │          │ 10. Update subscription   │
    │          │          │     in database           │
    │          │          │            │             │
    │<──────────────────────────────────┤             │
    │ 11. Redirect to success page      │             │
    │          │          │            │             │
```

---

## Sequence Diagrams

### Create Agent and Start Conversation
```
User → Frontend → API → AgentService → Database → ConversationService → AI Service

1. User clicks "Create Agent"
2. Frontend shows agent creation form
3. User fills in agent details (name, personality, model)
4. Frontend validates input
5. Frontend → API: POST /agents {name, systemPrompt, model, ...}
6. API → Middleware: Authenticate user
7. API → AgentService: createAgent(userId, agentData)
8. AgentService → Database: INSERT into agents table
9. Database → AgentService: Return agent record
10. AgentService → API: Return created agent
11. API → Frontend: 201 Created {agent}
12. Frontend redirects to chat page

13. User clicks "Start Conversation"
14. Frontend → API: POST /conversations {agentId}
15. API → ConversationService: createConversation(userId, agentId)
16. ConversationService → Database: INSERT into conversations table
17. Database → ConversationService: Return conversation record
18. ConversationService → API: Return created conversation
19. API → Frontend: 201 Created {conversation}
20. Frontend opens chat window

21. User types message and sends
22. Frontend → API: POST /conversations/:id/messages {content}
23. API → ConversationService: createMessage(conversationId, userId, content)
24. ConversationService → Database: INSERT into messages table
25. Database → ConversationService: Return message record
26. ConversationService → AI Service: generateResponse(conversationId)
27. AI Service → ConversationService: Build context from recent messages
28. AI Service → Anthropic API: POST /messages {messages, system}
29. Anthropic API → AI Service: Stream response chunks
30. AI Service → WebSocket: Emit chunks to client
31. Frontend → User: Display streaming response in real-time
32. AI Service → Database: Save complete AI response
33. WebSocket → Frontend: Emit stream:end event
```

---

## Component Diagrams

### Frontend Component Hierarchy
```
App
├── Router
│   ├── PublicRoutes
│   │   ├── Home
│   │   ├── Pricing
│   │   └── AuthLayout
│   │       ├── Login
│   │       └── Register
│   │
│   └── ProtectedRoutes (requires auth)
│       └── DashboardLayout
│           ├── Header
│           │   ├── Logo
│           │   ├── Navigation
│           │   └── UserMenu
│           │
│           ├── Sidebar
│           │   ├── ConversationList
│           │   │   └── ConversationItem[]
│           │   └── NewChatButton
│           │
│           └── MainContent
│               ├── Dashboard
│               │   ├── StatsCards
│               │   ├── UsageChart
│               │   └── RecentActivity
│               │
│               ├── Chat
│               │   ├── ChatHeader
│               │   ├── MessageList
│               │   │   ├── MessageBubble[]
│               │   │   ├── TypingIndicator
│               │   │   └── StreamingMessage
│               │   └── MessageInput
│               │       ├── Textarea
│               │       └── SendButton
│               │
│               ├── Agents
│               │   ├── AgentList
│               │   │   └── AgentCard[]
│               │   ├── AgentCreator
│               │   │   ├── BasicInfo
│               │   │   ├── ModelSelector
│               │   │   ├── PersonalityEditor
│               │   │   └── PreviewPane
│               │   └── AgentSettings
│               │
│               └── Settings
│                   ├── ProfileSettings
│                   ├── AccountSettings
│                   ├── BillingSettings
│                   │   ├── PricingTable
│                   │   ├── SubscriptionCard
│                   │   └── PaymentHistory
│                   └── APIKeys
```

### Backend Service Architecture
```
API Layer (Express Router)
    │
    ├── Middleware
    │   ├── Authentication (JWT)
    │   ├── Authorization (RBAC)
    │   ├── Rate Limiting
    │   ├── Validation (Zod)
    │   └── Error Handling
    │
    └── Controllers
        ├── AuthController
        ├── UserController
        ├── AgentController
        ├── ConversationController
        ├── MessageController
        ├── PaymentController
        └── AnalyticsController
            │
            ├── Service Layer
            │   ├── AuthService
            │   │   ├── Hash passwords
            │   │   ├── Generate tokens
            │   │   └── Verify credentials
            │   │
            │   ├── UserService
            │   │   ├── CRUD operations
            │   │   └── Profile management
            │   │
            │   ├── AgentService
            │   │   ├── Agent CRUD
            │   │   └── Template management
            │   │
            │   ├── ConversationService
            │   │   ├── Conversation CRUD
            │   │   └── Context management
            │   │
            │   ├── AIService
            │   │   ├── Call Anthropic API
            │   │   ├── Stream responses
            │   │   └── Token management
            │   │
            │   ├── MemoryService
            │   │   ├── Context assembly
            │   │   ├── Vector search
            │   │   └── Summarization
            │   │
            │   ├── PaymentService
            │   │   ├── Stripe integration
            │   │   ├── Subscription management
            │   │   └── Webhook handling
            │   │
            │   └── AnalyticsService
            │       ├── Usage tracking
            │       └── Metrics aggregation
            │
            └── Repository Layer
                ├── UserRepository
                ├── AgentRepository
                ├── ConversationRepository
                ├── MessageRepository
                ├── SubscriptionRepository
                └── PaymentRepository
                    │
                    └── Database (Prisma ORM)
                        └── PostgreSQL
```

---

## Deployment Diagram

### Kubernetes Deployment
```
┌────────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster (EKS)                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    Namespace: production                │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │              Ingress (ALB Ingress Controller)     │  │   │
│  │  │                  - SSL termination                │  │   │
│  │  │                  - Path-based routing             │  │   │
│  │  └──────────────────┬───────────────────────────────┘  │   │
│  │                     │                                   │   │
│  │  ┌──────────────────┼───────────────────────────────┐  │   │
│  │  │                  │       Services                 │  │   │
│  │  │  ┌───────────────▼────────────┐  ┌──────────────┐ │  │   │
│  │  │  │  API Service (ClusterIP)   │  │  WS Service  │ │  │   │
│  │  │  └───────────────┬────────────┘  │  (NodePort)  │ │  │   │
│  │  │                  │                └──────┬───────┘ │  │   │
│  │  └──────────────────┼───────────────────────┼─────────┘  │   │
│  │                     │                       │             │   │
│  │  ┌──────────────────▼───────────────────────▼─────────┐  │   │
│  │  │                   Deployments                       │  │   │
│  │  │                                                      │  │   │
│  │  │  ┌────────────────────────────────────────────┐    │  │   │
│  │  │  │        API Deployment (3 replicas)         │    │  │   │
│  │  │  │                                             │    │  │   │
│  │  │  │  Pod-1        Pod-2        Pod-3           │    │  │   │
│  │  │  │  ┌─────┐     ┌─────┐     ┌─────┐          │    │  │   │
│  │  │  │  │ API │     │ API │     │ API │          │    │  │   │
│  │  │  │  │Container   │Container   │Container      │    │  │   │
│  │  │  │  └─────┘     └─────┘     └─────┘          │    │  │   │
│  │  │  │  Resources: 512Mi RAM, 500m CPU each       │    │  │   │
│  │  │  └────────────────────────────────────────────┘    │  │   │
│  │  │                                                      │  │   │
│  │  │  ┌────────────────────────────────────────────┐    │  │   │
│  │  │  │     WebSocket Deployment (2 replicas)      │    │  │   │
│  │  │  │                                             │    │  │   │
│  │  │  │  Pod-1        Pod-2                        │    │  │   │
│  │  │  │  ┌─────┐     ┌─────┐                      │    │  │   │
│  │  │  │  │  WS │     │  WS │                      │    │  │   │
│  │  │  │  │Container   │Container                  │    │  │   │
│  │  │  │  └─────┘     └─────┘                      │    │  │   │
│  │  │  │  Resources: 256Mi RAM, 250m CPU each       │    │  │   │
│  │  │  │  Sticky sessions enabled                   │    │  │   │
│  │  │  └────────────────────────────────────────────┘    │  │   │
│  │  │                                                      │  │   │
│  │  │  ┌────────────────────────────────────────────┐    │  │   │
│  │  │  │      Worker Deployment (2 replicas)        │    │  │   │
│  │  │  │                                             │    │  │   │
│  │  │  │  Pod-1        Pod-2                        │    │  │   │
│  │  │  │  ┌─────┐     ┌─────┐                      │    │  │   │
│  │  │  │  │Worker     │Worker                      │    │  │   │
│  │  │  │  │Container   │Container                  │    │  │   │
│  │  │  │  └─────┘     └─────┘                      │    │  │   │
│  │  │  │  Jobs: Email, Analytics, Cleanup           │    │  │   │
│  │  │  └────────────────────────────────────────────┘    │  │   │
│  │  │                                                      │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │                  ConfigMaps                       │  │   │
│  │  │  - Environment variables                          │  │   │
│  │  │  - Application config                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │                    Secrets                        │  │   │
│  │  │  - Database credentials                           │  │   │
│  │  │  - API keys                                       │  │   │
│  │  │  - JWT secrets                                    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │         Horizontal Pod Autoscaler (HPA)          │  │   │
│  │  │  - Min replicas: 3                                │  │   │
│  │  │  - Max replicas: 20                               │  │   │
│  │  │  - Target CPU: 70%                                │  │   │
│  │  │  - Target Memory: 80%                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Network Architecture

### Security Layers
```
┌──────────────────────────────────────────────────────────────┐
│                        Internet                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              Layer 1: DDoS Protection (AWS Shield)            │
│                   + WAF (Web Application Firewall)            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│         Layer 2: CDN (CloudFront) + SSL/TLS Termination       │
│                  - Static asset caching                       │
│                  - Geographic distribution                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│       Layer 3: Application Load Balancer (Multi-AZ)          │
│                  - Health checks                              │
│                  - SSL/TLS termination                        │
│                  - Path-based routing                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                Layer 4: VPC Security Groups                   │
│                  - Allow HTTPS (443)                          │
│                  - Allow WSS (443)                            │
│                  - Deny all other inbound                     │
└──────────────────────┬───────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│  Public    │  │  Private   │  │   Data     │
│  Subnet    │  │  Subnet    │  │  Subnet    │
│            │  │            │  │            │
│ NAT        │  │ EKS Pods   │  │ RDS        │
│ Gateway    │  │            │  │ Redis      │
└────────────┘  └────────────┘  └────────────┘
                       │
                       │ Outbound only
                       │ via NAT Gateway
                       │
                       ▼
            External Services
            ┌──────────────┐
            │  Anthropic   │
            │  Stripe      │
            │  SendGrid    │
            └──────────────┘
```

---

## Summary

These diagrams provide a comprehensive visual representation of The dAItaniverse platform architecture, covering:

✅ **High-Level Architecture**: Overall system design
✅ **Infrastructure**: AWS cloud infrastructure
✅ **Data Flows**: Request/response flows
✅ **Sequences**: Detailed interaction sequences
✅ **Components**: Frontend and backend component hierarchies
✅ **Deployment**: Kubernetes deployment architecture
✅ **Network**: Security layers and network topology

These diagrams should be used in conjunction with the detailed documentation in:
- [DAITANIVERSE_ARCHITECTURE.md](./DAITANIVERSE_ARCHITECTURE.md)
- [DAITANIVERSE_DATABASE.md](./DAITANIVERSE_DATABASE.md)
- [DAITANIVERSE_FRONTEND.md](./DAITANIVERSE_FRONTEND.md)
- [DAITANIVERSE_BACKEND.md](./DAITANIVERSE_BACKEND.md)
- [DAITANIVERSE_ROADMAP.md](./DAITANIVERSE_ROADMAP.md)

---

**Note**: For interactive diagrams, consider using tools like:
- **Mermaid.js** for code-based diagrams
- **Draw.io** / **Lucidchart** for detailed architectural diagrams
- **Figma** for UI/UX mockups and component designs
