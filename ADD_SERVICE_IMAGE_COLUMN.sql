-- ============================================
-- ADD IMAGE_URL COLUMN TO SERVICES TABLE
-- ============================================
-- Run this in Supabase Dashboard SQL Editor
-- This adds image_url column to services table if it doesn't exist
-- ============================================

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'services' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.services 
    ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Verify column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'services'
  AND column_name = 'image_url';


