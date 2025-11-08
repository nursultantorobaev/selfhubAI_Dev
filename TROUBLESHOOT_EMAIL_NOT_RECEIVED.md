# Troubleshoot: Not Receiving Confirmation Emails

## 🔍 Step-by-Step Debugging

### Step 1: Check Supabase Auth Logs (MOST IMPORTANT)

1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Try to sign up with a new account
3. Immediately check the Auth Logs
4. Look for:
   - ✅ **Success**: "Email sent" or "Confirmation email sent"
   - ❌ **Error**: Any error messages (SMTP error, rate limit, etc.)

**What to look for:**
- If you see errors, that tells us exactly what's wrong
- If you see "Email sent" but you don't receive it, it's likely spam or SMTP issue

### Step 2: Verify Email Confirmation is Enabled

1. Go to **Authentication** → **Settings** → **Auth** tab
2. Scroll down to **"Email Auth"** section
3. Make sure **"Enable email confirmations"** is **ON** (toggle should be green/blue)
4. If it's OFF, turn it ON and **Save**

### Step 3: Check SMTP Configuration

1. Go to **Authentication** → **Settings** → **Emails** → **SMTP Settings** tab
2. Check if **"Enable Custom SMTP"** is:
   - **ON**: Your custom SMTP should be configured
   - **OFF**: Supabase uses default email (limited to 3 emails/hour)

**If Custom SMTP is OFF:**
- This might be the issue! Supabase default email has strict limits
- You need to enable Custom SMTP for production

**If Custom SMTP is ON:**
- Verify all fields are correct:
  - ✅ Host (e.g., `smtp.gmail.com`)
  - ✅ Port (`587` for TLS or `465` for SSL)
  - ✅ Username (your email)
  - ✅ Password (app password, not regular password)
  - ✅ Sender Email (must be verified)
  - ✅ Sender Name

### Step 4: Test SMTP Connection

1. In **SMTP Settings**, click **"Send test email"** (if available)
2. Enter your email address
3. Check if you receive the test email
4. If test email fails, SMTP is misconfigured

### Step 5: Check Email Template

1. Go to **Authentication** → **Settings** → **Email Templates**
2. Click **"Confirm signup"**
3. Make sure:
   - ✅ Template has content (not empty)
   - ✅ Contains `{{ .ConfirmationURL }}` exactly as shown
   - ✅ Subject is set

### Step 6: Check Redirect URLs

1. Go to **Authentication** → **Settings** → **URL Configuration**
2. **Site URL** should be: `https://selfhub-ai-dev.vercel.app`
3. **Redirect URLs** should include:
   ```
   https://selfhub-ai-dev.vercel.app
   https://selfhub-ai-dev.vercel.app/*
   ```
4. Click **Save**

### Step 7: Check Spam Folder

- Check your **spam/junk folder**
- Check **promotions tab** (Gmail)
- Check **all mail** folder
- Search for "SelfHub" or "Confirm"

### Step 8: Check Rate Limits

**Supabase Default Email:**
- Limited to **3 emails per hour**
- If you've sent 3+ emails, wait 1 hour

**Custom SMTP:**
- Check your email provider's rate limits
- Gmail: 500 emails/day (with app password)
- SendGrid: 100 emails/day (free tier)

### Step 9: Try Different Email Provider

- Try signing up with a different email (Gmail, Outlook, etc.)
- Some email providers block automated emails more aggressively

## 🚨 Common Issues & Fixes

### Issue 1: "SMTP Error" in Logs

**Fix:**
- Verify SMTP credentials are correct
- For Gmail, use **App Password** (not regular password)
- Check if your email provider requires "Less secure app access"

### Issue 2: "Rate limit exceeded"

**Fix:**
- Wait 1 hour (if using Supabase default)
- Upgrade SMTP provider plan
- Reduce testing frequency

### Issue 3: "Email sent" but not received

**Fix:**
- Check spam folder
- Verify sender email is correct
- Check email provider's spam filters
- Try different email address

### Issue 4: "Email confirmation disabled"

**Fix:**
- Go to **Authentication** → **Settings** → **Auth**
- Turn ON **"Enable email confirmations"**
- Save

### Issue 5: Wrong email template

**Fix:**
- Make sure you're editing **"Confirm signup"** (not "Reset password")
- Verify template has `{{ .ConfirmationURL }}`
- Save changes

## 🧪 Quick Test Checklist

Run through this checklist:

- [ ] Checked Supabase Auth Logs for errors
- [ ] "Enable email confirmations" is ON
- [ ] SMTP is configured (or using Supabase default)
- [ ] Email template has `{{ .ConfirmationURL }}`
- [ ] Redirect URLs include production URL
- [ ] Checked spam folder
- [ ] Not exceeded rate limits
- [ ] Tried different email address

## 📞 What to Share for Help

If still not working, share:
1. **Screenshot of Auth Logs** (showing the signup attempt)
2. **SMTP Settings** (with sensitive info hidden)
3. **Email Template** (screenshot)
4. **Any error messages** from logs

## 🔧 Alternative: Disable Email Confirmation (Temporary)

If you need to test other features while fixing email:

1. Go to **Authentication** → **Settings** → **Auth**
2. Turn OFF **"Enable email confirmations"**
3. Users can sign in immediately without verification
4. **⚠️ Not recommended for production** - turn it back ON after fixing

---

**Most Common Cause:** SMTP not configured or misconfigured. Check Step 3 first!

