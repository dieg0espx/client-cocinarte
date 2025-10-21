-- Update class dates to future dates for testing
-- All times are in Los Angeles (America/Los_Angeles) timezone

-- Update 'Baking Fundamentals' - TOMORROW at 8:30 AM (Los Angeles time)
UPDATE clases 
SET date = '2025-10-22', time = '08:30:00', updated_at = NOW()
WHERE id = '6234f7bf-c812-40a3-bddd-946a4d5c63ba';

-- Update 'gfwq4g' - TOMORROW at 9:30 AM (Los Angeles time)
UPDATE clases 
SET date = '2025-10-22', time = '09:30:00', updated_at = NOW()
WHERE id = '512ff124-44aa-4246-9621-99b33c7d3614';

-- Update 'Kids Cooking Basics' (currently 18/10/2025)
UPDATE clases 
SET date = '2025-10-27', updated_at = NOW()
WHERE id = 'd48d6ad8-c18f-4b94-bb25-bcf7cf6928cc';

-- Update 'Family Cooking Workshop' (currently 19/10/2025)
UPDATE clases 
SET date = '2025-10-28', updated_at = NOW()
WHERE id = 'e4a9aa17-1488-4693-b490-d4bc5b1a0890';

-- Update 'Birthday Party Cooking' (currently 20/10/2025)
UPDATE clases 
SET date = '2025-10-29', updated_at = NOW()
WHERE id = '53a3bd0f-7f1f-40b3-95de-f4a3053f3141';

-- Update 'Healthy Cooking for Kids' (currently 24/10/2025)
UPDATE clases 
SET date = '2025-10-30', updated_at = NOW()
WHERE id = '31fa3a1f-d10e-48fc-a059-96088e543768';

-- Verify the updates
SELECT id, title, date, time, enrolled, "maxStudents", "minStudents" 
FROM clases 
ORDER BY date, time;

