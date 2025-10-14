# Fix: Add stripe_payment_intent_id Column to Bookings Table

## Problem
The booking flow is failing with error:
```
Could not find the 'stripe_payment_intent_id' column of 'bookings' in the schema cache
```

## Solution

### Option 1: Add Column via Supabase Dashboard (RECOMMENDED)

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project
   - Click on "SQL Editor" in the left sidebar

2. **Run this SQL command:**

```sql
-- Add stripe_payment_intent_id column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS bookings_stripe_payment_intent_id_idx 
ON public.bookings (stripe_payment_intent_id);

-- Add comment
COMMENT ON COLUMN public.bookings.stripe_payment_intent_id 
IS 'Stripe Payment Intent ID for tracking payments';
```

3. **Verify the column was added:**

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'stripe_payment_intent_id';
```

You should see:
```
column_name               | data_type | is_nullable
stripe_payment_intent_id  | text      | YES
```

4. **Refresh the Schema Cache (IMPORTANT)**

After adding the column, you need to refresh Supabase's schema cache:

**Method A: Via API Settings**
- Go to: Settings → API
- Click "Reload schema cache" button
- Wait a few seconds

**Method B: Via SQL**
```sql
NOTIFY pgrst, 'reload schema';
```

5. **Restart Your Application**
```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Option 2: Temporary Workaround (Remove stripe_payment_intent_id)

If you want the booking to work immediately without adding the column, you can temporarily remove the field from the booking data:

**Edit: `components/cocinarte/cocinarte-booking-popup.tsx`**

Find the line around line 347 where you create the booking:
```typescript
const booking = await bookingsService.createBooking({
  user_id: user.id,
  class_id: selectedClass.id,
  student_id: student.id,
  payment_amount: selectedClass.price * 100,
  payment_method: 'stripe',
  stripe_payment_intent_id: paymentIntentId, // <-- REMOVE THIS LINE
  notes: `Booking for ${selectedClass.title}`,
})
```

Change to:
```typescript
const booking = await bookingsService.createBooking({
  user_id: user.id,
  class_id: selectedClass.id,
  student_id: student.id,
  payment_amount: selectedClass.price * 100,
  payment_method: 'stripe',
  // stripe_payment_intent_id removed temporarily
  notes: `Booking for ${selectedClass.title}`,
})
```

**⚠️ WARNING:** This workaround means you won't be able to track which Stripe payment belongs to which booking. Use Option 1 instead for proper functionality.

## Why This Happens

Supabase caches the database schema for performance. When you add a new column:
1. The column exists in the database
2. But Supabase's internal schema cache doesn't know about it yet
3. You need to manually reload the schema cache

## After Fixing

Once the column is added and the cache is refreshed:
1. Bookings will successfully save the Stripe Payment Intent ID
2. You'll be able to track payments in the dashboard
3. Refunds can be properly linked to bookings
4. The error will be resolved

## Testing

After applying the fix:
1. Try creating a new booking with a test payment
2. Check the database to confirm `stripe_payment_intent_id` is populated
3. Verify no errors appear in the console
4. Check the Payments dashboard to see the linked payment

## Need Help?

If the issue persists after following these steps:
1. Check Supabase logs for any errors
2. Verify your database permissions
3. Make sure you're using the service role key for writes
4. Check if there are any RLS policies blocking the insert

