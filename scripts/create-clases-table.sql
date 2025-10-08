-- Create the clases table
CREATE TABLE IF NOT EXISTS clases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  minStudents INTEGER NOT NULL DEFAULT 1,
  maxStudents INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  classDuration INTEGER NOT NULL, -- duration in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on date for better query performance
CREATE INDEX IF NOT EXISTS idx_clases_date ON clases(date);

-- Create an index on time for better query performance
CREATE INDEX IF NOT EXISTS idx_clases_time ON clases(time);

-- Insert sample data for Cocinarte cooking classes
INSERT INTO clases (title, description, date, time, minStudents, maxStudents, price, classDuration) VALUES
('Kids Cooking Basics', 'Learn basic cooking skills and kitchen safety for children ages 6-12', '2024-02-15', '10:00:00', 4, 8, 25.00, 60),
('Teen Culinary Skills', 'Advanced cooking techniques for teenagers ages 13-17', '2024-02-16', '16:00:00', 3, 6, 35.00, 90),
('Family Cooking Workshop', 'Interactive cooking class for parents and children together', '2024-02-17', '14:00:00', 4, 10, 30.00, 75),
('Birthday Party Cooking', 'Special cooking class for birthday celebrations', '2024-02-18', '11:00:00', 6, 12, 20.00, 45),
('Healthy Cooking for Kids', 'Learn to make nutritious and delicious meals', '2024-02-19', '15:00:00', 4, 8, 28.00, 60),
('Baking Fundamentals', 'Learn the basics of baking bread, cookies, and pastries', '2024-02-20', '10:00:00', 3, 6, 32.00, 90);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_clases_updated_at 
    BEFORE UPDATE ON clases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
