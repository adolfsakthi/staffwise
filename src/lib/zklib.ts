
import ZKLib from 'zklib-js';

const safeError = (err: any): string => {
    if (!err) {
        return 'An unknown error occurred.';
    }
    if (typeof err === 'string') {
        return err;
    }
    if (err.message) {
        return err.message;
    }
    return JSON.stringify(err);
};

export const getDeviceLogs = async (ipAddress: string, port: number): Promise<{ success: boolean; message: string, logs?: any[] }> => {
    if (!ipAddress || !port) {
        return { success: false, message: 'Device IP address and port are required.' };
    }

    let zkInstance: ZKLib | null = null;
    try {
        zkInstance = new ZKLib(ipAddress, port, 5000, 4000);
        await zkInstance.connect();
        
        // The library returns an object with a `data` property which is the array of logs
        const logsResponse = await zkInstance.getAttendances();

        if (logsResponse && logsResponse.data) {
             return {
                success: true,
                message: `Found ${logsResponse.data.length} logs.`,
                logs: logsResponse.data,
            };
        }
        
        return { success: false, message: 'No logs found or invalid response from device.' };

    } catch (e: any) {
        let errorMessage = 'An unknown error occurred during sync.';
        
        // zklib-js often wraps errors
        if (e && e.err && e.err.message) {
            errorMessage = e.err.message;
        } else if (e && e.message) {
            errorMessage = e.message;
        }

        return { success: false, message: errorMessage };

    } finally {
        if (zkInstance) {
            await zkInstance.disconnect();
        }
    }
};
