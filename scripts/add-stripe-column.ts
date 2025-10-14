import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addStripePaymentIntentIdColumn() {
  console.log('🔄 Adding stripe_payment_intent_id column to bookings table...')
  
  try {
    // Check if column already exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'bookings')
      .eq('column_name', 'stripe_payment_intent_id')

    if (columnsError) {
      console.error('❌ Error checking existing columns:', columnsError.message)
      return
    }

    if (columns && columns.length > 0) {
      console.log('✅ Column stripe_payment_intent_id already exists!')
      return
    }

    // Add the column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.bookings 
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
        
        CREATE INDEX IF NOT EXISTS bookings_stripe_payment_intent_id_idx 
        ON public.bookings (stripe_payment_intent_id);
        
        COMMENT ON COLUMN public.bookings.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
      `
    })

    if (alterError) {
      console.error('❌ Error adding column:', alterError.message)
      return
    }

    console.log('✅ Successfully added stripe_payment_intent_id column to bookings table!')
    console.log('✅ Added index for faster lookups!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Alternative approach using direct SQL execution
async function addStripeColumnAlternative() {
  console.log('🔄 Trying alternative method to add column...')
  
  try {
    // Use the SQL editor approach
    const { error } = await supabase
      .from('bookings')
      .select('id')
      .limit(1)

    if (error && error.message.includes('stripe_payment_intent_id')) {
      console.log('📝 Column does not exist, you need to run this SQL in your Supabase dashboard:')
      console.log('')
      console.log('-- Add stripe_payment_intent_id column to bookings table')
      console.log('ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;')
      console.log('')
      console.log('-- Add index for faster lookups')
      console.log('CREATE INDEX IF NOT EXISTS bookings_stripe_payment_intent_id_idx ON public.bookings (stripe_payment_intent_id);')
      console.log('')
      console.log('-- Add comment')
      console.log('COMMENT ON COLUMN public.bookings.stripe_payment_intent_id IS \'Stripe Payment Intent ID for tracking payments\';')
      console.log('')
      console.log('🌐 Go to: https://supabase.com/dashboard/project/[your-project]/sql')
      console.log('📋 Copy and paste the SQL above into the SQL Editor and run it.')
    } else if (error) {
      console.error('❌ Database error:', error.message)
    } else {
      console.log('✅ Column might already exist or table is accessible!')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function main() {
  console.log('🚀 Starting migration to add stripe_payment_intent_id column...')
  
  await addStripePaymentIntentIdColumn()
  await addStripeColumnAlternative()
  
  console.log('')
  console.log('📋 Next steps:')
  console.log('1. If the column was added successfully, restart your Next.js app')
  console.log('2. If you see SQL commands above, run them in your Supabase SQL Editor')
  console.log('3. Test the booking flow again')
}

main().catch(console.error)
