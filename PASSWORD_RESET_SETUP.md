# Password Reset Email Setup Guide

## Issue: Password Reset Emails Not Being Sent

This guide helps you troubleshoot and fix password reset email issues.

## ✅ Code is Already Fixed

The code implementation is correct. The issue is likely in Supabase configuration.

## 🔧 Supabase Configuration Checklist

### Step 1: Verify SMTP is Configured

1. Go to **Supabase Dashboard** → **Authentication** → **Settings** → **Emails**
2. Make sure **"Enable Custom SMTP"** is **ON** (if you configured it)
3. Verify all SMTP fields are filled:
   - ✅ Host (e.g., `smtp.gmail.com`)
   - ✅ Port (e.g., `587`)
   - ✅ Username
   - ✅ Password
   - ✅ Sender Email
   - ✅ Sender Name

### Step 2: Check Redirect URLs

**This is critical for password reset!**

1. Go to **Authentication** → **Settings** → **URL Configuration**
2. Make sure these URLs are in **Redirect URLs**:
   ```
   http://localhost:8080/reset-password
   http://localhost:8080/*
   https://yourdomain.com/reset-password
   https://yourdomain.com/*
   ```
3. **Site URL** should be set to your main domain

### Step 3: Check Password Reset Email Template

1. Go to **Authentication** → **Settings** → **Email Templates**
2. Select **"Reset password"** template
3. Make sure it includes the reset link: `{{ .ConfirmationURL }}`
4. The template should look something like:
   ```
   Click the link below to reset your password:
   {{ .ConfirmationURL }}
   ```

### Step 4: Verify Email is Sent (Check Logs)

1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Try requesting a password reset
3. Look for entries related to password reset
4. Check for any error messages

## 🧪 Testing Password Reset

### Test Steps:

1. **Request Password Reset**:
   - Click "Forgot password?" in login form
   - Enter your email address
   - Click "Send Reset Link"

2. **Check for Success Message**:
   - You should see: "Reset link sent!"
   - Even if email doesn't exist, Supabase shows success (for security)

3. **Check Email**:
   - Check inbox (wait 1-2 minutes)
   - Check spam/junk folder
   - Look for email from your sender email

4. **Click Reset Link**:
   - Should redirect to `/reset-password` page
   - Should show password reset form (not "expired" error)

## 🔍 Troubleshooting

### Issue 1: "Reset link sent" but no email received

**Possible Causes:**
- Email in spam folder
- SMTP not configured correctly
- Email provider blocking automated emails
- Rate limits exceeded

**Solutions:**
1. Check spam folder
2. Verify SMTP credentials in Supabase
3. Check Supabase Auth logs for errors
4. Try with a different email provider
5. Wait a few minutes and try again (rate limits)

### Issue 2: Error when requesting reset

**Check:**
- Supabase Auth logs for specific error
- SMTP connection is working
- Redirect URLs are configured correctly

### Issue 3: Reset link shows "expired" immediately

**This was already fixed!** The code now waits up to 3 minutes for Supabase to process the token.

If still happening:
- Check browser console for errors
- Verify redirect URL is in allowed list
- Make sure you're clicking the link from the email (not copying/pasting incorrectly)

## 📋 Quick Checklist

- [ ] SMTP configured in Supabase
- [ ] Redirect URLs include `/reset-password`
- [ ] Password reset email template exists
- [ ] Site URL is set correctly
- [ ] Tested with real email address
- [ ] Checked spam folder
- [ ] Checked Supabase Auth logs

## 🚀 Common Issues & Solutions

### Gmail SMTP Issues:

**Problem**: Gmail blocks automated emails
**Solution**: 
- Use App Password (not regular password)
- Enable "Less secure app access" (if available)
- Consider using a dedicated email service (Resend, SendGrid)

### Redirect URL Not Working:

**Problem**: Reset link redirects to wrong page
**Solution**:
- Add exact URL to Redirect URLs: `http://localhost:8080/reset-password`
- Add wildcard: `http://localhost:8080/*`
- Make sure Site URL matches your domain

### Email Template Missing Link:

**Problem**: Email sent but no link in email
**Solution**:
- Edit email template in Supabase
- Add: `{{ .ConfirmationURL }}` or `{{ .ConfirmationLink }}`
- Save template

## 📞 Still Not Working?

1. **Check Supabase Logs**:
   - Go to Logs → Auth Logs
   - Look for password reset attempts
   - Check for error messages

2. **Test SMTP Connection**:
   - Try sending a test email from Supabase
   - Go to Authentication → Settings → Emails
   - Look for "Test Email" option (if available)

3. **Verify Email Address**:
   - Make sure the email exists in your Supabase users
   - Try with a confirmed email address

4. **Check Rate Limits**:
   - Gmail: Limited (use App Password)
   - Supabase default: 3 emails/hour
   - Custom SMTP: Depends on provider

## 💡 Pro Tips

1. **For Development**: Use Supabase default email (limited but works)
2. **For Production**: Use dedicated email service (Resend, SendGrid)
3. **Test Regularly**: Check if emails are being delivered
4. **Monitor Logs**: Keep an eye on Auth logs for issues
5. **User Experience**: Show success message even if email doesn't exist (security best practice)


