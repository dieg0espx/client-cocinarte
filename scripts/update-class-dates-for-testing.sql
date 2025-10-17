-- ========================================================================
-- UPDATE CLASS DATES FOR TESTING CRON JOB
-- ========================================================================
-- This script updates class dates to test the payment capture cron job
-- Run this in your Supabase SQL Editor
-- ========================================================================

-- Set "Kids Cooking Basics" to TOMORROW at 10:00 AM
-- This will trigger the cron job to send emails and process payments
UPDATE clases
SET 
    date = CURRENT_DATE + INTERVAL '1 day',
    time = '10:00:00'
WHERE title = 'Kids Cooking Basics';

-- Set "Family Cooking Workshop" to 2 DAYS from now at 2:00 PM
UPDATE clases
SET 
    date = CURRENT_DATE + INTERVAL '2 days',
    time = '14:00:00'
WHERE title = 'Family Cooking Workshop';

-- Set "Birthday Party Cooking" to 3 DAYS from now at 11:00 AM
UPDATE clases
SET 
    date = CURRENT_DATE + INTERVAL '3 days',
    time = '11:00:00'
WHERE title = 'Birthday Party Cooking';

-- Set "Healthy Cooking for Kids" to 1 WEEK from now at 3:00 PM
UPDATE clases
SET 
    date = CURRENT_DATE + INTERVAL '7 days',
    time = '15:00:00'
WHERE title = 'Healthy Cooking for Kids';

-- Set "Baking Fundamentals" to 2 WEEKS from now at 10:00 AM
UPDATE clases
SET 
    date = CURRENT_DATE + INTERVAL '14 days',
    time = '10:00:00'
WHERE title = 'Baking Fundamentals';

-- Set "gfwq4g" to NEXT MONTH at 4:00 PM
UPDATE clases
SET 
    date = CURRENT_DATE + INTERVAL '30 days',
    time = '16:00:00'
WHERE title = 'gfwq4g';

-- ========================================================================
-- VERIFY THE UPDATES
-- ========================================================================

-- View all classes with their updated dates and enrollment info
SELECT 
    title,
    date,
    time,
    enrolled,
    minStudents,
    maxStudents,
    (enrolled >= minStudents) as has_minimum,
    (enrolled >= maxStudents) as is_full,
    CASE 
        WHEN date = CURRENT_DATE + INTERVAL '1 day' THEN '🔥 TOMORROW - Will trigger cron!'
        WHEN date = CURRENT_DATE + INTERVAL '2 days' THEN '📅 Day after tomorrow'
        WHEN date = CURRENT_DATE + INTERVAL '3 days' THEN '📅 In 3 days'
        WHEN date < CURRENT_DATE + INTERVAL '7 days' THEN '📅 This week'
        ELSE '📅 Future'
    END as timing
FROM clases
ORDER BY date, time;

-- ========================================================================
-- EXPECTED RESULTS AFTER RUNNING THIS SCRIPT
-- ========================================================================
--
-- Kids Cooking Basics:
--   - Date: Tomorrow at 10:00 AM
--   - Enrolled: 3/8 (min: 4)
--   - Status: BELOW MINIMUM → Will be cancelled
--   - Cron will: Send cancellation emails + Release payment holds
--
-- Family Cooking Workshop:
--   - Date: 2 days from now at 2:00 PM
--   - Enrolled: 3/10 (min: 4)
--   - Status: BELOW MINIMUM → Will be cancelled
--
-- Birthday Party Cooking:
--   - Date: 3 days from now at 11:00 AM
--   - Enrolled: 8/12 (min: 6)
--   - Status: HAS MINIMUM → Will proceed
--   - Cron will: Send confirmation emails + Charge payments
--
-- ========================================================================
-- TO TEST THE CRON JOB
-- ========================================================================
--
-- 1. Run this SQL script in Supabase SQL Editor
-- 2. Wait ~5 minutes (or restart your dev environment)
-- 3. Run the cron job: npm run cron:payment-capture
-- 4. Check the console output - it should find "Kids Cooking Basics"
-- 5. Check for emails sent to enrolled students
-- 6. Verify payments in Stripe Dashboard
--
-- ========================================================================
-- NOTES
-- ========================================================================
--
-- - The cron job checks for classes 24 hours away (±30 minutes window)
-- - Since "Kids Cooking Basics" is set to tomorrow, it will be caught
-- - Current enrollment (3) is BELOW minimum (4), so:
--   * Students will receive CANCELLATION emails
--   * Payment authorizations will be RELEASED (not charged)
--
-- - "Birthday Party Cooking" has 8 enrolled (min: 6), so when its time comes:
--   * Students will receive CONFIRMATION emails
--   * Payments will be CAPTURED (charged)
--
-- ========================================================================
-- TO RESET DATES (Optional)
-- ========================================================================
-- If you want to reset dates back to original far future dates:
--
-- UPDATE clases SET date = '2024-11-20' WHERE title = 'Kids Cooking Basics';
-- UPDATE clases SET date = '2024-11-21' WHERE title = 'Family Cooking Workshop';
-- UPDATE clases SET date = '2024-11-22' WHERE title = 'Birthday Party Cooking';
-- UPDATE clases SET date = '2024-11-23' WHERE title = 'Healthy Cooking for Kids';
-- UPDATE clases SET date = '2024-11-24' WHERE title = 'Baking Fundamentals';
--
-- ========================================================================

