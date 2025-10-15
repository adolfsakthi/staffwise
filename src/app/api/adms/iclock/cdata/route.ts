import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const logsFilePath = path.join(process.cwd(), 'src', 'lib', 'logs.json');
const commandsFilePath = path.join(process.cwd(), 'src', 'lib', 'commands.json');

// This function handles incoming data from the biometric device.
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceSN = searchParams.get('SN');
  const tableName = searchParams.get('table');

  const bodyText = await req.text();

  console.log('============================================================');
  console.log(`[${new Date().toISOString()}] ADMS HTTP Push Received`);
  console.log('============================================================');
  console.log(`Device SN: ${deviceSN}`);
  console.log(`Table Name: ${tableName}`);
  console.log('Raw Body:', bodyText);

  // Parse the raw text data from the device
  // Format: 1\t2024-07-15 09:00:00\t1\t1\t0\t0
  const logs = bodyText.trim().split('\n').map(line => {
    const [empId, timestamp, ...rest] = line.split('\t');
    return {
      deviceSN,
      employeeId: empId,
      punchTime: timestamp,
      raw: line,
      receivedAt: new Date().toISOString(),
    };
  });
  console.log(`✅ Parsed ${logs.length} records`);

  // Store the parsed logs
  try {
    let existingLogs = [];
    try {
        const data = await fs.readFile(logsFilePath, 'utf-8');
        if (data) {
            existingLogs = JSON.parse(data);
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
        // File doesn't exist, will be created.
    }
    
    const updatedLogs = [...existingLogs, ...logs];
    await fs.writeFile(logsFilePath, JSON.stringify(updatedLogs, null, 2));
    console.log('💾 Logs saved to file.');

  } catch (error) {
    console.error('❌ ERROR: Failed to save logs:', error);
    return new NextResponse('Error saving logs', { status: 500 });
  }
  
  // After receiving data, check if there are any commands for the device.
  // This is part of the ADMS protocol.
  try {
      await fs.access(commandsFilePath);
      const commandData = await fs.readFile(commandsFilePath, 'utf-8');
      await fs.unlink(commandsFilePath); // Delete command after sending
      console.log('📤 Sending command to device:', commandData.trim());
      return new NextResponse(commandData.trim(), { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    // No command file found, which is normal.
    console.log('✅ OK: No further commands for device.');
    return new NextResponse('OK', { status: 200 });
  }

}

// This handles the initial connection test from the device.
export async function GET(req: NextRequest) {
    console.log('ADMS GET request received for cdata');
    return new NextResponse('OK', { status: 200 });
}
