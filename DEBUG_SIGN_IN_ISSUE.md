# Debug Sign-In Issue - Email Verification Disabled

## 🔍 Troubleshooting Steps

Since email verification is disabled, the issue is likely one of these:

### 1. Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to sign in
4. Look for error messages - they will show the exact Supabase error

### 2. Common Issues

#### Wrong Password
- **Error**: "Invalid login credentials"
- **Fix**: Use "Forgot password?" to reset

#### Account Disabled
- **Error**: "User is disabled"
- **Fix**: Check Supabase Dashboard → Authentication → Users

#### Rate Limiting
- **Error**: "Too many requests"
- **Fix**: Wait a few minutes and try again

#### Supabase Configuration
- Check Supabase Dashboard → Authentication → Settings
- Ensure "Enable email confirmations" is OFF (for testing)
- Check "Site URL" is set correctly

### 3. Verify User in Supabase

Run this SQL in Supabase Dashboard:

```sql
-- Check user status
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at,
  banned_until,
  deleted_at
FROM auth.users
WHERE email = 'torobaev.nursultan@gmail.com';
```

**Things to check:**
- `email_confirmed_at` should be NULL (if verification disabled) or have a timestamp
- `banned_until` should be NULL
- `deleted_at` should be NULL

### 4. Reset Password

If password might be wrong:

1. Use "Forgot password?" in the app
2. Or manually trigger reset in Supabase Dashboard:
   - Go to Authentication → Users
   - Find your user
   - Click "Send password reset email"

### 5. Check Supabase Auth Settings

In Supabase Dashboard → Authentication → Settings:

- ✅ **Site URL**: Should be `https://selfhub-ai-dev.vercel.app` (or your domain)
- ✅ **Redirect URLs**: Should include your domain
- ✅ **Enable email confirmations**: OFF (for testing)
- ✅ **Enable email change confirmations**: OFF (for testing)

### 6. Manual Password Reset (If Needed)

If you need to manually set a password:

```sql
-- This requires Supabase Admin API or Dashboard
-- Go to Authentication → Users → Select user → Reset password
```

Or use Supabase Dashboard:
1. Authentication → Users
2. Find your user
3. Click "..." menu
4. Select "Reset password"
5. Check email for reset link

---

## 🐛 Debug Mode

The app now logs detailed errors to console. Check:
- Browser Console (F12)
- Look for "Sign in error details:" or "Supabase sign in error:"
- This will show the exact error message and status code

---

## ✅ Quick Fixes

1. **Try "Forgot Password"** - This will verify your email and let you set a new password
2. **Check Console** - Look for the actual error message
3. **Verify Supabase Settings** - Make sure email verification is disabled
4. **Check User Status** - Run SQL query to verify user isn't banned/deleted

---

**Last Updated**: January 2025

