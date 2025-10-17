import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Check for Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Initialize Stripe client
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });

    const body = await request.json();
    const { amount, classTitle, userName, classId, classDate, classTime } = body;

    // Validate required fields
    if (!amount || !classTitle || !classId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with MANUAL CAPTURE (holds funds, doesn't charge)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: 'usd',
      description: `${classTitle}${userName ? ` - ${userName}` : ''}`,
      capture_method: 'manual', // ← KEY: This holds the payment instead of charging immediately
      metadata: {
        className: classTitle,
        customerName: userName || 'Guest',
        classId: classId,
        classDate: classDate || '',
        classTime: classTime || '',
      },
      // Show only credit/debit card in PaymentElement
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

