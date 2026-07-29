import { NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import crypto, { randomUUID } from 'crypto';
import os from 'os';

const execFileAsync = promisify(execFile);

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
  return new Response(
    new ReadableStream({
      async start(controller) {
        let tempInputPath = '';
        let tempOutputPath = '';
        const tmpDir = join(os.tmpdir(), 'pdfbullet-bg-remove');

        try {
          const formData = await request.formData();
          const file = formData.get('file') as File;

          if (!file) {
            controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: 'No file provided' }) + '\n'));
            controller.close();
            return;
          }

          if (!existsSync(tmpDir)) {
            await mkdir(tmpDir, { recursive: true });
          }

          const sessionId = randomUUID();
          const ext = file.name.split('.').pop() || 'png';
          tempInputPath = join(tmpDir, `${sessionId}_input.${ext}`);
          tempOutputPath = join(tmpDir, `${sessionId}_output.png`);

          const buffer = Buffer.from(await file.arrayBuffer());
          await writeFile(tempInputPath, buffer);

          const scriptPath = join(process.cwd(), 'src', 'app', 'api', 'remove-background', 'remove_bg.py');
          if (!existsSync(scriptPath)) {
            throw new Error(`Python script not found at path: ${scriptPath}`);
          }

          const { spawn } = await import('child_process');
          const pyProcess = spawn('python', [scriptPath, tempInputPath, tempOutputPath]);

          pyProcess.stdout.on('data', (data) => {
            controller.enqueue(data);
          });

          pyProcess.stderr.on('data', (data) => {
            console.error(`Python stderr: ${data}`);
          });

          pyProcess.on('close', async (code) => {
            try {
              if (code !== 0) {
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: `Python script exited with code ${code}` }) + '\n'));
              } else if (!existsSync(tempOutputPath)) {
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: 'Output file was not created.' }) + '\n'));
              } else {
                const outputBytes = await readFile(tempOutputPath);
                
                // Upload directly to Cloudinary instead of using Base64
                const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'uofmqpax';
                const API_KEY = process.env.CLOUDINARY_API_KEY || '811578795199997';
                const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'ZfvM_Ha18PBe_xUNd_Dk14rg2cs';
                
                const timestamp = Math.round(Date.now() / 1000).toString();
                const folder = 'pdfbullet_bg_removed';
                
                const signatureString = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
                const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

                const uploadFormData = new FormData();
                const blob = new Blob([new Uint8Array(outputBytes)], { type: 'image/png' });
                uploadFormData.append('file', blob, 'bg-removed.png');
                uploadFormData.append('api_key', API_KEY);
                uploadFormData.append('timestamp', timestamp);
                uploadFormData.append('signature', signature);
                uploadFormData.append('folder', folder);

                const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
                
                const cloudinaryRes = await fetch(cloudinaryUrl, {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!cloudinaryRes.ok) {
                    const errTxt = await cloudinaryRes.text();
                    throw new Error('Cloudinary upload failed: ' + errTxt);
                }

                const cloudinaryData = await cloudinaryRes.json();
                
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ success: true, url: cloudinaryData.secure_url }) + '\n'));
              }
            } catch (err: any) {
              controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: err.message }) + '\n'));
            } finally {
              // Cleanup
              if (tempInputPath && existsSync(tempInputPath)) await unlink(tempInputPath).catch(console.error);
              if (tempOutputPath && existsSync(tempOutputPath)) await unlink(tempOutputPath).catch(console.error);
              controller.close();
            }
          });
        } catch (err: any) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: err.message }) + '\n'));
          controller.close();
        }
      }
    }),
    {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
}
