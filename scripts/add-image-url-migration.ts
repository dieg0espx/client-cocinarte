import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Starting migration: Add image_url column to clases table...')

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-image-url-to-clases.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('Executing SQL migration...')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    })

    if (error) {
      // If the RPC doesn't exist, we'll try a different approach
      console.log('Attempting alternative migration method...')
      
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec', {
          query: statement
        })
        
        if (stmtError) {
          console.error('Error executing statement:', stmtError)
          throw stmtError
        }
      }
    }

    console.log('✓ Migration completed successfully!')
    console.log('The image_url column has been added to the clases table.')
    
  } catch (error) {
    console.error('Migration failed:', error)
    console.log('\nPlease run this SQL manually in your Supabase SQL Editor:')
    console.log('\n' + fs.readFileSync(path.join(__dirname, 'add-image-url-to-clases.sql'), 'utf8'))
    process.exit(1)
  }
}

runMigration()

