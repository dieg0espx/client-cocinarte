-- ========================================================================
-- UPDATE BOOKINGS TABLE FOR STRIPE PAYMENT HOLD FUNCTIONALITY
-- ========================================================================
-- This migration adds support for holding payments and capturing them later
-- Based on Stripe's authorization and capture payment flow
-- ========================================================================

-- Step 1: Add stripe_payment_intent_id column if it doesn't exist
-- This stores the Stripe Payment Intent ID for each booking
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN stripe_payment_intent_id VARCHAR(255);
        
        -- Add index for faster lookups
        CREATE INDEX idx_bookings_stripe_payment_intent_id 
        ON bookings(stripe_payment_intent_id);
        
        RAISE NOTICE 'Added stripe_payment_intent_id column';
    ELSE
        RAISE NOTICE 'stripe_payment_intent_id column already exists';
    END IF;
END $$;

-- Step 2: Update payment_status to support 'held' and 'canceled' statuses
-- Note: PostgreSQL doesn't have built-in support for adding enum values in older versions
-- So we'll use a VARCHAR if payment_status is currently an enum, or update constraints

-- First, check if payment_status has a check constraint
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the check constraint name for payment_status
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'bookings'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%payment_status%'
    LIMIT 1;
    
    IF constraint_name IS NOT NULL THEN
        -- Drop the old constraint
        EXECUTE 'ALTER TABLE bookings DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped old payment_status constraint: %', constraint_name;
    END IF;
    
    -- Add new constraint with updated values
    ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check 
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'held', 'canceled'));
    
    RAISE NOTICE 'Added updated payment_status constraint with held and canceled statuses';
END $$;

-- Step 3: Add comments for documentation
COMMENT ON COLUMN bookings.stripe_payment_intent_id IS 
'Stripe Payment Intent ID for tracking payment status and capturing held funds';

COMMENT ON COLUMN bookings.payment_status IS 
'Payment status: pending, completed, failed, refunded, held (authorized but not captured), canceled (authorization released)';

-- ========================================================================
-- USAGE NOTES
-- ========================================================================
-- 
-- Payment Flow:
-- 1. When booking is created: payment_status = 'held'
-- 2. 12 hours before class:
--    - If class is fully booked: payment_status = 'completed' (captured)
--    - If class is not fully booked: payment_status = 'canceled' (released)
-- 
-- stripe_payment_intent_id:
-- - Stores the Stripe Payment Intent ID (e.g., 'pi_xxxxx')
-- - Used to capture or cancel the payment authorization
-- - Should be NOT NULL for all new bookings with Stripe payments
--
-- ========================================================================

-- Verification queries (optional - uncomment to run)
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'bookings' 
-- AND column_name IN ('payment_status', 'stripe_payment_intent_id');

-- SELECT COUNT(*) as total_bookings,
--        COUNT(stripe_payment_intent_id) as with_payment_intent,
--        payment_status,
--        booking_status
-- FROM bookings
-- GROUP BY payment_status, booking_status;

