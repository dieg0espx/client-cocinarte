import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Force dynamic rendering for cron job
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
 * Fetch all classes from database
 */
async function fetchAllClasses() {
    try {
        const { data, error } = await supabase
            .from('clases')
            .select('*')
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) {
            console.error('Error fetching classes:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchAllClasses:', error);
        return [];
    }
}

/**
 * Send email with classes status
 */
async function sendClassesStatusEmail(classes: any[]) {
    const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Build HTML table for classes
    let classesHTML = '';
    let totalClasses = classes.length;
    let fullyBookedCount = 0;
    let availableCount = 0;

    classes.forEach((clase) => {
        const enrolled = clase.enrolled || 0;
        const maxStudents = clase.maxStudents || 0;
        const isFullyBooked = enrolled >= maxStudents;
        const availableSpots = maxStudents - enrolled;
        
        if (isFullyBooked) fullyBookedCount++;
        else availableCount++;

        const statusBadge = isFullyBooked 
            ? '<span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">FULLY BOOKED</span>'
            : `<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${availableSpots} SPOTS LEFT</span>`;

        const classDate = new Date(clase.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });

        classesHTML += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 500;">${clase.title || 'Untitled'}</td>
                <td style="padding: 12px;">${classDate}</td>
                <td style="padding: 12px;">${clase.time || 'N/A'}</td>
                <td style="padding: 12px; text-align: center;">${enrolled}/${maxStudents}</td>
                <td style="padding: 12px; text-align: center;">${statusBadge}</td>
            </tr>
        `;
    });

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: 'lexispam33@gmail.com',
        subject: `📊 Classes Status Report - ${timestamp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">📚 Classes Status Report</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">${timestamp}</p>
                </div>
                
                <div style="padding: 20px; background: #f9fafb;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-size: 32px; font-weight: bold; color: #6366f1;">${totalClasses}</div>
                            <div style="color: #6b7280; margin-top: 5px;">Total Classes</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-size: 32px; font-weight: bold; color: #10b981;">${availableCount}</div>
                            <div style="color: #6b7280; margin-top: 5px;">Available</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${fullyBookedCount}</div>
                            <div style="color: #6b7280; margin-top: 5px;">Fully Booked</div>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px;">
                    <h2 style="color: #1f2937; margin-top: 0;">All Classes</h2>
                    <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Class Title</th>
                                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Date</th>
                                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Time</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Enrollment</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classesHTML || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #6b7280;">No classes found</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                    <p>This is an automated report from Cocinarte PDX</p>
                    <p style="margin: 5px 0;">Sent every 2 minutes</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Classes status email sent successfully to lexispam33@gmail.com`);
        return true;
    } catch (error: any) {
        console.error(`❌ Error sending email:`, error.message);
        return false;
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log("Cron job started - Fetching classes and sending email...");
        
        const timestamp = new Date().toISOString();
        console.log(`Cron executed at: ${timestamp}`);
        
        // Fetch all classes
        const classes = await fetchAllClasses();
        console.log(`Found ${classes.length} classes`);
        
        // Send email with classes status
        const emailSent = await sendClassesStatusEmail(classes);
        
        return NextResponse.json({
            message: "Classes status email sent", 
            timestamp,
            status: "success",
            classesCount: classes.length,
            emailSent
        }, {status: 200});
        
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json({
            error: "Cron job failed",
            message: error instanceof Error ? error.message : "Unknown error"
        }, {status: 500});
    }
}