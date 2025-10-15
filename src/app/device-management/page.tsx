'use server';

import AddDeviceForm from "@/components/device-management/add-device-form";
import DeviceList from "@/app/device-management/device-list";
import type { Device } from "@/lib/types";
import { promises as fs } from 'fs';
import path from 'path';

// Mock function to simulate fetching devices
async function getDevices(): Promise<Device[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'devices.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as Device[];
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array.
        return [];
    }
}


export default async function DeviceManagementPage() {
    const initialDevices = await getDevices();
    const propertyCode = 'D001';

    return (
        <div className="space-y-6">
            <AddDeviceForm propertyCode={propertyCode} />
            <DeviceList initialDevices={initialDevices.filter(d => d.property_code === propertyCode)} />
        </div>
    );
}
