-- Update bookings table to have 'pending' as default booking_status
-- This ensures new bookings start as pending until the 24-hour cron processes them

-- Change the default value for booking_status column
ALTER TABLE bookings 
ALTER COLUMN booking_status SET DEFAULT 'pending';

-- Optionally, update existing 'confirmed' bookings to 'pending' if they haven't been processed
-- (Only do this if you want to reset existing bookings)
-- UPDATE bookings 
-- SET booking_status = 'pending' 
-- WHERE booking_status = 'confirmed' 
-- AND payment_status = 'held';

-- Verify the change
SELECT 
    column_name, 
    column_default, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'booking_status';

