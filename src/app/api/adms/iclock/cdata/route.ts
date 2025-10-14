import { NextRequest, NextResponse } from 'next/server';
import { updateDeviceStatus, processLogs } from '@/app/actions';
import { promises as fs } from 'fs';
import path from 'path';

// /api/adms/iclock/cdata
// This is the main endpoint for ADMS communication.

// A simple in-memory store for commands to be sent to the device.
// In a real production app, this should be a database or a Redis cache.
const commandQueue: { [sn: string]: string[] } = {};
const devicesFilePath = path.join(process.cwd(), 'src', 'lib', 'devices.json');


async function getDevicePropertyCode(sn: string): Promise<string | null> {
    try {
        const data = await fs.readFile(devicesFilePath, 'utf-8');
        const devices = JSON.parse(data);
        const device = devices.find((d: any) => d.serialNumber === sn);
        return device?.property_code || null;
    } catch (e) {
        console.error("Could not read devices file to get property code", e);
        return null;
    }
}


// When a device connects, it sends a GET request.
// The server responds with commands for the device to execute.
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const sn = searchParams.get('SN');

    if (!sn) {
        return new NextResponse('Error: No Serial Number (SN) in request.', { status: 400 });
    }

    // When a device checks in, we'll mark it as online.
    await updateDeviceStatus(sn, 'online');

    // Check if there are any commands queued for this device.
    const commands = commandQueue[sn] || [];
    
    // Default response is "OK".
    let responseBody = 'OK';
    
    if (commands.length > 0) {
        // Send the first command in the queue.
        responseBody = commands.shift()!;
    } else {
        // If no commands, you can send device options.
        // This tells the device how often to sync, etc.
        // The registry value tells the device where our server is.
        const host = request.headers.get('host');
        responseBody = `GetDate\nPostInterval=60\nRegistry=http://${host}/api/adms/iclock/cdata\n`;
    }
    
    console.log(`[ADMS GET] SN: ${sn} | Response: \n${responseBody}`);

    // The response must be plain text.
    return new NextResponse(responseBody, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}

// When the device has data to send (like attendance logs), it sends a POST request.
export async function POST(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const sn = searchParams.get('SN');
    const table = searchParams.get('table');

    if (!sn) {
        return new NextResponse('Error: No Serial Number (SN) in request.', { status: 400 });
    }
    
    const propertyCode = await getDevicePropertyCode(sn);
    if (!propertyCode) {
        console.error(`[ADMS POST] Received data from unknown device SN: ${sn}`);
        return new NextResponse('OK', { status: 200 }); // Acknowledge to prevent retries
    }

    const bodyText = await request.text();
    console.log(`[ADMS POST] SN: ${sn} | Table: ${table} | Body:\n${bodyText}`);
    
    if (table === 'ATTLOG') {
        const logs = bodyText.trim().split('\n').map(line => {
            const [userId, timestamp] = line.trim().split('\t');
            if (!userId || !timestamp) return null;
            // The format is '2\t2025-01-01 10:00:00'
            return {
                userId,
                attTime: new Date(timestamp),
            };
        }).filter(Boolean);

        if (logs.length > 0) {
            console.log(`Processing ${logs.length} attendance logs for property ${propertyCode}`);
            await processLogs(logs as any[], propertyCode);
        }
    }
    // Acknowledge the receipt of data.
    return new NextResponse('OK', { status: 200 });
}
