-- Add user_id column to existing tables to associate data with users
-- This script fixes the missing user_id columns that are causing dashboard errors

-- Add user_id to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to clases table  
ALTER TABLE clases 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for the new user_id columns
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_clases_user_id ON clases(user_id);

-- Add RLS policies for students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own students
CREATE POLICY "Users can view their own students" ON students
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own students
CREATE POLICY "Users can insert their own students" ON students
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own students
CREATE POLICY "Users can update their own students" ON students
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own students
CREATE POLICY "Users can delete their own students" ON students
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for clases table
ALTER TABLE clases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own classes
CREATE POLICY "Users can view their own classes" ON clases
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own classes
CREATE POLICY "Users can insert their own classes" ON clases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own classes
CREATE POLICY "Users can update their own classes" ON clases
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own classes
CREATE POLICY "Users can delete their own classes" ON clases
    FOR DELETE USING (auth.uid() = user_id);

-- Update existing records to associate with a default user (if any exist)
-- Note: This will only work if you have at least one user in auth.users
-- You may need to manually update these records with actual user IDs
UPDATE students SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE clases SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE students ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE clases ALTER COLUMN user_id SET NOT NULL;
