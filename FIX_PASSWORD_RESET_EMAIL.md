# Fix Password Reset Email - Step by Step

## Issue: Password Reset Emails Not Being Received

Based on your Supabase dashboard, here's exactly what to check and fix:

## ✅ Step 1: Check "Reset password" Email Template

1. Go to **Authentication** → **Settings** → **Emails** → **Templates** tab
2. Click on **"Reset password"** (not "Confirm sign up")
3. **Check if the template exists and has content**

### If Template is Empty or Missing:

**Subject:** 
```
Reset Your Password
```

**Message Body (Source tab):**
```html
<h2>Reset Your Password</h2>

<p>Click the link below to reset your password:</p>

<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>This link will expire in 1 hour.</p>
```

**Important:** Make sure `{{ .ConfirmationURL }}` is included (with the dot and spaces as shown)

4. Click **"Save changes"** at the bottom

## ✅ Step 2: Verify Redirect URLs

1. Go to **Authentication** → **Settings** → **URL Configuration**
2. In **Redirect URLs**, make sure you have:
   ```
   http://localhost:8080/reset-password
   http://localhost:8080/*
   ```
3. If you have a production domain, also add:
   ```
   https://yourdomain.com/reset-password
   https://yourdomain.com/*
   ```
4. Click **Save**

## ✅ Step 3: Verify SMTP Settings

1. Go to **Authentication** → **Settings** → **Emails** → **SMTP Settings** tab
2. Make sure **"Enable Custom SMTP"** is **ON**
3. Verify all fields are filled:
   - ✅ Host: `smtp.gmail.com` (or your SMTP host)
   - ✅ Port: `587`
   - ✅ Username: Your email
   - ✅ Password: Your app password
   - ✅ Sender Email: `torobaev.nursultan@gmail.com`
   - ✅ Sender Name: `SelfHub AI`

## ✅ Step 4: Test and Check Logs

1. **Request a password reset** from your app
2. Go to **Logs** → **Auth Logs** in Supabase
3. Look for the password reset request
4. Check for any error messages

## 🔍 Common Issues

### Issue: Template Missing `{{ .ConfirmationURL }}`
**Fix:** Add `{{ .ConfirmationURL }}` to the template (exactly as shown, with spaces)

### Issue: Redirect URL Not Allowed
**Fix:** Add `http://localhost:8080/reset-password` to Redirect URLs

### Issue: SMTP Not Working
**Fix:** 
- Test SMTP credentials
- For Gmail, make sure you're using App Password (not regular password)
- Check if Gmail is blocking automated emails

### Issue: Email Going to Spam
**Fix:**
- Check spam folder
- Verify sender email is correct
- Make sure SMTP is properly configured

## 🧪 Quick Test

1. Open browser console (F12)
2. Request password reset
3. Check console for: `Password reset response:`
4. Check Supabase Auth Logs for email sending status

## 📝 Template Example (Copy This)

**Subject:**
```
Reset Your Password - SelfHub AI
```

**Message Body:**
```html
<h2>Reset Your Password</h2>

<p>Hello,</p>

<p>You requested to reset your password. Click the link below to create a new password:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this password reset, you can safely ignore this email.</p>

<p>Best regards,<br>SelfHub AI Team</p>
```

**Important:** The `{{ .ConfirmationURL }}` must be exactly as shown (with spaces around the dot).


