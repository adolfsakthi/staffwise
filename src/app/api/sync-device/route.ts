import { NextRequest, NextResponse } from 'next/server';
import ZKLib from 'node-zklib';

// Set a time limit for the serverless function to 60 seconds
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    const { ip, port, connectionKey } = await request.json();

    if (!ip || !port) {
        return NextResponse.json({ success: false, message: 'IP address and port are required.' }, { status: 400 });
    }

    let zkInstance: ZKLib | null = null;
    try {
        zkInstance = new ZKLib(ip, port, 10000, 5000); // 10s timeout, 5s interval

        // Create a connection to the device
        await zkInstance.createSocket();
        
        console.log(`Connection established to ${ip}:${port}`);

        // Get attendance logs
        const logs = await zkInstance.getAttendances();

        // The logs are raw, so we need to format them slightly for processing
        const formattedLogs = logs.data.map((log: any) => ({
            userId: log.userId,
            attTime: log.recordTime,
        }));
        
        return NextResponse.json({ success: true, logs: formattedLogs });

    } catch (e: any) {
        console.error(`Error connecting to device ${ip}:${port}`, e);
        // Provide more specific error messages
        let errorMessage = e.message || 'An unknown error occurred.';
        if (e.code === 'ECONNREFUSED') {
            errorMessage = 'Connection refused. Check the device IP and port, and ensure it is powered on and connected to the network.';
        } else if (e.message.includes('Timeout')) {
            errorMessage = 'Connection timed out. The device is not responding.';
        }
        
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    } finally {
        // Ensure the connection is always closed
        if (zkInstance) {
            console.log(`Closing connection to ${ip}:${port}`);
            await zkInstance.disconnect();
        }
    }
}
