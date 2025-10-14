import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { RefundRequest, RefundResponse } from '@/lib/types/stripe-payments';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: RefundRequest = await request.json();
    const { paymentIntentId, amount, reason } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Create refund in Stripe
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    // Add optional parameters
    if (amount) {
      refundParams.amount = amount;
    }
    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    // Update booking status in Supabase
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        payment_status: refund.status === 'succeeded' ? 'refunded' : 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (updateError) {
      console.error('Error updating booking status:', updateError);
      // Don't fail the request since refund was successful in Stripe
    }

    const response: RefundResponse = {
      success: true,
      refund,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error processing refund:', error);
    
    const response: RefundResponse = {
      success: false,
      error: error.message || 'Failed to process refund',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

