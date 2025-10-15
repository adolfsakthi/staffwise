import { NextRequest, NextResponse } from 'next/server';

export const auth = 'public';

// /api/adms/iclock/getrequest
// This endpoint is polled by the device to see if the server has any new commands for it.
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const sn = searchParams.get('SN');

    if (!sn) {
        return new NextResponse('Error: No Serial Number (SN) in request.', { status: 400 });
    }

    console.log(`[ADMS GETREQUEST] SN: ${sn}`);
    
    // In a real application, you would check a database for pending commands for this device.
    // For now, we will just respond with "OK" which means "no commands pending".
    // Example commands could be:
    // "C:1:REBOOT" - Reboot device with ID 1
    // "C:2:DATA QUERY ATTLog StartTime=2025-01-01 00:00:00 EndTime=2025-01-01 23:59:59" - Query logs
    
    const responseBody = 'OK';
    
    return new NextResponse(responseBody, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
