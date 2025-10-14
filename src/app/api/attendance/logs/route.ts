import { NextResponse } from 'next/server';
import { getLiveLogs } from '@/app/actions';

export async function GET() {
  try {
    const logs = await getLiveLogs();
    // The logs in live-logs.json are already processed attendance records
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    return NextResponse.json(
      { message: 'Error fetching attendance logs.' },
      { status: 500 }
    );
  }
}
