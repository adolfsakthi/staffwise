'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Device, Employee, LiveLog } from '@/lib/types';
import { format, differenceInMinutes, parse } from 'date-fns';
import net from 'net';


const devicesFilePath = path.join(process.cwd(), 'src', 'lib', 'devices.json');
const employeesFilePath = path.join(process.cwd(), 'src', 'lib', 'employees.json');
const logsFilePath = path.join(process.cwd(), 'src', 'lib', 'logs.json');
const liveLogsFilePath = path.join(process.cwd(), 'src', 'lib', 'live-logs.json');

// --- Device Management ---

async function readDevices(): Promise<Device[]> {
  try {
    const data = await fs.readFile(devicesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading devices file:', error);
    throw new Error('Could not read device data.');
  }
}

async function writeDevices(devices: Device[]): Promise<void> {
  try {
    await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing devices file:', error);
    throw new Error('Could not save device data.');
  }
}

export async function getDevices(): Promise<Device[]> {
  return await readDevices();
}

export async function addDevice(newDeviceData: Omit<Device, 'id'>): Promise<void> {
    const devices = await readDevices();
    const newDevice: Device = {
        ...newDeviceData,
        id: (Math.max(0, ...devices.map(d => parseInt(d.id, 10))) + 1).toString(),
    };
    const updatedDevices = [...devices, newDevice];
    await writeDevices(updatedDevices);
}

export async function removeDevice(deviceId: string): Promise<{ success: boolean; message?: string }> {
    try {
        const devices = await readDevices();
        const updatedDevices = devices.filter(d => d.id !== deviceId);
        if (devices.length === updatedDevices.length) {
            return { success: false, message: 'Device not found.' };
        }
        await writeDevices(updatedDevices);
        return { success: true };
    } catch (error: any) {
        console.error("Error in removeDevice:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}

export async function pingDevice(ip: string, port: number): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 2000; // 2 seconds

        socket.setTimeout(timeout);

        socket.on('connect', () => {
            socket.destroy();
            resolve({ success: true, message: `Successfully connected to ${ip}:${port}` });
        });

        socket.on('error', (err) => {
            resolve({ success: false, message: `Connection to ${ip}:${port} failed: ${err.message}` });
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ success: false, message: `Connection to ${ip}:${port} timed out.` });
        });

        socket.connect(port, ip);
    });
}


export async function updateDeviceStatus(deviceId: string, status: 'online' | 'offline'): Promise<void> {
    const devices = await readDevices();
    const deviceIndex = devices.findIndex(d => d.serialNumber === deviceId || d.id === deviceId);
    if (deviceIndex > -1) {
        devices[deviceIndex].status = status;
        await writeDevices(devices);
    }
}

export async function requestLogSync(deviceIp: string, devicePort: number, host: string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const targetUrl = `${protocol}://${host}/api/adms/iclock/cdata`;

    console.log('Triggering device sync via server action...');
    console.log('Device:', `${deviceIp}:${devicePort}`);
    console.log('Target URL for device push:', targetUrl);

    // This simulates telling the device to push to our endpoint.
    // In a real scenario, this would be a command sent to the device.
    const response = await fetch(`http://${deviceIp}:${devicePort}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl }),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Device responded with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    return { success: true, message: 'Sync triggered successfully', data: result };

  } catch (e: any) {
    console.error(`Error during log sync for ${deviceIp}:`, e);
    // More detailed error checking for network issues
    if (e.cause?.code === 'ECONNREFUSED') {
         return { success: false, message: `Connection refused by device at ${e.cause.address}:${e.cause.port}. Check device IP and ensure it is on the same network.` };
    }
    return { success: false, message: e.message || 'Failed to trigger sync.' };
  }
}


// --- Log Processing & Management ---

async function readLogs(): Promise<any[]> {
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

export async function getLiveLogs(): Promise<LiveLog[]> {
    try {
        const data = await fs.readFile(liveLogsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        console.error('Error reading live logs file:', error);
        return [];
    }
}

async function writeLiveLogs(logs: LiveLog[]): Promise<void> {
    try {
        await fs.writeFile(liveLogsFilePath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing live logs file:', error);
    }
}

export async function processAndSaveLogs(rawLogs: any[], propertyCode: string): Promise<{ success: boolean, message: string, count: number }> {
    if (!rawLogs || rawLogs.length === 0) {
        return { success: true, message: 'No new logs to process.', count: 0 };
    }

    let employees: Employee[] = [];
    try {
        const data = await fs.readFile(employeesFilePath, 'utf-8');
        employees = JSON.parse(data);
    } catch (error) {
        console.error('Could not read employees file for log processing:', error);
        return { success: false, message: 'Could not read employee data.', count: 0 };
    }
    
    const existingLiveLogs = await getLiveLogs();

    const newLiveLogs: LiveLog[] = rawLogs.map(log => {
        const employee = employees.find(emp => emp.employeeCode === log.userId && emp.property_code === propertyCode);
        if (!employee) return null;

        const punchTime = new Date(log.attTime);
        const shiftStartTime = parse(employee.shiftStartTime, 'HH:mm', punchTime);
        
        const deviation = differenceInMinutes(punchTime, shiftStartTime);
        let type: LiveLog['type'] = 'on_time';
        let message = `${employee.firstName} ${employee.lastName} punched on time.`;

        if (deviation > 5) {
            type = 'late';
            message = `${employee.firstName} ${employee.lastName} arrived late by ${deviation} minutes.`;
        } else if (deviation < -15) {
            type = 'early';
            message = `${employee.firstName} ${employee.lastName} arrived early by ${Math.abs(deviation)} minutes.`;
        }

        return {
            id: `log-${Date.now()}-${log.userId}`,
            employeeId: employee.id,
            type,
            message,
            timestamp: punchTime.toISOString(),
            isRead: false,
            property_code: propertyCode,
            employee: `${employee.firstName} ${employee.lastName}`,
            department: employee.department,
            time: format(punchTime, 'HH:mm'),
            deviation
        };
    }).filter((log): log is LiveLog => log !== null);
    
    if (newLiveLogs.length === 0) {
        return { success: true, message: 'No logs matched employees for this property.', count: 0 };
    }

    const updatedLiveLogs = [...newLiveLogs, ...existingLiveLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    await writeLiveLogs(updatedLiveLogs);

    // Also write the raw logs to the main logs file for the /logs endpoint
    try {
        const existingRawLogs = await readLogs();
        const combinedRawLogs = [...rawLogs, ...existingRawLogs];
        await fs.writeFile(logsFilePath, JSON.stringify(combinedRawLogs, null, 2), 'utf-8');
    } catch (error) {
        console.error("Failed to write to raw logs file", error);
    }


    return { success: true, message: `Successfully processed ${newLiveLogs.length} logs.`, count: 0 };
}
