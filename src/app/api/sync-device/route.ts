
import { NextRequest, NextResponse } from 'next/server';
import ZKLib from 'zklib-js';

const safeError = (err: any) => ({ message: err?.message ?? String(err), stack: err?.stack ?? '' });

export async function POST(request: NextRequest) {
  const { ipAddress, port = 4370 } = await request.json();

  if (!ipAddress) {
    return NextResponse.json({ success: false, message: 'Device IP is required.' }, { status: 400 });
  }

  let zkInstance: ZKLib | null = null;

  try {
    zkInstance = new ZKLib(ipAddress, port, 5000, 4000);
    await zkInstance.connect();

    const logs = await zkInstance.getAttendances();

    // The library returns an object with a `data` property which is the array of logs
    if (logs && logs.data) {
        return NextResponse.json({
            success: true,
            message: `Found ${logs.data.length} logs.`,
            data: logs.data
        });
    }

    return NextResponse.json({ success: true, message: 'No new logs found.', data: [] });

  } catch (e: any) {
    console.error('Sync failed:', e);
    // Use the safeError pattern. Check for the nested error structure from zklib-js.
    const errorMessage = e?.err?.message || e?.message || 'An unknown error occurred during sync.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  } finally {
    if (zkInstance) {
      await zkInstance.disconnect();
    }
  }
}
