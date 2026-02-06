# Production Deployment Guide

## 🎯 Goal
Deploy the notification system (and entire app) to production so emails work on your live site.

---

## 📋 Step-by-Step Deployment

### Step 1: Deploy Convex to Production

**Current Status:**
- ✅ Working in **dev** deployment
- ❌ Need to deploy to **production** deployment

**Action:**
```bash
cd ansar-platform
npx convex deploy
```

This will:
- Deploy to your **production** deployment (default)
- Deploy all your functions and schema
- Show your production Convex URL

**Note:** 
- `npx convex dev` = Development deployment (local testing)
- `npx convex deploy` = Production deployment (live site)

---

### Step 2: Set Environment Variables in Production Convex

**Critical:** Environment variables in dev are separate from production!

After deploying, set the same environment variables in production:

```bash
# Set production environment variables (no --prod flag needed, deploy sets production)
npx convex env set TWILIO_ACCOUNT_SID <YOUR_TWILIO_ACCOUNT_SID>
npx convex env set TWILIO_AUTH_TOKEN <YOUR_TWILIO_AUTH_TOKEN>
npx convex env set TWILIO_PHONE_NUMBER <YOUR_TWILIO_PHONE_NUMBER>
npx convex env set RESEND_API_KEY <YOUR_RESEND_API_KEY>
```

**Important:** When you run `npx convex deploy`, it switches to production mode. Environment variables set after that will be in production.

**Verify they're set:**
```bash
# After deploying, this shows production env vars
npx convex env list
```

---

### Step 3: Update Vercel Environment Variables

**If deploying to Vercel:**

1. Go to: https://vercel.com/dashboard
2. Select your project: `ansar-platform` (or your project name)
3. Go to: **Settings** → **Environment Variables**
4. Add/Update:
   - `NEXT_PUBLIC_CONVEX_URL` → Your **production** Convex URL (from Step 1)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → Your production Clerk key
   - `CLERK_SECRET_KEY` → Your production Clerk secret

**Important:** 
- Use **production** Convex URL (not dev URL)
- Use **production** Clerk keys (not test keys)

---

### Step 4: Redeploy Vercel

After updating environment variables:

1. Go to Vercel Dashboard → **Deployments**
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger auto-deploy

---

### Step 5: Test Production

**Test on your live site:**

1. **Seeker Email:**
   - Go to: `https://ansar-family.vercel.app/join` (or your domain)
   - Submit form with your real email
   - Check inbox/spam

2. **Ansar Email:**
   - Go to: `https://ansar-family.vercel.app/volunteer`
   - Submit form
   - Check email

3. **Partner Email:**
   - Go to: `https://ansar-family.vercel.app/partner`
   - Submit form
   - Check email

4. **Verify in Production Convex:**
   - Go to: https://dashboard.convex.dev
   - Switch to **Production** deployment (top right dropdown)
   - Navigate to: **Data** → **messages** table
   - Should see entries with `status: "sent"`

---

## 🔍 Understanding Dev vs Production

### Development Deployment
- **URL:** `https://tremendous-schnauzer-492.convex.cloud` (dev)
- **Environment:** `.env.local` → `CONVEX_DEPLOYMENT=dev:...`
- **Use:** Local development (`npm run dev`)
- **Data:** Separate database (test data)

### Production Deployment
- **URL:** `https://[your-project].convex.cloud` (prod)
- **Environment:** Vercel environment variables
- **Use:** Live site (Vercel deployment)
- **Data:** Production database (real users)

**Key Point:** They're completely separate! Environment variables, data, and deployments are independent.

---

## ✅ Production Checklist

Before going live:

- [ ] Convex deployed to production (`npx convex deploy`)
- [ ] Environment variables set in production Convex (after deploy)
- [ ] Vercel environment variables updated (production Convex URL)
- [ ] Vercel redeployed with new env vars
- [ ] Tested all 3 forms on live site
- [ ] Verified emails arrive in production
- [ ] Checked production `messages` table for successful sends
- [ ] Verified no failed messages

---

## 🚨 Common Issues

### Issue: "Environment variable not found" in production

**Fix:**
```bash
# First deploy to production (switches to prod mode)
npx convex deploy

# Then set env vars (they'll be set in production)
npx convex env set RESEND_API_KEY <key>

# Verify it's set
npx convex env list
```

### Issue: "Wrong Convex URL" in Vercel

**Fix:**
- Get production URL: `npx convex deploy --prod` (shows URL)
- Update Vercel: Settings → Environment Variables → `NEXT_PUBLIC_CONVEX_URL`

### Issue: Emails work in dev but not production

**Check:**
1. Production Convex has env vars set (`npx convex env list --prod`)
2. Vercel has correct `NEXT_PUBLIC_CONVEX_URL` (production URL)
3. Vercel deployment is using production environment

---

## 📊 Monitoring Production

**Check Production Logs:**
1. Go to: https://dashboard.convex.dev
2. Switch to **Production** deployment
3. Navigate to: **Logs**
4. Look for email sending activity

**Check Production Data:**
1. Switch to **Production** deployment
2. Navigate to: **Data** → **messages** table
3. Monitor for failed messages

---

## 🎯 Quick Commands Reference

```bash
# Deploy to production (default)
npx convex deploy

# Set production env vars (after deploy, you're in prod mode)
npx convex env set RESEND_API_KEY <key>
npx convex env set TWILIO_ACCOUNT_SID <sid>
npx convex env set TWILIO_AUTH_TOKEN <token>
npx convex env set TWILIO_PHONE_NUMBER <number>

# List production env vars
npx convex env list

# Check what will be deployed (dry run)
npx convex deploy --dry-run
```

---

## 🚀 Ready to Deploy?

Run these commands in order:

```bash
# 1. Deploy Convex to production (this switches to production mode)
npx convex deploy

# 2. Set environment variables (now in production mode)
npx convex env set RESEND_API_KEY <YOUR_RESEND_API_KEY>
npx convex env set TWILIO_ACCOUNT_SID <YOUR_TWILIO_ACCOUNT_SID>
npx convex env set TWILIO_AUTH_TOKEN <YOUR_TWILIO_AUTH_TOKEN>
npx convex env set TWILIO_PHONE_NUMBER <YOUR_TWILIO_PHONE_NUMBER>

# 3. Verify (shows production env vars)
npx convex env list
```

Then update Vercel with the production Convex URL and redeploy!
