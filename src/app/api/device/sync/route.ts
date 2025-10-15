
import { NextRequest, NextResponse } from 'next/server';

interface SyncRequest {
  deviceIp: string;
  devicePort: number;
  host: string; // The host header from the client request
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();
    const { deviceIp, devicePort, host } = body;

    if (!deviceIp || !devicePort || !host) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceIp, devicePort, and host are required.' },
        { status: 400 }
      );
    }

    // Determine protocol and construct the target URL using the provided host
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const targetUrl = `${protocol}://${host}/api/adms/iclock/cdata`;

    console.log('Triggering device sync...');
    console.log('Device:', `${deviceIp}:${devicePort}`);
    console.log('Target URL:', targetUrl);

    // Trigger the device via its local HTTP endpoint
    const deviceUrl = `http://${deviceIp}:${devicePort}/sync`;
    
    const response = await fetch(deviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_url: targetUrl,
      }),
      cache: 'no-store', // Ensure we don't cache this request
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
    // More detailed error checking for network issues
    if (error.cause?.code === 'ECONNREFUSED') {
         return NextResponse.json(
          { error: `Connection refused by device at ${error.cause.address}:${error.cause.port}. Check device IP and ensure it is on the same network.` },
          { status: 500 }
        );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to sync with device' },
      { status: 500 }
    );
  }
}
