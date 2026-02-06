# 🧪 Test SMS Now - Quick Guide

## 🎯 Goal: Test SMS and Check Status

Let's test SMS sending and verify the status in both Convex and Twilio.

---

## ✅ Method 1: Test via Your App (Recommended)

### Step 1: Deploy Code (If Not Already Done)

```bash
cd ansar-platform
npx convex deploy
```

### Step 2: Submit Seeker Form

1. **Go to your live site:**
   - Visit: `https://ansar-family.vercel.app/join` (or your domain)
   - Or locally: `http://localhost:3000/join`

2. **Fill out the form:**
   - **Phone:** Your real phone number (any format: `(510) 491-5023`, `510-491-5023`, `5104915023`, or `+15104915023`)
   - **Email:** Your real email
   - **Name:** Your name
   - Complete all required fields

3. **Submit the form**

### Step 3: Check Status in Convex Dashboard

1. **Go to Convex Dashboard:**
   - Visit: https://dashboard.convex.dev
   - Switch to **Production** deployment (top right)

2. **Check Messages Table:**
   - Navigate to: **Data** → **messages** table
   - Find your test submission (should have 2 entries: SMS + Email)

3. **Check SMS Entry:**
   - `type: "sms"`
   - `template: "welcome_seeker"`
   - `status: "sent"` ✅ or `"failed"` ❌
   - `recipientPhone`: Should be normalized (`+15104915023`)
   - `externalId`: Should have Twilio SID (`SM...`)
   - `errorMessage`: Check if status is "failed"

### Step 4: Check Status in Twilio Console

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/us1/monitor/logs/sms

2. **Filter for Outgoing Messages:**
   - Look for filter: **"Outbound"** or **"Outgoing"**
   - Or filter by "From": `<YOUR_TWILIO_PHONE_NUMBER>`

3. **Find Your Message:**
   - Look for the SID from Convex (`externalId` field)
   - Or search by phone number or timestamp
   - Should show "From": `<YOUR_TWILIO_PHONE_NUMBER>`

4. **Check These Details:**

   **a) "To" Phone Number:**
   - ✅ Should be: `+15104915023` (E.164 format with +1)
   - ❌ If it's: `5104915023` (no +1) = Normalization didn't work

   **b) Delivery Status:**
   - ✅ **Delivered** = Twilio sent it successfully (check your phone!)
   - ⚠️ **Failed** = Check error message for details
   - ⏳ **Queued** = Still processing (wait a bit)

   **c) Error Message (if failed):**
   - Look for specific error details
   - Common errors:
     - "Invalid 'To' Phone Number" = Format issue
     - "Unsubscribed recipient" = User opted out
     - "Carrier filtering" = Carrier blocked it
     - "Not registered" = A2P registration issue

### Step 5: Check Your Phone

- **Check SMS inbox** (within 1-2 minutes)
- **Check spam/junk folder**
- **Message should say:** "Assalamu Alaikum [Name]! Welcome to Ansar Family 🌱..."

---

## ✅ Method 2: Test via Twilio Console (Quick Test)

### Step 1: Send Test SMS Directly

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/us1/develop/sms/try-it-out
   - Or: Messaging → Try it Out → Send an SMS

2. **Fill out the form:**
   - **From:** `<YOUR_TWILIO_PHONE_NUMBER>` (your Twilio number)
   - **To:** `+15104915023` (your phone number)
   - **Message:** "Test SMS from Ansar Family"
   - Click **"Send"**

3. **Check Result:**
   - ✅ Success = Number is working!
   - ❌ Error = Check error message

### Step 2: Check Delivery Status

1. **Go to Monitor → Logs → SMS:**
   - Visit: https://console.twilio.com/us1/monitor/logs/sms

2. **Find Your Test Message:**
   - Should be at the top (most recent)
   - Check delivery status

---

## 📊 Status Interpretation

### Convex Shows "sent" + Twilio Shows "Delivered"
✅ **SUCCESS!** SMS was sent and delivered. Check your phone!

### Convex Shows "sent" + Twilio Shows "Failed"
⚠️ **ISSUE:** SMS was sent to Twilio but delivery failed.
- Check Twilio error message
- Common: Invalid number, carrier filtering, unsubscribed

### Convex Shows "sent" + Twilio Shows "Queued"
⏳ **PROCESSING:** SMS is being processed. Wait a bit and check again.

### Convex Shows "failed"
❌ **ISSUE:** SMS wasn't sent to Twilio.
- Check `errorMessage` in Convex
- Common: Missing env vars, normalization error, API error

### Twilio Shows "To": `5104915023` (no +1)
⚠️ **ISSUE:** Normalization didn't work.
- Redeploy code
- Check Convex logs for normalization errors

---

## 🔍 Quick Status Check Commands

### Check Convex Environment Variables:
```bash
cd ansar-platform
npx convex env list | grep TWILIO
```

Should show:
- `TWILIO_ACCOUNT_SID=<YOUR_TWILIO_ACCOUNT_SID>`
- `TWILIO_AUTH_TOKEN=<YOUR_TWILIO_AUTH_TOKEN>`
- `TWILIO_PHONE_NUMBER=<YOUR_TWILIO_PHONE_NUMBER>`

### Check Convex Logs:
1. Go to: https://dashboard.convex.dev
2. Navigate to: **Logs**
3. Filter by: SMS or notifications
4. Look for errors around test time

---

## ✅ Quick Test Checklist

- [ ] Deploy code: `npx convex deploy`
- [ ] Submit seeker form with real phone number
- [ ] Check Convex Dashboard → `messages` table
  - [ ] Status: "sent" or "failed"?
  - [ ] `externalId`: Has Twilio SID?
  - [ ] `recipientPhone`: Normalized format?
- [ ] Check Twilio Console → Outgoing messages
  - [ ] "To" number: Correct format?
  - [ ] Delivery status: Delivered/Failed/Queued?
  - [ ] Error message: Any errors?
- [ ] Check phone for SMS
  - [ ] Inbox
  - [ ] Spam folder

---

## 🎯 What to Report Back

**After testing, share:**

1. **Convex Status:**
   - `status`: "sent" or "failed"?
   - `externalId`: What SID?
   - `errorMessage`: Any errors?

2. **Twilio Status:**
   - "To" number: What format?
   - Delivery status: Delivered/Failed/Queued?
   - Error message: Any errors?

3. **Phone:**
   - Did SMS arrive?
   - How long did it take?

**This will help us identify exactly what's happening!**

---

## 🚀 Ready to Test?

1. **Deploy code** (if not done)
2. **Submit form** with your phone number
3. **Check both** Convex and Twilio
4. **Report back** what you see!

Let's get SMS working! 🎉
