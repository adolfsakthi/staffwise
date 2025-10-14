
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

export async function POST(request: NextRequest) {
    const { ip, port, connectionKey } = await request.json();

    if (!ip || !port) {
        return NextResponse.json({ success: false, message: 'IP address and port are required.' }, { status: 400 });
    }

    let zkInstance: ZKLib | null = null;
    try {
        // The library handles its own connection. A separate pre-check is not needed and can cause conflicts.
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
        // Ensure the connection is always closed
        if (zkInstance) {
            await zkInstance.disconnect();
        }
    }
}
