-- ============================================
-- ADD ONBOARDING TRACKING TO PROFILES
-- ============================================
-- This adds fields to track onboarding completion
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- Step 1: Add onboarding tracking columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Step 2: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
  ON public.profiles(onboarding_completed)
  WHERE onboarding_completed = false;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether the user has completed their role-specific onboarding';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';

-- Step 4: Verify columns were added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('onboarding_completed', 'onboarding_completed_at');

-- ============================================
-- DONE!
-- ============================================
-- Onboarding tracking is now enabled.
-- Set onboarding_completed = true when user completes onboarding
-- ============================================

