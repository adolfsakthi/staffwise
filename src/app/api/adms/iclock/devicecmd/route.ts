import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const commandsFilePath = path.join(process.cwd(), 'src', 'lib', 'commands.json');

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const deviceSN = searchParams.get('SN');

    console.log('============================================================');
    console.log(`[${new Date().toISOString()}] ADMS DeviceCMD Request from SN: ${deviceSN}`);
    console.log('============================================================');

    try {
        await fs.access(commandsFilePath);
        const commandJson = await fs.readFile(commandsFilePath, 'utf-8');
        const commandData = JSON.parse(commandJson);

        // Delete command after it has been fetched.
        await fs.unlink(commandsFilePath); 

        console.log('📤 Sending command to device:', commandData.command);

        const responseBody = `C:${commandData.id}:${commandData.command}\n`;
        
        return new NextResponse(responseBody, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });

    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
           console.error('❌ Error reading command file:', error);
        } else {
           console.log('✅ OK: No command file found.');
        }
        return new NextResponse('OK', { status: 200 });
    }
}
