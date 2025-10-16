'use client';

import { useState } from 'react';
import AddDeviceForm from "@/components/device-management/add-device-form";
import DeviceList from "@/app/device-management/device-list";
import type { Device } from "@/lib/types";
import { useMockData } from '@/lib/mock-data-store';

export default function DeviceManagementPage() {
    const { devices, setDevices } = useMockData();
    const propertyCode = 'D001';

    const handleAddDevice = (deviceData: Omit<Device, 'id' | 'status' | 'clientId' | 'branchId'>) => {
        const newDevice: Device = {
            ...deviceData,
            id: `device-${Date.now()}`,
            status: 'offline', // Default status
            clientId: 'default_client',
            branchId: 'default_branch',
        };
        setDevices(prev => [...prev, newDevice]);
    };

    const handleRemoveDevice = (deviceId: string) => {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
    };

    const handlePingDevice = (deviceId: string) => {
        setDevices(prev => prev.map(d => {
            if (d.id === deviceId) {
                // Simulate ping result
                const newStatus = d.status === 'online' ? 'offline' : 'online';
                return { ...d, status: newStatus };
            }
            return d;
        }));
    };

    const filteredDevices = devices.filter(d => d.property_code === propertyCode);

    return (
        <div className="space-y-6">
            <AddDeviceForm propertyCode={propertyCode} onAddDevice={handleAddDevice} />
            <DeviceList devices={filteredDevices} onRemoveDevice={handleRemoveDevice} onPingDevice={handlePingDevice} />
        </div>
    );
}
