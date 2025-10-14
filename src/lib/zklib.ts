
import ZKLib from 'node-zklib';

export const getDeviceLogs = async (ipAddress: string, port: number): Promise<{ success: boolean; message: string; logs?: any[] }> => {
    if (!ipAddress || !port) {
        return { success: false, message: 'Device IP address and port are required.' };
    }

    let zkInstance: ZKLib | null = null;
    try {
        // Correctly instantiate the new library
        zkInstance = new ZKLib({
            ip: ipAddress,
            port: port,
            timeout: 5000,
        });

        // The library handles connection implicitly. No connect() call is needed.
        const logs = await zkInstance.getAttendances();

        // The library returns an object with a data property.
        if (logs && Array.isArray(logs.data)) {
             return {
                success: true,
                message: `Found ${logs.data.length} logs.`,
                logs: logs.data,
            };
        }
        
        return { success: false, message: 'No logs found or invalid response from device.' };

    } catch (e: any) {
        // Provide a specific error message
        const errorMessage = e.message || String(e);
        return { success: false, message: errorMessage };

    } finally {
        // The library handles disconnection implicitly. No disconnect() call is needed.
    }
};
