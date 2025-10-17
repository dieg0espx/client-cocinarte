-- Create adminUsers table to store admin email addresses
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON public.admin_users (email);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read admin_users (needed for middleware checks)
CREATE POLICY "Allow authenticated users to read admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow only admins to insert/update/delete admin_users
-- This prevents non-admins from adding themselves as admins
CREATE POLICY "Only admins can modify admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.admin_users
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.admin_users
    )
  );

-- Add a comment to the table
COMMENT ON TABLE public.admin_users IS 'Stores email addresses of users with admin privileges';

-- Insert the first admin user (update this email to your admin email)
-- After running this script, you can add more admins through the Supabase dashboard
-- or by running: INSERT INTO public.admin_users (email) VALUES ('your-email@example.com');

