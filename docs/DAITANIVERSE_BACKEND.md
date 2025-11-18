# The dAItaniverse - Backend Architecture (Node.js)

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [API Architecture](#api-architecture)
5. [Service Layer](#service-layer)
6. [Database Integration](#database-integration)
7. [Authentication & Authorization](#authentication--authorization)
8. [AI Integration (Anthropic)](#ai-integration-anthropic)
9. [Payment Integration (Stripe)](#payment-integration-stripe)
10. [Real-time Communication](#real-time-communication)
11. [Error Handling & Logging](#error-handling--logging)
12. [Testing Strategy](#testing-strategy)

---

## Overview

The dAItaniverse backend is a robust, scalable Node.js application built with Express.js and TypeScript, providing RESTful APIs and real-time WebSocket communication.

### Key Features
- 🚀 High-performance REST API
- 🔐 Secure JWT + OAuth authentication
- 🤖 Anthropic Claude AI integration with streaming
- 💳 Stripe payment processing
- ⚡ Real-time WebSocket communication
- 📊 PostgreSQL with Prisma ORM
- 🔄 Redis caching and session management
- 📝 Comprehensive logging and monitoring
- ✅ Full TypeScript coverage
- 🧪 Unit and integration testing

---

## Technology Stack

### Core Technologies
```json
{
  "runtime": "Node.js 20.x LTS",
  "framework": "Express.js 4.18",
  "language": "TypeScript 5.0",
  "orm": "Prisma 5.7",
  "authentication": "Passport.js + JWT",
  "websockets": "Socket.io",
  "validation": "Zod",
  "testing": "Jest + Supertest"
}
```

### Key Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "passport-github2": "^0.1.12",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "zod": "^3.22.0",
    "socket.io": "^4.6.0",
    "ioredis": "^5.3.2",
    "bull": "^4.12.0",
    "stripe": "^14.10.0",
    "@anthropic-ai/sdk": "^0.12.0",
    "winston": "^3.11.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1515.0",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.3",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "prettier": "^3.1.0"
  }
}
```

---

## Project Structure

```
backend/
├── src/
│   ├── api/                        # API routes and controllers
│   │   ├── v1/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── users.routes.ts
│   │   │   │   ├── agents.routes.ts
│   │   │   │   ├── conversations.routes.ts
│   │   │   │   ├── messages.routes.ts
│   │   │   │   ├── payments.routes.ts
│   │   │   │   └── analytics.routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── agents.controller.ts
│   │   │   │   ├── conversations.controller.ts
│   │   │   │   ├── messages.controller.ts
│   │   │   │   ├── payments.controller.ts
│   │   │   │   └── analytics.controller.ts
│   │   │   ├── validators/
│   │   │   │   ├── auth.validator.ts
│   │   │   │   ├── agent.validator.ts
│   │   │   │   └── message.validator.ts
│   │   │   └── index.ts
│   │   └── middleware/
│   │       ├── auth.middleware.ts
│   │       ├── validate.middleware.ts
│   │       ├── rateLimit.middleware.ts
│   │       └── upload.middleware.ts
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── agent.service.ts
│   │   ├── conversation.service.ts
│   │   ├── message.service.ts
│   │   ├── memory.service.ts
│   │   ├── ai.service.ts
│   │   ├── payment.service.ts
│   │   ├── email.service.ts
│   │   ├── analytics.service.ts
│   │   └── storage.service.ts
│   │
│   ├── repositories/               # Data access layer
│   │   ├── user.repository.ts
│   │   ├── agent.repository.ts
│   │   ├── conversation.repository.ts
│   │   ├── message.repository.ts
│   │   ├── payment.repository.ts
│   │   └── base.repository.ts
│   │
│   ├── models/                     # Domain models
│   │   ├── User.ts
│   │   ├── Agent.ts
│   │   ├── Conversation.ts
│   │   └── Message.ts
│   │
│   ├── config/                     # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── passport.ts
│   │   ├── stripe.ts
│   │   ├── anthropic.ts
│   │   ├── aws.ts
│   │   └── index.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   ├── crypto.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── types/                      # TypeScript types
│   │   ├── express.d.ts
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── common.types.ts
│   │
│   ├── jobs/                       # Background jobs
│   │   ├── email.job.ts
│   │   ├── analytics.job.ts
│   │   └── cleanup.job.ts
│   │
│   ├── websocket/                  # WebSocket handlers
│   │   ├── handlers/
│   │   │   ├── conversation.handler.ts
│   │   │   └── presence.handler.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   └── index.ts
│   │
│   ├── middleware/                 # Global middleware
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   ├── cors.ts
│   │   └── security.ts
│   │
│   ├── app.ts                      # Express app setup
│   └── server.ts                   # Server entry point
│
├── prisma/
│   ├── schema.prisma              # Prisma schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Database seeding
│
├── tests/
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── helpers/                   # Test utilities
│
├── .env.example                   # Environment variables template
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── tsconfig.json                  # TypeScript configuration
├── jest.config.js                 # Jest configuration
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Docker Compose
└── package.json
```

---

## API Architecture

### RESTful API Design

#### API Versioning
```
/api/v1/auth/login
/api/v1/users/:id
/api/v1/agents
/api/v1/conversations/:id/messages
```

#### Standard Response Format
```typescript
// Success response
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Paginated response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Route Implementation Example

```typescript
// src/api/v1/routes/conversations.routes.ts
import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { conversationValidator } from "../validators/conversation.validator";

const router = Router();
const controller = new ConversationController();

// All routes require authentication
router.use(authenticate);

// Get all conversations
router.get("/", controller.getConversations);

// Create conversation
router.post(
  "/",
  validate(conversationValidator.create),
  controller.createConversation
);

// Get specific conversation
router.get("/:id", controller.getConversation);

// Update conversation
router.patch(
  "/:id",
  validate(conversationValidator.update),
  controller.updateConversation
);

// Delete conversation
router.delete("/:id", controller.deleteConversation);

// Get conversation messages
router.get("/:id/messages", controller.getMessages);

// Send message
router.post(
  "/:id/messages",
  validate(conversationValidator.sendMessage),
  controller.sendMessage
);

export default router;
```

### Controller Implementation

```typescript
// src/api/v1/controllers/conversation.controller.ts
import { Request, Response, NextFunction } from "express";
import { ConversationService } from "@/services/conversation.service";
import { MessageService } from "@/services/message.service";
import { ApiError } from "@/utils/errors";
import { asyncHandler } from "@/utils/helpers";

export class ConversationController {
  private conversationService: ConversationService;
  private messageService: MessageService;

  constructor() {
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
  }

  getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status } = req.query;

    const result = await this.conversationService.getUserConversations(userId, {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  createConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { agentId, title } = req.body;

    const conversation = await this.conversationService.create({
      userId,
      agentId,
      title,
    });

    res.status(201).json({
      success: true,
      data: conversation,
      message: "Conversation created successfully",
    });
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id: conversationId } = req.params;
    const { content } = req.body;

    // Verify conversation ownership
    const conversation = await this.conversationService.getById(conversationId);
    if (conversation.userId !== userId) {
      throw new ApiError(403, "Forbidden");
    }

    // Create user message
    const userMessage = await this.messageService.create({
      conversationId,
      userId,
      role: "user",
      content,
    });

    // Generate AI response (streamed via WebSocket)
    this.messageService.generateAIResponse(conversationId, userId);

    res.status(201).json({
      success: true,
      data: userMessage,
    });
  });
}
```

---

## Service Layer

### Base Service Pattern

```typescript
// src/services/base.service.ts
export abstract class BaseService<T> {
  protected repository: any;

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
```

### Conversation Service

```typescript
// src/services/conversation.service.ts
import { ConversationRepository } from "@/repositories/conversation.repository";
import { MessageRepository } from "@/repositories/message.repository";
import { AgentRepository } from "@/repositories/agent.repository";
import { ApiError } from "@/utils/errors";
import { BaseService } from "./base.service";

export class ConversationService extends BaseService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private agentRepo: AgentRepository;

  constructor() {
    super();
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
    this.agentRepo = new AgentRepository();
  }

  async getUserConversations(
    userId: string,
    options: { page: number; limit: number; status?: string }
  ) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.conversationRepo.findByUser(userId, {
        skip,
        take: limit,
        where: status ? { status } : undefined,
        include: {
          agent: true,
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      this.conversationRepo.count({ userId, status }),
    ]);

    return {
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: {
    userId: string;
    agentId: string;
    title?: string;
  }) {
    // Verify agent exists and user has access
    const agent = await this.agentRepo.findById(data.agentId);
    if (!agent) {
      throw new ApiError(404, "Agent not found");
    }

    if (!agent.isPublic && agent.userId !== data.userId) {
      throw new ApiError(403, "Agent is private");
    }

    // Create conversation
    const conversation = await this.conversationRepo.create({
      userId: data.userId,
      agentId: data.agentId,
      title: data.title || `Chat with ${agent.name}`,
      status: "active",
    });

    // Increment agent usage count
    await this.agentRepo.incrementConversationCount(data.agentId);

    return conversation;
  }

  async getById(id: string) {
    const conversation = await this.conversationRepo.findById(id);
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }
    return conversation;
  }

  async archive(id: string, userId: string) {
    const conversation = await this.getById(id);

    if (conversation.userId !== userId) {
      throw new ApiError(403, "Forbidden");
    }

    return this.conversationRepo.update(id, {
      status: "archived",
      archivedAt: new Date(),
    });
  }
}
```

---

## Database Integration

### Prisma Configuration

```typescript
// src/config/database.ts
import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/logger";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });

// Log slow queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: any) => {
    if (e.duration > 100) {
      logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
    }
  });
}

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
```

### Repository Pattern

```typescript
// src/repositories/conversation.repository.ts
import { prisma } from "@/config/database";
import { Prisma, Conversation } from "@prisma/client";

export class ConversationRepository {
  async findById(id: string, include?: Prisma.ConversationInclude) {
    return prisma.conversation.findUnique({
      where: { id },
      include,
    });
  }

  async findByUser(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      where?: Prisma.ConversationWhereInput;
      include?: Prisma.ConversationInclude;
    }
  ) {
    return prisma.conversation.findMany({
      where: {
        userId,
        deletedAt: null,
        ...options?.where,
      },
      skip: options?.skip,
      take: options?.take,
      include: options?.include,
      orderBy: {
        lastMessageAt: "desc",
      },
    });
  }

  async create(data: Prisma.ConversationCreateInput) {
    return prisma.conversation.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ConversationUpdateInput) {
    return prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(where: Prisma.ConversationWhereInput) {
    return prisma.conversation.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }
}
```

---

## Authentication & Authorization

### JWT Authentication

```typescript
// src/config/passport.ts
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserRepository } from "@/repositories/user.repository";
import { config } from "./index";

const userRepo = new UserRepository();

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
      algorithms: ["RS256"],
    },
    async (payload, done) => {
      try {
        const user = await userRepo.findById(payload.sub);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: config.oauth.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userRepo.findByGoogleId(profile.id);

        if (!user) {
          user = await userRepo.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
            emailVerified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
```

### Auth Middleware

```typescript
// src/api/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/errors";
import { config } from "@/config";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return next(new ApiError(401, "Unauthorized"));

    req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (...allowedPlans: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (!allowedPlans.includes(req.user.subscriptionTier)) {
      return next(
        new ApiError(403, "Upgrade your plan to access this feature")
      );
    }

    next();
  };
};

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ sub: userId }, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry,
    algorithm: "RS256",
  });

  const refreshToken = jwt.sign({ sub: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });

  return { accessToken, refreshToken };
};
```

---

## AI Integration (Anthropic)

### AI Service Implementation

```typescript
// src/services/ai.service.ts
import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import { MessageService } from "./message.service";
import { MemoryService } from "./memory.service";

export class AIService {
  private client: Anthropic;
  private messageService: MessageService;
  private memoryService: MemoryService;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
    this.messageService = new MessageService();
    this.memoryService = new MemoryService();
  }

  async generateResponse(
    conversationId: string,
    userId: string,
    agentConfig: any
  ) {
    try {
      // Build context
      const context = await this.memoryService.buildContext(
        conversationId,
        userId
      );

      // Prepare messages
      const messages = context.messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Call Anthropic API
      const response = await this.client.messages.create({
        model: agentConfig.model || "claude-3-5-sonnet-20241022",
        max_tokens: agentConfig.maxTokens || 4096,
        temperature: agentConfig.temperature || 1.0,
        system: agentConfig.systemPrompt,
        messages,
      });

      const content = response.content[0].text;
      const usage = response.usage;

      // Save assistant message
      const message = await this.messageService.create({
        conversationId,
        userId,
        role: "assistant",
        content,
        model: agentConfig.model,
        tokenCount: usage.output_tokens,
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
      });

      // Track usage
      await this.trackUsage(userId, usage);

      return message;
    } catch (error) {
      logger.error("AI generation error:", error);
      throw error;
    }
  }

  async *streamResponse(
    conversationId: string,
    userId: string,
    agentConfig: any
  ): AsyncGenerator<string> {
    const context = await this.memoryService.buildContext(
      conversationId,
      userId
    );

    const messages = context.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const stream = await this.client.messages.stream({
      model: agentConfig.model || "claude-3-5-sonnet-20241022",
      max_tokens: agentConfig.maxTokens || 4096,
      temperature: agentConfig.temperature || 1.0,
      system: agentConfig.systemPrompt,
      messages,
    });

    let fullContent = "";

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        const text = chunk.delta.text;
        fullContent += text;
        yield text;
      }
    }

    // Save complete message
    await this.messageService.create({
      conversationId,
      userId,
      role: "assistant",
      content: fullContent,
      model: agentConfig.model,
    });
  }

  private async trackUsage(userId: string, usage: any) {
    // Track token usage for billing
    await this.messageService.incrementUserTokenCount(
      userId,
      usage.input_tokens + usage.output_tokens
    );
  }
}
```

---

## Payment Integration (Stripe)

### Payment Service

```typescript
// src/services/payment.service.ts
import Stripe from "stripe";
import { config } from "@/config";
import { UserRepository } from "@/repositories/user.repository";
import { PaymentRepository } from "@/repositories/payment.repository";
import { ApiError } from "@/utils/errors";

export class PaymentService {
  private stripe: Stripe;
  private userRepo: UserRepository;
  private paymentRepo: PaymentRepository;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2023-10-16",
    });
    this.userRepo = new UserRepository();
    this.paymentRepo = new PaymentRepository();
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.userRepo.update(userId, { stripeCustomerId: customerId });
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.app.frontendUrl}/settings/billing?success=true`,
      cancel_url: `${config.app.frontendUrl}/pricing?canceled=true`,
      metadata: { userId },
    });

    return { url: session.url };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update user subscription
    await this.userRepo.update(userId, {
      subscriptionTier: this.getPlanFromPriceId(subscription.items.data[0].price.id),
      subscriptionStatus: "active",
    });
  }

  private getPlanFromPriceId(priceId: string): string {
    // Map price IDs to plan names
    const planMap: Record<string, string> = {
      [config.stripe.prices.pro]: "pro",
      [config.stripe.prices.business]: "business",
    };
    return planMap[priceId] || "free";
  }
}
```

---

## Real-time Communication

### WebSocket Implementation

```typescript
// src/websocket/index.ts
import { Server as SocketServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { authMiddleware } from "./middleware/auth.middleware";
import { ConversationHandler } from "./handlers/conversation.handler";

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(authMiddleware);

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    const conversationHandler = new ConversationHandler(socket, io);

    // Register event handlers
    socket.on("join:conversation", conversationHandler.joinConversation);
    socket.on("leave:conversation", conversationHandler.leaveConversation);
    socket.on("typing:start", conversationHandler.handleTypingStart);
    socket.on("typing:stop", conversationHandler.handleTypingStop);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
```

### Conversation Handler

```typescript
// src/websocket/handlers/conversation.handler.ts
import { Socket, Server } from "socket.io";
import { AIService } from "@/services/ai.service";
import { AgentRepository } from "@/repositories/agent.repository";

export class ConversationHandler {
  private socket: Socket;
  private io: Server;
  private aiService: AIService;
  private agentRepo: AgentRepository;

  constructor(socket: Socket, io: Server) {
    this.socket = socket;
    this.io = io;
    this.aiService = new AIService();
    this.agentRepo = new AgentRepository();
  }

  joinConversation = async (data: { conversationId: string }) => {
    const { conversationId } = data;
    const userId = this.socket.data.userId;

    // Join room
    await this.socket.join(`conversation:${conversationId}`);

    // Notify others
    this.socket.to(`conversation:${conversationId}`).emit("user:joined", {
      userId,
    });
  };

  leaveConversation = async (data: { conversationId: string }) => {
    const { conversationId } = data;
    await this.socket.leave(`conversation:${conversationId}`);
  };

  handleTypingStart = (data: { conversationId: string }) => {
    this.socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
      userId: this.socket.data.userId,
    });
  };

  handleTypingStop = (data: { conversationId: string }) => {
    this.socket.to(`conversation:${data.conversationId}`).emit("typing:stop", {
      userId: this.socket.data.userId,
    });
  };

  async streamAIResponse(conversationId: string, agentId: string) {
    const userId = this.socket.data.userId;
    const agent = await this.agentRepo.findById(agentId);

    if (!agent) return;

    // Emit stream start
    this.io.to(`conversation:${conversationId}`).emit("message:stream:start");

    try {
      // Stream response
      for await (const chunk of this.aiService.streamResponse(
        conversationId,
        userId,
        agent
      )) {
        this.io.to(`conversation:${conversationId}`).emit("message:stream:chunk", {
          chunk,
        });
      }

      // Emit stream end
      this.io.to(`conversation:${conversationId}`).emit("message:stream:end");
    } catch (error) {
      this.io.to(`conversation:${conversationId}`).emit("message:stream:error", {
        error: error.message,
      });
    }
  }
}
```

---

## Error Handling & Logging

### Custom Error Classes

```typescript
// src/utils/errors.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  errors: any[];

  constructor(message: string, errors: any[]) {
    super(400, message);
    this.errors = errors;
  }
}
```

### Error Handler Middleware

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/errors";
import { logger } from "@/utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.name,
        message: err.message,
      },
    });
  }

  // Log unexpected errors
  logger.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
```

### Winston Logger

```typescript
// src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});
```

---

## Testing Strategy

### Unit Test Example

```typescript
// tests/unit/services/conversation.service.test.ts
import { ConversationService } from "@/services/conversation.service";
import { ConversationRepository } from "@/repositories/conversation.repository";

jest.mock("@/repositories/conversation.repository");

describe("ConversationService", () => {
  let service: ConversationService;
  let mockRepo: jest.Mocked<ConversationRepository>;

  beforeEach(() => {
    mockRepo = new ConversationRepository() as jest.Mocked<ConversationRepository>;
    service = new ConversationService();
    service["conversationRepo"] = mockRepo;
  });

  describe("getUserConversations", () => {
    it("should return paginated conversations", async () => {
      const userId = "user-123";
      const mockConversations = [
        { id: "conv-1", userId, title: "Chat 1" },
        { id: "conv-2", userId, title: "Chat 2" },
      ];

      mockRepo.findByUser.mockResolvedValue(mockConversations);
      mockRepo.count.mockResolvedValue(2);

      const result = await service.getUserConversations(userId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockConversations);
      expect(result.pagination.total).toBe(2);
    });
  });
});
```

### Integration Test Example

```typescript
// tests/integration/api/conversations.test.ts
import request from "supertest";
import { app } from "@/app";
import { generateTokens } from "@/api/middleware/auth.middleware";

describe("Conversations API", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test user and token
    userId = "test-user-123";
    const tokens = generateTokens(userId);
    authToken = tokens.accessToken;
  });

  describe("GET /api/v1/conversations", () => {
    it("should return user conversations", async () => {
      const response = await request(app)
        .get("/api/v1/conversations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should require authentication", async () => {
      await request(app)
        .get("/api/v1/conversations")
        .expect(401);
    });
  });
});
```

---

## Summary

The dAItaniverse backend architecture provides:

✅ **Scalable Architecture**: Service-oriented design with separation of concerns
✅ **Type Safety**: Full TypeScript coverage
✅ **Database**: PostgreSQL with Prisma ORM
✅ **Authentication**: JWT + OAuth 2.0 (Google, GitHub)
✅ **AI Integration**: Anthropic Claude with streaming support
✅ **Payment Processing**: Stripe subscriptions and webhooks
✅ **Real-time**: WebSocket communication with Socket.io
✅ **Caching**: Redis for sessions and API responses
✅ **Testing**: Unit and integration tests with Jest
✅ **Monitoring**: Winston logging and error tracking
✅ **Security**: Helmet, CORS, rate limiting, input validation

**API Endpoints**: 50+ REST endpoints
**WebSocket Events**: 10+ real-time events
**Test Coverage**: Target 80%+
**Response Time**: P95 < 200ms
