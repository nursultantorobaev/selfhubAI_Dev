-- ============================================
-- CREATE REVIEWS TABLE
-- ============================================
-- This migration creates the reviews and ratings system
-- ============================================

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate reviews from same customer for same business
  UNIQUE(business_id, customer_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

-- Customers can create their own reviews
CREATE POLICY "Customers can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own reviews
CREATE POLICY "Customers can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = customer_id);

-- Customers can delete their own reviews
CREATE POLICY "Customers can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = customer_id);

-- Business owners can view reviews for their business
CREATE POLICY "Business owners can view their business reviews"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles
      WHERE business_profiles.id = reviews.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Function to calculate and update business rating
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  total_count INTEGER;
BEGIN
  -- Calculate average rating and total count for the business
  SELECT 
    COALESCE(AVG(rating)::DECIMAL(2,1), 0),
    COUNT(*)
  INTO avg_rating, total_count
  FROM public.reviews
  WHERE business_id = COALESCE(NEW.business_id, OLD.business_id);
  
  -- Update business profile
  UPDATE public.business_profiles
  SET 
    rating = avg_rating,
    total_reviews = total_count,
    updated_at = now()
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update business rating when review is created
CREATE TRIGGER update_business_rating_on_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_rating();

-- Trigger to update business rating when review is updated
CREATE TRIGGER update_business_rating_on_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_rating();

-- Trigger to update business rating when review is deleted
CREATE TRIGGER update_business_rating_on_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_rating();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


