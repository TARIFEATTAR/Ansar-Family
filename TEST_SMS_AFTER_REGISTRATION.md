# ✅ Test SMS After Registration - Step by Step

## 🎉 Great! Registration Complete

**Status:**
- ✅ Domain verified
- ✅ Number registered
- ✅ Ready to test!

---

## ✅ Step 1: Verify Code is Deployed

**Make sure the latest code with phone normalization is deployed:**

```bash
cd ansar-platform
npx convex deploy
```

**Verify deployment:**
- Check Convex Dashboard → Functions → Should show latest code
- Or check deployment logs for success

---

## ✅ Step 2: Test via Form Submission

### Option A: Test on Live Site (Recommended)

1. **Go to your live site:**
   - Visit: `https://ansar-family.vercel.app/join` (or your domain)
   - Or: `http://localhost:3000/join` (if testing locally)

2. **Fill out the Seeker Form:**
   - **Phone:** Your real phone number (any format: `(510) 491-5023`, `510-491-5023`, `5104915023`, or `+15104915023`)
   - **Email:** Your real email
   - **Name:** Your name
   - Complete all required fields

3. **Submit the form**

4. **What Should Happen:**
   - Form submits successfully
   - SMS arrives within **1-2 minutes** ✅
   - Email arrives within **10-30 seconds** ✅

---

## ✅ Step 3: Verify in Convex Dashboard

1. **Go to Convex Dashboard:**
   - Visit: https://dashboard.convex.dev
   - Switch to **Production** deployment (top right)

2. **Check Messages Table:**
   - Navigate to: **Data** → **messages** table
   - Find your test submission (should have 2 entries: SMS + Email)

3. **Check SMS Entry:**
   - `type: "sms"`
   - `template: "welcome_seeker"`
   - `status: "sent"` ✅ (should be "sent" now)
   - `recipientPhone`: Should be normalized (`+15104915023`)
   - `externalId`: Should have Twilio SID (`SM...`)
   - `errorMessage`: Should be empty/null

---

## ✅ Step 4: Verify in Twilio Console

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/us1/monitor/logs/sms

2. **Filter for Outgoing Messages:**
   - Look for filter: **"Outbound"** or **"Outgoing"**
   - Or filter by "From": `<YOUR_TWILIO_PHONE_NUMBER>`

3. **Find Your Message:**
   - Look for the SID from Convex (`externalId` field)
   - Or search by phone number or timestamp
   - Should be most recent message

4. **Check These Details:**

   **a) "To" Phone Number:**
   - ✅ Should be: `+15104915023` (E.164 format with +1)
   - ✅ Normalization working correctly

   **b) Delivery Status:**
   - ✅ **Delivered** = Success! (check your phone!)
   - ⚠️ **Failed** = Check error message
   - ⏳ **Queued** = Still processing (wait a bit)

   **c) Error Message (if failed):**
   - Should be empty/null if successful
   - If present, check specific error

---

## ✅ Step 5: Check Your Phone

- **Check SMS inbox** (within 1-2 minutes)
- **Check spam/junk folder** (just in case)
- **Message should say:** "Assalamu Alaikum [Name]! Welcome to Ansar Family 🌱 We'll connect you to your local community within 48hrs. Your starter kit: ansar.family/resources/new-muslim"

---

## 📊 Success Criteria

**SMS is working when:**

- ✅ Form submits successfully
- ✅ SMS arrives within 1-2 minutes
- ✅ Email arrives within 10-30 seconds
- ✅ Convex `messages` table shows `status: "sent"`
- ✅ Twilio Console shows **"Delivered"** (not "Undelivered")
- ✅ `externalId` populated (Twilio SID)
- ✅ Phone receives SMS

---

## 🔍 If Still Not Working

### Check 1: Twilio Console Status

**If still showing "Undelivered":**
- Click "Troubleshoot" button
- Check exact error message
- Verify A2P registration is fully approved (not just pending)

### Check 2: A2P Registration Status

**Verify it's fully approved:**
1. Go to: Messaging → Regulatory Compliance → A2P 10DLC
2. Check Brand: Should be "Approved" (not "Pending")
3. Check Campaign: Should be "Approved" (not "Pending")
4. Verify number is linked to campaign

### Check 3: Wait for Approval

**If status is "Pending":**
- Brand approval: Usually 1-2 business days
- Campaign approval: Usually 1-3 business days
- Wait for approval email from Twilio
- Test again after approval

---

## ✅ Quick Test Checklist

- [ ] Deploy code: `npx convex deploy`
- [ ] Submit seeker form with real phone number
- [ ] Check phone for SMS (1-2 minutes)
- [ ] Check email inbox (10-30 seconds)
- [ ] Verify in Convex Dashboard → `messages` table
  - [ ] Status: "sent"?
  - [ ] External ID: Has Twilio SID?
- [ ] Verify in Twilio Console → Outgoing messages
  - [ ] Delivery status: "Delivered"?
  - [ ] "To" number: Correct format?
- [ ] Check phone received SMS

---

## 🎯 Expected Results

**After registration, you should see:**

1. **Convex Dashboard:**
   - `status: "sent"` ✅
   - `externalId: "SM..."` ✅
   - No error messages ✅

2. **Twilio Console:**
   - Delivery status: **"Delivered"** ✅ (not "Undelivered")
   - "To" number: `+15104915023` ✅
   - No error messages ✅

3. **Your Phone:**
   - SMS arrives within 1-2 minutes ✅
   - Message content correct ✅

---

## 🚀 Ready to Test!

1. **Deploy code** (if not already done)
2. **Submit form** with your phone number
3. **Check both** Convex and Twilio
4. **Check your phone** for SMS

**Let's see if it works now!** 🎉

---

## 🆘 Report Back

**After testing, share:**

1. **Convex Status:**
   - Status: "sent" or "failed"?
   - External ID: What SID?

2. **Twilio Status:**
   - Delivery status: "Delivered" or "Undelivered"?
   - Any error messages?

3. **Phone:**
   - Did SMS arrive?
   - How long did it take?

**This will confirm everything is working!**
