# Debug Password Reset Email Issue

## ✅ Good News: Request is Working!

Your log shows:
- **Status: 200** ✅ (Success)
- **Action: "user_recovery_requested"** ✅ (Password reset was requested)
- **No errors in the log** ✅

This means the code is working correctly, but the **email is not being sent**.

## 🔍 The Problem: Email Not Being Sent

Since the request succeeds but no email arrives, the issue is in **email configuration**.

## 🛠️ Fix Steps

### Step 1: Check "Reset password" Email Template

1. Go to **Authentication** → **Settings** → **Emails** → **Templates** tab
2. **Click on "Reset password"** (make sure it's selected, not "Confirm sign up")
3. **Check if the template has content**

**If template is empty or missing:**

**Subject:**
```
Reset Your Password - SelfHub AI
```

**Message Body (Source tab):**
```html
<h2>Reset Your Password</h2>

<p>Click the link below to reset your password:</p>

<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

**CRITICAL:** Must include `{{ .ConfirmationURL }}` (with spaces around the dot)

4. Click **"Save changes"**

### Step 2: Verify SMTP is Working

1. Go to **Authentication** → **Settings** → **Emails** → **SMTP Settings** tab
2. Check:
   - ✅ "Enable Custom SMTP" is **ON**
   - ✅ All fields are filled:
     - Host: `smtp.gmail.com`
     - Port: `587`
     - Username: Your email
     - Password: Your Gmail App Password (16 characters)
     - Sender Email: `torobaev.nursultan@gmail.com`
     - Sender Name: `SelfHub AI`

### Step 3: Test SMTP Connection

**For Gmail:**
1. Make sure you're using an **App Password** (not your regular password)
2. Get App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Other (Custom name)"
4. Enter "SelfHub AI"
5. Copy the 16-character password
6. Use that in SMTP Password field

### Step 4: Check for Email Sending Errors

1. Go to **Logs** → **Auth Logs** again
2. Look for entries with:
   - "email" in the message
   - "smtp" in the message
   - "mail" in the message
   - Any error status (not 200)

### Step 5: Check Gmail Settings

Gmail might be blocking automated emails:
1. Check your Gmail inbox spam folder
2. Check Gmail "Security" settings
3. Make sure "Less secure app access" is enabled (if available)
4. Or use a dedicated email service (Resend, SendGrid) instead

## 🎯 Most Likely Issues

### Issue 1: Email Template Missing `{{ .ConfirmationURL }}`
**Fix:** Add `{{ .ConfirmationURL }}` to the template

### Issue 2: SMTP Password Wrong
**Fix:** Use Gmail App Password (16 characters), not regular password

### Issue 3: Gmail Blocking Emails
**Fix:** 
- Check spam folder
- Use a different email service (Resend recommended)

### Issue 4: SMTP Not Enabled
**Fix:** Make sure "Enable Custom SMTP" is ON

## 🧪 Quick Test

1. **Update the email template** (Step 1 above)
2. **Verify SMTP settings** (Step 2 above)
3. **Request password reset again**
4. **Wait 2-3 minutes**
5. **Check email (including spam)**

## 💡 Alternative: Use Resend (Recommended)

If Gmail keeps blocking, use Resend (free tier: 3,000 emails/month):

1. Sign up: https://resend.com
2. Get API key
3. In Supabase SMTP Settings:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: Your Resend API key
   - Sender Email: Use a verified domain or `onboarding@resend.dev` for testing

## 📊 What Your Log Tells Us

✅ **Request successful** - Code is working
✅ **User exists** - Email is registered
❌ **Email not sent** - SMTP/Template issue

The fix is in Supabase email configuration, not the code!


