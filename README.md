# The dAItaniverse Platform - Complete MVP

A comprehensive coaching platform featuring AI-powered conversations, marketplace, community forum, and content library.

## 🚀 Features

### Core Platform
- **SUPERNova AI Chat**: Intelligent coaching powered by OpenAI with comprehensive memory system
- **Marketplace**: Buy/sell business ideas with integrated payments
- **Community Forum**: Discussion boards with nested comments and likes
- **Content Library**: Video, PDF, audio, and text content with progress tracking
- **Direct Messaging**: In-platform user-to-user messaging
- **Notifications**: Real-time notification system

### User Tiers
- **FREE**: Basic access to chat
- **UPGRADE** (£26 one-time): Enhanced chat + downloadable resources
- **MEMBER** (£19/month or £199/year): Full platform access

### Technical Features
- Full-stack TypeScript/JavaScript application
- PostgreSQL database with Prisma ORM
- JWT authentication & authorization
- Stripe payment integration
- SendGrid email notifications
- Cloudinary image uploads
- Mobile-responsive design
- Admin dashboard for content management

## 📦 Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma
- OpenAI API
- Stripe
- SendGrid
- Cloudinary

**Frontend:**
- React 18 + Vite
- TailwindCSS
- React Router
- Zustand (state management)
- Axios
- React Hot Toast

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/debs-daitani/supernova-build.git
cd supernova-build

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

**Server (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/daitaniverse"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-key"
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="hello@yourdomain.com"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
STRIPE_SECRET_KEY="your-stripe-key"
CLIENT_URL="http://localhost:5173"
```

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 3. Database Setup

```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit `http://localhost:5173`

## 📊 Database Schema

17 tables covering:
- Users & Authentication
- Conversations & Messages
- Memories & Preferences
- Payments & Subscriptions
- Content Library
- Marketplace Listings & Purchases
- Forum Posts & Comments
- Direct Messages
- Notifications

## 🎯 Key Routes

### Backend API (50+ endpoints)
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/supernova` - AI chat
- `/api/marketplace` - Marketplace operations
- `/api/community` - Forum operations
- `/api/messages` - Direct messaging
- `/api/notifications` - Notifications
- `/api/content` - Content library
- `/api/payments` - Stripe integration
- `/api/admin` - Admin operations

### Frontend Routes
- `/login`, `/signup` - Authentication
- `/dashboard` - User dashboard
- `/chat` - SUPERNova AI chat
- `/marketplace` - Browse/create listings
- `/community` - Forum
- `/content` - Content library
- `/messages` - Direct messages
- `/admin` - Admin panel

## 🎨 Design System

Built with TailwindCSS featuring:
- Primary color: Purple gradient
- Secondary color: Pink gradient
- Fully responsive (mobile-first)
- Accessible (ARIA labels, keyboard navigation)
- Toast notifications
- Loading states & skeletons

## 📧 Email Templates

10 HTML email templates:
1. Welcome email
2. Upgrade confirmation
3. Subscription confirmation
4. Payment receipt
5. Password reset
6. Marketplace sale (buyer)
7. Marketplace sale (seller)
8. Marketplace message
9. Community mention
10. New direct message

## 🤖 SUPERNova AI System

Comprehensive system prompt featuring:
- Debs Daitani's authentic voice
- Three Pillars (Body, Brain, Business)
- User context awareness
- Memory integration
- ADHD-friendly responses
- Access-level-appropriate coaching

## 🚢 Deployment

See `DEPLOYMENT.md` for detailed deployment instructions for:
- Railway
- Heroku
- Vercel
- DigitalOcean

## 📝 License

MIT License

## 👥 Author

Built for Debs Daitani - The dAItaniverse

## 🙏 Support

For issues and questions, please open a GitHub issue.

---

**Status**: Production-ready MVP ✅

Built with 💜 for midlife women building badass businesses
