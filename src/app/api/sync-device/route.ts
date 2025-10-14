
import { NextRequest, NextResponse } from 'next/server';
import ZKLib from 'node-zklib';
import net from 'net';

export const maxDuration = 60; // Allow this function to run for up to 60 seconds

// Utility to create a safe, serializable error object
const safeError = (error: unknown): { message: string, stack?: string } => {
    if (error instanceof Error) {
        return { message: error.message, stack: error.stack };
    }
    // Handle cases where the error is not an Error object
    try {
        return { message: String(error) };
    } catch {
        return { message: 'An unknown error occurred during serialization.' };
    }
};

const testConnection = (ip: string, port: number, timeout = 2000): Promise<void> => {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);

        socket.connect(port, ip, () => {
            socket.destroy();
            resolve();
        });

        socket.on('error', (err) => {
            socket.destroy();
            reject(err);
        });

        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Connection timed out.'));
        });
    });
};


export async function POST(request: NextRequest) {
    const { ip, port, connectionKey } = await request.json();

    if (!ip || !port) {
        return NextResponse.json({ success: false, message: 'IP address and port are required.' }, { status: 400 });
    }

    let zkInstance: ZKLib | null = null;
    try {
        // 1. First, confirm basic network connectivity
        await testConnection(ip, port);

        // 2. If connection is successful, proceed with the library
        zkInstance = new ZKLib(ip, port, 5000, 4370); // 5 second timeout

        // Create connection
        await zkInstance.createSocket();
        
        // Get all logs in the machine
        const logs = await zkInstance.getAttendances();

        return NextResponse.json({ success: true, logs: logs.data });

    } catch (e: unknown) {
        console.error("Error in POST /api/sync-device:", e);
        return NextResponse.json({ success: false, ...safeError(e) }, { status: 500 });
    } finally {
        // 3. Ensure the connection is always closed
        if (zkInstance) {
            await zkInstance.disconnect();
        }
    }
}
