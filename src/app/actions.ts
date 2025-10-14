
'use server';

import net from 'net';
import fs from 'fs/promises';
import path from 'path';
import type { Device } from '@/lib/types';
import ZKLib from 'zklib-js';

const devicesFilePath = path.join(process.cwd(), 'src', 'lib', 'devices.json');

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

export async function addDevice(newDeviceData: Omit<Device, 'id'>): Promise<Device> {
    const devices = await readDevices();
    const newDevice: Device = {
        ...newDeviceData,
        id: (Math.max(0, ...devices.map(d => parseInt(d.id, 10))) + 1).toString(),
        status: 'offline' // Always default to offline
    };
    const updatedDevices = [...devices, newDevice];
    await writeDevices(updatedDevices);
    return newDevice;
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

export async function syncDevice(deviceId: string): Promise<{ success: boolean; message: string; data?: any[] }> {
    const devices = await readDevices();
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        return { success: false, message: 'Device not found.' };
    }

    let zkInstance: ZKLib | null = null;
    try {
        zkInstance = new ZKLib(device.ipAddress, device.port, 10000, 4000);
        
        // Create connection
        await zkInstance.createSocket();
        
        // Authenticate with connection key
        await zkInstance.connect();

        // Get attendance logs
        const logs = await zkInstance.getAttendances();

        // Disconnect
        await zkInstance.disconnect();

        return {
            success: true,
            message: `Found ${logs.data.length} logs on device ${device.deviceName}.`,
            data: logs.data,
        };

    } catch (e: any) {
        console.error(`Error syncing with device ${device.deviceName}:`, e);
        return { success: false, message: e.message || 'An unknown error occurred during sync.' };
    } finally {
        if (zkInstance) {
            await zkInstance.disconnect();
        }
    }
}
