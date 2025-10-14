import { NextRequest, NextResponse } from 'next/server';
import ZKLib from 'node-zklib';

const safeError = (err: any) => ({
    message: err?.message ?? String(err),
    stack: process.env.NODE_ENV === 'development' ? err?.stack ?? '' : undefined,
});

export async function POST(request: NextRequest) {
    const { ip, port = 4370, timeout = 5000 } = await request.json();

    if (!ip) {
        return NextResponse.json(
            { success: false, message: 'Device IP address is required.' },
            { status: 400 }
        );
    }

    let zkInstance: ZKLib | null = null;
    try {
        zkInstance = new ZKLib(ip, port, timeout);
        
        // The library's connect method is implicit in its operations.
        // We can create a connection explicitly to test it.
        await zkInstance.createSocket();


        // Fetch attendance logs
        const logs = await zkInstance.getAttendances();

        // The data is often nested in a 'data' property
        const attendanceData = logs.data;

        return NextResponse.json({
            success: true,
            message: `Successfully fetched ${attendanceData.length} logs.`,
            data: attendanceData,
        });

    } catch (e: any) {
        console.error(`[SYNC-API] Error syncing with device ${ip}:${port}`, e);
        // Use the safeError utility to ensure the error is serializable
        return NextResponse.json(
            { success: false, message: `Failed to sync with device: ${e.message || 'Unknown error' }`, error: safeError(e) },
            { status: 500 }
        );
    } finally {
        // Ensure the connection is always closed
        if (zkInstance) {
            try {
                await zkInstance.disconnect();
            } catch (e) {
                console.error(`[SYNC-API] Failed to disconnect from device ${ip}:${port}`, e);
            }
        }
    }
}
