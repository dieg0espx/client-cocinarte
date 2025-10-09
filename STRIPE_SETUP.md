# Stripe Payment Integration Setup

This guide will help you set up Stripe payment processing for the Cocinarte booking system.

## Prerequisites

- A Stripe account (create one at [stripe.com](https://stripe.com))
- Node.js and npm installed
- Access to your project's environment variables

## Installation

The required packages have already been installed:
- `stripe` (Node.js backend library)
- `@stripe/stripe-js` (JavaScript library for frontend)
- `@stripe/react-stripe-js` (React components for Stripe Elements)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Keys (Get these from your Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Getting Your Stripe Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
5. Add them to your `.env.local` file

**⚠️ Important:** Never commit your `.env.local` file or expose your secret key!

## How It Works

### Payment Flow

1. **User selects a class** and proceeds to book
2. **User signs up or logs in** (if not already authenticated)
3. **Payment Intent is created** automatically when reaching the payment step
   - API route: `/api/create-payment-intent`
   - Creates a Stripe PaymentIntent with the class amount
4. **Stripe Elements form loads** with secure payment fields
5. **User enters payment details** (handled securely by Stripe)
6. **Payment is processed** using Stripe's API
7. **Booking is created** in the database after successful payment
8. **Confirmation emails** are sent to user and admin

### Files Involved

#### Frontend
- `components/cocinarte/cocinarte-booking-popup.tsx` - Main booking flow
- `components/cocinarte/stripe-payment-form.tsx` - Stripe payment form component

#### Backend
- `app/api/create-payment-intent/route.ts` - Creates Stripe PaymentIntent
- `app/api/booking-confirmation/route.ts` - Sends confirmation emails

#### Types
- `lib/types/bookings.ts` - Booking types (includes 'stripe' payment method)

## Testing

### Test Mode

Stripe starts in test mode by default. Use these test card numbers:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

For more test cards, see [Stripe's testing guide](https://stripe.com/docs/testing).

### Testing the Flow

1. Navigate to the booking calendar
2. Select a class and click "Book This Class"
3. Sign up or log in
4. Wait for the payment form to load
5. Use a test card number
6. Complete the payment
7. Verify booking confirmation appears
8. Check that emails were sent

## Production Deployment

### Before Going Live

1. **Switch to Live Mode** in your Stripe Dashboard
2. **Get your live API keys**:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`
3. **Update environment variables** on your production server:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
4. **Complete Stripe account activation**:
   - Provide business details
   - Verify your bank account
   - Accept Stripe's terms

5. **Test in production** with real cards (small amounts first!)

### Security Checklist

- ✅ Secret key is stored in environment variables (not in code)
- ✅ Secret key is never sent to the client
- ✅ Payment form uses Stripe Elements (PCI compliant)
- ✅ PaymentIntent is created server-side
- ✅ Booking is only created after successful payment
- ✅ `.env.local` is in `.gitignore`

## Webhooks (Optional but Recommended)

To handle events like failed payments, refunds, or disputes:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Get the webhook signing secret
5. Add to environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Create webhook handler at `/app/api/stripe-webhook/route.ts`

## Monitoring

### Stripe Dashboard

Monitor your payments at:
- **Home** → View recent payments
- **Payments** → All payments
- **Customers** → Customer list
- **Logs** → API request logs

### Common Issues

**Payment form doesn't load:**
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
- Verify the key starts with `pk_test_` or `pk_live_`
- Check browser console for errors

**Payment fails with "Invalid API key":**
- Verify `STRIPE_SECRET_KEY` is set correctly
- Make sure you're using the right key for your mode (test/live)
- Check that the key starts with `sk_test_` or `sk_live_`

**Booking created but payment failed:**
- This shouldn't happen with the current flow
- Payment is processed first, then booking is created
- Check application logs for errors

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [API Reference](https://stripe.com/docs/api)

## Currency and Pricing

Currently set to:
- Currency: USD
- Amount conversion: Multiplied by 100 (Stripe uses cents)
- Example: $45.00 → 4500 cents

To change currency, update the `currency` field in `/app/api/create-payment-intent/route.ts`.

