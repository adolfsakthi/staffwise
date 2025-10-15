
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
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch from ${url}. Status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Error fetching from ${url}:`, error);
        return NextResponse.json({ message: error.message || `Failed to fetch from ${url}` }, { status: 500 });
    }
}
