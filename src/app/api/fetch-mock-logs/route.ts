
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const logsFilePath = path.join(process.cwd(), 'src', 'lib', 'logs.json');

// This endpoint polls for changes in the logs.json file.
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const lastCheck = searchParams.get('since');
    const timeout = 30000; // 30 seconds timeout
    const pollInterval = 2000; // 2 seconds poll interval

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            const stats = await fs.stat(logsFilePath);
            const lastModified = stats.mtime.getTime();

            if (lastCheck && lastModified > parseInt(lastCheck)) {
                 const data = await fs.readFile(logsFilePath, 'utf-8');
                 // Clear the file after reading
                 await fs.writeFile(logsFilePath, '[]');
                 return NextResponse.json({ logs: JSON.parse(data), timestamp: lastModified });
            }
        } catch (e) {
            // File might not exist yet
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // If timeout is reached, return empty response
    return NextResponse.json({ logs: [], timestamp: Date.now() });
}
