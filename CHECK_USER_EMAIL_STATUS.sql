-- ============================================
-- CHECK USER EMAIL STATUS AND VERIFICATION
-- ============================================
-- This script helps diagnose sign-in issues
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Check user email and verification status
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Verified'
    WHEN confirmed_at IS NOT NULL THEN 'Confirmed (legacy)'
    ELSE 'Not Verified'
  END as verification_status,
  raw_user_meta_data->>'user_role' as user_role,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'torobaev.nursultan@gmail.com'  -- Replace with your email
ORDER BY created_at DESC;

-- Check if profile exists for this user
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_business_owner,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'torobaev.nursultan@gmail.com';  -- Replace with your email

-- ============================================
-- FIX: Manually verify email (if needed)
-- ============================================
-- WARNING: Only run this if you're sure the email is valid
-- This bypasses email verification
-- ============================================

-- Uncomment and run this to manually verify the email:
-- UPDATE auth.users
-- SET email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE email = 'torobaev.nursultan@gmail.com';  -- Replace with your email

-- ============================================
-- RESET PASSWORD (Alternative solution)
-- ============================================
-- If you can't sign in, you can reset your password
-- Use the "Forgot password?" feature in the app
-- Or run this to trigger a password reset email:
-- ============================================

-- Note: Password reset must be done through Supabase Auth API
-- Use the app's "Forgot password?" feature instead

