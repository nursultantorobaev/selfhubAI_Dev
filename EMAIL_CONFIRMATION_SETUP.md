# Email Confirmation Setup Guide

## Issue: Users Not Receiving Signup Confirmation Emails

This guide helps you configure Supabase to send email confirmations properly.

## ✅ Code Fixes Applied

1. **Added `emailRedirectTo`** to signup function - Users are now redirected after confirming email
2. **Added resend confirmation email** feature - Users can request a new confirmation email
3. **Better error handling** - Detects when email is not confirmed and offers resend option

## 🔧 Supabase Configuration Required

### Step 1: Check Email Settings in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Email Templates**

### Step 2: Verify Email Confirmation is Enabled

1. Go to **Authentication** → **Settings** → **Auth**
2. Check **"Enable email confirmations"** is **ON**
3. If it's OFF, turn it ON and save

### Step 3: Configure Email Provider

You have two options:

#### Option A: Use Supabase Default Email (Recommended for Development)

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Supabase provides default email service (limited to 3 emails/hour)
3. For production, you'll need to configure custom SMTP

#### Option B: Configure Custom SMTP (Recommended for Production)

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Configure your SMTP provider:
   - **SMTP Host**: (e.g., `smtp.gmail.com`, `smtp.sendgrid.net`)
   - **SMTP Port**: (e.g., `587` for TLS, `465` for SSL)
   - **SMTP User**: Your email address
   - **SMTP Password**: Your email app password
   - **Sender Email**: The email address that will send confirmations
   - **Sender Name**: (e.g., "SelfHub AI")

**Popular SMTP Providers:**
- **SendGrid**: Free tier (100 emails/day)
- **Mailgun**: Free tier (5,000 emails/month)
- **Resend**: Free tier (3,000 emails/month)
- **Gmail**: Requires app password (limited)

### Step 4: Customize Email Templates (Optional)

1. Go to **Authentication** → **Settings** → **Email Templates**
2. Select **"Confirm signup"** template
3. Customize the email content
4. Make sure the confirmation link includes: `{{ .ConfirmationURL }}`

### Step 5: Set Site URL

1. Go to **Authentication** → **Settings** → **URL Configuration**
2. Set **Site URL** to your production URL (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs**:
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)
   - `https://yourdomain.com/*` (for all routes)

## 🧪 Testing Email Confirmation

### Test in Development:

1. Sign up with a new email address
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. Try to sign in - should work now

### If Emails Still Not Received:

1. **Check Supabase Logs**:
   - Go to **Logs** → **Auth Logs**
   - Look for email sending errors

2. **Check Email Provider Limits**:
   - Supabase default: 3 emails/hour
   - Check if you've exceeded limits

3. **Verify Email Address**:
   - Make sure the email address is valid
   - Check spam/junk folder

4. **Test with Different Email**:
   - Try with a different email provider (Gmail, Outlook, etc.)

## 🔄 Resend Confirmation Email Feature

Users can now resend confirmation emails:

1. **After Signup**: A "Resend Confirmation Email" button appears in the login form
2. **If Login Fails**: If user tries to login with unconfirmed email, they'll see option to resend

## 📝 Code Changes Made

### 1. Added `emailRedirectTo` to signup:
```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/`,
    // ...
  },
});
```

### 2. Added resend confirmation function:
```typescript
const resendConfirmationEmail = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  return { error };
};
```

### 3. Added UI for resending:
- Button appears in login form if user hasn't confirmed email
- Shows helpful message and allows resending

## 🚀 Next Steps

1. **Configure Supabase Email Settings** (see steps above)
2. **Test email confirmation** with a real email address
3. **Set up custom SMTP** for production (recommended)
4. **Monitor email delivery** in Supabase logs

## ⚠️ Important Notes

- **Development**: Supabase default email service works but has limits (3/hour)
- **Production**: You MUST configure custom SMTP for reliable email delivery
- **Email Templates**: Can be customized in Supabase dashboard
- **Rate Limits**: Be aware of email provider rate limits

## 📞 Troubleshooting

If emails still don't work after configuration:

1. Check Supabase Auth logs for errors
2. Verify SMTP credentials are correct
3. Test SMTP connection separately
4. Check email provider's spam filters
5. Verify Site URL and Redirect URLs are correct


