const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
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
 * Configure email transporter
 * Using existing SMTP configuration from .env.local
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
 * Fetch classes with enrollment status
 */
async function fetchClasses() {
    try {
        const { data, error } = await supabase
            .from('clases')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching classes:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchClasses:', error);
        return [];
    }
}

/**
 * Fetch enrolled students for a specific class
 */
async function fetchEnrolledStudents(classId) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                student_id,
                booking_status,
                students:student_id (
                    id,
                    parent_name,
                    child_name,
                    email,
                    phone
                )
            `)
            .eq('class_id', classId)
            .in('booking_status', ['confirmed', 'pending']);

        if (error) {
            console.error('Error fetching enrolled students:', error);
            return [];
        }

        // Flatten the data to get student info directly
        const students = (data || [])
            .filter(booking => booking.students) // Filter out null students
            .map(booking => ({
                id: booking.students.id,
                parent_name: booking.students.parent_name,
                child_name: booking.students.child_name,
                email: booking.students.email,
                phone: booking.students.phone,
                booking_id: booking.id,
                booking_status: booking.booking_status
            }));

        return students;
    } catch (error) {
        console.error('Error in fetchEnrolledStudents:', error);
        return [];
    }
}

/**
 * Send a personalized email to a student about their enrolled class
 */
async function sendStudentEmail(student, clase, timeString, timestamp) {
    const classTitle = clase.title || 'Unknown Class';
    const classType = clase.class_type || '';
    const enrolled = clase.enrolled || 0;
    const maxStudents = clase.maxStudents || 0;
    const price = clase.price ? `$${parseFloat(clase.price).toFixed(2)}` : 'Free';
    const classDate = clase.date || '';
    const classTime = clase.time || '';
    const classDuration = clase.classDuration || '';
    const description = clase.description || '';
    
    const spotsLeft = maxStudents - enrolled;
    const isAlmostFull = spotsLeft <= 2;
    
    const parentName = student.parent_name || 'Parent';
    const childName = student.child_name || 'your child';
    const studentEmail = student.email;

    if (!studentEmail) {
        console.log(`⚠️ Skipping student ${childName} - no email address`);
        return;
    }
    
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: studentEmail,
        subject: `🍳 ${classTitle} - ${spotsLeft} spots left!`,
        text: `Hello ${parentName}!\n\nThis is a reminder about ${childName}'s upcoming class: ${classTitle}\n\nClass Details:\n- Type: ${classType || 'N/A'}\n- Current Enrollment: ${enrolled}/${maxStudents} students\n- Spots Still Available: ${spotsLeft}\n- Price: ${price}\n- Duration: ${classDuration} minutes\n- Schedule: ${classDate} at ${classTime}\n- Description: ${description}\n\n${isAlmostFull ? '⚠️ This class is almost full! Only ' + spotsLeft + ' spots remaining.\n\n' : ''}You can still invite friends to join ${childName} in this class!\n\nSee you soon!\n\nBest regards,\nCocinarte Team`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                <h2 style="color: #333;">🍳 ${classTitle}</h2>
                <p>Hello ${parentName}!</p>
                <p>This is a reminder about <strong>${childName}'s</strong> upcoming cooking class!</p>
                
                <div style="background: ${isAlmostFull ? '#fff3cd' : '#d4edda'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isAlmostFull ? '#ffc107' : '#28a745'};">
                    <h3 style="margin-top: 0; color: ${isAlmostFull ? '#856404' : '#155724'};">
                        ${isAlmostFull ? '⚠️ Almost Full!' : '✅ Spots Still Available'}
                    </h3>
                    <p style="font-size: 18px; margin: 10px 0;"><strong>Spots Left:</strong> ${spotsLeft}</p>
                    <p style="font-size: 16px; margin: 10px 0;"><strong>Current Enrollment:</strong> ${enrolled}/${maxStudents} students</p>
                    ${isAlmostFull ? `<p style="color: #856404; margin: 10px 0;">This class is almost full! Tell your friends to sign up soon!</p>` : `<p style="color: #155724; margin: 10px 0;">There's still room for ${childName}'s friends to join!</p>`}
                </div>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #495057;">📋 Class Details</h3>
                    <p><strong>Class Name:</strong> ${classTitle}</p>
                    ${classType ? `<p><strong>Type:</strong> ${classType}</p>` : ''}
                    <p><strong>Price:</strong> ${price}</p>
                    ${classDuration ? `<p><strong>Duration:</strong> ${classDuration} minutes</p>` : ''}
                    ${classDate && classTime ? `<p><strong>Schedule:</strong> ${classDate} at ${classTime}</p>` : ''}
                    ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
                </div>

                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                    <h3 style="margin-top: 0; color: #2e7d32;">👨‍🍳 Your Child's Booking</h3>
                    <p style="font-size: 16px; margin: 10px 0;"><strong>Child:</strong> ${childName}</p>
                    <p style="font-size: 16px; margin: 10px 0;"><strong>Parent:</strong> ${parentName}</p>
                    <p style="font-size: 14px; margin: 10px 0; color: #666;"><strong>Booking Status:</strong> ${student.booking_status}</p>
                </div>

                <p style="margin-top: 20px;">We're excited to see ${childName} in class! If you have any questions, feel free to contact us.</p>

                <p style="color: #888; font-size: 14px; margin-top: 20px;">This is an automated reminder. If you have questions, please reply to this email.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${studentEmail} (${childName}) for class: ${classTitle}`);
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error(`❌ Error sending email to ${studentEmail} for class ${classTitle}:`, error);
    }
}

/**
 * Simple task that prints the current hour every minute
 */
async function performTask() {
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
    
    const hours = now.toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        hour: '2-digit'
    });
    
    const minutes = now.toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        minute: '2-digit'
    });
    
    const seconds = now.toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        second: '2-digit'
    });
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Print the hour each minute
    console.log(`[${timestamp}] Current hour: ${hours}`);
    
    /* COMMENTED OUT - Original email functionality
    try {
        // Fetch classes from Supabase
        console.log('Fetching classes from Supabase...');
        const classes = await fetchClasses();
        console.log(`Found ${classes.length} classes`);
        
        // Filter classes that have available spots (enrolled < maxStudents)
        const availableClasses = classes.filter(clase => {
            const enrolled = clase.enrolled || 0;
            const maxStudents = clase.maxStudents || 0;
            return enrolled > 0 && enrolled < maxStudents; // Has students AND not full
        });
        console.log(`Classes with available spots: ${availableClasses.length}`);

        let totalEmailsSent = 0;

        // For each available class, send emails to all enrolled students
        for (const clase of availableClasses) {
            console.log(`\n📚 Processing class: ${clase.title}`);
            
            // Fetch enrolled students for this class
            const students = await fetchEnrolledStudents(clase.id);
            console.log(`   Found ${students.length} enrolled students`);

            // Send email to each student
            for (const student of students) {
                await sendStudentEmail(student, clase, timeString, timestamp);
                totalEmailsSent++;
            }
        }

        console.log(`\n✅ Total emails sent: ${totalEmailsSent}`);
        
    } catch (error) {
        console.error('❌ Error in cron job:', error);
    }
    */
}

// Schedule the cron job to run every minute
// Cron pattern: * * * * *
// - *: Every minute
// - *: Every hour
// - *: Every day of month
// - *: Every month
// - *: Every day of week
const task = cron.schedule('* * * * *', async () => {
    console.log('=====================================');
    console.log('Starting scheduled task...');
    await performTask();
    console.log('=====================================\n');
}, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "America/Los_Angeles"
});

console.log('🚀 Cron job scheduler started!');
console.log('⏰ Will print the current hour every minute');
console.log('🌲 Timezone: Pacific Time (Hillsboro, Oregon)');
console.log('🔄 Running first task immediately...\n');

// Run the task immediately on startup
(async () => {
    console.log('=====================================');
    console.log('Initial task execution...');
    await performTask();
    console.log('=====================================\n');
    console.log('✅ Initial execution complete. Next run in 1 minute.');
    console.log('Press Ctrl+C to stop\n');
})();

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping cron job...');
    task.stop();
    console.log('✅ Cron job stopped successfully');
    process.exit(0);
});
