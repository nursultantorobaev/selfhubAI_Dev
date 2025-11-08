-- ============================================
-- SETUP SUPABASE STORAGE FOR IMAGES
-- ============================================
-- Run this in Supabase Dashboard SQL Editor
-- This creates storage buckets and policies for image uploads
-- ============================================

-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for business cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-covers', 'business-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars (optional, for future use)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS POLICIES FOR BUSINESS LOGOS
-- ============================================

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Public Access: Anyone can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can delete logos" ON storage.objects;

-- Anyone can view logos (public bucket)
CREATE POLICY "Public Access: Anyone can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-logos');

-- Business owners can upload their logo
CREATE POLICY "Business owners can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business owners can update their logo
CREATE POLICY "Business owners can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business owners can delete their logo
CREATE POLICY "Business owners can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- RLS POLICIES FOR BUSINESS COVER IMAGES
-- ============================================

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Public Access: Anyone can view cover images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can update cover images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can delete cover images" ON storage.objects;

-- Anyone can view cover images (public bucket)
CREATE POLICY "Public Access: Anyone can view cover images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-covers');

-- Business owners can upload cover images
CREATE POLICY "Business owners can upload cover images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business owners can update cover images
CREATE POLICY "Business owners can update cover images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business owners can delete cover images
CREATE POLICY "Business owners can delete cover images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- RLS POLICIES FOR SERVICE IMAGES
-- ============================================

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Public Access: Anyone can view service images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can update service images" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can delete service images" ON storage.objects;

-- Anyone can view service images (public bucket)
CREATE POLICY "Public Access: Anyone can view service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

-- Business owners can upload service images (they own the services)
CREATE POLICY "Business owners can upload service images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business owners can update service images
CREATE POLICY "Business owners can update service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business owners can delete service images
CREATE POLICY "Business owners can delete service images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VERIFY SETUP
-- ============================================
SELECT 
  'Storage buckets created successfully!' as status,
  COUNT(*) as bucket_count
FROM storage.buckets
WHERE id IN ('business-logos', 'business-covers', 'user-avatars', 'service-images');

