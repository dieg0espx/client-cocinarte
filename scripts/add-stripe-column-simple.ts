import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import * as path from 'path'

// Read environment variables from .env.local
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf8')
    const env: Record<string, string> = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    return env
  } catch (error) {
    console.error('❌ Could not read .env.local file:', error)
    process.exit(1)
  }
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndAddColumn() {
  console.log('🔄 Checking if stripe_payment_intent_id column exists...')
  
  try {
    // Try to query the bookings table to see if the column exists
    const { data, error } = await supabase
      .from('bookings')
      .select('id, stripe_payment_intent_id')
      .limit(1)

    if (error) {
      if (error.message.includes('stripe_payment_intent_id')) {
        console.log('❌ Column does not exist in the database!')
        console.log('')
        console.log('📋 You need to run this SQL in your Supabase dashboard:')
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
        console.log('🌐 Go to your Supabase project dashboard:')
        console.log('   https://supabase.com/dashboard/project/[your-project-id]/sql')
        console.log('')
        console.log('📝 Copy the SQL above, paste it in the SQL Editor, and click "Run"')
        return false
      } else {
        console.error('❌ Database error:', error.message)
        return false
      }
    }

    console.log('✅ Column stripe_payment_intent_id already exists!')
    console.log('✅ Sample data:', data)
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Checking stripe_payment_intent_id column in bookings table...')
  console.log('')
  
  const columnExists = await checkAndAddColumn()
  
  console.log('')
  if (columnExists) {
    console.log('🎉 Column exists! Your booking flow should work now.')
    console.log('🔄 Try creating a new booking to test the payment flow.')
  } else {
    console.log('⚠️  Column missing! Please run the SQL commands above in your Supabase dashboard.')
    console.log('🔄 After running the SQL, restart your Next.js app and try the booking flow again.')
  }
}

main().catch(console.error)
