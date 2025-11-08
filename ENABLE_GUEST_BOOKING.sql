-- ============================================
-- ENABLE GUEST BOOKING
-- ============================================
-- This migration allows customers to book appointments without creating an account
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- Step 1: Make customer_id nullable to allow guest bookings
ALTER TABLE public.appointments 
  ALTER COLUMN customer_id DROP NOT NULL;

-- Step 2: Update RLS policies to allow guest bookings
-- Remove the requirement that customer_id must match auth.uid() for inserts

-- Drop existing customer policies
DROP POLICY IF EXISTS "Customers can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Customers can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Customers can update their own appointments" ON public.appointments;

-- New policy: Anyone can create appointments (for guest booking)
CREATE POLICY "Anyone can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

-- New policy: Customers can view their own appointments (if logged in)
CREATE POLICY "Customers can view their own appointments"
  ON public.appointments FOR SELECT
  USING (
    -- If customer_id is null (guest booking), only business owner can see it
    -- If customer_id matches auth.uid(), customer can see it
    customer_id IS NULL OR 
    customer_id = auth.uid() OR
    -- Business owners can see all appointments for their business
    business_id IN (
      SELECT id FROM public.business_profiles WHERE owner_id = auth.uid()
    )
  );

-- New policy: Customers can update their own appointments
CREATE POLICY "Customers can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (
    (customer_id IS NOT NULL AND customer_id = auth.uid()) OR
    business_id IN (
      SELECT id FROM public.business_profiles WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    (customer_id IS NOT NULL AND customer_id = auth.uid()) OR
    business_id IN (
      SELECT id FROM public.business_profiles WHERE owner_id = auth.uid()
    )
  );

-- New policy: Customers can delete their own appointments
CREATE POLICY "Customers can delete their own appointments"
  ON public.appointments FOR DELETE
  USING (
    (customer_id IS NOT NULL AND customer_id = auth.uid()) OR
    business_id IN (
      SELECT id FROM public.business_profiles WHERE owner_id = auth.uid()
    )
  );

-- Step 3: Update the create_appointment_safe function to handle nullable customer_id
-- First, check if the function exists and what it looks like
DO $$
BEGIN
  -- Check if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'create_appointment_safe'
  ) THEN
    -- Drop and recreate with nullable customer_id support
    DROP FUNCTION IF EXISTS public.create_appointment_safe;
    
    CREATE OR REPLACE FUNCTION public.create_appointment_safe(
      p_business_id UUID,
      p_service_id UUID,
      p_customer_id UUID, -- Now nullable
      p_appointment_date DATE,
      p_appointment_time TIME,
      p_customer_name TEXT,
      p_customer_email TEXT,
      p_customer_phone TEXT DEFAULT NULL,
      p_notes TEXT DEFAULT NULL,
      p_status TEXT DEFAULT 'pending'
    )
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_service_duration INTEGER;
      v_appointment_start TIMESTAMP;
      v_appointment_end TIMESTAMP;
      v_buffer_minutes INTEGER := 15;
      v_conflict_count INTEGER;
      v_appointment_id UUID;
    BEGIN
      -- Get service duration
      SELECT duration_minutes INTO v_service_duration
      FROM public.services
      WHERE id = p_service_id AND is_active = true;
      
      IF v_service_duration IS NULL THEN
        RAISE EXCEPTION 'Service not found or inactive';
      END IF;
      
      -- Check business is active
      IF NOT EXISTS (
        SELECT 1 FROM public.business_profiles
        WHERE id = p_business_id AND is_active = true
      ) THEN
        RAISE EXCEPTION 'Business is not active';
      END IF;
      
      -- Calculate appointment times
      v_appointment_start := (p_appointment_date || ' ' || p_appointment_time)::TIMESTAMP;
      v_appointment_end := v_appointment_start + (v_service_duration || ' minutes')::INTERVAL;
      
      -- Check for conflicts with buffer time
      -- Lock rows to prevent race conditions
      SELECT COUNT(*) INTO v_conflict_count
      FROM public.appointments
      WHERE business_id = p_business_id
        AND appointment_date = p_appointment_date
        AND status IN ('pending', 'confirmed')
        AND (
          -- Check if new appointment overlaps with existing (with buffer)
          (
            (p_appointment_time::TIME - (v_buffer_minutes || ' minutes')::INTERVAL) <
            (appointment_time::TIME + ((
              SELECT duration_minutes FROM public.services WHERE id = service_id
            ) || ' minutes')::INTERVAL)
          ) AND (
            (p_appointment_time::TIME + (v_service_duration || ' minutes')::INTERVAL) >
            (appointment_time::TIME - (v_buffer_minutes || ' minutes')::INTERVAL)
          )
        )
      FOR UPDATE; -- Lock rows to prevent concurrent modifications
      
      IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Time slot is no longer available';
      END IF;
      
      -- Insert appointment (customer_id can be NULL for guest bookings)
      INSERT INTO public.appointments (
        business_id,
        service_id,
        customer_id, -- Can be NULL
        appointment_date,
        appointment_time,
        status,
        customer_name,
        customer_email,
        customer_phone,
        notes
      ) VALUES (
        p_business_id,
        p_service_id,
        p_customer_id, -- NULL for guests
        p_appointment_date,
        p_appointment_time,
        p_status::public.appointment_status,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_notes
      )
      RETURNING id INTO v_appointment_id;
      
      RETURN v_appointment_id;
    END;
    $$;
  END IF;
END $$;

-- Step 4: Add index for better query performance on customer_email (for guest bookings)
CREATE INDEX IF NOT EXISTS idx_appointments_customer_email 
  ON public.appointments(customer_email);

-- Step 5: Verify changes
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'appointments'
  AND column_name = 'customer_id';

-- ============================================
-- DONE!
-- ============================================
-- Guest bookings are now enabled. Customers can book without creating an account.
-- Guest bookings will have customer_id = NULL
-- ============================================

