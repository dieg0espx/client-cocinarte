import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

// Force dynamic rendering for cron job
export const dynamic = 'force-dynamic';

// MAIN CRON JOB - Simple Hello World function
export async function GET(request: NextRequest) {
    try {
        console.log("Hello World - Cron job is working");
        
        // Add timestamp for debugging
        const timestamp = new Date().toISOString();
        console.log(`Cron executed at: ${timestamp}`);
        
        return NextResponse.json({
            message: "Hello World", 
            timestamp,
            status: "success"
        }, {status: 200});
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json({
            error: "Cron job failed",
            message: error instanceof Error ? error.message : "Unknown error"
        }, {status: 500});
    }
}

