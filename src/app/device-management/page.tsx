
'use server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AddDeviceForm from '@/components/device-management/add-device-form';
import { getDevices } from '@/app/actions';
import DeviceList from '@/components/device-management/device-list';


export default async function DeviceManagementPage() {
  const propertyCode = 'D001';
  const allDevices = await getDevices();
  const filteredDevices = allDevices.filter(d => d.property_code === propertyCode);

  return (
    <div className='space-y-6'>
      <AddDeviceForm propertyCode={propertyCode} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Device Management</CardTitle>
            <CardDescription>
              Manage and monitor your connected biometric devices for property {propertyCode}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DeviceList initialDevices={filteredDevices} />
        </CardContent>
      </Card>
    </div>
  );
}
