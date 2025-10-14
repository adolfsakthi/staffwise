
'use server';

import net from 'net';
import fs from 'fs/promises';
import path from 'path';
import type { Device, Employee, LiveLog } from '@/lib/types';
import ZKLib from 'zklib';
import { format, differenceInMinutes, parse } from 'date-fns';

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

export async function removeDevice(deviceId: string): Promise<void> {
    const devices = await readDevices();
    const updatedDevices = devices.filter(d => d.id !== deviceId);
    if (devices.length === updatedDevices.length) {
        throw new Error('Device not found.');
    }
    await writeDevices(updatedDevices);
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
        const employee = employees.find(emp => emp.employeeCode === log.id && emp.property_code === device.property_code);
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
            id: `log-${Date.now()}-${log.id}`,
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


export async function syncDevice(deviceId: string): Promise<{ success: boolean; message: string; data?: any[] }> {
    const devices = await readDevices();
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        return { success: false, message: 'Device not found.' };
    }

    let zkInstance: ZKLib | null = null;
    try {
        zkInstance = new ZKLib({
            ip: device.ipAddress,
            port: device.port,
            inport: 5200, // Optional,
            timeout: 5000,
        });

        // Connect to the device
        await zkInstance.connect();
        
        // Get all logs
        const logs = await zkInstance.getAttendances();

        if (logs && logs.length > 0) {
            const transformedLogs = logs.map((log: any) => ({
                id: log.userId,
                timestamp: log.attTime,
                type: log.attType, // You may need to map this to a more readable string
            }));

            const existingLogs = await readLogs();
            const updatedLogs = [...existingLogs, ...transformedLogs];
            await writeLogs(updatedLogs); // Persist raw logs

            // Process these new logs into the live log format
            await processLogs(transformedLogs, device);
             return {
                success: true,
                message: `Found ${logs.length} logs on device ${device.deviceName}. Data saved.`,
                data: transformedLogs,
            };
        }

        return {
            success: true,
            message: `No new logs found on device ${device.deviceName}.`,
            data: [], 
        };

    } catch (e: any) {
        // Log the full complex error to the server console for debugging
        console.error(`[ZKLIB_ERROR] Error syncing with device ${device.deviceName}:`, e);
        
        // Create a simple, serializable message for the client
        const errorMessage = e.message || 'An unknown error occurred during sync. Check server logs.';
        return { success: false, message: errorMessage };

    } finally {
        if (zkInstance) {
            // Disconnect from the device
            await zkInstance.disconnect();
        }
    }
}
