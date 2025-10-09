# Email Notifications Setup

## Overview

Both the Birthday Party Request form and Private Events form now send email notifications using nodemailer when a request is submitted.

## Features

- ✅ Admin notification email with all party request details
- ✅ Customer confirmation email
- ✅ Beautiful HTML email templates
- ✅ Form validation
- ✅ Loading states and success/error feedback
- ✅ Form reset after successful submission

## Files Modified/Created

### New API Routes
- `app/api/birthday-party/route.ts` - Handles birthday party form submission and sends emails
- `app/api/private-events/route.ts` - Handles private events form submission and sends emails

### Updated Components
- `components/cocinarte/cocinarte-birthday.tsx` - Added form state management and submission logic
- `components/cocinarte/cocinarte-private-events.tsx` - Added form state management and submission logic

## Required Environment Variables

Make sure your `.env.local` file includes these variables (same as the contact form):

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
SMTP_FROM="Cocinarte <your-email@gmail.com>"
CONTACT_EMAIL=admin@cocinarte.com
```

## Email Details

### Birthday Party Emails

#### Admin Email
- **To:** diego@comcreate.org and info@cocinartepdx.com
- **Subject:** 🎉 New Birthday Party Request - [Date]
- **Contains:**
  - Preferred date
  - Selected package (Mini/Deluxe/Premium Fiesta)
  - Number of children
  - Parent/guardian contact info
  - Birthday child's name and age
  - Special requests/dietary restrictions
  - Quick action links (email and call)

#### Customer Confirmation Email
- **To:** Customer's email address
- **Subject:** 🎉 We Received Your Birthday Party Request!
- **Contains:**
  - Confirmation of request details
  - What happens next
  - Contact information for questions:
    - **Email:** info@cocinartepdx.com
    - **Phone:** +1 (503) 916-9758

### Private Events Emails

#### Admin Email
- **To:** diego@comcreate.org and info@cocinartepdx.com
- **Subject:** 🎊 New Private Event Request - [Event Type]
- **Contains:**
  - Event type (Team Building, Corporate Event, etc.)
  - Number of guests
  - Preferred date and time
  - Contact information
  - Event details and special requirements
  - Quick action links (email and call)

#### Customer Confirmation Email
- **To:** Customer's email address
- **Subject:** 🎊 We Received Your Private Event Request!
- **Contains:**
  - Confirmation of request details
  - What happens next (custom pricing, menu options, etc.)
  - Contact information for questions:
    - **Email:** info@cocinartepdx.com
    - **Phone:** +1 (503) 916-9758

## Testing

### Testing Birthday Party Form

1. Navigate to the birthday parties section on the website
2. Fill out the "Request Your Party" form
3. Submit the form
4. Check for:
   - Success toast notification
   - Admin email in your inbox (both diego@comcreate.org and info@cocinartepdx.com)
   - Customer confirmation email
   - Form fields reset after submission

### Testing Private Events Form

1. Navigate to the private events section on the website
2. Fill out the event request form
3. Submit the form
4. Check for:
   - Success toast notification
   - Admin email in your inbox (both diego@comcreate.org and info@cocinartepdx.com)
   - Customer confirmation email
   - Form fields reset after submission

## Notes

### General
- All required fields must be filled out before submission
- Email validation is performed on both client and server side
- If submission fails, an error toast is displayed
- The submit button shows "Submitting..." during the submission process
- Both admin emails (diego@comcreate.org and info@cocinartepdx.com) receive notifications

### Birthday Party Form
- Validates that date and package are selected before submission
- All form fields reset after successful submission

### Private Events Form
- Validates that event type, date, and time are selected before submission
- Includes an email address field (added to the form)
- All form fields reset after successful submission

