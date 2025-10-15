'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Device } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const devicesFilePath = path.join(process.cwd(), 'src', 'lib', 'devices.json');

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
        status: 'offline', // Default status
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
    // Mock ping logic
    await new Promise(resolve => setTimeout(resolve, 750));
    // In a real app, you would try to connect to the device ip/port
    const isOnline = Math.random() > 0.3; // 70% chance of being online
    
    const devices = await readDevices();
    const deviceIndex = devices.findIndex(d => d.id === deviceId);

    if (deviceIndex !== -1) {
        devices[deviceIndex].status = isOnline ? 'online' : 'offline';
        await writeDevices(devices);
        revalidatePath('/device-management');
        return { success: true, status: devices[deviceIndex].status };
    }

    return { success: false, status: 'offline' };
}

export async function getDeviceLogs(deviceId: string): Promise<{ success: boolean; logs?: any[]; error?: string }> {
    // Mock log fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would fetch from a database or a log file.
    // For now, we return mock data or an empty array.
    
    // Simulate finding logs for a specific device
    const hasLogs = Math.random() > 0.5;

    if (hasLogs) {
        return {
            success: true,
            logs: [
                { timestamp: new Date().toISOString(), level: 'info', message: `Punch from user 123` },
                { timestamp: new Date().toISOString(), level: 'info', message: `Device synchronized settings` },
                { timestamp: new Date().toISOString(), level: 'warn', message: `Connection timed out` },
            ]
        };
    } else {
        return { success: true, logs: [] };
    }
}

export async function requestLogSync(deviceId: string) {
    // Placeholder for future implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Sync requested for device ${deviceId}`);
    return { success: true, message: 'Log sync requested.' };
}
