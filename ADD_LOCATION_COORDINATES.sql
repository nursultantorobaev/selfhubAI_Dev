-- ============================================
-- ADD LOCATION COORDINATES TO BUSINESS PROFILES
-- ============================================
-- This adds latitude and longitude columns for map functionality
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- Step 1: Add latitude and longitude columns
ALTER TABLE public.business_profiles 
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Step 2: Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_business_profiles_location 
  ON public.business_profiles(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.business_profiles.latitude IS 'Latitude coordinate for map display and distance calculation';
COMMENT ON COLUMN public.business_profiles.longitude IS 'Longitude coordinate for map display and distance calculation';

-- Step 4: Verify columns were added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'business_profiles'
  AND column_name IN ('latitude', 'longitude');

-- ============================================
-- NOTE: Geocoding Addresses
-- ============================================
-- After running this migration, you'll need to geocode existing addresses.
-- Options:
-- 1. Use a geocoding service (Google Maps Geocoding API, Mapbox, etc.)
-- 2. Manually update coordinates in Supabase dashboard
-- 3. Use a batch geocoding script
--
-- Example update (replace with actual coordinates):
-- UPDATE public.business_profiles 
-- SET latitude = 40.7128, longitude = -74.0060 
-- WHERE city = 'New York' AND latitude IS NULL;
-- ============================================

