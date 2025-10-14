
'use server';

import net from 'net';
import fs from 'fs/promises';
import path from 'path';
import type { Device, Employee, LiveLog } from '@/lib/types';
import { format, differenceInMinutes, parse } from 'date-fns';
import ZKLib from 'zklib-js';


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


export async function updateDeviceStatus(deviceId: string, status: 'online' | 'offline'): Promise<void> {
    const devices = await readDevices();
    const deviceIndex = devices.findIndex(d => d.id === deviceId);
    if (deviceIndex > -1) {
        devices[deviceIndex].status = status;
        await writeDevices(devices);
    }
}

export async function pingDevice(
  ipAddress: string,
  port: number
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 2000;

    socket.setTimeout(timeout);

    socket.connect(port, ipAddress, () => {
      socket.destroy();
      resolve({ success: true, message: `Successfully connected to ${ipAddress}:${port}` });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ success: false, message: `Connection failed: ${err.message}` });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, message: 'Connection timed out.' });
    });
  });
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

async function writeLogs(logs: any[]): Promise<void> {
    try {
        await fs.writeFile(logsFilePath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing logs file:', error);
    }
}

async function readLiveLogs(): Promise<LiveLog[]> {
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


export async function getLiveLogs(): Promise<LiveLog[]> {
    return await readLiveLogs();
}

// This function processes raw logs and generates structured LiveLog entries
export async function processLogs(rawLogs: any[], device: Device): Promise<{ success: boolean, message: string }> {
    if (!rawLogs || rawLogs.length === 0) {
        return { success: true, message: 'No new logs to process.' };
    }

    let employees: Employee[] = [];
    try {
        const data = await fs.readFile(employeesFilePath, 'utf-8');
        employees = JSON.parse(data);
    } catch (error) {
        console.error('Could not read employees file for log processing:', error);
        return { success: false, message: 'Could not read employee data.' };
    }
    
    const existingLiveLogs = await readLiveLogs();

    const newLiveLogs: LiveLog[] = rawLogs.map(log => {
        const employee = employees.find(emp => emp.employeeCode === log.userId && emp.property_code === device.property_code);
        if (!employee) return null;

        const punchTime = new Date(log.timestamp);
        const shiftStartTime = parse(employee.shiftStartTime, 'HH:mm', punchTime);
        
        const deviation = differenceInMinutes(punchTime, shiftStartTime);
        let type: LiveLog['type'] = 'on_time';
        let message = `${employee.firstName} ${employee.lastName} punched on time.`;

        if (deviation > 5) { // Assuming 5 minutes grace period
            type = 'late';
            message = `${employee.firstName} ${employee.lastName} arrived late by ${deviation} minutes.`;
        } else if (deviation < -15) { // Assuming more than 15 mins early is notable
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
            property_code: device.property_code,
            employee: `${employee.firstName} ${employee.lastName}`,
            department: employee.department,
            time: format(punchTime, 'HH:mm'),
            deviation
        };
    }).filter((log): log is LiveLog => log !== null);
    
    const updatedLiveLogs = [...existingLiveLogs, ...newLiveLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    await writeLiveLogs(updatedLiveLogs);

    return { success: true, message: `Successfully processed ${newLiveLogs.length} logs.` };
}


export async function syncDevice(deviceId: string): Promise<{ success: boolean; message: string; data?: string }> {
    const devices = await readDevices();
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        return { success: false, message: 'Device not found.' };
    }

    let zkInstance: ZKLib | null = null;
    try {
        zkInstance = new ZKLib(device.ipAddress, device.port, 5000, 4000);
        await zkInstance.connect();

        const logs = await zkInstance.getAttendances();

        if (logs && logs.data.length > 0) {
            const rawLogs = logs.data;
            const existingLogs = await readLogs();
            const updatedLogs = [...existingLogs, ...rawLogs];
            await writeLogs(updatedLogs); 

            await processLogs(rawLogs, device);

            return {
                success: true,
                message: `Found ${rawLogs.length} logs on device ${device.deviceName}. Data saved.`,
                // IMPORTANT: Serialize data to prevent crashes
                data: JSON.stringify(rawLogs),
            };
        }

        return {
            success: true,
            message: `No new logs found on device ${device.deviceName}.`,
            data: '[]',
        };

    } catch (e: any) {
        console.error(`[ZKLIB_JS_ERROR] Error syncing with device ${device.deviceName}:`, e);
        
        // This handles the specific error object structure from the library
        let errorMessage = 'An unknown error occurred during sync.';
        if (e && e.err && e.err.message) {
            errorMessage = e.err.message;
        } else if (e && e.message) {
            errorMessage = e.message;
        }
        
        return { success: false, message: errorMessage };
    } finally {
        if (zkInstance) {
            await zkInstance.disconnect();
        }
    }
}
