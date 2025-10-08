const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
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

async function createClasesTable() {
  try {
    console.log('Creating clases table...');
    
    // SQL to create the clases table
    const createTableSQL = `
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
    `;

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      // If the rpc function doesn't exist, try direct SQL execution
      console.log('RPC method not available, trying alternative approach...');
      
      // Alternative: Use the REST API to execute SQL
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Clases table created successfully!');
    } else {
      console.log('✅ Clases table created successfully!');
    }

    // Add some sample data
    console.log('Adding sample data...');
    const sampleData = [
      {
        title: 'Spanish for Beginners',
        description: 'Learn basic Spanish vocabulary and grammar',
        date: '2024-02-15',
        time: '10:00:00',
        minStudents: 3,
        maxStudents: 8,
        price: 25.00,
        classDuration: 60
      },
      {
        title: 'Advanced Conversation',
        description: 'Practice Spanish conversation with native speakers',
        date: '2024-02-16',
        time: '18:00:00',
        minStudents: 2,
        maxStudents: 6,
        price: 35.00,
        classDuration: 90
      }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('clases')
      .insert(sampleData);

    if (insertError) {
      console.log('Note: Could not insert sample data:', insertError.message);
    } else {
      console.log('✅ Sample data inserted successfully!');
    }

    console.log('\nTable structure:');
    console.log('- id: UUID (Primary Key)');
    console.log('- title: VARCHAR(255) - Class title');
    console.log('- description: TEXT - Class description');
    console.log('- date: DATE - Class date');
    console.log('- time: TIME - Class time');
    console.log('- minStudents: INTEGER - Minimum students required');
    console.log('- maxStudents: INTEGER - Maximum students allowed');
    console.log('- price: DECIMAL(10,2) - Class price');
    console.log('- classDuration: INTEGER - Duration in minutes');
    console.log('- created_at: TIMESTAMP - Creation timestamp');
    console.log('- updated_at: TIMESTAMP - Last update timestamp');

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
createClasesTable();
