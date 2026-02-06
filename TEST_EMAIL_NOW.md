# 🧪 Test Email Deliverability - Step by Step

## Current Configuration ✅

- **Resend API Key:** Set ✅
- **Email "From" Address:** `welcome@ansar.family`
- **Status:** Ready to test

---

## 🚀 Quick Test Process

### Step 1: Verify Domain (CRITICAL - Do This First!)

**Before testing, verify your domain in Resend:**

1. Go to: https://resend.com/domains
2. Check if `ansar.family` is listed and shows "Verified" ✅
3. **If NOT verified:**
   - Click "Add Domain"
   - Enter `ansar.family`
   - Add the DNS records (SPF, DKIM) to your domain's DNS
   - Wait 5-10 minutes for verification

**If using a different domain:**
- Update `convex/notifications.ts` lines 642 and 725
- Change `welcome@ansar.family` to your verified domain

---

### Step 2: Start Your Dev Server

```bash
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

---

### Step 3: Test Seeker Email (`/join`)

**Action:**
1. Open: http://localhost:3000/join
2. Fill out the form with **your real email address**
3. Use any phone number (SMS testing comes later)
4. Submit the form

**What to Check:**
- ✅ Form submits successfully (shows success screen)
- ✅ Check your email inbox (within 10-30 seconds)
- ✅ Check spam folder if not in inbox
- ✅ Email subject: "Welcome to the Family, [YourName] 🌱"

**Verify in Convex:**
1. Go to: https://dashboard.convex.dev
2. Navigate to: **Data** → **messages** table
3. Look for entry with:
   - `type: "email"`
   - `template: "welcome_seeker"`
   - `status: "sent"` (or check `errorMessage` if "failed")
   - `recipientEmail`: Your email address

---

### Step 4: Test Ansar Email (`/volunteer`)

**Action:**
1. Open: http://localhost:3000/volunteer
2. Fill out all steps of the Ansar form
3. Use **your real email address**
4. Submit

**What to Check:**
- ✅ Email arrives within 10-30 seconds
- ✅ Subject: "Thank you for stepping up, [YourName] 💚"
- ✅ Email has terracotta-colored accent box

**Verify in Convex:**
- Check `messages` table for `template: "welcome_ansar"`
- Status should be "sent"

---

### Step 5: Test Partner Email (`/partner`)

**Action:**
1. Open: http://localhost:3000/partner
2. Fill out all 5 steps of the Partner form
3. Use **your real email address**
4. Submit

**What to Check:**
- ✅ Email arrives within 10-30 seconds
- ✅ Subject: "Your Partner Application is In, [OrgName] 🏛️"
- ✅ Email includes dashboard URL preview

**Verify in Convex:**
- Check `messages` table for `template: "welcome_partner"`
- Status should be "sent"

---

## 🔍 Troubleshooting Failed Emails

### If `status: "failed"` in messages table:

**Check the `errorMessage` field:**

1. **"Invalid 'from' field"** or **"Domain not verified"**
   - **Fix:** Verify `ansar.family` domain in Resend Dashboard
   - Add DNS records if needed

2. **"Missing Resend configuration"**
   - **Fix:** API key not set (but we verified it is set)
   - Run: `npx convex env list | grep RESEND`

3. **"Unauthorized"** or **"Invalid API key"**
   - **Fix:** Check API key is correct
   - Re-set: `npx convex env set RESEND_API_KEY <your-key>`

4. **Other errors:**
   - Check Convex Dashboard → Logs
   - Look for detailed error messages

---

## 📊 Success Indicators

✅ **Email system is working when:**
- All 3 forms trigger emails
- Emails arrive within 10-30 seconds
- `messages` table shows `status: "sent"`
- `externalId` contains Resend email ID (e.g., `re_...`)
- Email content matches expected templates
- No failed entries in messages table

---

## 🎯 Next Steps After Testing

Once emails are working:

1. ✅ Document any issues found
2. ✅ Fix SMS (separate task)
3. ✅ Monitor for 24 hours
4. ✅ Test with different email providers
5. ✅ Check spam rates

---

## 💡 Pro Tip

**To see all email attempts:**
```typescript
// In Convex Dashboard → Data → Query
db.messages
  .filter(q => q.eq(q.field("type"), "email"))
  .order("desc")
  .take(20)
```

This shows the last 20 email attempts with their status and error messages.
