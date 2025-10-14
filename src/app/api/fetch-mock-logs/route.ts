'use server';

import { NextRequest, NextResponse } from 'next/server';
import net from 'net';

async function checkPort(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host);
    });
}


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ipAddress = searchParams.get('ip');
    const port = searchParams.get('port');

    if (!ipAddress || !port) {
        return NextResponse.json({ message: 'IP address and port are required.' }, { status: 400 });
    }

    const portNumber = parseInt(port, 10);

    const isPortOpen = await checkPort(ipAddress, portNumber);
    if (!isPortOpen) {
        return NextResponse.json({ message: `Could not connect to ${ipAddress}:${port}. Port is not open or device is offline.` }, { status: 504 });
    }


    const url = `http://${ipAddress}:${port}/mock/adms/logs`;

    try {
        const response = await fetch(url, { next: { revalidate: 0 }});

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
