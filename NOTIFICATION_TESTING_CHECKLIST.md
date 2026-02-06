# Notification System Testing Checklist

## ✅ Pre-Flight Checks

### 1. Environment Variables Verification
Run this command to verify all environment variables are set:
```bash
npx convex env list | grep -E "(TWILIO|RESEND)"
```

**Required Variables:**
- ✅ `TWILIO_ACCOUNT_SID` - Should start with "AC"
- ✅ `TWILIO_AUTH_TOKEN` - Should be your Twilio auth token
- ✅ `TWILIO_PHONE_NUMBER` - Should be in E.164 format (e.g., <YOUR_TWILIO_PHONE_NUMBER>)
- ✅ `RESEND_API_KEY` - Should start with "re_"

**If any are missing:**
```bash
npx convex env set TWILIO_ACCOUNT_SID <your_value>
npx convex env set TWILIO_AUTH_TOKEN <your_value>
npx convex env set TWILIO_PHONE_NUMBER <your_value>
npx convex env set RESEND_API_KEY <your_value>
```

---

### 2. Email "From" Address Configuration

**Current Setting:** `welcome@ansar.family`

**Action Required:**
1. Check if `ansar.family` is verified in your Resend dashboard
2. If using a different domain, update line ~631 in `convex/notifications.ts`:
   ```typescript
   from: "Ansar Family <welcome@your-verified-domain.com>",
   ```
3. Also update line ~704 for pairing emails

**To Verify Domain:**
- Go to Resend Dashboard → Settings → Domains
- Ensure your domain shows "Verified" status
- Check that SPF, DKIM, and DMARC records are configured

---

### 3. Twilio Trial Account Setup

**Important:** Twilio trial accounts can only send SMS to verified numbers.

**Action Required:**
1. Go to Twilio Console → Phone Numbers → Verified Caller IDs
2. Add your test phone number(s) to the verified list
3. Format: E.164 format (e.g., +15551234567)

**To Upgrade (if needed):**
- Go to Twilio Console → Settings → General
- Add payment method to remove trial restrictions

---

## 🧪 Testing Steps

### Test 1: Seeker Form Submission

1. **Submit the form:**
   - Go to `/join` (or `/[slug]/join` for partner-specific)
   - Fill out the form with your real phone number and email
   - Submit

2. **Check SMS:**
   - Should receive within 1-2 minutes
   - Message should say: "Assalamu Alaikum [Name]! Welcome to Ansar Family..."
   - Includes link to `/resources/new-muslim`

3. **Check Email:**
   - Check inbox (and spam folder)
   - Should have subject: "Welcome to the Family, [Name] 🌱"
   - Should include branded email template
   - Should have CTA button to "View Your Starter Kit"

4. **Check Audit Log:**
   - Go to Convex Dashboard → Data → `messages` table
   - Should see 2 entries (SMS + Email)
   - Both should have `status: "sent"`
   - SMS should have `externalId` (Twilio SID)
   - Email should have `externalId` (Resend ID)

---

### Test 2: Ansar Form Submission

1. **Submit the form:**
   - Go to `/volunteer` (or `/[slug]/volunteer`)
   - Fill out with your real phone and email
   - Submit

2. **Check SMS:**
   - Should say: "JazakAllahu Khair [Name]! Your Ansar application is received..."

3. **Check Email:**
   - Subject: "Thank you for stepping up, [Name] 💚"
   - Should explain the 3-step process (Review → Training → Integration)

4. **Check Audit Log:**
   - Verify 2 entries in `messages` table

---

### Test 3: Partner Form Submission

1. **Submit the form:**
   - Go to `/partner`
   - Fill out with your real phone and email
   - Submit

2. **Check SMS:**
   - Should say: "Assalamu Alaikum! [OrgName]'s Partner application is received..."

3. **Check Email:**
   - Subject: "Your Partner Application is In, [OrgName] 🏛️"
   - Should include dashboard URL preview

4. **Check Audit Log:**
   - Verify 2 entries in `messages` table

---

## 🔍 Troubleshooting

### SMS Not Sending

**Check 1: Twilio Configuration**
```bash
npx convex env list | grep TWILIO
```
- Verify all 3 variables are set
- Check that phone number is in E.164 format (+1...)

**Check 2: Verified Numbers**
- Go to Twilio Console → Verified Caller IDs
- Ensure your test number is verified (trial accounts only)

**Check 3: Messages Table**
- Check `messages` table for failed entries
- Look at `errorMessage` field for details
- Common errors:
  - "Missing Twilio configuration" → Env vars not set
  - "Unable to create record" → Invalid phone format
  - "The number +1... is unverified" → Add to verified list

**Check 4: Convex Logs**
- Go to Convex Dashboard → Logs
- Look for errors related to `sendWelcomeSMS`
- Check for console.error messages

---

### Email Not Sending

**Check 1: Resend Configuration**
```bash
npx convex env list | grep RESEND
```
- Verify API key is set

**Check 2: Domain Verification**
- Go to Resend Dashboard → Domains
- Ensure domain is verified
- Check DNS records are correct

**Check 3: "From" Address**
- Must match verified domain
- Current: `welcome@ansar.family`
- Update if using different domain

**Check 4: Messages Table**
- Check for failed entries
- Look at `errorMessage` field
- Common errors:
  - "Missing Resend configuration" → API key not set
  - "Invalid 'from' field" → Domain not verified
  - "Domain not verified" → Verify domain in Resend

**Check 5: Spam Folder**
- Emails might go to spam initially
- Check spam/junk folder
- Mark as "Not Spam" to improve deliverability

---

### Notifications Not Triggering

**Check 1: Form Submission**
- Verify form actually submits successfully
- Check browser console for errors
- Check Convex Dashboard → Logs for mutation errors

**Check 2: Scheduler**
- Check Convex Dashboard → Scheduled Functions
- Should see scheduled actions after form submission
- If not appearing, check for errors in mutation

**Check 3: Code Path**
- Verify `ctx.scheduler.runAfter(0, ...)` is being called
- Check that `internal.notifications.sendWelcomeSMS` exists
- Verify function names match exactly

---

## 📊 Monitoring

### Daily Checks

1. **Messages Table Health:**
   ```sql
   -- In Convex Dashboard → Data → Query
   -- Check failed messages
   db.messages.filter(q => q.eq(q.field("status"), "failed"))
   ```

2. **Success Rate:**
   - Total sent vs failed
   - Should be >95% success rate

3. **Response Times:**
   - SMS: Usually <30 seconds
   - Email: Usually <10 seconds

---

## 🚀 Production Readiness

### Before Going Live:

- [ ] All environment variables set in production Convex deployment
- [ ] Email "from" address matches verified domain
- [ ] Twilio account upgraded from trial (if needed)
- [ ] Test all three forms (Seeker, Ansar, Partner)
- [ ] Verify SMS and Email delivery
- [ ] Check messages table for successful logs
- [ ] Monitor for 24 hours to ensure stability
- [ ] Set up error alerts (optional)

---

## 🎯 Quick Test Command

Run this to test a single notification manually (after setting up test data):

```typescript
// In Convex Dashboard → Functions → Run
// Test SMS
await ctx.runAction(internal.notifications.sendWelcomeSMS, {
  recipientId: "test-123",
  phone: "+15551234567", // Your verified number
  firstName: "Test",
  template: "welcome_seeker",
});

// Test Email
await ctx.runAction(internal.notifications.sendWelcomeEmail, {
  recipientId: "test-123",
  email: "your-email@example.com",
  firstName: "Test",
  fullName: "Test User",
  template: "welcome_seeker",
  journeyType: "new_muslim",
});
```

---

## ✅ Success Criteria

Your notification system is working perfectly when:

1. ✅ All environment variables are set
2. ✅ SMS arrives within 1-2 minutes of form submission
3. ✅ Email arrives within 10-30 seconds of form submission
4. ✅ Messages table shows `status: "sent"` for both
5. ✅ `externalId` fields are populated (Twilio SID / Resend ID)
6. ✅ No failed messages in the audit log
7. ✅ Email "from" address matches verified domain
8. ✅ All three user types (Seeker, Ansar, Partner) receive notifications

---

## 🆘 Need Help?

If notifications aren't working:

1. Check Convex Dashboard → Logs for errors
2. Check `messages` table for failed entries
3. Verify environment variables are set
4. Test with verified phone numbers (Twilio trial)
5. Verify domain is verified (Resend)
