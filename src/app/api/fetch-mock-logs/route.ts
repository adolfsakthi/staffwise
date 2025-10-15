'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const ip = searchParams.get('ip');
    const port = searchParams.get('port');

    if (!ip || !port) {
        return NextResponse.json({ error: 'IP and Port are required' }, { status: 400 });
    }

    const url = `http://${ip}:${port}/mock/adms/logs`;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error fetching mock logs from ${url}: ${response.status} ${errorText}`);
            throw new Error(`Device endpoint responded with status ${response.status}.`);
        }
        
        const logs = await response.json();
        return NextResponse.json({ logs: logs, timestamp: Date.now() });

    } catch (e: any) {
        console.error(`Failed to fetch from ${url}:`, e);
        // This will catch network errors like ECONNREFUSED
        return NextResponse.json({ error: e.message || 'Could not retrieve mock logs from device.' }, { status: 500 });
    }
}
