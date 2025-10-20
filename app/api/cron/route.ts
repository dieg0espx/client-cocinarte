import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

// MAIN CRON JOB - Simple Hello World function
export async function GET(request: NextRequest) {
    console.log("Hello World - Cron job is working")
    return NextResponse.json({message: "Hello World"}, {status: 200});
}

/* 
COMMENTED OUT - All complex functionality below:

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function fetchClasses() {
    // Implementation commented out
}

async function fetchEnrolledStudents(classId: string) {
    // Implementation commented out
}

async function sendStudentEmail(student: any, clase: any, timeString: string, timestamp: string) {
    // Implementation commented out
}

async function performTask() {
    // Implementation commented out
}
*/