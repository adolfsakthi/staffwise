import { NextRequest, NextResponse } from 'next/server';
import { updateDeviceStatus, processLogs } from '@/app/actions';
import { promises as fs } from 'fs';
import path from 'path';

// /api/adms/iclock/cdata
// This is the main endpoint for ADMS communication.

// A simple in-memory store for commands to be sent to the device.
const commandQueue: { [sn: string]: string[] } = {};

const devicesFilePath = path.join(process.cwd(), 'src', 'lib', 'devices.json');

export function addCommandToQueue(sn: string, command: string) {
    if (!commandQueue[sn]) {
        commandQueue[sn] = [];
    }
    commandQueue[sn].push(command);
    console.log(`Command '${command}' queued for device ${sn}.`);
}

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
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const sn = searchParams.get('SN');

    if (!sn) {
        return new NextResponse('Error: No Serial Number (SN) in request.', { status: 400 });
    }

    await updateDeviceStatus(sn, 'online');

    const commands = commandQueue[sn] || [];
    
    let responseBody = 'OK';
    
    if (commands.length > 0) {
        const commandToSend = commands.shift()!;
        responseBody = `C:${Math.floor(Date.now() / 1000)}:${commandToSend}`;
        console.log(`Sent command to ${sn}: ${responseBody}`);
    }
    
    console.log(`[ADMS GET] SN: ${sn} | Response: \n${responseBody}`);

    return new NextResponse(responseBody, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}

// When the device has data to send, it sends a POST request.
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
        return new NextResponse('OK', { status: 200 }); 
    }

    const bodyText = await request.text();
    console.log(`[ADMS POST] SN: ${sn} | Table: ${table} | Body:\n${bodyText}`);
    
    if (table === 'ATTLOG') {
        let logs: { userId: string; attTime: Date; }[] = [];

        // Try parsing as JSON first
        try {
            const jsonData = JSON.parse(bodyText);
            if (Array.isArray(jsonData)) {
                 logs = jsonData.map(log => ({
                    userId: log.PIN || log.userId,
                    attTime: new Date(log.AttTime || log.attTime || log.timestamp),
                })).filter(log => log.userId && !isNaN(log.attTime.getTime()));
                 console.log('Parsed logs as JSON array.');
            }
        } catch (e) {
            console.log('Could not parse body as JSON, falling back to plain text.');
            // Fallback to plain text parsing
            logs = bodyText.trim().split('\n').map(line => {
                // ZKTeco can use tab or comma delimiters
                const parts = line.trim().split(/\s*,\s*|\s+/);
                const [userId, timestamp] = parts;
                if (!userId || !timestamp) return null;
                // The timestamp format can vary, e.g., "2024-05-23 09:05:00"
                return {
                    userId,
                    attTime: new Date(timestamp),
                };
            }).filter((log): log is { userId: string; attTime: Date; } => log !== null && !isNaN(log.attTime.getTime()));
             console.log('Parsed logs as plain text.');
        }


        if (logs.length > 0) {
            console.log(`Processing ${logs.length} attendance logs for property ${propertyCode}`);
            const processResult = await processLogs(logs, propertyCode);
        }
    }
    return new NextResponse('OK', { status: 200 });
}
