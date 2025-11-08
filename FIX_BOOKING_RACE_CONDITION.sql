-- ============================================
-- FIX BOOKING RACE CONDITION
-- ============================================
-- This creates a database function that prevents
-- double bookings by checking availability in a transaction
-- ============================================

-- ============================================
-- CREATE FUNCTION: Safe Appointment Creation
-- ============================================
-- This function checks for conflicts BEFORE inserting
-- Uses database-level locking to prevent race conditions
CREATE OR REPLACE FUNCTION public.create_appointment_safe(
  p_business_id UUID,
  p_service_id UUID,
  p_customer_id UUID,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_status appointment_status DEFAULT 'pending'::appointment_status
) RETURNS UUID AS $$
DECLARE
  v_appointment_id UUID;
  v_service_duration INTEGER;
  v_buffer_minutes INTEGER := 15; -- 15 minute buffer
  v_appointment_start TIMESTAMP;
  v_appointment_end TIMESTAMP;
  v_conflict_count INTEGER;
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
  
  -- Insert appointment
  INSERT INTO public.appointments (
    business_id,
    service_id,
    customer_id,
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
    p_customer_id,
    p_appointment_date,
    p_appointment_time,
    p_status,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_notes
  ) RETURNING id INTO v_appointment_id;
  
  RETURN v_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION public.create_appointment_safe TO authenticated;

-- ============================================
-- VERIFY FUNCTION
-- ============================================
SELECT 
  'Function created successfully!' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_appointment_safe';


