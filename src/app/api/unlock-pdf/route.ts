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
  const tmpDir = join(os.tmpdir(), 'pdfbullet-unlock');
  let tempInputPath = '';
  let tempOutputPath = '';

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const password = (formData.get('password') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure temp directory exists
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    const sessionId = randomUUID();
    tempInputPath = join(tmpDir, `${sessionId}_input.pdf`);
    tempOutputPath = join(tmpDir, `${sessionId}_output.pdf`);

    // Write input PDF file to temp folder
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempInputPath, buffer);

    const qpdfPath = join(process.cwd(), 'bin', 'qpdf-11.9.1-msvc64', 'bin', 'qpdf.exe');

    if (!existsSync(qpdfPath)) {
      throw new Error(`QPDF executable not found at path: ${qpdfPath}`);
    }

    // Execute QPDF to decrypt the document
    try {
      await execFileAsync(qpdfPath, [
        `--password=${password}`,
        '--decrypt',
        tempInputPath,
        tempOutputPath
      ]);
    } catch (qpdfErr: any) {
      console.error('QPDF decryption error:', qpdfErr);
      const stderr = qpdfErr.stderr || '';
      if (stderr.includes('invalid password') || stderr.includes('incorrect password') || qpdfErr.message.includes('exit code 2')) {
        return NextResponse.json({ error: 'Incorrect password. Please enter the correct password.' }, { status: 401 });
      }
      return NextResponse.json({ error: `Decryption failed: ${stderr || qpdfErr.message}` }, { status: 500 });
    }

    if (!existsSync(tempOutputPath)) {
      throw new Error('QPDF finished but output file was not created.');
    }

    // Read the decrypted output file
    const decryptedBytes = await readFile(tempOutputPath);

    // Return the decrypted file bytes directly
    return new Response(new Uint8Array(decryptedBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf"`
      }
    });

  } catch (err: any) {
    console.error('Unlock PDF general error:', err);
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
