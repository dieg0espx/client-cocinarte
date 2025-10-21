import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: NextRequest) {
    console.log("Hello World - Cron job is working");
    
    const timestamp = new Date().toISOString();
    console.log(`Cron executed at: ${timestamp}`);
    
    return NextResponse.json({
        message: "Hello World", 
        timestamp,
        status: "success"
    }, {status: 200});
}