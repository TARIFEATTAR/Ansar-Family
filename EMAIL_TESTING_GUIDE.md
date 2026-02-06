# Email Deliverability Testing Guide

## 🎯 Goal
Test email delivery for all three user journeys:
1. **Seeker** (`/join` form)
2. **Ansar** (`/volunteer` form)
3. **Partner Hub** (`/partner` form)

---

## ✅ Pre-Test Checklist

### 1. Verify Resend Domain
**Current "From" Address:** `welcome@ansar.family`

**Action Required:**
- Go to [Resend Dashboard](https://resend.com/domains)
- Check if `ansar.family` domain is verified
- If NOT verified:
  - Click "Add Domain"
  - Add `ansar.family`
  - Add the DNS records (SPF, DKIM, DMARC) to your domain
  - Wait for verification (usually 5-10 minutes)

**If using a different domain:**
- Update `convex/notifications.ts` line 642 and 725
- Change `welcome@ansar.family` to your verified domain

---

## 🧪 Testing Steps

### Test 1: Seeker Email (`/join` form)

**Step 1: Submit Form**
1. Navigate to: `http://localhost:3000/join` (or your deployed URL)
2. Fill out the form:
   - Use your **real email address** (important for testing)
   - Fill all required fields
   - Select a journey type (new_muslim, reconnecting, or seeker)
3. Submit the form

**Step 2: Check Email Delivery**
- **Timeline:** Email should arrive within 10-30 seconds
- **Check locations:**
  - ✅ Inbox
  - ✅ Spam/Junk folder (check here first!)
  - ✅ Promotions tab (Gmail)

**Step 3: Verify Email Content**
Expected email should have:
- ✅ Subject: "Welcome to the Family, [FirstName] 🌱"
- ✅ Branded header: "Ansar Family" with "Every Heart Rooted" tagline
- ✅ Personalized greeting based on journey type
- ✅ "What Happens Next" section with 3 steps
- ✅ CTA button: "View Your Starter Kit →" (links to `/resources/new-muslim`)
- ✅ Quote: "These resources are just to get your feet wet..."
- ✅ Emergency hotline: WhyIslam number

**Step 4: Check Audit Log**
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to: **Data** → **messages** table
3. Filter by `template: "welcome_seeker"`
4. Should see entry with:
   - `type: "email"`
   - `status: "sent"` (or "failed" if there's an issue)
   - `externalId`: Resend email ID (if successful)
   - `recipientEmail`: Your email address

---

### Test 2: Ansar Email (`/volunteer` form)

**Step 1: Submit Form**
1. Navigate to: `http://localhost:3000/volunteer`
2. Fill out the Ansar application form completely
3. Use your **real email address**
4. Submit

**Step 2: Check Email Delivery**
- Should arrive within 10-30 seconds
- Check inbox and spam folder

**Step 3: Verify Email Content**
Expected email should have:
- ✅ Subject: "Thank you for stepping up, [FirstName] 💚"
- ✅ Terracotta-colored accent box (Ansar branding)
- ✅ "What to Expect" section:
  - Application Review (3-5 days)
  - Training Access
  - Community Integration
- ✅ Reminder: "Your main role as an Ansar is *presence*..."

**Step 4: Check Audit Log**
- Filter `messages` table by `template: "welcome_ansar"`
- Verify `status: "sent"`

---

### Test 3: Partner Hub Email (`/partner` form)

**Step 1: Submit Form**
1. Navigate to: `http://localhost:3000/partner`
2. Fill out all 5 steps of the Partner application
3. Use your **real email address**
4. Submit

**Step 2: Check Email Delivery**
- Should arrive within 10-30 seconds
- Check inbox and spam folder

**Step 3: Verify Email Content**
Expected email should have:
- ✅ Subject: "Your Partner Application is In, [OrgName] 🏛️"
- ✅ Ochre-colored accent box (Partner branding)
- ✅ "What Happens Next" section:
  - Intro Call (3-5 days)
  - Dashboard Access (with slug preview)
  - Toolkit & Training
- ✅ Value prop: "Many people accept Islam in your area but don't know your community exists..."

**Step 4: Check Audit Log**
- Filter `messages` table by `template: "welcome_partner"`
- Verify `status: "sent"`

---

## 🔍 Troubleshooting Failed Emails

### If Email Status is "failed" in messages table:

**Check 1: Error Message**
- Look at `errorMessage` field in the `messages` table
- Common errors:
  - `"Missing Resend configuration"` → API key not set (but we verified it is)
  - `"Invalid 'from' field"` → Domain not verified in Resend
  - `"Domain not verified"` → Need to verify domain in Resend Dashboard

**Check 2: Domain Verification**
- Go to Resend Dashboard → Domains
- Ensure domain shows "Verified" status
- If not verified, add DNS records:
  - SPF record
  - DKIM record
  - DMARC record (optional but recommended)

**Check 3: Convex Logs**
- Go to Convex Dashboard → Logs
- Look for errors related to `sendWelcomeEmail`
- Check for console.error messages

**Check 4: API Key**
- Verify API key is correct: `npx convex env list | grep RESEND`
- Should start with `re_`

---

## 📊 Success Criteria

Email system is working correctly when:

1. ✅ All three forms trigger emails
2. ✅ Emails arrive within 10-30 seconds
3. ✅ `messages` table shows `status: "sent"` for all emails
4. ✅ `externalId` field contains Resend email ID
5. ✅ Email content matches expected templates
6. ✅ "From" address matches verified domain
7. ✅ Emails don't go to spam (after initial warm-up)

---

## 🚀 Quick Test Commands

### Test Email Function Directly (Manual)
```typescript
// In Convex Dashboard → Functions → Run
await ctx.runAction(internal.notifications.sendWelcomeEmail, {
  recipientId: "test-seeker-123",
  email: "your-email@example.com", // Your real email
  firstName: "Test",
  fullName: "Test User",
  template: "welcome_seeker",
  journeyType: "new_muslim",
});
```

### Check Recent Messages
```typescript
// In Convex Dashboard → Data → Query
db.messages
  .filter(q => q.eq(q.field("type"), "email"))
  .order("desc")
  .take(10)
```

---

## 📝 Testing Checklist

- [ ] Resend domain verified (`ansar.family` or your domain)
- [ ] Email "from" address matches verified domain
- [ ] Test Seeker form (`/join`) - Email received
- [ ] Test Ansar form (`/volunteer`) - Email received
- [ ] Test Partner form (`/partner`) - Email received
- [ ] All emails show `status: "sent"` in messages table
- [ ] Email content matches expected templates
- [ ] Links in emails work correctly
- [ ] Emails not going to spam (after warm-up period)

---

## 🎯 Next Steps After Testing

Once emails are working:

1. **Monitor for 24 hours** - Check for any failed deliveries
2. **Check spam rates** - Ensure emails aren't being marked as spam
3. **Test with different email providers** (Gmail, Outlook, Yahoo, etc.)
4. **Set up email monitoring** (optional - Resend provides analytics)
5. **Fix SMS** (once email is confirmed working)
