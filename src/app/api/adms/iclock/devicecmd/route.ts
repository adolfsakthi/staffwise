import { NextRequest, NextResponse } from 'next/server';

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

    // The body will contain the ID of the command and its result.
    // e.g., "ID=1&Return=0" where Return=0 means success.
    
    // You would typically update the status of the command in your database here.

    // Acknowledge receipt.
    return new NextResponse('OK', { status: 200 });
}
