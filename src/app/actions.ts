'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Device } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import net from 'net';

const devicesFilePath = path.join(process.cwd(), 'src', 'lib', 'devices.json');
const logsFilePath = path.join(process.cwd(), 'src', 'lib', 'logs.json');

async function readDevices(): Promise<Device[]> {
    try {
        const data = await fs.readFile(devicesFilePath, 'utf-8');
        // If file is empty, JSON.parse will fail. Return empty array.
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, return an empty array
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        console.error('Error reading devices file:', error);
        throw new Error('Could not read devices data.');
    }
}

async function writeDevices(devices: Device[]): Promise<void> {
    try {
        await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing devices file:', error);
        throw new Error('Could not save devices data.');
    }
}

export async function addDevice(deviceData: Omit<Device, 'id' | 'status' | 'clientId' | 'branchId'>) {
    const devices = await readDevices();
    const newDevice: Device = {
        ...deviceData,
        id: `device-${Date.now()}`,
        status: 'offline', // Default status for a new device is always offline
        clientId: 'default_client',
        branchId: 'default_branch',
    };
    devices.push(newDevice);
    await writeDevices(devices);
    revalidatePath('/device-management');
    return { success: true, message: 'Device added successfully.' };
}

export async function removeDevice(deviceId: string) {
    let devices = await readDevices();
    const initialCount = devices.length;
    devices = devices.filter(d => d.id !== deviceId);

    if (devices.length < initialCount) {
        await writeDevices(devices);
        revalidatePath('/device-management');
        return { success: true, message: 'Device removed successfully.' };
    } else {
        return { success: false, message: 'Device not found.' };
    }
}

export async function pingDevice(deviceId: string): Promise<{ success: boolean; status: 'online' | 'offline' }> {
    const devices = await readDevices();
    const deviceIndex = devices.findIndex(d => d.id === deviceId);

    if (deviceIndex === -1) {
        return { success: false, status: 'offline' };
    }

    const device = devices[deviceIndex];

    const checkConnection = new Promise<'online' | 'offline'>((resolve) => {
        const socket = new net.Socket();
        const connectionTimeout = 2000; // 2 seconds

        socket.setTimeout(connectionTimeout);

        socket.on('connect', () => {
            socket.destroy();
            resolve('online');
        });

        socket.on('error', (err) => {
            socket.destroy();
            console.error(`Socket error for ${device.ipAddress}:${device.port}:`, err.message);
            resolve('offline');
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve('offline');
        });

        socket.connect(device.port, device.ipAddress);
    });

    const newStatus = await checkConnection;

    devices[deviceIndex].status = newStatus;
    await writeDevices(devices);
    revalidatePath('/device-management');

    return { success: true, status: newStatus };
}


export async function getDeviceLogs(deviceId: string): Promise<{ success: boolean; logs?: any[]; error?: string }> {
    try {
        const data = await fs.readFile(logsFilePath, 'utf-8');
        if (!data) return { success: true, logs: [] };

        const allLogs = JSON.parse(data);
        // This is a simplified filter. 
        return { success: true, logs: allLogs };

    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return { success: true, logs: [] }; // No logs file yet
        }
        console.error("Error reading logs file:", error);
        return { success: false, error: "Failed to read logs." };
    }
}

export async function requestLogSync(deviceId: string, host: string) {
    // This is a placeholder for a new, more direct sync method.
    // The previous ADMS implementation was removed.
    console.log(`Log sync requested for device ${deviceId}. New implementation needed.`);
    return { success: false, message: 'Sync function is not implemented yet.' };
}
