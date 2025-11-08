-- ============================================
-- DELETE ALL USERS - USE WITH CAUTION!
-- ============================================
-- WARNING: This will delete ALL users and ALL related data:
--   - All user profiles
--   - All business profiles (and their services, hours)
--   - All appointments
--   - All reviews
--   - All user data in auth.users
--
-- This action CANNOT be undone!
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Step 1: View what will be deleted (optional - run this first to see the count)
-- Uncomment the lines below to see counts before deleting:

/*
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.business_profiles) as total_businesses,
  (SELECT COUNT(*) FROM public.appointments) as total_appointments,
  (SELECT COUNT(*) FROM public.reviews) as total_reviews;
*/

-- Step 2: Delete all users from auth.users
-- This will CASCADE delete:
--   - All profiles (because profiles.id REFERENCES auth.users(id) ON DELETE CASCADE)
--   - All business_profiles (because owner_id REFERENCES profiles(id) ON DELETE CASCADE)
--   - All services (because business_id REFERENCES business_profiles(id) ON DELETE CASCADE)
--   - All business_hours (because business_id REFERENCES business_profiles(id) ON DELETE CASCADE)
--   - All appointments (because customer_id REFERENCES profiles(id) ON DELETE CASCADE)
--   - All reviews (because customer_id REFERENCES profiles(id) ON DELETE CASCADE)

DELETE FROM auth.users;

-- Step 3: Verify deletion (optional - run this after to confirm)
-- Uncomment to verify everything was deleted:

/*
SELECT 
  (SELECT COUNT(*) FROM auth.users) as remaining_users,
  (SELECT COUNT(*) FROM public.profiles) as remaining_profiles,
  (SELECT COUNT(*) FROM public.business_profiles) as remaining_businesses,
  (SELECT COUNT(*) FROM public.appointments) as remaining_appointments,
  (SELECT COUNT(*) FROM public.reviews) as remaining_reviews;
*/

-- ============================================
-- ALTERNATIVE: Delete specific users only
-- ============================================
-- If you want to delete specific users instead of all users,
-- use this query and replace 'user-email@example.com':

/*
DELETE FROM auth.users 
WHERE email = 'user-email@example.com';
*/

-- Or delete by user ID:

/*
DELETE FROM auth.users 
WHERE id = 'user-uuid-here';
*/

-- ============================================
-- CLEANUP: Delete orphaned data (if any)
-- ============================================
-- Sometimes there might be orphaned data. Run these if needed:

-- Delete orphaned appointments (shouldn't happen with CASCADE, but just in case)
-- DELETE FROM public.appointments WHERE customer_id NOT IN (SELECT id FROM public.profiles);

-- Delete orphaned reviews (shouldn't happen with CASCADE, but just in case)
-- DELETE FROM public.reviews WHERE customer_id NOT IN (SELECT id FROM public.profiles);

-- ============================================
-- DONE!
-- ============================================
-- All users and related data have been deleted.
-- The database structure remains intact and ready for new users.
-- ============================================

