const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * Configure Supabase client
 */
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Configure Stripe client
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});

/**
 * Configure email transporter
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Fetch classes that start in approximately 12 hours
 * We check classes between 11.5 and 12.5 hours from now to account for the cron schedule
 */
async function fetchClassesStartingSoon() {
    try {
        const now = new Date();
        const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        const elevenHalfHoursFromNow = new Date(now.getTime() + 11.5 * 60 * 60 * 1000);
        
        // Convert to ISO date strings (YYYY-MM-DD)
        const targetDate = twelveHoursFromNow.toISOString().split('T')[0];
        
        // Get target time in HH:MM:SS format
        const targetTimeStart = elevenHalfHoursFromNow.toTimeString().split(' ')[0];
        const targetTimeEnd = twelveHoursFromNow.toTimeString().split(' ')[0];

        const { data, error } = await supabase
            .from('clases')
            .select('*')
            .eq('date', targetDate)
            .gte('time', targetTimeStart)
            .lte('time', targetTimeEnd);

        if (error) {
            console.error('Error fetching classes:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchClassesStartingSoon:', error);
        return [];
    }
}

/**
 * Fetch classes that start in approximately 24 hours (1 day)
 * We check classes between 23.5 and 24.5 hours from now
 */
async function fetchClassesStartingTomorrow() {
    try {
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const twentyThreeHalfHoursFromNow = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
        
        // Convert to ISO date strings (YYYY-MM-DD)
        const targetDate = twentyFourHoursFromNow.toISOString().split('T')[0];
        
        // Get target time in HH:MM:SS format
        const targetTimeStart = twentyThreeHalfHoursFromNow.toTimeString().split(' ')[0];
        const targetTimeEnd = twentyFourHoursFromNow.toTimeString().split(' ')[0];

        const { data, error } = await supabase
            .from('clases')
            .select('*')
            .eq('date', targetDate)
            .gte('time', targetTimeStart)
            .lte('time', targetTimeEnd);

        if (error) {
            console.error('Error fetching classes starting tomorrow:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchClassesStartingTomorrow:', error);
        return [];
    }
}

/**
 * Fetch bookings for a specific class with payment status 'held'
 */
async function fetchHeldBookingsForClass(classId) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                user_id,
                class_id,
                student_id,
                payment_status,
                payment_amount,
                stripe_payment_intent_id,
                students:student_id (
                    id,
                    parent_name,
                    child_name,
                    email
                )
            `)
            .eq('class_id', classId)
            .eq('payment_status', 'held')
            .not('stripe_payment_intent_id', 'is', null);

        if (error) {
            console.error('Error fetching held bookings:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchHeldBookingsForClass:', error);
        return [];
    }
}

/**
 * Fetch ALL enrolled students for a specific class (any payment/booking status)
 */
async function fetchAllEnrolledStudents(classId) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                payment_status,
                booking_status,
                students:student_id (
                    id,
                    parent_name,
                    child_name,
                    email
                )
            `)
            .eq('class_id', classId)
            .in('booking_status', ['confirmed', 'pending']);

        if (error) {
            console.error('Error fetching enrolled students:', error);
            return [];
        }

        return (data || []).filter(booking => booking.students);
    } catch (error) {
        console.error('Error in fetchAllEnrolledStudents:', error);
        return [];
    }
}

/**
 * Send class confirmation email (class will happen)
 */
async function sendClassConfirmationEmail(student, clase) {
    const parentName = student.students.parent_name || 'Parent';
    const childName = student.students.child_name || 'your child';
    const email = student.students.email;

    if (!email) {
        console.log(`  ⚠️ No email for ${childName}`);
        return false;
    }

    const classDate = new Date(clase.date).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `✅ Class Confirmed: ${clase.title} - Tomorrow!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">✅ Class Confirmed!</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hello ${parentName},</p>
                    <p>Great news! <strong>${childName}'s</strong> cooking class is confirmed!</p>
                    <div style="background: #f3f4f6; padding: 15px; margin: 15px 0;">
                        <h3>Class Details:</h3>
                        <p><strong>${clase.title}</strong></p>
                        <p>📅 ${classDate} at ${clase.time}</p>
                        <p>⏱️ ${clase.classDuration} minutes</p>
                        <p>👥 ${clase.enrolled}/${clase.maxStudents} students</p>
                    </div>
                    <p>💳 Your payment will be processed since the class reached minimum enrollment.</p>
                    <p>See you tomorrow!</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`  ✅ Confirmation sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`  ❌ Error sending to ${email}:`, error.message);
        return false;
    }
}

/**
 * Send class cancellation email (didn't reach minimum)
 */
async function sendClassCancellationEmail(student, clase) {
    const parentName = student.students.parent_name || 'Parent';
    const childName = student.students.child_name || 'your child';
    const email = student.students.email;

    if (!email) {
        console.log(`  ⚠️ No email for ${childName}`);
        return false;
    }

    const classDate = new Date(clase.date).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `❌ Class Cancelled: ${clase.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Class Cancelled</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hello ${parentName},</p>
                    <p>We regret to inform you that the following class has been cancelled due to insufficient enrollment:</p>
                    <div style="background: #f3f4f6; padding: 15px; margin: 15px 0;">
                        <h3>Cancelled Class:</h3>
                        <p><strong>${clase.title}</strong></p>
                        <p>📅 Was scheduled for: ${classDate} at ${clase.time}</p>
                        <p>👥 Enrollment: ${clase.enrolled}/${clase.maxStudents} (minimum not reached)</p>
                    </div>
                    <div style="background: #d4edda; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745;">
                        <h3 style="margin-top: 0; color: #155724;">💚 Payment Information</h3>
                        <p style="color: #155724; margin: 10px 0;"><strong>Your card was NOT charged.</strong></p>
                        <p style="color: #155724; margin: 10px 0;">The payment authorization has been completely released, and you will not see any charge on your statement.</p>
                    </div>
                    <p>We apologize for any inconvenience and hope to see ${childName} in a future class!</p>
                    <p>Browse other available classes at: <a href="https://cocinartepdx.com">cocinartepdx.com</a></p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`  ✅ Cancellation sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`  ❌ Error sending to ${email}:`, error.message);
        return false;
    }
}

/**
 * Capture a held payment (charge the customer)
 */
async function capturePayment(paymentIntentId, bookingId) {
    try {
        console.log(`  📤 Attempting to capture payment: ${paymentIntentId}`);
        
        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            // Update booking status in database
            await supabase
                .from('bookings')
                .update({ 
                    payment_status: 'completed',
                    booking_status: 'confirmed'
                })
                .eq('id', bookingId);
            
            console.log(`  ✅ Payment captured successfully`);
            return true;
        } else {
            console.log(`  ⚠️ Payment status: ${paymentIntent.status}`);
            return false;
        }
    } catch (error) {
        console.error(`  ❌ Error capturing payment:`, error.message);
        return false;
    }
}

/**
 * Cancel a held payment authorization (release the hold)
 */
async function cancelPaymentAuthorization(paymentIntentId, bookingId) {
    try {
        console.log(`  🚫 Attempting to cancel payment authorization: ${paymentIntentId}`);
        
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        
        if (paymentIntent.status === 'canceled') {
            // Update booking status in database
            await supabase
                .from('bookings')
                .update({ 
                    payment_status: 'canceled',
                    booking_status: 'cancelled',
                    notes: 'Payment authorization released - class did not reach minimum capacity'
                })
                .eq('id', bookingId);
            
            console.log(`  ✅ Payment authorization canceled successfully`);
            return true;
        } else {
            console.log(`  ⚠️ Payment status: ${paymentIntent.status}`);
            return false;
        }
    } catch (error) {
        console.error(`  ❌ Error canceling payment:`, error.message);
        return false;
    }
}

/**
 * Process a class: capture payments if fully booked, cancel if not
 */
async function processClass(clase) {
    const classTitle = clase.title || 'Unknown Class';
    const enrolled = clase.enrolled || 0;
    const maxStudents = clase.maxStudents || 0;
    const isFullyBooked = enrolled >= maxStudents;

    console.log(`\n📚 Processing class: ${classTitle}`);
    console.log(`   Enrollment: ${enrolled}/${maxStudents} students`);
    console.log(`   Status: ${isFullyBooked ? '✅ FULLY BOOKED' : '⚠️ NOT FULLY BOOKED'}`);

    // Fetch all held bookings for this class
    const heldBookings = await fetchHeldBookingsForClass(clase.id);
    console.log(`   Found ${heldBookings.length} held payments`);

    if (heldBookings.length === 0) {
        console.log(`   ℹ️ No held payments to process`);
        return {
            classTitle,
            captured: 0,
            canceled: 0,
            failed: 0
        };
    }

    let capturedCount = 0;
    let canceledCount = 0;
    let failedCount = 0;

    for (const booking of heldBookings) {
        const studentName = booking.students?.child_name || 'Unknown Student';
        const parentEmail = booking.students?.email || 'No email';
        
        console.log(`\n   👤 Student: ${studentName} (${parentEmail})`);

        if (isFullyBooked) {
            // Class is fully booked - CAPTURE the payment
            const success = await capturePayment(
                booking.stripe_payment_intent_id,
                booking.id
            );
            if (success) {
                capturedCount++;
            } else {
                failedCount++;
            }
        } else {
            // Class is NOT fully booked - CANCEL the authorization
            const success = await cancelPaymentAuthorization(
                booking.stripe_payment_intent_id,
                booking.id
            );
            if (success) {
                canceledCount++;
            } else {
                failedCount++;
            }
        }
    }

    return {
        classTitle,
        captured: capturedCount,
        canceled: canceledCount,
        failed: failedCount
    };
}

/**
 * Process classes starting tomorrow - send reminder emails
 */
async function processClassesStartingTomorrow() {
    console.log('\n📧 Checking for classes starting tomorrow (24 hours)...');
    const tomorrowClasses = await fetchClassesStartingTomorrow();
    console.log(`📋 Found ${tomorrowClasses.length} classes starting tomorrow`);
    
    if (tomorrowClasses.length === 0) {
        console.log('✅ No classes starting tomorrow');
        return;
    }

    let confirmationsSent = 0;
    let cancellationsSent = 0;

    for (const clase of tomorrowClasses) {
        const classTitle = clase.title || 'Unknown Class';
        const enrolled = clase.enrolled || 0;
        const minStudents = clase.minStudents || 0;
        const hasMinimum = enrolled >= minStudents;

        console.log(`\n📚 Processing: ${classTitle}`);
        console.log(`   Enrollment: ${enrolled}/${clase.maxStudents} (min: ${minStudents})`);
        console.log(`   Status: ${hasMinimum ? '✅ WILL PROCEED' : '❌ WILL BE CANCELLED'}`);

        // Fetch all enrolled students
        const students = await fetchAllEnrolledStudents(clase.id);
        console.log(`   Found ${students.length} enrolled students`);

        if (students.length === 0) {
            console.log(`   ℹ️ No students to email`);
            continue;
        }

        // Send appropriate email to each student
        for (const student of students) {
            const childName = student.students?.child_name || 'Student';
            console.log(`\n   👤 ${childName}`);

            if (hasMinimum) {
                // Class will happen - send confirmation
                const success = await sendClassConfirmationEmail(student, clase);
                if (success) confirmationsSent++;
            } else {
                // Class cancelled - send cancellation
                const success = await sendClassCancellationEmail(student, clase);
                if (success) cancellationsSent++;
            }
        }
    }

    console.log(`\n📧 Tomorrow's Class Emails:`);
    console.log(`   ✅ Confirmations sent: ${confirmationsSent}`);
    console.log(`   ❌ Cancellations sent: ${cancellationsSent}`);
}

/**
 * Update ALL booking statuses for a class
 */
async function updateAllBookingStatuses(classId, paymentStatus, bookingStatus, notes = null) {
    try {
        const updateData = {
            payment_status: paymentStatus,
            booking_status: bookingStatus
        };
        
        if (notes) {
            updateData.notes = notes;
        }

        const { error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('class_id', classId)
            .in('booking_status', ['confirmed', 'pending']);

        if (error) {
            console.error('Error updating booking statuses:', error);
            return false;
        }

        console.log(`  ✅ Updated all booking statuses to: ${bookingStatus}`);
        return true;
    } catch (error) {
        console.error('Error in updateAllBookingStatuses:', error);
        return false;
    }
}

/**
 * Process a class completely - send emails AND process payments
 */
async function processClassComplete(clase) {
    const classTitle = clase.title || 'Unknown Class';
    const enrolled = clase.enrolled || 0;
    const minStudents = clase.minStudents || 0;
    const maxStudents = clase.maxStudents || 0;
    const hasMinimum = enrolled >= minStudents;

    console.log(`\n📚 Processing class: ${classTitle}`);
    console.log(`   Enrollment: ${enrolled}/${maxStudents} (minimum: ${minStudents})`);
    console.log(`   Status: ${hasMinimum ? '✅ WILL PROCEED (Has minimum)' : '❌ WILL BE CANCELLED (Below minimum)'}`);

    // Fetch all enrolled students
    const allStudents = await fetchAllEnrolledStudents(clase.id);
    console.log(`   Found ${allStudents.length} enrolled students`);

    // Fetch held bookings for payment processing
    const heldBookings = await fetchHeldBookingsForClass(clase.id);
    console.log(`   Found ${heldBookings.length} held payments to process`);

    let emailsConfirmed = 0;
    let emailsCancelled = 0;
    let paymentsCaptured = 0;
    let paymentsCanceled = 0;
    let paymentsFailed = 0;

    // STEP 1: Update ALL booking statuses based on minimum enrollment
    if (hasMinimum) {
        // Class confirmed - update all bookings to confirmed
        await updateAllBookingStatuses(clase.id, 'completed', 'confirmed');
    } else {
        // Class cancelled - update all bookings to cancelled
        await updateAllBookingStatuses(
            clase.id, 
            'canceled', 
            'cancelled', 
            'Class cancelled - did not reach minimum enrollment'
        );
    }

    // STEP 2: Send emails to all students
    for (const student of allStudents) {
        const childName = student.students?.child_name || 'Student';
        const email = student.students?.email;
        
        console.log(`\n   👤 Student: ${childName} (${email})`);

        if (hasMinimum) {
            const success = await sendClassConfirmationEmail(student, clase);
            if (success) emailsConfirmed++;
        } else {
            const success = await sendClassCancellationEmail(student, clase);
            if (success) emailsCancelled++;
        }
    }

    // STEP 3: Process payments for held bookings
    for (const heldBooking of heldBookings) {
        const studentName = heldBooking.students?.child_name || 'Unknown Student';
        const parentEmail = heldBooking.students?.email || 'No email';
        
        console.log(`\n   💳 Processing payment for: ${studentName} (${parentEmail})`);

        if (hasMinimum) {
            // Capture payment
            const success = await capturePayment(
                heldBooking.stripe_payment_intent_id,
                heldBooking.id
            );
            if (success) {
                paymentsCaptured++;
            } else {
                paymentsFailed++;
            }
        } else {
            // Cancel authorization
            const success = await cancelPaymentAuthorization(
                heldBooking.stripe_payment_intent_id,
                heldBooking.id
            );
            if (success) {
                paymentsCanceled++;
            } else {
                paymentsFailed++;
            }
        }
    }

    return {
        classTitle,
        hasMinimum,
        emailsConfirmed,
        emailsCancelled,
        paymentsCaptured,
        paymentsCanceled,
        paymentsFailed
    };
}

/**
 * Main task - checks classes starting in 24 hours and processes everything
 */
async function performPaymentProcessingTask() {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    console.log(`\n[${timestamp}] Class Processing Cron Job Executed!`);
    console.log('='.repeat(80));
    
    try {
        // Check for classes starting in 24 hours (tomorrow)
        console.log('\n🔍 Checking for classes starting in 24 hours...');
        const classes = await fetchClassesStartingTomorrow();
        console.log(`📋 Found ${classes.length} classes starting tomorrow`);
        
        if (classes.length === 0) {
            console.log('✅ No classes to process at this time');
            console.log('='.repeat(80));
            return;
        }

        const results = [];

        // Process each class (emails + payments together)
        for (const clase of classes) {
            const result = await processClassComplete(clase);
            results.push(result);
        }

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 PROCESSING SUMMARY (24 Hours Before Class)');
        console.log('='.repeat(80));
        
        const totalEmailsConfirmed = results.reduce((sum, r) => sum + r.emailsConfirmed, 0);
        const totalEmailsCancelled = results.reduce((sum, r) => sum + r.emailsCancelled, 0);
        const totalPaymentsCaptured = results.reduce((sum, r) => sum + r.paymentsCaptured, 0);
        const totalPaymentsCanceled = results.reduce((sum, r) => sum + r.paymentsCanceled, 0);
        const totalPaymentsFailed = results.reduce((sum, r) => sum + r.paymentsFailed, 0);

        console.log('📧 EMAILS SENT:');
        console.log(`   ✅ Confirmation emails: ${totalEmailsConfirmed}`);
        console.log(`   ❌ Cancellation emails: ${totalEmailsCancelled}`);
        
        console.log('\n💳 PAYMENTS PROCESSED:');
        console.log(`   ✅ Payments captured (charged): ${totalPaymentsCaptured}`);
        console.log(`   🚫 Payments canceled (released): ${totalPaymentsCanceled}`);
        console.log(`   ❌ Failed operations: ${totalPaymentsFailed}`);
        
        console.log('\n📋 DETAILS BY CLASS:');
        results.forEach(result => {
            console.log(`\n   ${result.classTitle}:`);
            console.log(`      Status: ${result.hasMinimum ? '✅ Proceeding' : '❌ Cancelled'}`);
            console.log(`      Emails: ${result.emailsConfirmed + result.emailsCancelled} sent`);
            console.log(`      Payments: ${result.paymentsCaptured} captured | ${result.paymentsCanceled} canceled | ${result.paymentsFailed} failed`);
        });

        console.log('\n' + '='.repeat(80));
        
    } catch (error) {
        console.error('❌ Error in class processing cron job:', error);
    }
}

// Schedule the cron job to run every hour
// This way we catch classes in the 24-hour window multiple times
// Cron pattern: 0 * * * *
// - 0: At minute 0 (start of every hour)
// - *: Every hour
// - *: Every day of month
// - *: Every month
// - *: Every day of week
const task = cron.schedule('0 * * * *', async () => {
    await performPaymentProcessingTask();
}, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "America/Los_Angeles"
});

console.log('🚀 Class Processing Cron Job Started!');
console.log('⏰ Checks every hour for classes starting in 24 hours');
console.log('📧 Sends confirmation/cancellation emails to enrolled students');
console.log('💳 Processes payments (capture or cancel)');
console.log('   ✅ Classes with minimum enrollment → Emails + Charge payments');
console.log('   ❌ Classes below minimum → Emails + Release payment holds');
console.log('🌲 Timezone: Pacific Time (Hillsboro, Oregon)');
console.log('Press Ctrl+C to stop\n');

// Run immediately on startup for testing
console.log('🔄 Running initial check...\n');
performPaymentProcessingTask().then(() => {
    console.log('\n✅ Initial check complete. Next run at the top of the hour.');
});

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping payment processing cron job...');
    task.stop();
    console.log('✅ Cron job stopped successfully');
    process.exit(0);
});

