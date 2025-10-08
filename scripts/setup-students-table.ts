import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStudentsTable() {
  try {
    console.log('Creating students table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS students (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        parent_name VARCHAR(255) NOT NULL,
        child_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
      CREATE INDEX IF NOT EXISTS idx_students_parent_name ON students(parent_name);
      CREATE INDEX IF NOT EXISTS idx_students_child_name ON students(child_name);

      CREATE UNIQUE INDEX IF NOT EXISTS uq_students_parent_child_email 
        ON students (LOWER(parent_name), LOWER(child_name), LOWER(email));

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_students_updated_at 
          BEFORE UPDATE ON students 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createTableSQL })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Direct SQL execution not available or failed.');
      console.log(errorText);
      console.log('Please run the SQL script manually in your Supabase dashboard:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the contents of scripts/create-students-table.sql');
      return;
    }

    console.log('✅ Students table created or already exists.');

  } catch (error) {
    console.error('❌ Error creating students table:', error);
    console.log('\nAlternative: Please run the SQL script manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/create-students-table.sql');
    console.log('4. Execute the SQL');
  }
}

createStudentsTable();


