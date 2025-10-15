
'use server';

import AddDeviceForm from "@/components/device-management/add-device-form";
import DeviceList from "@/app/device-management/device-list";
import type { Device } from "@/lib/types";

// Mock function to simulate fetching devices
async function getDevices(): Promise<Device[]> {
    return [
        { id: '1', deviceName: 'Main Entrance', status: 'online', property_code: 'D001', ipAddress: '192.168.1.101', port: 4370, clientId: 'c1', branchId: 'b1', connectionKey: '' },
        { id: '2', deviceName: 'Staff Entrance', status: 'offline', property_code: 'D001', serialNumber: 'CKUH211960123', lastPing: '2023-04-11 16:06:05', ipAddress: '192.168.1.102', port: 4370, clientId: 'c1', branchId: 'b1', connectionKey: '' },
    ];
}


export default async function DeviceManagementPage() {
    const propertyCode = 'D001';
    const initialDevices = await getDevices();

    const filteredDevices = initialDevices.filter(d => d.property_code === propertyCode);

    return (
        <div className="space-y-6">
            <AddDeviceForm propertyCode={propertyCode} />
            <DeviceList initialDevices={filteredDevices} />
        </div>
    );
}
