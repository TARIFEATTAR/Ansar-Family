# 📱 SMS Verification & Testing Guide

## 🎯 Goal
Verify that SMS functionality is working correctly for seeker welcome messages.

---

## ✅ Step 1: Verify Twilio Configuration

**Current Environment Variables:**
```bash
TWILIO_ACCOUNT_SID=<YOUR_TWILIO_ACCOUNT_SID> ✅
TWILIO_AUTH_TOKEN=<YOUR_TWILIO_AUTH_TOKEN> ✅
TWILIO_PHONE_NUMBER=<YOUR_TWILIO_PHONE_NUMBER> ✅
```

**Status:** All variables are set correctly ✅

---

## ⚠️ Step 2: Verify Phone Numbers in Twilio (CRITICAL for Trial Accounts)

**Important:** Twilio trial accounts can ONLY send SMS to verified phone numbers.

### How to Verify Your Phone Number:

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/
   - Log in with your Twilio account

2. **Navigate to Verified Caller IDs:**
   - Go to: **Phone Numbers** → **Verified Caller IDs** (or **Manage** → **Verified Caller IDs**)
   - Or direct link: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

3. **Add Your Test Number:**
   - Click **"Add a new Caller ID"** or **"Verify a Number"**
   - Enter your phone number in **E.164 format**: `+15551234567`
     - Format: `+[country code][number]`
     - US Example: `+15551234567` (no spaces, dashes, or parentheses)
   - Click **"Verify"**
   - Twilio will send a verification code via SMS or call
   - Enter the code to verify

4. **Verify Multiple Numbers (if needed):**
   - Add any phone numbers you want to test with
   - Each number must be verified individually

**Note:** Once you upgrade from trial to paid account, you can send to any number without verification.

---

## ✅ Step 3: Verify Phone Number Format in Code

**Current Implementation:** `convex/notifications.ts` (Line 451)

The code sends phone numbers directly to Twilio without formatting. **Twilio requires E.164 format.**

### Check: Are phone numbers coming from forms in E.164 format?

**E.164 Format Requirements:**
- Must start with `+`
- Country code (US = `1`)
- Area code + number
- No spaces, dashes, or parentheses
- Example: `+15551234567`

**If your forms collect phone numbers in other formats** (e.g., `(555) 123-4567` or `555-123-4567`), we need to normalize them.

---

## 🔍 Step 4: Check Current Phone Number Handling

Let me verify how phone numbers are being handled in the intake form:

**Location:** `convex/intakes.ts` (Line 75)
- Phone number is passed directly: `phone: args.phone`
- No formatting/normalization is applied

**Recommendation:** Add phone number normalization to ensure E.164 format.

---

## 🧪 Step 5: Test SMS Sending

### Option A: Test via Form Submission (Recommended)

1. **Submit Seeker Form:**
   - Go to: `/join` (or your live site)
   - Fill out form with a **verified phone number** (from Step 2)
   - Submit form

2. **Check SMS:**
   - Should receive within 1-2 minutes
   - Message: "Assalamu Alaikum [Name]! Welcome to Ansar Family 🌱..."

3. **Check Audit Log:**
   - Go to Convex Dashboard → **Production** deployment
   - Navigate to: **Data** → **messages** table
   - Filter by `type: "sms"` and `template: "welcome_seeker"`
   - Check `status`:
     - ✅ `"sent"` = Success (check `externalId` for Twilio SID)
     - ❌ `"failed"` = Check `errorMessage` for details

### Option B: Test via Convex Dashboard (Manual)

1. **Go to Convex Dashboard:**
   - Switch to **Production** deployment
   - Navigate to: **Functions** → **notifications** → **sendWelcomeSMS**

2. **Run Function:**
   ```json
   {
     "recipientId": "test-123",
     "phone": "+15551234567",  // Use YOUR verified number
     "firstName": "Test",
     "template": "welcome_seeker"
   }
   ```

3. **Check Result:**
   - Should return `{ success: true, sid: "SM..." }`
   - Check `messages` table for log entry

---

## 🚨 Common SMS Issues & Fixes

### Issue 1: "Unable to create record: The number +1XXXXXXXXXX is not a valid phone number"

**Cause:** Phone number not in E.164 format

**Fix:** Normalize phone numbers before sending:
```typescript
// Add this helper function
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If doesn't start with +, assume US number and add +1
  if (!cleaned.startsWith('+')) {
    // Remove leading 1 if present
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }
    cleaned = '+1' + cleaned;
  }
  
  return cleaned;
}
```

### Issue 2: "The number +1XXXXXXXXXX is unverified"

**Cause:** Trial account trying to send to unverified number

**Fix:**
1. Verify the number in Twilio Console (Step 2)
2. Or upgrade Twilio account to remove restrictions

### Issue 3: "SMS failed" in messages table

**Check:**
1. Go to Convex Dashboard → **Logs**
2. Look for error messages
3. Check `messages` table → `errorMessage` field
4. Common errors:
   - Missing Twilio env vars
   - Invalid phone format
   - Unverified number (trial account)
   - Insufficient credits

### Issue 4: SMS not arriving

**Check:**
1. Verify number is correct in `messages` table
2. Check Twilio Console → **Monitor** → **Logs** → **Messaging**
3. Look for delivery status
4. Check if number is blocked or opted out

---

## ✅ Step 6: Verify Twilio API Endpoint

**Current Endpoint:** `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

**Status:** ✅ **CORRECT** - This is the standard Twilio Messaging API endpoint

**Verification:**
- Endpoint format: ✅ Correct
- HTTP Method: ✅ POST
- Headers: ✅ Correct (Basic Auth)
- Body format: ✅ Correct (URL-encoded)

---

## 🔧 Step 7: Add Phone Number Normalization (Recommended)

To ensure all phone numbers are in E.164 format, let's add normalization:

**File:** `convex/notifications.ts`

Add this helper function and use it before sending SMS:

```typescript
/**
 * Normalizes phone number to E.164 format
 * Examples:
 *   "(555) 123-4567" → "+15551234567"
 *   "555-123-4567" → "+15551234567"
 *   "5551234567" → "+15551234567"
 *   "+15551234567" → "+15551234567" (already correct)
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If doesn't start with +, assume US number
  if (!cleaned.startsWith('+')) {
    // Remove leading 1 if present (US country code)
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }
    // Add +1 for US numbers
    cleaned = '+1' + cleaned;
  }
  
  // Validate length (US numbers should be +1 + 10 digits = 12 chars)
  if (cleaned.startsWith('+1') && cleaned.length !== 12) {
    throw new Error(`Invalid US phone number length: ${phone}`);
  }
  
  return cleaned;
}
```

Then update `sendWelcomeSMS` to normalize:
```typescript
// In sendWelcomeSMS handler, before the try block:
const normalizedPhone = normalizePhoneNumber(phone);
```

---

## 📊 Step 8: Monitor SMS Delivery

### Check Twilio Console:
1. Go to: https://console.twilio.com/us1/monitor/logs/sms
2. View recent SMS attempts
3. Check delivery status:
   - ✅ **Delivered** = Success
   - ⚠️ **Failed** = Check reason
   - ⏳ **Queued** = Still processing

### Check Convex Dashboard:
1. Go to: **Data** → **messages** table
2. Filter by `type: "sms"`
3. Check `status` column:
   - `"sent"` = Successfully sent to Twilio
   - `"failed"` = Error occurred (check `errorMessage`)

**Note:** `status: "sent"` in Convex means it was successfully sent to Twilio. Actual delivery status is tracked in Twilio Console.

---

## ✅ Quick Verification Checklist

- [ ] Twilio environment variables set in production
- [ ] Test phone number verified in Twilio Console
- [ ] Phone numbers are in E.164 format (`+15551234567`)
- [ ] SMS endpoint is correct (`/Messages.json`)
- [ ] Test SMS sent successfully
- [ ] SMS received on verified number
- [ ] `messages` table shows `status: "sent"`
- [ ] Twilio Console shows delivery status

---

## 🎯 Next Steps

1. **Verify your test number** in Twilio Console (Step 2)
2. **Test SMS** via form submission (Step 5)
3. **Check audit log** in Convex Dashboard
4. **If issues:** Check error messages and troubleshoot (Step 7)

---

## 🆘 Need Help?

**If SMS is not working:**

1. Check `messages` table for `errorMessage`
2. Check Twilio Console → Monitor → Logs
3. Verify phone number is in E.164 format
4. Verify number is verified (if trial account)
5. Check Twilio account has credits/balance

**Common Error Messages:**
- `"Unable to create record"` → Invalid phone format
- `"Unverified number"` → Need to verify in Twilio Console
- `"Missing Twilio configuration"` → Check environment variables
