
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

        // Connect to the device
        await zkInstance.connect();

        // Get logs
        const logs = await zkInstance.getAttendances();

        // The new library returns the array directly
        if (logs && Array.isArray(logs)) {
             return {
                success: true,
                message: `Found ${logs.length} logs.`,
                logs: logs,
            };
        }
        
        return { success: false, message: 'No logs found or invalid response from device.' };

    } catch (e: any) {
        // Provide a specific error message
        const errorMessage = e.message || 'An unknown error occurred during device communication.';
        return { success: false, message: errorMessage };

    } finally {
        // Ensure disconnection in all cases
        if (zkInstance) {
            try {
                await zkInstance.disconnect();
            } catch (disconnectError: any) {
                // Log disconnection error if necessary, but don't let it hide the main error
                console.error("Error during device disconnection:", disconnectError.message);
            }
        }
    }
};
