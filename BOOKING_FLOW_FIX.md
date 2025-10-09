# Booking Flow Fix - Sign Up to Payment

## Problem
When a user wanted to book a class but was not logged in, after signing up, the flow was broken and didn't properly take them to the payment step.

## Solution
Implemented a sessionStorage-based booking intent system that preserves the booking context across the authentication flow.

## How It Works

### Flow for New Users (Sign Up)
1. User selects a class from the calendar
2. Clicks "Book This Class"
3. System detects user is not logged in → Shows signup form
4. User fills out signup form (parent name, child name, email, phone, address, password)
5. **On form submission:**
   - Booking data is saved to `sessionStorage` as `pendingBooking`
   - Sign up is initiated with Supabase
6. **After successful signup:**
   - Auth context updates with new user session
   - `useEffect` hook detects user is now available AND there's a pending booking
   - Student record is created automatically
   - Pending booking data is restored to form state
   - User is automatically navigated to payment step
7. User completes payment
8. Booking is confirmed and `pendingBooking` is cleared from sessionStorage

### Flow for Existing Users (Login)
1. User selects a class from the calendar
2. Clicks "Book This Class"
3. System detects user is not logged in → Shows login form
4. User logs in with existing credentials
5. After successful login → Directly navigates to payment step
6. User completes payment
7. Booking is confirmed

### Flow for Returning Users (Incomplete Booking)
If a user signs up but closes the browser before completing payment:
1. User returns to the site and logs in
2. System detects `pendingBooking` exists in sessionStorage
3. Booking data is automatically restored
4. User is directed to payment step to complete the booking

## Key Changes

### 1. New useEffect for Post-Signup Flow
```typescript
useEffect(() => {
  const handlePostSignup = async () => {
    const pendingBooking = sessionStorage.getItem('pendingBooking')
    
    if (user && pendingBooking && isOpen) {
      // Restore booking state
      // Create student record if needed
      // Navigate to payment
    }
  }
  
  handlePostSignup()
}, [user, isOpen])
```

### 2. Modified handleSignUp Function
- Saves booking intent to sessionStorage before calling signUp
- Removed immediate booking creation (was failing because user wasn't available yet)
- Added email verification check message

### 3. Enhanced useEffect for Popup Opening
- Checks for pending booking when popup opens
- Restores booking data if user is already logged in

### 4. Cleanup on Completion
- Clears `pendingBooking` from sessionStorage after successful payment
- Clears `pendingBooking` after booking confirmation

## SessionStorage Structure

```typescript
{
  classId: string,
  parentName: string,
  childName: string,
  phone: string,
  address: string,
  email: string
}
```

## Testing Scenarios

### ✅ Scenario 1: New User Sign Up → Payment
1. Navigate to the calendar or click "Book a Class"
2. Select a class
3. Click "Book This Class" (while not logged in)
4. Click "Sign up here" on the login form
5. Fill out signup form with all required fields
6. Submit form
7. **Expected:** Account creation message appears
8. **Expected:** Automatically redirected to payment page within 2-3 seconds
9. **Expected:** Selected class information is displayed on payment form
10. Complete payment with credit card details
11. **Expected:** Booking confirmation page appears
12. **Expected:** Confirmation emails sent to user and admin

### ✅ Scenario 2: Existing User Login → Payment
1. Navigate to the calendar or click "Book a Class"
2. Select a class
3. Click "Book This Class" (while not logged in)
4. Enter existing login credentials
5. Submit login
6. **Expected:** "Successfully signed in!" message appears
7. **Expected:** Automatically redirected to payment page within 1 second
8. **Expected:** Selected class information is displayed
9. Complete payment
10. **Expected:** Booking confirmed with confirmation emails

### ✅ Scenario 3: Sign Up → Close Browser → Login → Payment
1. Navigate to the calendar and select a class
2. Click "Book This Class" (while not logged in)
3. Click "Sign up here"
4. Fill signup form completely and submit
5. **Before payment loads**, close the browser/tab
6. Reopen browser and navigate back to the site
7. Click "Book a Class" or navigate to calendar
8. **Expected:** Pending booking is automatically restored
9. **Expected:** Form fields are pre-filled with previous data
10. **Expected:** Automatically redirected to payment
11. Complete payment
12. **Expected:** Booking confirmed successfully

### ✅ Scenario 4: Already Logged In → Direct Payment
1. Login to account first (from header or login page)
2. Navigate to calendar
3. Select a class
4. Click "Book This Class"
5. **Expected:** Goes directly to payment (skips all auth forms)
6. **Expected:** Selected class information is displayed
7. Complete payment
8. **Expected:** Booking confirmed

### ✅ Scenario 5: Multiple Classes - Switch Selection
1. Open booking popup
2. Select Class A
3. Start signup process
4. Go back to class selection
5. Select Class B instead
6. Complete signup
7. **Expected:** Class B is selected for payment (not Class A)

### ✅ Scenario 6: Error Handling - Signup Failure
1. Select a class
2. Start signup with invalid/duplicate email
3. **Expected:** Error message displayed
4. **Expected:** Pending booking is cleared
5. **Expected:** Can retry with correct information

## Error Handling

1. **Signup Error:** If signup fails, `pendingBooking` is cleared to prevent confusion
2. **Payment Error:** Pending booking remains so user can retry payment
3. **Student Creation Error:** Error message shown, user can retry
4. **Email Verification Required:** User is informed to check email

## Future Enhancements

1. Add expiration time to pending bookings (e.g., 24 hours)
2. Show pending booking banner on login if booking exists
3. Add ability to cancel pending booking
4. Store pending booking in database instead of sessionStorage for cross-device support

