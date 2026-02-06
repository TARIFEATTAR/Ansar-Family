# 🔍 SMS Troubleshooting - Status "Sent" But Not Receiving

## 🚨 Issue Identified

**Problem:** SMS shows `status: "sent"` in Convex with Twilio SID, but message not arriving.

**Observation:** Phone number in database: `5104915023` (missing country code!)

**Expected Format:** `+15104915023` (E.164 format with +1 prefix)

---

## 🔍 Root Cause Analysis

### Issue 1: Phone Number Format

**Current:** `5104915023`  
**Should Be:** `+15104915023`

**Problem:** The phone number normalization might not be working, OR the phone number was stored incorrectly before normalization was added.

---

## ✅ Step 1: Check Twilio Console

**This is the most important step!**

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/us1/monitor/logs/sms

2. **Find Your SMS:**
   - Look for the SID: `SMebf23a909a80f2d...`
   - Or search by phone number or timestamp

3. **Check Delivery Status:**
   - ✅ **Delivered** = Twilio sent it successfully (check phone/carrier)
   - ⚠️ **Failed** = Twilio couldn't deliver (check error reason)
   - ⏳ **Queued** = Still processing
   - ❌ **Undelivered** = Delivery failed

4. **Check Error Details:**
   - If failed, Twilio will show the exact error
   - Common errors:
     - "Invalid 'To' Phone Number" = Format issue
     - "Unsubscribed recipient" = User opted out
     - "Carrier filtering" = Carrier blocked it
     - "Invalid number" = Number doesn't exist

---

## 🔧 Step 2: Verify Phone Number Normalization

The code should normalize `5104915023` to `+15104915023`, but let's verify:

**Check Convex Logs:**
1. Go to Convex Dashboard → **Logs**
2. Look for SMS sending logs around `6:51:35 PM`
3. Check if you see:
   - `✅ SMS sent to +15104915023 (original: 5104915023), SID: SM...`
   - OR
   - `❌ Invalid phone number format: 5104915023`

**If normalization is failing:**
- The error would be logged
- Check `errorMessage` field in `messages` table

---

## 🔍 Step 3: Check What Was Actually Sent to Twilio

**The `externalId` shows Twilio received it, so let's check:**

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/us1/monitor/logs/sms
   - Find the message with SID: `SMebf23a909a80f2d...`

2. **Check the "To" field:**
   - What phone number did Twilio try to send to?
   - Should be: `+15104915023` (E.164 format)
   - If it's `5104915023` (without +1), that's the problem!

---

## 🚨 Common Issues & Fixes

### Issue 1: Phone Number Missing Country Code

**Symptom:** Phone number stored as `5104915023` instead of `+15104915023`

**Fix:** The normalization code should handle this, but if it's not working:

1. **Check if normalization is running:**
   - Look at Convex logs for normalization errors
   - Check `errorMessage` in `messages` table

2. **Verify normalization function:**
   - The code should convert `5104915023` → `+15104915023`
   - If it's not working, there might be an issue with the normalization logic

### Issue 2: Twilio Delivery Failed

**Symptom:** Status "sent" in Convex, but Twilio shows "Failed"

**Fix:**
- Check Twilio Console → Monitor → Logs → SMS
- Look at the error message
- Common causes:
  - Invalid number format
  - Number doesn't exist
  - Carrier filtering
  - User opted out

### Issue 3: Carrier Filtering

**Symptom:** Twilio shows "Delivered" but you don't receive it

**Fix:**
- Check spam/junk folder
- Try a different phone number
- Check if carrier is blocking short codes
- Some carriers filter SMS from unknown numbers

### Issue 4: Phone Number Format in Database

**Symptom:** Phone stored incorrectly before normalization

**Fix:**
- Check how phone numbers are being saved in `intakes` table
- Ensure forms are collecting phone numbers correctly
- Normalization happens at send time, not storage time

---

## 🔧 Immediate Actions

### Action 1: Check Twilio Console (CRITICAL)

1. Go to: https://console.twilio.com/us1/monitor/logs/sms
2. Find message with SID: `SMebf23a909a80f2d...`
3. Check:
   - What "To" number was used?
   - What's the delivery status?
   - Any error messages?

### Action 2: Check Convex Logs

1. Go to Convex Dashboard → **Logs**
2. Filter by time: `6:51:35 PM` (or around that time)
3. Look for:
   - SMS sending logs
   - Normalization errors
   - Any error messages

### Action 3: Test with Correct Format

Try submitting the form again with phone number in E.164 format:
- Enter: `+15104915023` (with +1 prefix)
- Or: `(510) 491-5023` (should normalize to +15104915023)

---

## 🔍 Debugging Steps

### Step 1: Verify Normalization is Working

**Check the code:**
- `normalizePhoneNumber()` function should convert `5104915023` → `+15104915023`
- Check if it's being called before sending to Twilio

**Test normalization:**
- Submit form with phone: `5104915023`
- Check Convex logs for normalization output
- Should see: `normalizedPhone: +15104915023`

### Step 2: Check What Twilio Received

**In Twilio Console:**
- Find the message
- Check "To" field
- If it's `5104915023` (no +1), normalization didn't work
- If it's `+15104915023`, normalization worked but delivery failed

### Step 3: Check Delivery Status

**In Twilio Console:**
- Check delivery status
- If "Failed", check error reason
- If "Delivered", check phone/carrier

---

## ✅ Quick Fix Checklist

- [ ] Check Twilio Console → Monitor → Logs → SMS
- [ ] Find message with SID: `SMebf23a909a80f2d...`
- [ ] Check "To" phone number format
- [ ] Check delivery status
- [ ] Check error messages (if any)
- [ ] Check Convex logs for normalization errors
- [ ] Test with phone number in E.164 format: `+15104915023`
- [ ] Check if phone number is blocked/opted out

---

## 🎯 Most Likely Causes

1. **Phone number format issue** (missing +1)
   - Normalization should fix this, but might not be working
   - Check Twilio Console to see what was actually sent

2. **Twilio delivery failure**
   - Check Twilio Console for delivery status
   - Look for specific error messages

3. **Carrier filtering**
   - Some carriers filter SMS from unknown numbers
   - Check spam/junk folder
   - Try different phone number

---

## 📊 Next Steps

1. **Check Twilio Console** - This will tell us exactly what happened
2. **Check Convex Logs** - See if normalization worked
3. **Test again** - With phone in correct format
4. **Report back** - What does Twilio Console show?

---

## 🆘 Need More Help?

**Share these details:**
1. What does Twilio Console show for delivery status?
2. What "To" number does Twilio show?
3. Any error messages in Twilio Console?
4. What do Convex logs show for normalization?

This will help identify the exact issue!
