import { NextRequest, NextResponse } from 'next/server';
import { processAndSaveLogs } from '@/app/actions';

export const auth = 'public';

// /api/adms/iclock/devicecmd
// The device reports the result of a command execution to this endpoint.
export async function POST(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const sn = searchParams.get('SN');
    const body = await request.text();

    if (!sn) {
        return new NextResponse('Error: No Serial Number (SN) in request.', { status: 400 });
    }

    console.log(`[ADMS DEVICECMD] SN: ${sn} | Body: \n${body}`);

    // If the body contains log data (some devices send it here)
    if (body.includes('AttLog')) {
        // This is a simplified parser, assuming a basic format.
        // You would need a more robust XML/text parser for production.
        try {
            const lines = body.split('\n').filter(line => line.includes('AttLog'));
            const logs = lines.map(line => {
                const pinMatch = line.match(/PIN="(\d+)"/);
                const timeMatch = line.match(/Time="([^"]+)"/);
                if (pinMatch && timeMatch) {
                    return {
                        userId: pinMatch[1],
                        attTime: new Date(timeMatch[1]),
                    };
                }
                return null;
            }).filter(Boolean);

            if (logs.length > 0) {
                // We need a property code here. This is a challenge with this endpoint.
                // For now, we'll assume a default or skip if we can't determine it.
                // A better approach would be to look up the device by SN.
                console.log(`Processing ${logs.length} logs from devicecmd`);
                // await processAndSaveLogs(logs, 'D001'); // Example with a hardcoded property code
            }

        } catch (e) {
            console.error('Error parsing logs from devicecmd:', e);
        }
    }
    
    // Acknowledge receipt.
    return new NextResponse('OK', { status: 200 });
}
