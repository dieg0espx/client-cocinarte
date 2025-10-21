-- Reset bookings to pending status for testing the cron job
-- This prepares bookings to be processed by the 24-hour cron check

-- Update bookings for 'Baking Fundamentals' class (should be confirmed - has minimum)
UPDATE bookings
SET 
    booking_status = 'pending',
    payment_status = 'held',
    notes = 'Awaiting 24-hour check',
    updated_at = NOW()
WHERE class_id = '6234f7bf-c812-40a3-bddd-946a4d5c63ba';

-- Update bookings for 'Family Cooking Workshop' class (should be cancelled - no minimum)
UPDATE bookings
SET 
    booking_status = 'pending',
    payment_status = 'held',
    notes = 'Awaiting 24-hour check',
    updated_at = NOW()
WHERE class_id = 'e4a9aa17-1488-4693-b490-d4bc5b1a0890';

-- Verify the updates
SELECT 
    b.id,
    c.title as class_title,
    s.child_name as student_name,
    s.email as parent_email,
    b.booking_status,
    b.payment_status,
    b.notes,
    c.date as class_date,
    c.time as class_time
FROM bookings b
JOIN clases c ON b.class_id = c.id
JOIN students s ON b.student_id = s.id
WHERE b.class_id IN (
    '6234f7bf-c812-40a3-bddd-946a4d5c63ba',
    'e4a9aa17-1488-4693-b490-d4bc5b1a0890'
)
ORDER BY c.title, s.child_name;

