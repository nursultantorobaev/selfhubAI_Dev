-- ============================================
-- ALLOW BUSINESS OWNERS TO CREATE APPOINTMENTS
-- ============================================
-- This adds an RLS policy that allows business owners
-- to create appointments for their business
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Business owners can create appointments" ON public.appointments;

-- Create policy for business owners to insert appointments
CREATE POLICY "Business owners can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE business_profiles.id = appointments.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- ============================================
-- VERIFY POLICIES
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'appointments'
ORDER BY policyname;


