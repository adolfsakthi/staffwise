import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const commandsFilePath = path.join(process.cwd(), 'src', 'lib', 'commands.json');

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const deviceSN = searchParams.get('SN');
    
    console.log('============================================================');
    console.log(`[${new Date().toISOString()}] ADMS GetRequest Received from SN: ${deviceSN}`);
    console.log('============================================================');
    
    try {
        // Check if a command file exists for this device (simplified logic)
        await fs.access(commandsFilePath);
        const commandJson = await fs.readFile(commandsFilePath, 'utf-8');
        const command = JSON.parse(commandJson);

        // In a real app, you'd match the command to the device SN.
        // For now, any command file triggers a response.

        // The URL the device will use to fetch the actual command content
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const cmdUrl = `${protocol}://${host}/api/adms/iclock/devicecmd`;
        
        const responseBody = `GET /iclock/devicecmd?SN=${deviceSN} HTTP/1.0\n\n`;
        
        console.log('✅ Command found. Instructing device to fetch from:', cmdUrl);

        return new NextResponse(responseBody, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });

    } catch (error) {
        // This is the normal case when there are no commands for the device.
        console.log('✅ OK: No commands pending for device.');
        return new NextResponse('OK', { status: 200 });
    }
}
