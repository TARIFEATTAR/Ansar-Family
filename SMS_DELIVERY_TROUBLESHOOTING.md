# 🔍 SMS Delivery Troubleshooting - Sent But Not Arriving

## 🚨 Issue: SMS Shows "Sent" But Not Receiving

**Status:** Convex shows `status: "sent"` ✅  
**Problem:** SMS not arriving on phone ❌

---

## ✅ Step 1: Check Twilio Console Delivery Status

**This is the most important check!**

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/us1/monitor/logs/sms

2. **Find Your Message:**
   - Filter for: **Outbound/Outgoing** messages
   - Or search by SID from Convex (`externalId` field)
   - Or filter by "From": `<YOUR_TWILIO_PHONE_NUMBER>`

3. **Check Delivery Status:**
   - ✅ **Delivered** = Twilio sent it successfully (check phone/carrier)
   - ⚠️ **Failed** = Delivery failed (check error message)
   - ⏳ **Queued** = Still processing (wait a bit)
   - ❌ **Undelivered** = Delivery failed

4. **Check Error Message (if Failed):**
   - Look for specific error details
   - Common errors:
     - "Invalid 'To' Phone Number"
     - "Unsubscribed recipient"
     - "Carrier filtering"
     - "Message blocked"
     - "A2P registration required"

---

## 🔍 Step 2: Common Delivery Issues & Fixes

### Issue 1: Twilio Shows "Delivered" But No SMS

**Possible Causes:**
- Carrier filtering/spam folder
- Phone number incorrect
- Carrier delay
- Phone settings blocking SMS

**Fixes:**
1. **Check spam/junk folder** on your phone
2. **Check phone number** - Is it correct in Twilio Console?
3. **Try different phone number** - Test with another number
4. **Check phone settings** - Blocked numbers, spam filters
5. **Wait a bit longer** - Sometimes there's a delay (up to 5 minutes)

### Issue 2: Twilio Shows "Failed"

**Check Error Message:**
- **"Invalid 'To' Phone Number"** = Number format issue
- **"Unsubscribed recipient"** = User opted out
- **"Carrier filtering"** = Carrier blocked it
- **"Message blocked"** = Number blocked
- **"A2P registration required"** = Need A2P 10DLC registration

**Fixes:**
- Fix the specific error
- For A2P: Complete brand + campaign registration
- For unsubscribed: User needs to opt back in
- For carrier filtering: Try different number or carrier

### Issue 3: Twilio Shows "Queued"

**Fix:**
- Wait a few minutes
- Check again in Twilio Console
- Should change to "Delivered" or "Failed"

### Issue 4: Phone Number Format Wrong

**Check "To" Number in Twilio Console:**
- ✅ Should be: `+15104915023` (E.164 format with +1)
- ❌ If it's: `5104915023` (no +1) = Normalization didn't work

**Fix:**
- Redeploy code with normalization
- Test again

---

## 🔍 Step 3: Verify Phone Number

### Check What Number Was Sent To:

1. **In Convex Dashboard:**
   - Go to: `messages` table
   - Check `recipientPhone` field
   - Is it the correct number?

2. **In Twilio Console:**
   - Check "To" field
   - Is it the correct number?
   - Is it in correct format (`+15104915023`)?

3. **Verify Your Phone Number:**
   - Make sure you're checking the right phone
   - Double-check the number you entered in the form

---

## 🔍 Step 4: Check Phone Settings

### Common Phone Issues:

1. **Spam/Junk Folder:**
   - Check spam folder
   - Check blocked messages
   - Check filtered messages

2. **Blocked Numbers:**
   - Check if `<YOUR_TWILIO_PHONE_NUMBER>` is blocked
   - Unblock if needed

3. **Carrier Filtering:**
   - Some carriers filter SMS from unknown numbers
   - Check carrier spam settings
   - Try different carrier/phone

4. **Do Not Disturb:**
   - Check if DND is enabled
   - Check notification settings

---

## 🔍 Step 5: Test with Different Number

**To isolate the issue:**

1. **Try a different phone number:**
   - Use a friend's phone
   - Use a different carrier
   - Use a different phone

2. **If it works on different number:**
   - Issue is with your specific phone/carrier
   - Check phone settings, carrier filtering

3. **If it doesn't work on any number:**
   - Issue is with Twilio/configuration
   - Check A2P registration
   - Check Twilio account status

---

## 🔍 Step 6: Check A2P Registration Status

**If Twilio shows "Failed" with A2P error:**

1. **Go to A2P 10DLC:**
   - Visit: https://console.twilio.com/us1/develop/sms/a2p-messaging
   - Or: Messaging → Regulatory Compliance → A2P 10DLC

2. **Check Brand Status:**
   - Should be "Approved"
   - If "Pending" or "Failed", fix and resubmit

3. **Check Campaign Status:**
   - Should be "Approved"
   - If "Pending" or "Failed", fix and resubmit

4. **Link Number to Campaign:**
   - Ensure `<YOUR_TWILIO_PHONE_NUMBER>` is linked to approved campaign

---

## 📊 Diagnostic Checklist

- [ ] Check Twilio Console → Delivery status
- [ ] Check "To" phone number format (`+15104915023`)
- [ ] Check error message (if failed)
- [ ] Check phone spam/junk folder
- [ ] Check phone blocked numbers
- [ ] Check phone carrier filtering settings
- [ ] Verify phone number is correct
- [ ] Try different phone number
- [ ] Check A2P registration status
- [ ] Check Convex logs for errors

---

## 🎯 Quick Test: Send Directly from Twilio

**To verify Twilio can send to your number:**

1. **Go to Twilio Console:**
   - Visit: https://console.twilio.com/us1/develop/sms/try-it-out
   - Or: Messaging → Try it Out → Send an SMS

2. **Send Test SMS:**
   - **From:** `<YOUR_TWILIO_PHONE_NUMBER>`
   - **To:** `+15104915023` (your phone)
   - **Message:** "Direct test from Twilio"
   - Click **"Send"**

3. **Check Result:**
   - ✅ If you receive it = Twilio works, issue is with app
   - ❌ If you don't receive it = Issue is with Twilio/phone/carrier

---

## 🆘 What to Report Back

**Please share:**

1. **Twilio Console Delivery Status:**
   - Delivered/Failed/Queued?
   - What error message (if failed)?

2. **"To" Phone Number:**
   - What number does Twilio show?
   - Is it correct?
   - Is it in correct format?

3. **Phone Checks:**
   - Checked spam folder?
   - Checked blocked numbers?
   - Tried different phone?

4. **Direct Twilio Test:**
   - Did you receive SMS sent directly from Twilio Console?

**This will help us identify the exact issue!**

---

## 🎯 Most Likely Causes

1. **Carrier Filtering** (Most Common)
   - Carrier blocking SMS from unknown numbers
   - Check spam folder, carrier settings

2. **A2P Registration** (If Failed)
   - Need to complete brand + campaign registration
   - Link number to campaign

3. **Phone Number Format** (If Wrong)
   - Normalization didn't work
   - Redeploy code

4. **Phone Settings** (If Delivered)
   - Spam folder, blocked numbers, DND

---

## ✅ Next Steps

1. **Check Twilio Console** → Delivery status
2. **Check phone** → Spam folder, blocked numbers
3. **Test directly** → Send SMS from Twilio Console
4. **Report back** → What you find

Let's get this working! 🚀
