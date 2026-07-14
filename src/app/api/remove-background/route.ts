import { NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import os from 'os';

const execFileAsync = promisify(execFile);

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
  const tmpDir = join(os.tmpdir(), 'pdfbullet-bg-remove');
  let tempInputPath = '';
  let tempOutputPath = '';

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure temp directory exists
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    const sessionId = randomUUID();
    // Keep the input file extension
    const ext = file.name.split('.').pop() || 'png';
    tempInputPath = join(tmpDir, `${sessionId}_input.${ext}`);
    tempOutputPath = join(tmpDir, `${sessionId}_output.png`);

    // Write input file to temp folder
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempInputPath, buffer);

    const scriptPath = join(process.cwd(), 'src', 'app', 'api', 'remove-background', 'remove_bg.py');

    if (!existsSync(scriptPath)) {
      throw new Error(`Python script not found at path: ${scriptPath}`);
    }

    // Execute Python script to remove background
    try {
      // In Windows we might have 'python' or 'py' or 'python3'
      // Since 'python' verified successfully, we will call 'python'
      await execFileAsync('python', [
        scriptPath,
        tempInputPath,
        tempOutputPath
      ]);
    } catch (pyErr: any) {
      console.error('Python background removal error:', pyErr);
      const stderr = pyErr.stderr || pyErr.stdout || '';
      return NextResponse.json({ error: `Background removal failed: ${stderr || pyErr.message}` }, { status: 500 });
    }

    if (!existsSync(tempOutputPath)) {
      throw new Error('Python script completed but output file was not created.');
    }

    // Read the decrypted output file
    const outputBytes = await readFile(tempOutputPath);

    // Return the transparent PNG file bytes directly
    return new Response(new Uint8Array(outputBytes), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${file.name.substring(0, file.name.lastIndexOf('.'))}_no_bg.png"`
      }
    });

  } catch (err: any) {
    console.error('Remove background general error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    // Clean up temp files
    try {
      if (tempInputPath && existsSync(tempInputPath)) {
        await unlink(tempInputPath);
      }
      if (tempOutputPath && existsSync(tempOutputPath)) {
        await unlink(tempOutputPath);
      }
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }
  }
}
