# Stripe Payments Dashboard

This document explains the Stripe-integrated payments dashboard that provides full payment management, including refunds.

## Overview

The payments dashboard now pulls all payment information directly from Stripe's API instead of the Supabase database. This provides:

- ✅ Real-time payment data from Stripe
- ✅ Detailed payment information (card details, status, etc.)
- ✅ Full refund capabilities (full or partial)
- ✅ Payment history and tracking
- ✅ Automatic sync between Stripe and Supabase

## Features

### 1. Real-Time Payment Data

All payment information is fetched directly from Stripe with comprehensive details:

**Payment Information:**
- Payment status (succeeded, processing, failed, canceled)
- Amount charged, amount received
- Stripe fees and net amount (after fees)
- Currency and capture method
- Payment Intent ID
- Receipt number and URL

**Customer Information:**
- Customer name and email
- Billing name, email, and phone
- Full billing address (street, city, state, postal code, country)

**Payment Method Details:**
- Card brand and last 4 digits
- Card expiry date
- Card type (credit/debit)
- Card country
- Card network (Visa, Mastercard, etc.)

**Transaction Details:**
- Transaction dates and times
- Metadata (class name, customer name, booking ID)
- Description and notes

### 2. Refund Management

Admins can issue refunds directly from the dashboard:
- **Full Refunds**: Refund the entire payment amount
- **Partial Refunds**: Refund any portion of the payment
- **Refund Reasons**: Track why refunds were issued
  - Requested by customer
  - Duplicate payment
  - Fraudulent transaction
- **Automatic Status Updates**: Booking status is automatically updated to "refunded" in Supabase

### 3. Comprehensive Payment Details

Click on any payment to view an extensive breakdown:

**Payment Summary:**
- Amount charged
- Stripe processing fee
- Net amount received
- Payment status

**Transaction Details:**
- Payment Intent ID
- Date and time
- Currency
- Capture method
- Receipt number

**Booking Information:**
- Class name
- Customer name
- Customer email
- Description

**Payment Method:**
- Card brand and last 4 digits
- Expiration date
- Card type (credit/debit)
- Card country
- Card network

**Billing Details:**
- Billing name
- Billing email
- Billing phone
- Complete billing address

**Receipt:**
- Direct link to Stripe receipt
- View or download receipt

**Refund History** (if applicable):
- Total amount refunded
- Individual refund transactions
- Refund dates and reasons
- Refund receipt numbers

### 4. Dashboard Statistics

The dashboard displays key metrics calculated from Stripe data:
- **Total Revenue**: All successful payments
- **Pending Payments**: Processing or incomplete payments
- **This Month**: Revenue for the current month
- **Average Transaction**: Average payment amount

## Database Schema

### Bookings Table

The `bookings` table now includes a `stripe_payment_intent_id` column to link bookings with Stripe payments:

```sql
ALTER TABLE public.bookings 
ADD COLUMN stripe_payment_intent_id TEXT;
```

This allows:
- Tracking which Stripe payment corresponds to each booking
- Updating booking status when refunds are issued
- Querying bookings by Stripe Payment Intent ID

## API Routes

### 1. GET `/api/stripe/payments`

Fetches payment data from Stripe.

**Query Parameters:**
- `limit` (optional): Number of payments to fetch (default: 100)
- `starting_after` (optional): Pagination cursor

**Response:**
```json
{
  "payments": [
    {
      "id": "pi_xxxxx",
      "amount": 4500,
      "currency": "usd",
      "status": "succeeded",
      "created": 1234567890,
      "metadata": {
        "className": "Latin Cooking for Kids",
        "customerName": "John Doe"
      },
      "charges": [...],
      "refunds": [...]
    }
  ],
  "hasMore": false
}
```

### 2. POST `/api/stripe/refund`

Processes a refund through Stripe.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxxxx",
  "amount": 4500,  // Optional, for partial refunds (in cents)
  "reason": "requested_by_customer"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "refund": {
    "id": "re_xxxxx",
    "amount": 4500,
    "status": "succeeded",
    ...
  }
}
```

## How It Works

### Payment Flow

1. **User books a class** through the booking popup
2. **Payment Intent is created** via `/api/create-payment-intent`
3. **User enters payment details** using Stripe Elements
4. **Payment is processed** by Stripe
5. **Booking is created** in Supabase with `stripe_payment_intent_id`
6. **Payment appears** in the dashboard automatically

### Refund Flow

1. **Admin clicks** on a payment in the dashboard
2. **Admin views** payment details
3. **Admin clicks** "Issue Refund"
4. **Admin enters** refund amount and reason
5. **Refund is processed** through Stripe API
6. **Booking status** is updated to "refunded" in Supabase
7. **Dashboard refreshes** to show updated payment status

## Security

### Admin-Only Access

- Only users in the `admin_users` table can access the payments dashboard
- Protected by middleware and page-level checks
- See `ADMIN_SETUP.md` for details

### API Authentication

- All payment API routes require authentication
- User session is verified via Supabase Auth
- Unauthorized requests are rejected with 401 status

### Stripe Keys

- Secret key is never exposed to the client
- All Stripe operations happen server-side
- Keys are stored in environment variables

## Usage

### Viewing Payments

1. Navigate to `/dashboard/payments`
2. View the payment statistics at the top
3. Scroll down to see all payments
4. Click on any payment to view details

### Issuing Refunds

1. Click on a payment that shows the refund icon
2. In the details popup, click "Issue Refund"
3. Enter the refund amount (defaults to full amount)
4. Select a reason from the dropdown
5. Click "Process Refund"
6. Wait for confirmation toast

### Refreshing Data

- Click the "Refresh" button to fetch latest data from Stripe
- Dashboard automatically loads data on page load
- Statistics are calculated in real-time

## Payment Statuses

### Stripe Payment Intent Statuses

- **succeeded**: Payment completed successfully
- **processing**: Payment is being processed
- **requires_payment_method**: Waiting for payment method
- **requires_confirmation**: Needs confirmation
- **requires_action**: Requires customer action (3D Secure)
- **canceled**: Payment was canceled
- **failed**: Payment failed

### Booking Statuses (Supabase)

- **pending**: Booking created, awaiting confirmation
- **confirmed**: Booking confirmed
- **completed**: Class has been completed
- **cancelled**: Booking cancelled
- **refunded**: Payment refunded

## Troubleshooting

### Payments Not Showing

**Problem**: No payments appear in the dashboard

**Solutions**:
1. Check that `STRIPE_SECRET_KEY` is set correctly
2. Verify Stripe account has payments
3. Check browser console for errors
4. Ensure admin user is authenticated

### Refund Failed

**Problem**: Refund button doesn't work or shows error

**Solutions**:
1. Verify payment is eligible for refund (status: succeeded)
2. Check that refund amount doesn't exceed remaining balance
3. Ensure Stripe account has refunds enabled
4. Check application logs for Stripe API errors

### Payment Intent ID Not Stored

**Problem**: Bookings don't have `stripe_payment_intent_id`

**Solutions**:
1. Run the migration: `scripts/add-stripe-payment-intent-id.sql`
2. Verify column exists in `bookings` table
3. Check booking creation code passes the parameter

### Dashboard Shows Old Data

**Problem**: Dashboard doesn't show latest payments

**Solutions**:
1. Click the "Refresh" button
2. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
3. Check Stripe Dashboard to confirm payments exist
4. Verify API route is returning data

## Future Enhancements

Potential improvements for the payment system:

1. **Webhooks**: Implement Stripe webhooks for real-time updates
2. **Export**: Add ability to export payment data to CSV
3. **Filters**: Add date range and status filters
4. **Search**: Search payments by customer name or amount
5. **Disputes**: Handle payment disputes and chargebacks
6. **Reports**: Generate detailed financial reports
7. **Pagination**: Implement infinite scroll or pagination
8. **Email Notifications**: Send email when refunds are issued

## Related Documentation

- `STRIPE_SETUP.md` - Initial Stripe integration setup
- `ADMIN_SETUP.md` - Admin user management
- Stripe API: https://stripe.com/docs/api/payment_intents
- Stripe Refunds: https://stripe.com/docs/refunds

## Support

For issues or questions:
1. Check Stripe Dashboard logs
2. Review application server logs
3. Consult Stripe documentation
4. Contact development team

