'use server';

import net from 'net';

/**
 * Attempts to connect to a device at a given IP address and port to check its status.
 * @param ipAddress The IP address of the device.
 * @param port The port number of the device.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function pingDevice(
  ipAddress: string,
  port: number
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 2000; // 2 seconds

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
