
'use server';

import AddDeviceForm from "@/components/device-management/add-device-form";
import DeviceList from "@/components/device-management/device-list";
import type { Device } from "@/lib/types";
import { getDevices } from "@/app/actions";


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
