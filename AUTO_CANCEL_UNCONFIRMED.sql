-- ============================================
-- AUTO-CANCEL UNCONFIRMED APPOINTMENTS
-- ============================================
-- Automatically cancels appointments that remain unconfirmed
-- after a specified number of days (default: 3 days)
-- ============================================

-- ============================================
-- FUNCTION: Auto-cancel unconfirmed appointments
-- ============================================
CREATE OR REPLACE FUNCTION auto_cancel_unconfirmed_appointments()
RETURNS void AS $$
DECLARE
  days_before_cancellation INTEGER := 3; -- Cancel after 3 days if unconfirmed
  cancelled_count INTEGER := 0;
BEGIN
  -- Cancel appointments that are:
  -- 1. Still in 'pending' status
  -- 2. Created more than X days ago
  -- 3. Not yet past their appointment date
  UPDATE appointments
  SET 
    status = 'cancelled',
    cancellation_reason = 'Automatically cancelled: Appointment was not confirmed within ' || days_before_cancellation || ' days.'
  WHERE status = 'pending'
    AND created_at < NOW() - (days_before_cancellation || ' days')::INTERVAL
    AND appointment_date >= CURRENT_DATE
    AND cancellation_reason IS NULL;
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  
  -- Log the action (optional - can be removed if not needed)
  IF cancelled_count > 0 THEN
    RAISE NOTICE 'Auto-cancelled % unconfirmed appointments', cancelled_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SCHEDULE: Run daily at 2 AM
-- ============================================
-- This uses pg_cron to run the function daily
-- Note: pg_cron may not be available on all Supabase plans
-- Alternative: Use Supabase Edge Function with cron trigger

-- Schedule the job (comment out if pg_cron is not available)
-- SELECT cron.schedule(
--   'auto-cancel-unconfirmed-appointments',
--   '0 2 * * *', -- Daily at 2 AM
--   $$SELECT auto_cancel_unconfirmed_appointments();$$
-- );

-- ============================================
-- MANUAL EXECUTION (for testing)
-- ============================================
-- Run this to manually trigger the auto-cancellation:
-- SELECT auto_cancel_unconfirmed_appointments();

-- ============================================
-- VERIFY FUNCTION
-- ============================================
SELECT 
  'Function created successfully!' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'auto_cancel_unconfirmed_appointments';


