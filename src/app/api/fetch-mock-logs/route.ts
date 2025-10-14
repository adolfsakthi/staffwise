
'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const ipAddress = searchParams.get('ip');
    const port = searchParams.get('port');

    if (!ipAddress || !port) {
        return NextResponse.json({ message: 'IP address and port are required.' }, { status: 400 });
    }

    const url = `http://${ipAddress}:${port}/mock/adms/logs`;

    try {
        // Use { cache: 'no-store' } for Next.js App Router to prevent caching
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch logs from device: ${response.status} ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Error fetching from ${url}:`, error);
        return NextResponse.json({ message: error.message || `Failed to fetch from ${url}` }, { status: 500 });
    }
}
