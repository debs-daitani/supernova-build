# The dAItaniverse - Phase 2 Custom Platform

**AI-powered coaching, community, and marketplace for midlife female entrepreneurs.**

Anti-establishment pricing. ADHD-friendly design. No corporate BS.

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ database (local or Railway/Supabase)
- OpenAI API key
- Stripe account (test mode for development)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd supernova-build
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database - Get this from Railway or local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/daitaniverse"

# JWT Secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Stripe (test mode keys from dashboard.stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npx ts-node src/lib/db/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default admin login:**
- Email: `admin@daitani.co.uk`
- Password: `admin123`

---

## Project Structure

```
supernova-build/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js 14 app directory
│   │   ├── api/              # API routes
│   │   ├── auth/             # Auth pages (login, register)
│   │   ├── dashboard/        # User dashboard
│   │   ├── supernova/        # AI chat interface
│   │   ├── marketplace/      # i•DEA marketplace
│   │   ├── community/        # The Venue (forums, DMs)
│   │   ├── library/          # Content library
│   │   ├── admin/            # Admin dashboard
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities and helpers
│   │   ├── prisma.ts        # Prisma client
│   │   ├── auth.ts          # Auth helpers (JWT, bcrypt)
│   │   └── db/              # Database utilities
│   └── types/               # TypeScript type definitions
├── .env.example             # Environment variables template
└── README.md
```

---

## Core Features

### 1. SUPERNova AI Chat
- GPT-4 powered coaching
- Cross-conversation memory system
- Personalized based on quiz results
- Organise conversations by pillar (Body/Brain/Business)
- Folder system for ADHD-friendly organization

### 2. i•DEA Marketplace
- Buy and sell unfinished business ideas
- In-platform messaging
- 6% platform commission
- Review/rating system
- Asset transfer coordination

### 3. The Venue (Community)
- Discussion forums by pillar
- Member directory
- Direct messaging
- Profile pages

### 4. Content Library
- Video courses
- Templates and frameworks
- AI-curated learning paths
- Progress tracking

### 5. Payments
- £26 one-time upgrade
- £26/month subscription
- £260/year subscription
- Stripe integration

---

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Auth**: JWT tokens with httpOnly cookies
- **AI**: OpenAI GPT-4
- **Payments**: Stripe
- **Deployment**: Railway or Render

---

## Deployment

### Deploy to Railway

1. Create a Railway account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Add this repo as a service
5. Set environment variables in Railway dashboard
6. Deploy!

Railway will automatically:
- Install dependencies
- Run `npm run build`
- Start the server with `npm start`

### Deploy to Render

1. Create a Render account at [render.com](https://render.com)
2. Create new PostgreSQL database
3. Create new Web Service from this repo
4. Set build command: `npm install && npm run db:generate && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy!

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | JWT secret (generate with openssl) | `random-32-char-string` |
| `NEXTAUTH_URL` | App URL | `https://your-domain.com` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public Stripe key | `pk_test_...` |

---

## Database Schema

See `prisma/schema.prisma` for complete schema.

**Core tables:**
- `User` - User accounts and profiles
- `Conversation` - SUPERNova chat conversations
- `Message` - Individual messages
- `UserMemory` - Cross-chat memory storage
- `ContentLibrary` - Learning content
- `MarketplaceListing` - i•DEA marketplace listings
- `CommunityPost` - Forum posts
- `Payment` - Payment history

---

## API Routes

All API routes are in `src/app/api/`:

- `/api/auth/*` - Authentication (register, login, logout)
- `/api/supernova/*` - AI chat endpoints
- `/api/marketplace/*` - Marketplace endpoints
- `/api/community/*` - Community endpoints
- `/api/library/*` - Content library endpoints
- `/api/admin/*` - Admin dashboard endpoints
- `/api/stripe/webhook` - Stripe webhooks

---

## Development Tips

### Run Database Studio

View and edit database in browser:

```bash
npm run db:studio
```

### Reset Database

**WARNING: This deletes all data!**

```bash
npx prisma migrate reset
```

### View Logs

```bash
# In development
npm run dev

# In production (Railway/Render)
# Check Railway/Render dashboard for logs
```

---

## ADHD-Friendly Design Principles

This platform is built with ADHD-friendly design:

- **Clear visual hierarchy** - Important things stand out
- **Ample white space** - Not overwhelming
- **Chunked content** - Short paragraphs, bullet points
- **Progress indicators** - See where you are
- **Quick wins** - Celebrate small victories
- **Minimal distractions** - No autoplay, optional notifications
- **Easy navigation** - Simple menu, search everywhere
- **Save for later** - Bookmark content, draft messages

---

## Support

For issues or questions:
- Create an issue in this repo
- Email: support@daitani.co.uk

---

## License

Proprietary - © 2025 Debs Daitani / The dAItaniverse

---

**Let's fucking GO! 🚀**
