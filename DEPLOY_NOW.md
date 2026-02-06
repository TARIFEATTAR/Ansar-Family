# 🚀 Deploy to Production - Action Plan

## Current Status
- ✅ **Dev Deployment:** `tremendous-schnauzer-492` (working, emails tested)
- ✅ **Production Deployment:** `healthy-malamute-80` (exists, needs update)
- ❌ **Production Convex URL:** Not set in Vercel yet
- ❌ **Production Env Vars:** Not set in production Convex yet

---

## Step 1: Deploy Convex to Production

```bash
cd ansar-platform
npx convex deploy
```

When prompted, type `y` to confirm.

This will:
- Push your latest code (including notifications) to production
- Show you the production URL: `https://healthy-malamute-80.convex.cloud`

---

## Step 2: Set Environment Variables in Production Convex

**After deploying, run these commands:**

```bash
# Set production environment variables
npx convex env set RESEND_API_KEY <YOUR_RESEND_API_KEY>
npx convex env set TWILIO_ACCOUNT_SID <YOUR_TWILIO_ACCOUNT_SID>
npx convex env set TWILIO_AUTH_TOKEN <YOUR_TWILIO_AUTH_TOKEN>
npx convex env set TWILIO_PHONE_NUMBER <YOUR_TWILIO_PHONE_NUMBER>
```

**Verify:**
```bash
npx convex env list
```

Should show all 4 variables listed.

---

## Step 3: Update Vercel Environment Variables ⚠️ CRITICAL

**YES, you MUST set the production Convex URL in Vercel!**

1. Go to: https://vercel.com/dashboard
2. Select your project (likely `ansar-platform` or similar)
3. Go to: **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_CONVEX_URL`
5. **Update it to:** `https://healthy-malamute-80.convex.cloud`
   - (Replace the dev URL with the production URL)

**Also check these are set:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production key, not test)
- `CLERK_SECRET_KEY` (production secret, not test)

---

## Step 4: Redeploy Vercel

After updating environment variables:

1. Go to Vercel Dashboard → **Deployments**
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger auto-deploy

**Important:** Vercel needs to rebuild with the new `NEXT_PUBLIC_CONVEX_URL` for production to work!

---

## Step 5: Test Production

After Vercel redeploys:

1. Go to your live site (e.g., `https://ansar-family.vercel.app`)
2. Submit a test form (`/join`, `/volunteer`, or `/partner`)
3. Check your email inbox
4. Verify in Convex Dashboard:
   - Switch to **Production** deployment (top right)
   - Go to **Data** → **messages** table
   - Should see `status: "sent"`

---

## ✅ Quick Checklist

- [ ] Run `npx convex deploy` (confirm with `y`)
- [ ] Set 4 environment variables in production Convex
- [ ] Verify env vars: `npx convex env list`
- [ ] Update `NEXT_PUBLIC_CONVEX_URL` in Vercel to production URL
- [ ] Redeploy Vercel
- [ ] Test on live site
- [ ] Verify emails arrive
- [ ] Check production `messages` table

---

## 🎯 Why This Matters

**Dev vs Production are SEPARATE:**
- **Dev:** `tremendous-schnauzer-492` → Used by `npm run dev` (local)
- **Production:** `healthy-malamute-80` → Used by Vercel (live site)

**If Vercel uses the dev URL:**
- ❌ Your live site connects to dev database
- ❌ Test data mixes with real data
- ❌ Environment variables won't work

**After fixing:**
- ✅ Live site uses production database
- ✅ Production environment variables work
- ✅ Emails send from production

---

## 🚨 Common Mistake

**Don't forget:** After updating Vercel env vars, you MUST redeploy! Vercel doesn't automatically rebuild when you change environment variables.
