# Fix Email Verification Issue - Step by Step

## 🐛 Problem
When users sign up, they receive a "Reset Password" email instead of a "Confirm Signup" email, and the link doesn't work.

## ✅ Solution: Configure Supabase Email Templates

### Step 1: Fix "Confirm signup" Email Template

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **Settings** → **Email Templates**
2. Click on **"Confirm signup"** template (NOT "Reset password")
3. Make sure it has this content:

**Subject:**
```
Confirm Your Email - SelfHub AI
```

**Message Body (Source tab):**
```html
<h2>Confirm Your Email</h2>

<p>Welcome to SelfHub AI!</p>

<p>Click the link below to verify your email address and activate your account:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't create an account, you can safely ignore this email.</p>

<p>Best regards,<br>SelfHub AI Team</p>
```

**⚠️ CRITICAL:** Make sure `{{ .ConfirmationURL }}` is included exactly as shown (with spaces around the dot)

4. Click **"Save changes"**

### Step 2: Verify Email Confirmation is Enabled

1. Go to **Authentication** → **Settings** → **Auth** tab
2. Find **"Enable email confirmations"**
3. Make sure it's **ON** (enabled)
4. If it's OFF, turn it ON and click **Save**

### Step 3: Configure Redirect URLs (IMPORTANT!)

1. Go to **Authentication** → **Settings** → **URL Configuration**
2. Set **Site URL** to your production URL:
   ```
   https://selfhub-ai-dev.vercel.app
   ```
3. In **Redirect URLs**, add these (one per line):
   ```
   https://selfhub-ai-dev.vercel.app
   https://selfhub-ai-dev.vercel.app/*
   http://localhost:8080
   http://localhost:8080/*
   http://localhost:5173
   http://localhost:5173/*
   ```
4. Click **Save**

### Step 4: Verify SMTP Settings

1. Go to **Authentication** → **Settings** → **Emails** → **SMTP Settings** tab
2. Make sure **"Enable Custom SMTP"** is **ON**
3. Verify all fields are correct:
   - ✅ Host: Your SMTP host (e.g., `smtp.gmail.com`)
   - ✅ Port: `587` (or `465` for SSL)
   - ✅ Username: Your email
   - ✅ Password: Your app password
   - ✅ Sender Email: Your verified sender email
   - ✅ Sender Name: `SelfHub AI`

### Step 5: Test Email Templates

1. Go to **Authentication** → **Settings** → **Email Templates**
2. Click **"Send test email"** next to "Confirm signup"
3. Enter your email address
4. Check if you receive the correct email

## 🔍 Troubleshooting

### Issue: Still receiving "Reset Password" email

**Possible causes:**
1. Wrong template is selected in Supabase
2. Email confirmation is disabled
3. SMTP is misconfigured

**Fix:**
1. Double-check you're editing the **"Confirm signup"** template (not "Reset password")
2. Verify "Enable email confirmations" is ON
3. Check SMTP settings are correct

### Issue: Link doesn't work / Redirects to wrong page

**Possible causes:**
1. Redirect URLs not configured correctly
2. Site URL is wrong
3. Link is expired

**Fix:**
1. Add your production URL to Redirect URLs: `https://selfhub-ai-dev.vercel.app/*`
2. Make sure Site URL matches: `https://selfhub-ai-dev.vercel.app`
3. Links expire after 24 hours - request a new confirmation email

### Issue: Email not received at all

**Possible causes:**
1. SMTP not configured
2. Email in spam folder
3. Rate limits exceeded

**Fix:**
1. Check Supabase **Logs** → **Auth Logs** for email sending errors
2. Check spam/junk folder
3. Verify SMTP credentials are correct
4. Check email provider rate limits

## 📋 Quick Checklist

- [ ] "Confirm signup" email template has `{{ .ConfirmationURL }}`
- [ ] "Enable email confirmations" is ON
- [ ] Site URL is set to production URL
- [ ] Redirect URLs include production URL with `/*`
- [ ] SMTP is enabled and configured
- [ ] Test email works

## 🧪 Test After Fix

1. Create a new test account
2. Check email inbox (and spam folder)
3. Verify email subject says "Confirm Your Email" (not "Reset Password")
4. Click the verification link
5. Should redirect to your app and log you in automatically

## 📝 Code is Already Correct

The code in `src/contexts/AuthContext.tsx` is already configured correctly:
- ✅ `emailRedirectTo` is set to `${window.location.origin}/`
- ✅ `resendConfirmationEmail` uses `type: 'signup'`

The issue is in **Supabase configuration**, not the code.

---

**Last Updated:** January 2025

