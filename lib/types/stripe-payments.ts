import Stripe from 'stripe';

export interface StripePaymentDetails {
  id: string; // Payment Intent ID
  amount: number; // Amount in cents
  amount_received: number; // Amount received in cents
  currency: string;
  status: Stripe.PaymentIntent.Status;
  created: number; // Unix timestamp
  description: string | null;
  customer: string | null;
  customer_email: string | null;
  payment_method: string | null;
  receipt_email: string | null;
  receipt_url: string | null;
  metadata: {
    className?: string;
    customerName?: string;
    bookingId?: string;
    [key: string]: string | undefined;
  };
  charges: {
    id: string;
    amount: number;
    amount_captured: number;
    paid: boolean;
    refunded: boolean;
    refund_amount: number;
    receipt_url: string | null;
    receipt_number: string | null;
    billing_details: {
      email: string | null;
      name: string | null;
      phone: string | null;
      address: {
        city: string | null;
        country: string | null;
        line1: string | null;
        line2: string | null;
        postal_code: string | null;
        state: string | null;
      } | null;
    } | null;
    payment_method_details: {
      type: string;
      card?: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
        country: string | null;
        funding: string;
        network: string | null;
      };
    } | null;
    balance_transaction: string | null;
    fee: number;
    net: number;
  }[];
  refunds: {
    id: string;
    amount: number;
    created: number;
    reason: string | null;
    status: string;
    receipt_number: string | null;
  }[];
  latest_charge: string | null;
  amount_capturable: number;
  amount_refunded: number;
  application_fee_amount: number | null;
  cancellation_reason: string | null;
  canceled_at: number | null;
  capture_method: string;
  confirmation_method: string;
  processing: {
    type: string;
  } | null;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // Optional partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface RefundResponse {
  success: boolean;
  refund?: Stripe.Refund;
  error?: string;
}

export interface StripePaymentsListResponse {
  payments: StripePaymentDetails[];
  hasMore: boolean;
  totalCount?: number;
}

