-- Add stripe_payment_intent_id column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS bookings_stripe_payment_intent_id_idx 
ON public.bookings (stripe_payment_intent_id);

-- Add comment
COMMENT ON COLUMN public.bookings.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';

