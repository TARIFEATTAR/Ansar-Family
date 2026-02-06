# 📧 Complete Email Flows Testing Guide

## 🎯 Overview
This guide covers testing all email flows in the Ansar Family platform:
1. **Welcome Seeker** (SMS + Email) ✅ Tested
2. **Welcome Ansar** (SMS + Email) ⚠️ Needs Testing
3. **Welcome Partner** (SMS + Email) ⚠️ Needs Testing
4. **Pairing Seeker** (SMS + Email) ⚠️ Needs Testing

---

## ✅ Pre-Test Checklist

### 1. Verify Resend Domain
- **Current "From" Address:** `welcome@ansar.family`
- **Action:** Go to [Resend Dashboard](https://resend.com/domains)
- **Check:** Domain `ansar.family` is verified ✅
- **If NOT verified:** Add domain and configure DNS records (SPF, DKIM, DMARC)

### 2. Verify Environment Variables
```bash
# Check Convex environment variables
npx convex env list | grep -E "(RESEND|TWILIO)"
```

**Should show:**
- ✅ `RESEND_API_KEY=<your-api-key>`
- ✅ `TWILIO_ACCOUNT_SID=<your-account-sid>`
- ✅ `TWILIO_AUTH_TOKEN=<your-auth-token>`
- ✅ `TWILIO_PHONE_NUMBER=<your-phone-number>`

### 3. Verify Database Schema
- ✅ `messages` table exists for audit logging
- ✅ All required fields are present

---

## 🧪 Test 1: Welcome Ansar Email Flow

### Step 1: Submit Ansar Application
1. Navigate to: `https://ansar.family/volunteer` (or your deployed URL)
2. Fill out the Ansar application form:
   - **Full Name:** Test Ansar
   - **Email:** Use your **real email address** for testing
   - **Phone:** Use your **real phone number** for SMS testing
   - Fill all required fields
   - Accept agreements
3. Submit the form

### Step 2: Check SMS Delivery
- **Timeline:** SMS should arrive within 10-30 seconds
- **Expected Content:**
  ```
  JazakAllahu Khair Test Ansar! Your Ansar application is received 💚 
  We'll review it within 3-5 days. - Ansar Family
  
  Reply STOP to opt out.
  ```

### Step 3: Check Email Delivery
- **Timeline:** Email should arrive within 10-30 seconds
- **Check locations:**
  - ✅ Inbox
  - ✅ Spam/Junk folder (check here first!)
  - ✅ Promotions tab (Gmail)

**Expected Email Content:**
- ✅ **Subject:** "Thank you for stepping up, Test Ansar 💚"
- ✅ Branded header: "Ansar Family" with "Every Heart Rooted" tagline
- ✅ Personalized greeting: "JazakAllahu Khair, Test Ansar 💚"
- ✅ "What to Expect" section with 3 steps:
  1. Application Review (3-5 business days)
  2. Training Access (10-minute "Ansar Way" training)
  3. Community Integration (local Partner community)
- ✅ Reminder block about Ansar role (presence, not heavy mentoring)

### Step 4: Verify Audit Log
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to: **Data** → **messages** table
3. Filter by `template: "welcome_ansar"`
4. Should see **2 entries**:
   - One with `type: "sms"` and `status: "sent"`
   - One with `type: "email"` and `status: "sent"`
5. Check `externalId` field:
   - SMS: Should have Twilio SID (starts with `SM`)
   - Email: Should have Resend ID

---

## 🧪 Test 2: Welcome Partner Email Flow

### Step 1: Submit Partner Application
1. Navigate to: `https://ansar.family/partner` (or your deployed URL)
2. Fill out the Partner Hub application form:
   - **Lead Name:** Test Partner Lead
   - **Lead Email:** Use your **real email address** for testing
   - **Lead Phone:** Use your **real phone number** for SMS testing
   - **Organization Name:** Test Community Center
   - Fill all required fields
   - Accept agreements
3. Submit the form

### Step 2: Check SMS Delivery
- **Timeline:** SMS should arrive within 10-30 seconds
- **Expected Content:**
  ```
  Assalamu Alaikum! Test Community Center's Partner application is received 🏛️ 
  We'll be in touch within 3-5 days to schedule an intro call. - Ansar Family
  ```

### Step 3: Check Email Delivery
- **Timeline:** Email should arrive within 10-30 seconds
- **Check locations:** Inbox, Spam, Promotions tab

**Expected Email Content:**
- ✅ **Subject:** "Your Partner Application is In, Test Community Center 🏛️"
- ✅ Branded header: "Ansar Family" with "Every Heart Rooted" tagline
- ✅ Personalized greeting: "Assalamu Alaikum, Test Partner Lead 🏛️"
- ✅ Organization name mentioned: "Thank you for registering **Test Community Center**"
- ✅ "What Happens Next" section with 3 steps:
  1. Intro Call (15-minute check-in within 3-5 days)
  2. Dashboard Access (at `ansar.family/test-community-center`)
  3. Toolkit & Training (resources for hosting gatherings)
- ✅ What you get section (custom intake forms, dashboard, event toolkit)

### Step 4: Verify Audit Log
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to: **Data** → **messages** table
3. Filter by `template: "welcome_partner"`
4. Should see **2 entries**:
   - One with `type: "sms"` and `status: "sent"`
   - One with `type: "email"` and `status: "sent"`

---

## 🧪 Test 3: Pairing Seeker Email Flow

### Prerequisites
- ✅ At least one Seeker (intake) exists in the system
- ✅ At least one Ansar exists with `status: "approved"` or `status: "active"`
- ✅ An Organization exists
- ✅ You have Partner Lead access to create pairings

### Step 1: Create Pairing via Dashboard
1. Navigate to: `https://ansar.family/dashboard/[your-org-slug]`
2. Sign in as Partner Lead
3. Go to **Pairing** tab
4. Find a Seeker in "Ready to Pair" list
5. Click **"Pair with Ansar"** button
6. Select an Ansar from the modal
7. Click **"Create Pairing"**

### Step 2: Check SMS Delivery
- **Timeline:** SMS should arrive within 10-30 seconds
- **Expected Content:**
  ```
  Great news [SeekerFirstName]! You've been paired with [AnsarName] from [CommunityName]. 
  They'll reach out soon to connect 🤝 - Ansar Family
  ```

### Step 3: Check Email Delivery
- **Timeline:** Email should arrive within 10-30 seconds
- **Check locations:** Inbox, Spam, Promotions tab

**Expected Email Content:**
- ✅ **Subject:** "Great news, [SeekerFirstName]! Meet your Ansar 🤝"
- ✅ Branded header: "Ansar Family" with "Every Heart Rooted" tagline
- ✅ Personalized greeting: "Great News, [SeekerFirstName]! 🤝"
- ✅ Ansar Card section:
  - Ansar's initial in a circle
  - Ansar's full name
  - "Your Ansar at [CommunityName]"
- ✅ "What to expect" section explaining casual meetup
- ✅ Community info box (if jumaTime/monthlyGathering available)

### Step 4: Verify Audit Log
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to: **Data** → **messages** table
3. Filter by `template: "pairing"` or `template: "pairing_seeker"`
4. Should see **2 entries**:
   - One with `type: "sms"` and `status: "sent"`
   - One with `type: "email"` and `status: "sent"`

---

## 🔍 Troubleshooting

### Email Not Arriving

**Check 1: Resend Dashboard**
- Go to [Resend Dashboard](https://resend.com/emails)
- Check "Emails" tab for delivery status
- Look for error messages

**Check 2: Domain Verification**
- Go to [Resend Domains](https://resend.com/domains)
- Ensure `ansar.family` is verified ✅
- Check DNS records are correct

**Check 3: Spam Folder**
- Check spam/junk folder
- Mark as "Not Spam" to improve deliverability

**Check 4: Convex Logs**
- Go to [Convex Dashboard](https://dashboard.convex.dev) → **Logs**
- Look for errors related to `sendWelcomeEmail` or `sendPairingEmail`
- Check for "Missing Resend configuration" errors

**Check 5: Messages Table**
- Check `messages` table for failed entries
- Look at `errorMessage` field for details

### SMS Not Arriving

**Check 1: Twilio Console**
- Go to [Twilio Console](https://console.twilio.com) → **Messaging** → **Logs**
- Filter by "Outbound" messages
- Check delivery status and error messages

**Check 2: Phone Number Format**
- Ensure phone numbers are in E.164 format (`+15551234567`)
- The system should auto-normalize, but verify in logs

**Check 3: A2P 10DLC Registration**
- If sending to US numbers, ensure A2P 10DLC Brand and Campaign are registered
- Check Twilio Console → **Messaging** → **Regulatory Compliance**

**Check 4: Convex Logs**
- Check Convex Dashboard → **Logs**
- Look for errors related to `sendWelcomeSMS` or `sendPairingSMS`

### Notifications Not Triggering

**Check 1: Form Submission**
- Verify form actually submits successfully
- Check browser console for errors
- Check Convex Dashboard → **Logs** for mutation errors

**Check 2: Scheduler**
- Check Convex Dashboard → **Scheduled Functions**
- Should see scheduled actions after form submission
- If not appearing, check for errors in mutation

**Check 3: Code Path**
- Verify `ctx.scheduler.runAfter(0, ...)` is being called
- Check that `internal.notifications.sendWelcomeEmail` exists
- Verify function names match exactly

---

## 📊 Success Criteria

### ✅ All Tests Pass When:
1. **Welcome Ansar:**
   - ✅ SMS arrives within 30 seconds
   - ✅ Email arrives within 30 seconds
   - ✅ Both logged in `messages` table with `status: "sent"`
   - ✅ Email content matches template exactly
   - ✅ SMS content matches template exactly

2. **Welcome Partner:**
   - ✅ SMS arrives within 30 seconds
   - ✅ Email arrives within 30 seconds
   - ✅ Both logged in `messages` table with `status: "sent"`
   - ✅ Email includes organization name and slug
   - ✅ Content matches template exactly

3. **Pairing Seeker:**
   - ✅ SMS arrives within 30 seconds
   - ✅ Email arrives within 30 seconds
   - ✅ Both logged in `messages` table with `status: "sent"`
   - ✅ Email includes Ansar name and community name
   - ✅ Ansar card displays correctly

---

## 🎯 Next Steps After Testing

1. **Document Any Issues:**
   - Note any email delivery delays
   - Document any template rendering issues
   - Track any error messages

2. **Monitor Production:**
   - Set up daily checks of `messages` table
   - Monitor failed message rate
   - Check Resend and Twilio dashboards regularly

3. **Future Enhancements:**
   - Add Ansar approval email (when status changes to "approved")
   - Add Partner approval email (when status changes to "approved")
   - Add Ansar training completion email
   - Add jumaTime and monthlyGathering to pairing email

---

## 📝 Quick Reference

### Email Templates Location
- **File:** `convex/notifications.ts`
- **Functions:**
  - `getWelcomeSeekerEmail()` - Lines 117-207
  - `getWelcomeAnsarEmail()` - Lines 212-272
  - `getWelcomePartnerEmail()` - Lines 277-341
  - `getPairingSeekerEmail()` - Lines 346-397

### SMS Templates Location
- **File:** `convex/notifications.ts`
- **Functions:**
  - `getWelcomeSeekerSMS()` - Line 403
  - `getWelcomeAnsarSMS()` - Line 407
  - `getWelcomePartnerSMS()` - Line 411
  - `getPairingSMS()` - Line 415

### Trigger Locations
- **Welcome Seeker:** `convex/intakes.ts` - Lines 73-88
- **Welcome Ansar:** `convex/ansars.ts` - Lines 90-104
- **Welcome Partner:** `convex/partners.ts` - Lines 152-169
- **Pairing Seeker:** `convex/pairings.ts` - Lines 80-105 (NEW)

---

**Last Updated:** January 26, 2026
