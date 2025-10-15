
import { NextRequest, NextResponse } from 'next/server';
import net from 'net';

interface SyncRequest {
  deviceIp: string;
  devicePort: number;
  targetIp: string;
  targetPort: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();
    const { deviceIp, devicePort, targetIp, targetPort } = body;

    if (!deviceIp || !devicePort || !targetIp || !targetPort) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await triggerDeviceSync(deviceIp, devicePort, targetIp, targetPort);

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

function triggerDeviceSync(
  deviceIp: string,
  devicePort: number,
  targetIp: string,
  targetPort: number
): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = '';

    client.setTimeout(15000);

    client.connect(devicePort, deviceIp, () => {
      console.log(`Connected to ESSL device at ${deviceIp}:${devicePort}`);
      const triggerCommand = JSON.stringify({
        target_ip: targetIp,
        target_port: targetPort,
        command: 'sync',
      });
      client.write(triggerCommand);
    });

    client.on('data', (data) => {
      responseData += data.toString();
      try {
        const response = JSON.parse(responseData);
        client.destroy();
        resolve(response);
      } catch (e) {
        // Wait for more data
      }
    });

    client.on('close', () => {
      if (responseData) {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid response from device'));
        }
      } else {
        // If no data was received, it could mean the command was sent but there's no JSON confirmation.
        // Depending on device behavior, this might still be a success.
        resolve({ status: 'Command sent, no response body.' });
      }
    });

    client.on('timeout', () => {
      client.destroy();
      reject(new Error('Connection timeout'));
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}
