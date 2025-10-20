import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { StripePaymentDetails, StripePaymentsListResponse } from '@/lib/types/stripe-payments';

// Force dynamic rendering since this route uses searchParams
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const startingAfter = searchParams.get('starting_after') || undefined;

    // Fetch payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: limit,
      starting_after: startingAfter,
      expand: ['data.charges', 'data.charges.data.refunds', 'data.payment_method'],
    });

    // Transform Stripe payment intents to our format
    const payments = await Promise.all(
      paymentIntents.data.map(async (pi): Promise<StripePaymentDetails> => {
        // Get charge details - cast to proper type when expanded
        const expandedPi = pi as Stripe.PaymentIntent & {
          charges?: Stripe.ApiList<Stripe.Charge>;
        };
        const charges = expandedPi.charges?.data || [];
        
        // Get balance transactions for fees
        const chargesData = await Promise.all(charges.map(async (charge: Stripe.Charge) => {
          let fee = 0;
          let net = charge.amount;
          
          // Fetch balance transaction to get fees
          if (charge.balance_transaction && typeof charge.balance_transaction === 'string') {
            try {
              const balanceTransaction = await stripe.balanceTransactions.retrieve(charge.balance_transaction);
              fee = balanceTransaction.fee;
              net = balanceTransaction.net;
            } catch (error) {
              console.error('Error fetching balance transaction:', error);
            }
          }
          
          return {
            id: charge.id,
            amount: charge.amount,
            amount_captured: charge.amount_captured,
            paid: charge.paid,
            refunded: charge.refunded,
            refund_amount: charge.amount_refunded,
            receipt_url: charge.receipt_url,
            receipt_number: charge.receipt_number,
            billing_details: charge.billing_details ? {
              email: charge.billing_details.email,
              name: charge.billing_details.name,
              phone: charge.billing_details.phone,
              address: charge.billing_details.address ? {
                city: charge.billing_details.address.city,
                country: charge.billing_details.address.country,
                line1: charge.billing_details.address.line1,
                line2: charge.billing_details.address.line2,
                postal_code: charge.billing_details.address.postal_code,
                state: charge.billing_details.address.state,
              } : null,
            } : null,
            payment_method_details: charge.payment_method_details ? {
              type: charge.payment_method_details.type,
              card: charge.payment_method_details.card ? {
                brand: charge.payment_method_details.card.brand || '',
                last4: charge.payment_method_details.card.last4 || '',
                exp_month: charge.payment_method_details.card.exp_month,
                exp_year: charge.payment_method_details.card.exp_year,
                country: charge.payment_method_details.card.country,
                funding: charge.payment_method_details.card.funding || '',
                network: charge.payment_method_details.card.network,
              } : undefined,
            } : null,
            balance_transaction: typeof charge.balance_transaction === 'string' ? charge.balance_transaction : null,
            fee,
            net,
          };
        }));

        // Get refunds
        const refundsData = charges.flatMap((charge: Stripe.Charge) => 
          (charge.refunds?.data || []).map((refund: Stripe.Refund) => ({
            id: refund.id,
            amount: refund.amount,
            created: refund.created,
            reason: refund.reason as string | null,
            status: refund.status || '',
            receipt_number: refund.receipt_number,
          }))
        );

        // Get receipt URL from latest charge
        const latestCharge = charges[0];
        const receiptUrl = latestCharge?.receipt_url || null;
        const customerEmail = latestCharge?.billing_details?.email || pi.receipt_email;

        // Calculate total refunded amount from charges
        const totalRefunded = charges.reduce((sum, charge) => sum + (charge.amount_refunded || 0), 0);

        return {
          id: pi.id,
          amount: pi.amount,
          amount_received: pi.amount_received,
          currency: pi.currency,
          status: pi.status,
          created: pi.created,
          description: pi.description,
          customer: typeof pi.customer === 'string' ? pi.customer : pi.customer?.id || null,
          customer_email: customerEmail,
          payment_method: typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id || null,
          receipt_email: pi.receipt_email,
          receipt_url: receiptUrl,
          metadata: pi.metadata as any,
          charges: chargesData,
          refunds: refundsData,
          latest_charge: pi.latest_charge as string | null,
          amount_capturable: pi.amount_capturable,
          amount_refunded: totalRefunded,
          application_fee_amount: pi.application_fee_amount,
          cancellation_reason: pi.cancellation_reason,
          canceled_at: pi.canceled_at,
          capture_method: pi.capture_method || 'automatic',
          confirmation_method: pi.confirmation_method || 'automatic',
          processing: pi.processing ? { type: pi.processing.type || 'unknown' } : null,
        };
      })
    );

    const response: StripePaymentsListResponse = {
      payments,
      hasMore: paymentIntents.has_more,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Stripe payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments from Stripe' },
      { status: 500 }
    );
  }
}

