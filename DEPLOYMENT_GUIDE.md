# 🚀 **SUPERNova AI - Deployment Guide**

Complete guide to deploying SUPERNova AI to Railway.

---

## **Prerequisites**

1. **Railway Account** - Sign up at [railway.app](https://railway.app)
2. **GitHub Account** - To connect your repository
3. **Stripe Account** - For payments ([stripe.com](https://stripe.com))
4. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com)

---

## **Step 1: Prepare Your Repository**

### 1.1 Push Code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 Verify File Structure

Ensure your repository has this structure:
```
supernova-build/
├── server/          # Backend (Express + PostgreSQL)
├── client/          # Frontend (React + Vite)
├── railway.json     # Railway configuration
├── Procfile         # Process file
└── README.md        # Documentation
```

---

## **Step 2: Set Up Railway Project**

### 2.1 Create New Project

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `supernova-build` repository

### 2.2 Add PostgreSQL Database

1. Click "+ New" in your Railway project
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will automatically provision a database and set `DATABASE_URL`

### 2.3 Configure Environment Variables

Click on your service → "Variables" tab → Add these variables:

#### **Backend Variables:**

```bash
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.railway.app

# Database (auto-set by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=<generate-a-random-32-character-string>
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_UPGRADE_PRICE_ID=price_1234567890
STRIPE_MONTHLY_PRICE_ID=price_1234567890
STRIPE_ANNUAL_PRICE_ID=price_1234567890

# Email (optional - SendGrid or Mailgun)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=hello@supernova.ai
EMAIL_FROM_NAME=SUPERNova AI
```

#### **Frontend Variables:**

```bash
VITE_API_URL=https://your-backend.railway.app/api
```

---

## **Step 3: Set Up Database**

### 3.1 Run Database Migration

Once deployed, connect to your Railway project via CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migration
railway run npm run migrate --dir server
```

Alternatively, use Railway's built-in terminal:

1. Go to your service → "Deployments" tab
2. Click on latest deployment
3. Open "Terminal"
4. Run:
   ```bash
   cd server
   npm run migrate
   ```

---

## **Step 4: Configure Stripe**

### 4.1 Create Products & Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Products" → "+ Add product"

**Create 3 products:**

| Product | Price | Type | Price ID |
|---------|-------|------|----------|
| Upgrade | £26 | One-time | Copy this ID → `STRIPE_UPGRADE_PRICE_ID` |
| Monthly Subscription | £26 | Recurring (monthly) | Copy this ID → `STRIPE_MONTHLY_PRICE_ID` |
| Annual Subscription | £260 | Recurring (yearly) | Copy this ID → `STRIPE_ANNUAL_PRICE_ID` |

### 4.2 Set Up Webhook

1. Go to "Developers" → "Webhooks" → "+ Add endpoint"
2. Endpoint URL: `https://your-backend.railway.app/api/payments/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the "Signing secret" → Set as `STRIPE_WEBHOOK_SECRET`

---

## **Step 5: Deploy**

### 5.1 Trigger Deployment

Railway auto-deploys when you push to `main`. To manually redeploy:

1. Go to your service → "Deployments"
2. Click "Deploy" → "Redeploy"

### 5.2 Monitor Deployment

Watch the build logs:
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Start server

### 5.3 Get Your URL

Once deployed, Railway provides a public URL:
```
https://supernova-production-xxxx.up.railway.app
```

Update `FRONTEND_URL` and `VITE_API_URL` environment variables with this URL.

---

## **Step 6: Custom Domain (Optional)**

### 6.1 Add Domain in Railway

1. Go to your service → "Settings" → "Domains"
2. Click "Generate Domain" or "Custom Domain"
3. Add your domain (e.g., `app.supernova.ai`)

### 6.2 Configure DNS

Add these records to your DNS provider:

```
Type: CNAME
Name: app (or @)
Value: <your-railway-url>
```

### 6.3 Update Environment Variables

Update `FRONTEND_URL` to your custom domain:
```
FRONTEND_URL=https://app.supernova.ai
```

---

## **Step 7: Post-Deployment Checklist**

✅ **Test Sign Up** - Create a test account
✅ **Test Login** - Log in with test account
✅ **Test Chat** - Start a SUPERNova conversation
✅ **Test Streaming** - Verify AI responses stream correctly
✅ **Test Stripe (Test Mode)** - Complete test payment
✅ **Switch Stripe to Live Mode** - Update to live keys
✅ **Test Email** - Verify welcome emails send
✅ **Monitor Logs** - Check for errors in Railway dashboard
✅ **Set Up Monitoring** - Use Railway's built-in metrics

---

## **Troubleshooting**

### Database Connection Issues

**Error:** `Connection refused`
**Fix:** Ensure `DATABASE_URL` is correctly set. Railway auto-sets this - don't override it.

### Build Failures

**Error:** `npm install failed`
**Fix:** Check `package.json` in both `server/` and `client/` directories.

### 500 Errors

**Error:** Server crashes on start
**Fix:** Check logs in Railway dashboard. Common issues:
- Missing environment variables
- Database migration not run
- Port binding (ensure `process.env.PORT`)

### CORS Issues

**Error:** `CORS policy blocked`
**Fix:** Verify `FRONTEND_URL` in backend `.env` matches your actual frontend URL.

### Stripe Webhook Not Working

**Error:** Webhook events not received
**Fix:**
1. Verify webhook URL is correct
2. Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. Test webhook in Stripe dashboard ("Send test webhook")

---

## **Scaling & Optimization**

### Horizontal Scaling

Railway allows easy scaling:
1. Go to service → "Settings" → "Replicas"
2. Increase to 2+ instances for high availability

### Database Optimization

Add indexes for frequently queried fields (already done in schema).

### CDN for Frontend

Use Railway's built-in CDN or Cloudflare for faster static asset delivery.

---

## **Cost Estimates**

### Railway Costs (Monthly)

- **Hobby Plan:** $5/month (500 hours)
- **Pro Plan:** $20/month (unlimited)
- **PostgreSQL:** Included in plan

### Third-Party Services

- **OpenAI API:** ~$0.002 per 1K tokens (~$5-20/month)
- **Stripe:** 1.5% + 20p per transaction
- **Email (SendGrid):** Free tier (12K emails/month)

**Total estimated cost:** ~£25-50/month for first 100 users

---

## **Backups**

### Database Backups

Railway automatically backs up PostgreSQL databases. To manually backup:

```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Code Backups

Your code is on GitHub - ensure regular commits!

---

## **Monitoring**

### Railway Dashboard

- View logs in real-time
- Monitor CPU, memory, network usage
- Set up alerts for downtime

### Application Monitoring

Add services like:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - User analytics

---

## **Next Steps After Deployment**

1. ✅ Set up custom domain
2. ✅ Configure email service (SendGrid/Mailgun)
3. ✅ Add SSL certificate (automatic with Railway)
4. ✅ Set up monitoring & alerts
5. ✅ Create admin account
6. ✅ Seed initial content library
7. ✅ Test all features end-to-end
8. ✅ Launch! 🎉

---

## **Support**

For deployment issues:
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Railway Discord:** [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues:** Open an issue in your repository

---

**Ready to deploy? Let's go! 🚀**
