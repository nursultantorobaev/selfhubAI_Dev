-- ============================================
-- COMPLETE DATABASE SETUP FOR SELFHUB AI
-- ============================================
-- Run this in Supabase Dashboard SQL Editor
-- This includes all migrations in the correct order
-- ============================================

-- ============================================
-- STEP 1: Create enum for business types
-- ============================================
DO $$ BEGIN
  CREATE TYPE public.business_type AS ENUM ('salon', 'barbershop', 'spa', 'nails', 'massage', 'fitness', 'beauty', 'wellness', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_business_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 3: Create business_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type public.business_type NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id)
);

-- ============================================
-- STEP 4: Create services table
-- ============================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 5: Create business_hours table
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, day_of_week)
);

-- ============================================
-- STEP 6: Enable RLS on all tables
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: Create RLS Policies for profiles
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 8: Create RLS Policies for business_profiles
-- ============================================
DROP POLICY IF EXISTS "Business profiles are viewable by everyone" ON public.business_profiles;
CREATE POLICY "Business profiles are viewable by everyone"
  ON public.business_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Business owners can create their business profile" ON public.business_profiles;
CREATE POLICY "Business owners can create their business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Business owners can update their business profile" ON public.business_profiles;
CREATE POLICY "Business owners can update their business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Business owners can delete their business profile" ON public.business_profiles;
CREATE POLICY "Business owners can delete their business profile"
  ON public.business_profiles FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- STEP 9: Create RLS Policies for services
-- ============================================
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Business owners can manage their services" ON public.services;
CREATE POLICY "Business owners can manage their services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE business_profiles.id = services.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 10: Create RLS Policies for business_hours
-- ============================================
DROP POLICY IF EXISTS "Business hours are viewable by everyone" ON public.business_hours;
CREATE POLICY "Business hours are viewable by everyone"
  ON public.business_hours FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Business owners can manage their hours" ON public.business_hours;
CREATE POLICY "Business owners can manage their hours"
  ON public.business_hours FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE business_profiles.id = business_hours.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 11: Create functions
-- ============================================
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- STEP 12: Create triggers
-- ============================================
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Drop and recreate updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON public.business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- STEP 13: Create appointments enum and table
-- ============================================
DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status public.appointment_status DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 14: Enable RLS for appointments
-- ============================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 15: Create RLS Policies for appointments
-- ============================================
DROP POLICY IF EXISTS "Appointments are viewable by everyone" ON public.appointments;
CREATE POLICY "Appointments are viewable by everyone"
  ON public.appointments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Customers can create appointments" ON public.appointments;
CREATE POLICY "Customers can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update own appointments" ON public.appointments;
CREATE POLICY "Customers can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Business owners can view their business appointments" ON public.appointments;
CREATE POLICY "Business owners can view their business appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE business_profiles.id = appointments.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can update their business appointments" ON public.appointments;
CREATE POLICY "Business owners can update their business appointments"
  ON public.appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE business_profiles.id = appointments.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 16: Create trigger for appointments updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- STEP 17: Create indexes for appointments
-- ============================================
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON public.appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- ============================================
-- COMPLETE! 
-- All tables, policies, triggers, and indexes are now set up.
-- ============================================

