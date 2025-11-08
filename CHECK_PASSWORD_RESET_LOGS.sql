-- ============================================
-- Check Password Reset Logs in Supabase
-- ============================================
-- Run this in Supabase SQL Editor to check
-- for password reset attempts and errors
-- ============================================

-- Option 1: Check recent auth events (if available in your Supabase version)
-- Note: This might not work in all Supabase projects as auth logs
-- are typically only available through the Dashboard UI

-- Option 2: Check if users exist and their email confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'torobaev.nursultan@gmail.com'  -- Replace with the email you're testing
ORDER BY created_at DESC
LIMIT 5;

-- Option 3: Check for any password reset related entries in audit logs
-- (if audit logging is enabled)
SELECT 
  id,
  payload,
  created_at
FROM auth.audit_log_entries
WHERE payload::text LIKE '%password%reset%'
   OR payload::text LIKE '%password_recovery%'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- RECOMMENDED: Use Dashboard UI Instead
-- ============================================
-- The easiest way is through the Dashboard:
-- 1. Go to Supabase Dashboard
-- 2. Click "Logs" in left sidebar
-- 3. Click "Auth Logs"
-- 4. Look for password reset entries
-- ============================================

