import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const logsFilePath = path.join(process.cwd(), 'src', 'lib', 'logs.json');

async function readRawLogs(): Promise<any[]> {
    try {
        const data = await fs.readFile(logsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        console.error('Error reading logs file:', error);
        return [];
    }
}

export async function GET() {
  try {
    const logs = await readRawLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching raw punch logs:', error);
    return NextResponse.json(
      { message: 'Error fetching raw punch logs.' },
      { status: 500 }
    );
  }
}
