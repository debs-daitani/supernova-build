# Deployment Guide - The dAItaniverse Platform

Complete guide for deploying the full-stack application to production.

## Overview

This application consists of:
- **Backend**: Node.js/Express server
- **Frontend**: React/Vite SPA
- **Database**: PostgreSQL
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Email**: SendGrid

## Quick Deploy Options

### Option 1: Railway (Recommended)

**Backend:**
1. Create account at railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add PostgreSQL service
5. Add environment variables (see below)
6. Deploy

**Frontend:**
1. Build: `cd client && npm run build`
2. Deploy `client/dist` to Vercel/Netlify

### Option 2: Heroku + Vercel

**Backend (Heroku):**
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key
# ... (add all env vars)

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma db push
```

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm install -g vercel

cd client
vercel
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...

# SendGrid
SENDGRID_API_KEY=SG...
FROM_EMAIL=hello@yourdomain.com
FROM_NAME=The dAItaniverse

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pricing (in pence)
UPGRADE_PRICE=2600
MONTHLY_PRICE=1900
ANNUAL_PRICE=19900

# URLs
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com

# Marketplace
MARKETPLACE_COMMISSION_PERCENT=6
```

### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Step-by-Step Production Deployment

### 1. Prepare Database

**Create Production Database:**
- Use managed PostgreSQL (Railway, Heroku, DigitalOcean, AWS RDS)
- Minimum recommended: 1GB RAM, 10GB storage

**Run Migrations:**
```bash
DATABASE_URL="your-production-url" npx prisma db push
```

### 2. Set Up Third-Party Services

**Stripe:**
1. Get live API keys from dashboard.stripe.com
2. Set up webhook endpoint: `https://api.yourdomain.com/api/payments/webhook`
3. Copy webhook secret

**SendGrid:**
1. Create account at sendgrid.com
2. Verify sender email domain
3. Create API key with "Mail Send" permissions

**Cloudinary:**
1. Create account at cloudinary.com
2. Copy cloud name, API key, and secret
3. Set upload preset (optional)

**OpenAI:**
1. Get API key from platform.openai.com
2. Set usage limits for cost control

### 3. Deploy Backend

**Build:**
```bash
cd server
npm install --production
```

**Start:**
```bash
npm start
```

**Health Check:**
```bash
curl https://api.yourdomain.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 4. Deploy Frontend

**Build:**
```bash
cd client
npm install
npm run build
# Outputs to client/dist
```

**Deploy dist folder to:**
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

**Vercel Example:**
```bash
cd client
vercel --prod
```

### 5. Configure Domain & SSL

**Backend:**
- Point API subdomain (api.yourdomain.com) to backend server
- Enable SSL (automatic on most platforms)

**Frontend:**
- Point root domain to frontend hosting
- Enable SSL (automatic on Vercel/Netlify)

### 6. Set Up Monitoring

**Recommended:**
- Sentry for error tracking
- LogRocket for user sessions
- UptimeRobot for uptime monitoring

**Add to code:**
```javascript
// server/src/index.js
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}
```

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] Stripe webhook configured
- [ ] SendGrid domain verified
- [ ] Email templates tested
- [ ] Cloudinary configured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error logging set up
- [ ] Backup strategy in place
- [ ] Test user signup flow
- [ ] Test payment flow
- [ ] Test AI chat
- [ ] Test email delivery

## Scaling Considerations

**Database:**
- Enable connection pooling (Prisma built-in)
- Add read replicas for high traffic
- Regular backups (daily recommended)

**Backend:**
- Use horizontal scaling (multiple instances)
- Add Redis for session management
- Implement caching for expensive queries

**Frontend:**
- Enable CDN for static assets
- Implement code splitting
- Use service worker for offline support

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Check DATABASE_URL format
- Verify database is running
- Check firewall rules

**"CORS error"**
- Verify CLIENT_URL in backend .env
- Check CORS configuration in server/src/index.js

**"Stripe webhook failed"**
- Verify webhook secret
- Check webhook endpoint is publicly accessible
- Test with Stripe CLI: `stripe listen`

**"Email not sending"**
- Verify SendGrid API key
- Check sender email is verified
- Review SendGrid activity log

## Security Best Practices

1. **Never commit .env files**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable rate limiting** (already configured)
4. **Keep dependencies updated**: `npm audit fix`
5. **Use HTTPS everywhere**
6. **Sanitize user inputs** (already implemented)
7. **Regular database backups**

## Support

For deployment issues:
1. Check logs first
2. Verify all environment variables
3. Test each service independently
4. Open GitHub issue with details

---

**Ready for Production** 🚀

Your complete dAItaniverse platform is ready to go live!
