'use server';

import AddDeviceForm from "@/components/device-management/add-device-form";
import DeviceList from "@/app/device-management/device-list";
import type { Device } from "@/lib/types";
import devicesData from '@/lib/devices.json';

// Mock function to simulate fetching devices
async function getDevices(): Promise<Device[]> {
    // In a real app, this would fetch from a database.
    // For now, we read from a local JSON file.
    return devicesData as Device[];
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