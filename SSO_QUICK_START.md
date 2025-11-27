# VENUED SSO - Quick Start Guide

Get SSO up and running in 5 minutes.

## Prerequisites

- ✅ SUPERNova and VENUED apps installed
- ✅ PostgreSQL database running
- ✅ Node.js 18+ installed
- ✅ User account created in SUPERNova

---

## Step 1: Environment Setup

### SUPERNova `.env`
```bash
# Copy from .env.example
cp .env.example .env

# Add these values
DATABASE_URL="postgresql://user:password@localhost:5432/daitaniverse"
JWT_SECRET="your-secret-key-min-32-chars"
VENUED_URL="http://localhost:3000"
```

### VENUED `.env`
```bash
# Create .env file
NEXT_PUBLIC_SUPERNOVA_URL="http://localhost:3001"
```

---

## Step 2: Database Setup

```bash
cd supernova
npx prisma db push
npx prisma generate
```

---

## Step 3: Install Dependencies

```bash
# SUPERNova
cd supernova
npm install

# VENUED
cd ../venued
npm install
```

---

## Step 4: Start Applications

```bash
# Terminal 1 - SUPERNova
cd supernova
npm run dev
# Runs on http://localhost:3001

# Terminal 2 - VENUED
cd venued
npm run dev
# Runs on http://localhost:3000
```

---

## Step 5: Test SSO Flow

1. **Login to SUPERNova**
   - Navigate to `http://localhost:3001`
   - Login with your credentials

2. **Launch VENUED**
   - Click "LAUNCH VENUED" button in sidebar
   - New tab opens automatically

3. **Verify Connection**
   - You should see "Connected to SUPERNova" banner
   - Your user info appears in VENUED

4. **Create a Project**
   - Click "Backstage" in VENUED
   - Create a new project
   - It saves to PostgreSQL automatically

---

## Step 6: View SSO Status

1. Navigate to `http://localhost:3001/sso`
2. See all connected apps
3. View VENUED stats (if you have data)

---

## Troubleshooting

### "Invalid SSO token"
- Check that `JWT_SECRET` is set in SUPERNova `.env`
- Verify both apps are running

### VENUED stays loading
- Check browser console for errors
- Verify `NEXT_PUBLIC_SUPERNOVA_URL` is correct
- Test API endpoint:
```bash
curl http://localhost:3001/api/sso/status
```

### Token expired
- Tokens expire after 5 minutes
- Click "LAUNCH VENUED" again to get a new token

---

## Next Steps

- Read full documentation: `SSO_IMPLEMENTATION_COMPLETE.md`
- Review security guide: `SSO_SECURITY.md`
- Check VENUED features: `VENUED_SSO_README.md`

---

**Need Help?**
- GitHub Issues: [supernova-build/issues](https://github.com/your-repo/issues)
- Email: support@daitaniverse.com
