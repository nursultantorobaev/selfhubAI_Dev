-- ============================================
-- CREATE TEST DATA - SAMPLE BUSINESSES
-- ============================================
-- This script creates 6-7 sample businesses for testing
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- First, let's create test user profiles if they don't exist
-- Note: You'll need to create actual auth users first, or use existing user IDs
-- For testing, we'll use placeholder UUIDs - REPLACE THESE with actual user IDs from auth.users

-- ============================================
-- STEP 1: Create test user profiles
-- ============================================
-- IMPORTANT: Replace these UUIDs with actual user IDs from your auth.users table
-- Or create test users first, then use their IDs

-- Example: Get existing user IDs (uncomment and use if you have users)
-- SELECT id, email FROM auth.users LIMIT 10;

-- For now, we'll create test profiles with placeholder UUIDs
-- You should replace these with real user IDs

DO $$
DECLARE
  test_user_ids UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID,
    '00000000-0000-0000-0000-000000000003'::UUID,
    '00000000-0000-0000-0000-000000000004'::UUID,
    '00000000-0000-0000-0000-000000000005'::UUID,
    '00000000-0000-0000-0000-000000000006'::UUID,
    '00000000-0000-0000-0000-000000000007'::UUID
  ];
  user_id UUID;
BEGIN
  -- Create profiles for test users (only if they don't exist)
  FOREACH user_id IN ARRAY test_user_ids
  LOOP
    INSERT INTO public.profiles (id, email, full_name, is_business_owner)
    VALUES (
      user_id,
      'test' || substring(user_id::text, 1, 8) || '@selfhubai.com',
      'Test Business Owner ' || substring(user_id::text, 1, 8),
      true
    )
    ON CONFLICT (id) DO UPDATE SET is_business_owner = true;
  END LOOP;
END $$;

-- ============================================
-- STEP 2: Insert Sample Businesses
-- ============================================

-- Business 1: Hair Salon in New York
INSERT INTO public.business_profiles (
  owner_id,
  business_name,
  business_type,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  rating,
  total_reviews,
  is_active,
  is_verified,
  latitude,
  longitude
) VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Glamour Hair Studio',
  'salon',
  'Premium hair salon offering cutting-edge styles, coloring, and treatments. Our expert stylists specialize in modern cuts, balayage, and keratin treatments. Book your transformation today!',
  '125 Madison Avenue',
  'New York',
  'NY',
  '10016',
  'US',
  '212-555-0101',
  'info@glamourhair.com',
  'https://glamourhair.com',
  4.8,
  127,
  true,
  true,
  40.7489,
  -73.9857
) ON CONFLICT DO NOTHING;

-- Business 2: Barbershop in Chicago
INSERT INTO public.business_profiles (
  owner_id,
  business_name,
  business_type,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  rating,
  total_reviews,
  is_active,
  is_verified,
  latitude,
  longitude
) VALUES (
  '00000000-0000-0000-0000-000000000002'::UUID,
  'Classic Cuts Barbershop',
  'barbershop',
  'Traditional barbershop with modern flair. Expert fades, beard trims, hot towel shaves, and classic cuts. Walk-ins welcome, appointments preferred.',
  '1909 W Belmont Avenue',
  'Chicago',
  'IL',
  '60657',
  'US',
  '773-555-0202',
  'hello@classiccuts.com',
  'https://classiccuts.com',
  4.9,
  203,
  true,
  true,
  41.9394,
  -87.6788
) ON CONFLICT DO NOTHING;

-- Business 3: Spa in Los Angeles
INSERT INTO public.business_profiles (
  owner_id,
  business_name,
  business_type,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  rating,
  total_reviews,
  is_active,
  is_verified,
  latitude,
  longitude
) VALUES (
  '00000000-0000-0000-0000-000000000003'::UUID,
  'Serenity Day Spa',
  'spa',
  'Luxury spa experience offering facials, massages, body treatments, and wellness services. Relax and rejuvenate in our tranquil environment.',
  '8423 Sunset Boulevard',
  'Los Angeles',
  'CA',
  '90069',
  'US',
  '323-555-0303',
  'bookings@serenityspa.com',
  'https://serenityspa.com',
  4.7,
  89,
  true,
  true,
  34.0928,
  -118.3287
) ON CONFLICT DO NOTHING;

-- Business 4: Nail Salon in Miami
INSERT INTO public.business_profiles (
  owner_id,
  business_name,
  business_type,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  rating,
  total_reviews,
  is_active,
  is_verified,
  latitude,
  longitude
) VALUES (
  '00000000-0000-0000-0000-000000000004'::UUID,
  'Polished Nail Bar',
  'nails',
  'Trendy nail salon specializing in gel manicures, pedicures, nail art, and extensions. We use premium products and follow strict hygiene standards.',
  '1560 Collins Avenue',
  'Miami Beach',
  'FL',
  '33139',
  'US',
  '305-555-0404',
  'info@polishednailbar.com',
  NULL,
  4.6,
  156,
  true,
  false,
  25.7907,
  -80.1300
) ON CONFLICT DO NOTHING;

-- Business 5: Massage Therapy in Seattle
INSERT INTO public.business_profiles (
  owner_id,
  business_name,
  business_type,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  rating,
  total_reviews,
  is_active,
  is_verified,
  latitude,
  longitude
) VALUES (
  '00000000-0000-0000-0000-000000000005'::UUID,
  'Healing Hands Massage',
  'massage',
  'Licensed massage therapists offering deep tissue, Swedish, hot stone, and sports massage. Perfect for stress relief, pain management, and relaxation.',
  '2201 1st Avenue',
  'Seattle',
  'WA',
  '98121',
  'US',
  '206-555-0505',
  'book@healinghandsmassage.com',
  'https://healinghandsmassage.com',
  4.9,
  234,
  true,
  true,
  47.6085,
  -122.3401
) ON CONFLICT DO NOTHING;

-- Business 6: Beauty Salon in Austin
INSERT INTO public.business_profiles (
  owner_id,
  business_name,
  business_type,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  rating,
  total_reviews,
  is_active,
  is_verified,
  latitude,
  longitude
) VALUES (
  '00000000-0000-0000-0000-000000000006'::UUID,
  'Bella Beauty Lounge',
  'beauty',
  'Full-service beauty salon offering hair, makeup, brows, lashes, and skincare. Specializing in bridal and special event beauty services.',
  '1201 S Lamar Boulevard',
  'Austin',
  'TX',
  '78704',
  'US',
  '512-555-0606',
  'hello@bellabeautylounge.com',
  'https://bellabeautylounge.com',
  4.8,
  178,
  true,
  true,
  30.2672,
  -97.7431
) ON CONFLICT DO NOTHING;

-- Business 7: Wellness Center in Denver
INSERT INTO public.business_profiles (
  owner_id,
  business_name,
  business_type,
  description,
  address,
  city,
  state,
  zip_code,
  country,
  phone,
  email,
  website,
  rating,
  total_reviews,
  is_active,
  is_verified,
  latitude,
  longitude
) VALUES (
  '00000000-0000-0000-0000-000000000007'::UUID,
  'Zen Wellness Center',
  'wellness',
  'Holistic wellness center offering yoga, meditation, acupuncture, and wellness consultations. Your destination for mind-body balance and healing.',
  '1850 Blake Street',
  'Denver',
  'CO',
  '80202',
  'US',
  '303-555-0707',
  'info@zenwellness.com',
  'https://zenwellness.com',
  4.7,
  95,
  true,
  false,
  39.7508,
  -104.9965
) ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: Add Services for Each Business
-- ============================================

-- Services for Glamour Hair Studio (Business 1)
INSERT INTO public.services (business_id, name, description, duration_minutes, price, is_active)
SELECT id, 'Women''s Haircut', 'Professional haircut and style', 60, 75.00, true FROM public.business_profiles WHERE business_name = 'Glamour Hair Studio'
UNION ALL
SELECT id, 'Color & Highlights', 'Full color service with highlights', 180, 250.00, true FROM public.business_profiles WHERE business_name = 'Glamour Hair Studio'
UNION ALL
SELECT id, 'Keratin Treatment', 'Smoothing keratin treatment', 120, 300.00, true FROM public.business_profiles WHERE business_name = 'Glamour Hair Studio'
UNION ALL
SELECT id, 'Blowout', 'Professional blow dry and style', 45, 50.00, true FROM public.business_profiles WHERE business_name = 'Glamour Hair Studio';

-- Services for Classic Cuts Barbershop (Business 2)
INSERT INTO public.services (business_id, name, description, duration_minutes, price, is_active)
SELECT id, 'Classic Cut', 'Traditional men''s haircut', 30, 35.00, true FROM public.business_profiles WHERE business_name = 'Classic Cuts Barbershop'
UNION ALL
SELECT id, 'Fade & Style', 'Modern fade with styling', 45, 45.00, true FROM public.business_profiles WHERE business_name = 'Classic Cuts Barbershop'
UNION ALL
SELECT id, 'Beard Trim', 'Professional beard shaping', 20, 20.00, true FROM public.business_profiles WHERE business_name = 'Classic Cuts Barbershop'
UNION ALL
SELECT id, 'Hot Towel Shave', 'Traditional straight razor shave', 30, 40.00, true FROM public.business_profiles WHERE business_name = 'Classic Cuts Barbershop';

-- Services for Serenity Day Spa (Business 3)
INSERT INTO public.services (business_id, name, description, duration_minutes, price, is_active)
SELECT id, 'Swedish Massage', 'Relaxing full-body massage', 60, 100.00, true FROM public.business_profiles WHERE business_name = 'Serenity Day Spa'
UNION ALL
SELECT id, 'Deep Tissue Massage', 'Therapeutic deep tissue massage', 90, 140.00, true FROM public.business_profiles WHERE business_name = 'Serenity Day Spa'
UNION ALL
SELECT id, 'Facial Treatment', 'Customized facial with extraction', 75, 120.00, true FROM public.business_profiles WHERE business_name = 'Serenity Day Spa'
UNION ALL
SELECT id, 'Body Scrub', 'Exfoliating body treatment', 60, 90.00, true FROM public.business_profiles WHERE business_name = 'Serenity Day Spa';

-- Services for Polished Nail Bar (Business 4)
INSERT INTO public.services (business_id, name, description, duration_minutes, price, is_active)
SELECT id, 'Gel Manicure', 'Long-lasting gel polish manicure', 45, 45.00, true FROM public.business_profiles WHERE business_name = 'Polished Nail Bar'
UNION ALL
SELECT id, 'Gel Pedicure', 'Relaxing gel pedicure', 60, 55.00, true FROM public.business_profiles WHERE business_name = 'Polished Nail Bar'
UNION ALL
SELECT id, 'Nail Art', 'Custom nail art design', 30, 25.00, true FROM public.business_profiles WHERE business_name = 'Polished Nail Bar'
UNION ALL
SELECT id, 'Full Set Extensions', 'Acrylic or gel extensions', 90, 85.00, true FROM public.business_profiles WHERE business_name = 'Polished Nail Bar';

-- Services for Healing Hands Massage (Business 5)
INSERT INTO public.services (business_id, name, description, duration_minutes, price, is_active)
SELECT id, 'Swedish Massage', 'Classic relaxation massage', 60, 90.00, true FROM public.business_profiles WHERE business_name = 'Healing Hands Massage'
UNION ALL
SELECT id, 'Deep Tissue Massage', 'Intense therapeutic massage', 90, 130.00, true FROM public.business_profiles WHERE business_name = 'Healing Hands Massage'
UNION ALL
SELECT id, 'Hot Stone Massage', 'Heated stone therapy', 75, 120.00, true FROM public.business_profiles WHERE business_name = 'Healing Hands Massage'
UNION ALL
SELECT id, 'Sports Massage', 'Athletic recovery massage', 60, 100.00, true FROM public.business_profiles WHERE business_name = 'Healing Hands Massage';

-- Services for Bella Beauty Lounge (Business 6)
INSERT INTO public.services (business_id, name, description, duration_minutes, price, is_active)
SELECT id, 'Haircut & Style', 'Complete haircut and styling', 60, 80.00, true FROM public.business_profiles WHERE business_name = 'Bella Beauty Lounge'
UNION ALL
SELECT id, 'Makeup Application', 'Professional makeup service', 60, 75.00, true FROM public.business_profiles WHERE business_name = 'Bella Beauty Lounge'
UNION ALL
SELECT id, 'Brow Shaping', 'Eyebrow threading and shaping', 30, 35.00, true FROM public.business_profiles WHERE business_name = 'Bella Beauty Lounge'
UNION ALL
SELECT id, 'Lash Extensions', 'Full set lash extensions', 120, 200.00, true FROM public.business_profiles WHERE business_name = 'Bella Beauty Lounge';

-- Services for Zen Wellness Center (Business 7)
INSERT INTO public.services (business_id, name, description, duration_minutes, price, is_active)
SELECT id, 'Yoga Session', '60-minute yoga class', 60, 25.00, true FROM public.business_profiles WHERE business_name = 'Zen Wellness Center'
UNION ALL
SELECT id, 'Acupuncture', 'Traditional acupuncture treatment', 60, 85.00, true FROM public.business_profiles WHERE business_name = 'Zen Wellness Center'
UNION ALL
SELECT id, 'Meditation Session', 'Guided meditation', 45, 30.00, true FROM public.business_profiles WHERE business_name = 'Zen Wellness Center'
UNION ALL
SELECT id, 'Wellness Consultation', 'Holistic health consultation', 60, 100.00, true FROM public.business_profiles WHERE business_name = 'Zen Wellness Center';

-- ============================================
-- STEP 4: Add Business Hours for Each Business
-- ============================================

-- Standard hours: Mon-Fri 9am-6pm, Sat 10am-4pm, Sun Closed
DO $$
DECLARE
  business_record RECORD;
BEGIN
  FOR business_record IN SELECT id FROM public.business_profiles
  LOOP
    -- Monday (1)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES (business_record.id, 1, '09:00', '18:00', false)
    ON CONFLICT (business_id, day_of_week) DO NOTHING;
    
    -- Tuesday (2)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES (business_record.id, 2, '09:00', '18:00', false)
    ON CONFLICT (business_id, day_of_week) DO NOTHING;
    
    -- Wednesday (3)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES (business_record.id, 3, '09:00', '18:00', false)
    ON CONFLICT (business_id, day_of_week) DO NOTHING;
    
    -- Thursday (4)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES (business_record.id, 4, '09:00', '18:00', false)
    ON CONFLICT (business_id, day_of_week) DO NOTHING;
    
    -- Friday (5)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES (business_record.id, 5, '09:00', '18:00', false)
    ON CONFLICT (business_id, day_of_week) DO NOTHING;
    
    -- Saturday (6)
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES (business_record.id, 6, '10:00', '16:00', false)
    ON CONFLICT (business_id, day_of_week) DO NOTHING;
    
    -- Sunday (0) - Closed
    INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    VALUES (business_record.id, 0, '00:00', '00:00', true)
    ON CONFLICT (business_id, day_of_week) DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that businesses were created
SELECT 
  business_name,
  business_type,
  city,
  state,
  rating,
  total_reviews
FROM public.business_profiles
ORDER BY business_name;

-- Check services count per business
SELECT 
  bp.business_name,
  COUNT(s.id) as service_count
FROM public.business_profiles bp
LEFT JOIN public.services s ON s.business_id = bp.id
GROUP BY bp.business_name
ORDER BY bp.business_name;

-- Check business hours
SELECT 
  bp.business_name,
  COUNT(bh.id) as hours_entries
FROM public.business_profiles bp
LEFT JOIN public.business_hours bh ON bh.business_id = bp.id
GROUP BY bp.business_name
ORDER BY bp.business_name;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. The user IDs used are placeholders (00000000-0000-0000-0000-000000000001, etc.)
--    You MUST replace these with actual user IDs from your auth.users table
--
-- 2. To get real user IDs, run this first:
--    SELECT id, email FROM auth.users;
--
-- 3. Then update the owner_id values in the INSERT statements above
--
-- 4. Alternatively, create test users first:
--    - Sign up 7 test accounts in your app
--    - Get their IDs from auth.users
--    - Update the UUIDs in this script
--
-- 5. The coordinates (latitude/longitude) are approximate for each city
--    You can update them with exact addresses if needed
--
-- ============================================

