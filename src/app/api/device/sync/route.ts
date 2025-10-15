
import { NextRequest, NextResponse } from 'next/server';

interface SyncRequest {
  deviceIp: string;
  devicePort: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();
    const { deviceIp, devicePort } = body;

    if (!deviceIp || !devicePort) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current server URL dynamically
    const host = request.headers.get('host') || 'localhost:9002';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const targetUrl = `${protocol}://${host}/api/adms/iclock/cdata`;

    console.log('Triggering device sync...');
    console.log('Device:', `${deviceIp}:${devicePort}`);
    console.log('Target URL:', targetUrl);

    // Trigger the device via HTTP
    // This assumes the device has a `/sync` endpoint that accepts a POST request
    const deviceUrl = `http://${deviceIp}:${devicePort}/sync`;
    
    const response = await fetch(deviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_url: targetUrl,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Device responded with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Sync triggered successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync with device' },
      { status: 500 }
    );
  }
}
