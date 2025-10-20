import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

/**
 * Configure Supabase client
 */
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
async function fetchEnrolledStudents(classId: string) {
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
            .filter((booking: any) => booking.students) // Filter out null students
            .map((booking: any) => ({
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
async function sendStudentEmail(student: any, clase: any, timeString: string, timestamp: string) {
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
 * Simple task that prints the current time every 5 minutes
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
    
    // Print the current time every 5 minutes
    console.log(`[${timestamp}] Vercel Cron - Current time: ${hours}:${minutes}`);
    console.log('✅ Cron job executed successfully every 5 minutes');
    
    /* COMMENTED OUT - Original email functionality (ready to uncomment when needed)
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

export async function GET(request: NextRequest) {
  // Check authorization header for cron secret
  const authHeader = request.headers.get('Authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRON_SECRET environment variable not set');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }
  
  if (authHeader !== expectedAuth) {
    console.error('❌ Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('=====================================');
  console.log('Starting Vercel cron job - every 5 minutes...');
  
  try {
    await performTask();
    
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

    console.log('=====================================');
    
    return NextResponse.json({ 
      ok: true, 
      timestamp,
      hour: hours,
      message: 'Vercel cron job executed successfully - every 5 minutes',
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('❌ Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}