# Deployment Guide - The dAItaniverse

This guide will help you deploy The dAItaniverse to Railway or Render.

---

## Prerequisites

Before deploying, make sure you have:

1. **Accounts Created:**
   - Railway account (railway.app) OR Render account (render.com)
   - Stripe account (stripe.com) with test mode enabled
   - OpenAI account (platform.openai.com) with API access
   - GitHub account (to push this repo)

2. **Required Information:**
   - Stripe API keys (secret and publishable)
   - OpenAI API key
   - Stripe webhook secret (you'll create this during setup)

---

## Option 1: Deploy to Railway (Recommended)

Railway is easier for solo founders and has generous free tier.

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Initial commit - The dAItaniverse Phase 2"
git push origin claude/build-daitaniverse-phase2-011tYeGiwxpDsjRALAGtrDfG
```

### Step 2: Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select this repository
5. Select the branch: `claude/build-daitaniverse-phase2-011tYeGiwxpDsjRALAGtrDfG`

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will create a database and provide `DATABASE_URL`
4. Copy the `DATABASE_URL` connection string

### Step 4: Configure Environment Variables

In Railway project settings, add these variables:

```env
# Database (automatically provided by Railway PostgreSQL)
DATABASE_URL=<provided-by-railway>

# JWT Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=<generate-random-32-char-string>
NEXTAUTH_URL=https://your-app.railway.app

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_UPGRADE_PRICE_ID=price_upgrade_26
STRIPE_MONTHLY_PRICE_ID=price_monthly_26
STRIPE_ANNUAL_PRICE_ID=price_annual_260

# App URL (update after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production
```

### Step 5: Configure Build & Deploy

Railway auto-detects Next.js. But verify these settings:

- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm start`
- **Port:** Railway auto-assigns (Next.js uses PORT env var automatically)

### Step 6: Deploy

1. Click "Deploy" in Railway
2. Wait for build to complete (5-10 minutes first time)
3. Railway will provide a URL: `https://your-app.railway.app`

### Step 7: Setup Database

After first deploy, you need to initialize the database:

Option A - Use Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run database migrations
railway run npx prisma db push

# Seed database
railway run npx ts-node src/lib/db/seed.ts
```

Option B - Use Railway's Web Shell:
1. In Railway project, go to your service
2. Click "Shell" tab
3. Run:
```bash
npx prisma db push
npx ts-node src/lib/db/seed.ts
```

### Step 8: Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-app.railway.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy webhook signing secret
6. Add to Railway env vars as `STRIPE_WEBHOOK_SECRET`

### Step 9: Create Stripe Products

1. Go to Stripe Dashboard → Products
2. Create 3 products:

**Product 1: Upgrade (One-time)**
- Name: "dAItaniverse Upgrade"
- Price: £26.00 GBP (one-time payment)
- Copy Price ID → Add to Railway as `STRIPE_UPGRADE_PRICE_ID`

**Product 2: Monthly Membership**
- Name: "dAItaniverse Monthly"
- Price: £26.00 GBP (recurring monthly)
- Copy Price ID → Add to Railway as `STRIPE_MONTHLY_PRICE_ID`

**Product 3: Annual Membership**
- Name: "dAItaniverse Annual"
- Price: £260.00 GBP (recurring yearly)
- Copy Price ID → Add to Railway as `STRIPE_ANNUAL_PRICE_ID`

### Step 10: Test

1. Visit your Railway URL
2. Create a test account
3. Try upgrading (use Stripe test card: 4242 4242 4242 4242)
4. Access SUPERNova AI
5. Test marketplace, community, etc.

---

## Option 2: Deploy to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Name: `daitaniverse-db`
4. Region: Choose closest to your users (e.g., Frankfurt for EU)
5. Plan: Free tier (for testing) or Starter ($7/mo)
6. Create Database
7. Copy **Internal Database URL** (starts with `postgresql://`)

### Step 3: Create Web Service

1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select this repo and branch
4. Configure:
   - **Name:** `daitaniverse`
   - **Region:** Same as database
   - **Branch:** `claude/build-daitaniverse-phase2-011tYeGiwxpDsjRALAGtrDfG`
   - **Root Directory:** Leave blank
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (for testing) or Starter ($7/mo)

### Step 4: Add Environment Variables

In Render service settings, add all env vars (same as Railway list above).

For `NEXT_PUBLIC_APP_URL`, use: `https://daitaniverse.onrender.com` (or your custom domain)

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will build and deploy (10-15 minutes first time)
3. After deploy, run database setup via Render Shell

### Step 6: Initialize Database

1. In Render service dashboard, click "Shell"
2. Run:
```bash
npx prisma db push
npx ts-node src/lib/db/seed.ts
```

### Step 7: Configure Stripe Webhooks

Same as Railway Step 8, but use Render URL: `https://daitaniverse.onrender.com/api/stripe/webhook`

### Step 8: Custom Domain (Optional)

1. In Render service settings → "Custom Domains"
2. Add your domain (e.g., daitaniverse.space)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to use custom domain

---

## Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] User can register and login
- [ ] Dashboard displays correctly
- [ ] SUPERNova AI chat works with streaming
- [ ] Stripe payments work (test mode)
- [ ] Webhooks receiving events (check Stripe dashboard)
- [ ] Marketplace loads listings
- [ ] Community features accessible
- [ ] Admin dashboard works (login with admin@daitani.co.uk)

---

## Production Checklist

Before going live with real payments:

- [ ] Switch Stripe to live mode (get live API keys)
- [ ] Update all `STRIPE_` env vars with live keys
- [ ] Create live Stripe products and price IDs
- [ ] Update webhook endpoint with live mode
- [ ] Test full payment flow with real card
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Enable production logging
- [ ] Back up database regularly
- [ ] Set up SSL certificate (Railway/Render do this automatically)
- [ ] Configure custom domain
- [ ] Update NEXTAUTH_SECRET to strong production secret

---

## Monitoring & Maintenance

### Check Logs

**Railway:**
```bash
railway logs
```

**Render:**
- View in dashboard under "Logs" tab

### Database Backups

**Railway:**
- Automatic backups on paid plans
- Manual backup: Use `pg_dump` from Railway shell

**Render:**
- Automatic daily backups on paid plans
- Manual backup in dashboard

### Scaling

**Railway:**
- Auto-scales based on usage
- Upgrade plan for more resources

**Render:**
- Upgrade to higher tier plans
- Add horizontal scaling (multiple instances)

---

## Troubleshooting

### Build Fails

**Error:** "Prisma client not generated"
**Fix:** Make sure build command includes `npx prisma generate`

**Error:** "Module not found"
**Fix:** Check all imports use `@/` alias correctly

### Runtime Errors

**Error:** "Database connection failed"
**Fix:** Verify `DATABASE_URL` is correct and database is running

**Error:** "OpenAI API key invalid"
**Fix:** Check `OPENAI_API_KEY` is set correctly

**Error:** "Stripe webhook signature verification failed"
**Fix:** Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

### Performance Issues

**Slow AI responses:**
- Check OpenAI API status
- Consider using GPT-3.5-turbo instead of GPT-4 (cheaper, faster)

**Slow database queries:**
- Add indexes in Prisma schema
- Use pagination for large datasets
- Consider upgrading database plan

---

## Cost Estimates

**Monthly costs for 100 active users:**

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| Railway/Render | $0-5 | $7-20 |
| PostgreSQL | $0 | $7-15 |
| OpenAI API | ~$50-200 | (usage-based) |
| Stripe | Free | 1.4% + 20p per transaction |
| **Total** | **~$50-200** | **~$70-250** |

**Revenue potential:**
- 100 members × £26/month = £2,600/month
- Minus 6% platform costs = £2,444/month net
- Minus £200 infrastructure = £2,244/month profit

**Profit margin: ~86%** 🚀

---

## Need Help?

- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Stripe Docs:** https://stripe.com/docs

---

**You've got this! Let's fucking GO! 🚀**
