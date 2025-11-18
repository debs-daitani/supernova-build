# 🌟 **SUPERNova AI - Confident Body, Brain & Business**

> **Your ADHD-friendly AI coach for confident living**

A complete full-stack AI coaching platform with cross-chat memory, i•DEA marketplace, and vibrant community.

---

## **✨ What's New in Phase 2B**

🎉 **COMPLETE REBUILD** - Migrated from Wix to standalone full-stack application!

- ✅ **React + Vite Frontend** - Modern, fast, responsive
- ✅ **Express + PostgreSQL Backend** - Scalable API server
- ✅ **SUPERNova Chat Interface** - Beautiful ADHD-friendly chat with streaming
- ✅ **Railway Deployment** - One-click deploy to production
- ✅ **Stripe Integration** - Payments & subscriptions
- ✅ **i•DEA Marketplace** - Buy & sell unfinished projects
- ✅ **The Venue (Community)** - Forums & member directory

**Lines of Code:** 10,000+
**Files Created:** 80+
**Completion:** 90% MVP Ready

---

## **🚀 Quick Start**

### **Option 1: Deploy to Railway (Recommended)**

1. Fork this repository
2. Go to [railway.app](https://railway.app)
3. Click "Deploy from GitHub"
4. Add PostgreSQL database
5. Set environment variables (see `.env.example` files)
6. Deploy! 🎉

**Full guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### **Option 2: Run Locally**

```bash
# 1. Clone repository
git clone https://github.com/debs-daitani/supernova-build.git
cd supernova-build

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your keys

# 4. Set up database
createdb supernova
cd server && npm run migrate

# 5. Run dev servers (in separate terminals)
cd server && npm run dev
cd client && npm run dev
```

Open `http://localhost:5173` 🎉

---

## **📦 What's Included**

### **Backend API** (`/server`)
- ✅ User authentication (JWT)
- ✅ SUPERNova conversations (OpenAI streaming)
- ✅ Cross-chat memory system
- ✅ Stripe payments & subscriptions
- ✅ i•DEA marketplace (listings, messaging, reviews)
- ✅ Community forums & DMs
- ✅ Admin dashboard
- ✅ 50+ API endpoints

### **Frontend App** (`/client`)
- ✅ Landing page with pricing
- ✅ Sign up / Login pages
- ✅ Dashboard (user home)
- ✅ **SUPERNova Chat Interface** (CRITICAL - fully functional!)
- ✅ Memory management UI
- ✅ Marketplace browse & create listings
- ✅ Community forums
- ✅ User profile & settings
- ✅ Admin dashboard

### **Database** (PostgreSQL)
- ✅ 17 tables with relationships
- ✅ Full-text search indexes
- ✅ Optimized queries
- ✅ Migration scripts

---

## **🎯 Key Features**

### **1. SUPERNova AI Chat** ⭐ **COMPLETED**

The **heart of the platform** - a beautiful, ADHD-friendly chat interface:

- **Real-time Streaming** - See AI responses as they're typed
- **Cross-Chat Memory** - SUPERNova remembers everything about you
- **3 Pillars** - Body (💪), Brain (🧠), Business (💼)
- **Conversation Management** - Search, organize, archive, star
- **Markdown Rendering** - Rich text formatting
- **Mobile Responsive** - Works perfectly on all devices

**Try it:** Sign up → Click "Chat with SUPERNova" → Ask anything!

### **2. i•DEA Marketplace**

Buy & sell unfinished business ideas:

- Browse listings with filters
- View detailed progress (0-100%)
- Secure Stripe payments
- Buyer-seller messaging
- Reviews & ratings

### **3. The Venue (Community)**

Connect with fellow entrepreneurs:

- Member directory
- Discussion forums (6 categories)
- Direct messaging
- Post, comment, like

### **4. Flexible Pricing**

- **Free:** Unlimited AI chats
- **£26 Upgrade:** One-time (guides + prompts)
- **£26/mo or £260/yr:** Full membership

---

## **🛠️ Tech Stack**

**Frontend:** React, Vite, TailwindCSS, Zustand, Axios
**Backend:** Node.js, Express, PostgreSQL, JWT
**AI:** OpenAI GPT-4 (streaming)
**Payments:** Stripe (one-time + subscriptions)
**Deployment:** Railway (PostgreSQL + hosting)

---

## **📚 Documentation**

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to Railway (step-by-step)
- **[/docs](./docs/)** - Original Wix architecture docs (historical)
- **API Docs** - See `/server/src/routes/` for all endpoints

---

## **🎨 Design Philosophy**

**ADHD-Friendly Principles:**
- ✅ Clear visual hierarchy
- ✅ Ample white space
- ✅ Short, chunked content
- ✅ Bullet points over paragraphs
- ✅ Immediate feedback (loading states, toasts)
- ✅ Minimal cognitive load

**Colors:**
- Primary: Hot Pink (#FF1493)
- Secondary: Cyan (#00CED1)
- Success: Green (#10B981)
- Error: Red (#EF4444)

---

## **📊 Project Stats**

- **Total Lines:** 10,000+
- **Files Created:** 80+
- **Components:** 30+
- **API Routes:** 50+
- **Database Tables:** 17
- **Completion:** 90% MVP

---

## **🔐 Security**

- JWT authentication
- Bcrypt password hashing
- HTTPS only (production)
- Rate limiting
- SQL injection protection
- CORS configured

---

## **🚢 Deployment Status**

✅ **Backend:** Production-ready
✅ **Frontend:** Production-ready
✅ **Database:** Schema complete
✅ **Payments:** Stripe integrated
⏳ **Email:** To be configured (SendGrid/Mailgun)

**Ready to deploy on Railway!**

---

## **🎉 What's Next (Phase 3)**

- [ ] Email service integration
- [ ] AI-powered memory extraction
- [ ] Advanced search (full-text across all conversations)
- [ ] File uploads (images, PDFs)
- [ ] Content library admin UI
- [ ] Mobile app (React Native)

---

## **🤝 Contributing**

Solo project by **Debs Daitani**. Future contributors welcome!

---

## **📄 License**

MIT License

---

## **💬 Support**

- **Email:** hello@supernova.ai
- **GitHub Issues:** [Report bugs](https://github.com/debs-daitani/supernova-build/issues)

---

**Built with 💪🧠💼 by Debs Daitani**

**Ready to unlock your confident living? Let's GO! 🚀**
