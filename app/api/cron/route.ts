import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check authorization header for cron secret
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET environment variable not set');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }
    
    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Log the current hour (this will appear in Vercel function logs)
    console.log(`[${timestamp}] Current hour: ${hours}`);

    return NextResponse.json({ 
      ok: true, 
      timestamp,
      hour: hours,
      message: 'Cron job executed successfully'
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
