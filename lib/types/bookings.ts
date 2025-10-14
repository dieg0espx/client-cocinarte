export interface Booking {
  id: string;
  user_id: string;
  class_id: string;
  student_id: string;
  booking_date: string; // ISO date string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_amount: number;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'stripe';
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  user_id: string;
  class_id: string;
  student_id: string;
  payment_amount: number;
  payment_method?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'stripe';
  stripe_payment_intent_id?: string;
  notes?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {
  id: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface BookingWithDetails extends Booking {
  class: {
    id: string;
    title: string;
    date: string;
    time: string;
    price: number;
    classDuration: number;
  };
  student: {
    id: string;
    parent_name: string;
    child_name: string;
    email: string;
  };
}
