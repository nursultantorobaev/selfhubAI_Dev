-- ============================================
-- SETUP EMAIL NOTIFICATIONS SYSTEM
-- ============================================
-- This creates database functions and triggers for email notifications
-- Requires: Supabase Edge Functions to be set up for actual email sending
-- ============================================

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
-- Enable pg_cron for scheduled reminders (24h before appointments)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension for calling Edge Functions
CREATE EXTENSION IF NOT EXISTS http;

-- ============================================
-- FUNCTION: Send Email Notification
-- ============================================
-- This function calls the Supabase Edge Function to send emails
CREATE OR REPLACE FUNCTION send_email_notification(
  p_to_email TEXT,
  p_subject TEXT,
  p_template TEXT,
  p_data JSONB DEFAULT '{}'::JSONB
) RETURNS void AS $$
DECLARE
  edge_function_url TEXT;
  response_status INT;
BEGIN
  -- Get the Edge Function URL from environment
  -- You'll need to replace this with your actual Edge Function URL
  -- Format: https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-email
  edge_function_url := current_setting('app.settings.edge_function_url', true);
  
  -- If URL not set, use default pattern
  IF edge_function_url IS NULL OR edge_function_url = '' THEN
    edge_function_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co/functions/v1/send-email';
  END IF;

  -- Call Edge Function via HTTP
  SELECT status INTO response_status
  FROM http((
    'POST',
    edge_function_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
    ],
    'application/json',
    json_build_object(
      'to', p_to_email,
      'subject', p_subject,
      'template', p_template,
      'data', p_data
    )::text
  )::http_request);

  -- Log errors (but don't fail the transaction)
  IF response_status != 200 THEN
    RAISE WARNING 'Email notification failed: %', response_status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Send Booking Confirmation
-- ============================================
CREATE OR REPLACE FUNCTION notify_booking_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  customer_name TEXT;
  business_name TEXT;
  service_name TEXT;
  appointment_date TEXT;
  appointment_time TEXT;
  business_owner_email TEXT;
BEGIN
  -- Get customer and business details
  SELECT 
    p.email,
    COALESCE(p.full_name, 'Customer'),
    bp.business_name,
    bp.owner_id
  INTO customer_email, customer_name, business_name, business_owner_email
  FROM profiles p
  JOIN business_profiles bp ON bp.id = NEW.business_id
  WHERE p.id = NEW.customer_id;

  -- Get service name
  SELECT name INTO service_name
  FROM services
  WHERE id = NEW.service_id;

  -- Format date and time
  appointment_date := TO_CHAR(NEW.appointment_date::DATE, 'Month DD, YYYY');
  appointment_time := TO_CHAR(NEW.appointment_time::TIME, 'HH:MI AM');

  -- Send confirmation email to customer
  PERFORM send_email_notification(
    customer_email,
    'Booking Confirmation - ' || business_name,
    'booking_confirmation',
    json_build_object(
      'customer_name', customer_name,
      'business_name', business_name,
      'service_name', service_name,
      'appointment_date', appointment_date,
      'appointment_time', appointment_time,
      'appointment_id', NEW.id
    )
  );

  -- Send notification to business owner
  SELECT email INTO business_owner_email
  FROM profiles
  WHERE id = (SELECT owner_id FROM business_profiles WHERE id = NEW.business_id);

  IF business_owner_email IS NOT NULL THEN
    PERFORM send_email_notification(
      business_owner_email,
      'New Booking - ' || business_name,
      'new_booking_alert',
      json_build_object(
        'business_name', business_name,
        'customer_name', customer_name,
        'service_name', service_name,
        'appointment_date', appointment_date,
        'appointment_time', appointment_time,
        'appointment_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Booking Confirmation
-- ============================================
DROP TRIGGER IF EXISTS trigger_booking_confirmation ON appointments;
CREATE TRIGGER trigger_booking_confirmation
  AFTER INSERT ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'pending' OR NEW.status = 'confirmed')
  EXECUTE FUNCTION notify_booking_confirmation();

-- ============================================
-- FUNCTION: Send Booking Cancellation
-- ============================================
CREATE OR REPLACE FUNCTION notify_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  customer_name TEXT;
  business_name TEXT;
  service_name TEXT;
  appointment_date TEXT;
  appointment_time TEXT;
  business_owner_email TEXT;
BEGIN
  -- Only send if status changed to cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Get customer and business details
    SELECT 
      p.email,
      COALESCE(p.full_name, 'Customer'),
      bp.business_name,
      bp.owner_id
    INTO customer_email, customer_name, business_name, business_owner_email
    FROM profiles p
    JOIN business_profiles bp ON bp.id = NEW.business_id
    WHERE p.id = NEW.customer_id;

    -- Get service name
    SELECT name INTO service_name
    FROM services
    WHERE id = NEW.service_id;

    -- Format date and time
    appointment_date := TO_CHAR(NEW.appointment_date::DATE, 'Month DD, YYYY');
    appointment_time := TO_CHAR(NEW.appointment_time::TIME, 'HH:MI AM');

    -- Send cancellation email to customer
    PERFORM send_email_notification(
      customer_email,
      'Booking Cancelled - ' || business_name,
      'booking_cancellation',
      json_build_object(
        'customer_name', customer_name,
        'business_name', business_name,
        'service_name', service_name,
        'appointment_date', appointment_date,
        'appointment_time', appointment_time
      )
    );

    -- Send notification to business owner
    SELECT email INTO business_owner_email
    FROM profiles
    WHERE id = (SELECT owner_id FROM business_profiles WHERE id = NEW.business_id);

    IF business_owner_email IS NOT NULL THEN
      PERFORM send_email_notification(
        business_owner_email,
        'Booking Cancelled - ' || business_name,
        'booking_cancellation_owner',
        json_build_object(
          'business_name', business_name,
          'customer_name', customer_name,
          'service_name', service_name,
          'appointment_date', appointment_date,
          'appointment_time', appointment_time
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Booking Cancellation
-- ============================================
DROP TRIGGER IF EXISTS trigger_booking_cancellation ON appointments;
CREATE TRIGGER trigger_booking_cancellation
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_cancellation();

-- ============================================
-- FUNCTION: Send Review Notification
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
DECLARE
  business_owner_email TEXT;
  business_name TEXT;
  customer_name TEXT;
  rating INT;
BEGIN
  -- Get business owner email
  SELECT 
    p.email,
    bp.business_name
  INTO business_owner_email, business_name
  FROM business_profiles bp
  JOIN profiles p ON p.id = bp.owner_id
  WHERE bp.id = NEW.business_id;

  -- Get customer name
  SELECT COALESCE(full_name, 'Customer') INTO customer_name
  FROM profiles
  WHERE id = NEW.customer_id;

  rating := NEW.rating;

  -- Send notification to business owner
  IF business_owner_email IS NOT NULL THEN
    PERFORM send_email_notification(
      business_owner_email,
      'New Review - ' || business_name,
      'new_review',
      json_build_object(
        'business_name', business_name,
        'customer_name', customer_name,
        'rating', rating,
        'review_text', COALESCE(NEW.review_text, ''),
        'review_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: New Review
-- ============================================
DROP TRIGGER IF EXISTS trigger_new_review ON reviews;
CREATE TRIGGER trigger_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_review();

-- ============================================
-- FUNCTION: Send Booking Reminders
-- ============================================
-- This function finds appointments 24 hours in the future and sends reminders
CREATE OR REPLACE FUNCTION send_booking_reminders()
RETURNS void AS $$
DECLARE
  appointment_record RECORD;
  customer_email TEXT;
  customer_name TEXT;
  business_name TEXT;
  service_name TEXT;
  appointment_date TEXT;
  appointment_time TEXT;
BEGIN
  -- Find appointments that are exactly 24 hours from now
  FOR appointment_record IN
    SELECT 
      a.id,
      a.customer_id,
      a.business_id,
      a.service_id,
      a.appointment_date,
      a.appointment_time,
      a.status
    FROM appointments a
    WHERE a.status IN ('pending', 'confirmed')
      AND a.appointment_date = CURRENT_DATE + INTERVAL '1 day'
      AND a.appointment_time::TIME = (CURRENT_TIME + INTERVAL '1 minute')::TIME
      AND a.reminder_sent = false
  LOOP
    -- Get customer details
    SELECT 
      p.email,
      COALESCE(p.full_name, 'Customer')
    INTO customer_email, customer_name
    FROM profiles p
    WHERE p.id = appointment_record.customer_id;

    -- Get business and service details
    SELECT 
      bp.business_name,
      s.name
    INTO business_name, service_name
    FROM business_profiles bp
    JOIN services s ON s.business_id = bp.id
    WHERE bp.id = appointment_record.business_id
      AND s.id = appointment_record.service_id;

    -- Format date and time
    appointment_date := TO_CHAR(appointment_record.appointment_date::DATE, 'Month DD, YYYY');
    appointment_time := TO_CHAR(appointment_record.appointment_time::TIME, 'HH:MI AM');

    -- Send reminder email
    PERFORM send_email_notification(
      customer_email,
      'Reminder: Your Appointment Tomorrow - ' || business_name,
      'booking_reminder',
      json_build_object(
        'customer_name', customer_name,
        'business_name', business_name,
        'service_name', service_name,
        'appointment_date', appointment_date,
        'appointment_time', appointment_time,
        'appointment_id', appointment_record.id
      )
    );

    -- Mark reminder as sent
    UPDATE appointments
    SET reminder_sent = true
    WHERE id = appointment_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADD REMINDER_SENT COLUMN TO APPOINTMENTS
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'appointments' 
    AND column_name = 'reminder_sent'
  ) THEN
    ALTER TABLE public.appointments 
    ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ============================================
-- SCHEDULE REMINDER JOB (pg_cron)
-- ============================================
-- Run reminder check every hour
SELECT cron.schedule(
  'send-booking-reminders',
  '0 * * * *', -- Every hour at minute 0
  $$SELECT send_booking_reminders();$$
);

-- ============================================
-- VERIFY SETUP
-- ============================================
SELECT 
  'Email notification functions created!' as status,
  COUNT(*) as function_count
FROM pg_proc
WHERE proname IN (
  'send_email_notification',
  'notify_booking_confirmation',
  'notify_booking_cancellation',
  'notify_new_review',
  'send_booking_reminders'
);


