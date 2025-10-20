import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = new Date();
  const logs: string[] = [];
  
  // Helper function to add logs and console.log simultaneously
  const addLog = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  addLog(`🚀 Vercel Cron Job Started at ${startTime.toISOString()}`);
  addLog(`Request User-Agent: ${request.headers.get('User-Agent') || 'Unknown'}`);
  addLog(`CRON_SECRET exists: ${!!process.env.CRON_SECRET}`);
  
  try {
    // Check authorization header for cron secret
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    addLog(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
    
    if (!process.env.CRON_SECRET) {
      addLog('❌ CRON_SECRET environment variable not set');
      return NextResponse.json({ 
        error: 'Configuration error',
        logs: logs
      }, { status: 500 });
    }
    
    if (authHeader !== expectedAuth) {
      addLog('❌ Unauthorized cron request');
      addLog(`Received: ${authHeader}`);
      return NextResponse.json({ 
        error: 'Unauthorized',
        logs: logs
      }, { status: 401 });
    }

    addLog('✅ Authorization successful');

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

    // Multiple log statements with different formats
    addLog(`⏰ Current timestamp: ${timestamp}`);
    addLog(`🕐 Current hour: ${hours}`);
    addLog(`[${timestamp}] Current hour: ${hours}`);
    addLog('✅ Cron job executed successfully');

    const response = { 
      ok: true, 
      timestamp,
      hour: hours,
      message: 'Cron job executed successfully',
      environment: process.env.NODE_ENV || 'development',
      logs: logs,
      executionTime: new Date().toISOString()
    };

    addLog(`📤 Returning response with ${logs.length} log entries`);

    return NextResponse.json(response);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    addLog(`❌ Error in cron job: ${errorMsg}`);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({
      error: 'Internal server error', 
      details: errorMsg,
      logs: logs,
      executionTime: new Date().toISOString()
    }, { status: 500 });
  }
}
