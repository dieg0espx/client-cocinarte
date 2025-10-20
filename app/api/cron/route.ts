import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Log the start of the function execution
  console.log('🚀 Vercel Cron Job Started');
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('Environment check - CRON_SECRET exists:', !!process.env.CRON_SECRET);
  
  try {
    // Check authorization header for cron secret
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing');
    console.log('Expected auth format:', expectedAuth ? 'Set' : 'Not Set');
    
    if (!process.env.CRON_SECRET) {
      console.error('❌ CRON_SECRET environment variable not set');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }
    
    if (authHeader !== expectedAuth) {
      console.error('❌ Unauthorized cron request');
      console.error('Received:', authHeader);
      console.error('Expected:', expectedAuth);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Authorization successful');

    // Get current time
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

    // Multiple log statements to ensure visibility
    console.log('⏰ Current timestamp:', timestamp);
    console.log(`🕐 Current hour: ${hours}`);
    console.log(`[${timestamp}] Current hour: ${hours}`);
    console.log('✅ Cron job executed successfully');

    const response = { 
      ok: true, 
      timestamp,
      hour: hours,
      message: 'Cron job executed successfully',
      environment: process.env.NODE_ENV || 'development'
    };

    console.log('📤 Returning response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in cron job:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
