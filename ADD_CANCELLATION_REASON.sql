-- ============================================
-- ADD CANCELLATION REASON COLUMN
-- ============================================
-- Adds cancellation_reason column to appointments table
-- ============================================

-- Add cancellation_reason column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'appointments' 
      AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE public.appointments 
    ADD COLUMN cancellation_reason TEXT;
    
    COMMENT ON COLUMN public.appointments.cancellation_reason IS 
      'Reason for appointment cancellation, provided by business owner or customer';
  END IF;
END $$;

-- Verify column was added
SELECT 
  'Column added successfully!' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'appointments'
  AND column_name = 'cancellation_reason';


