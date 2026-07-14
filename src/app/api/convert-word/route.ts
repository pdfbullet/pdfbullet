import { NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import os from 'os';

const execAsync = promisify(exec);

export const runtime = 'nodejs';
export const maxDuration = 120;

// Convert DOC/DOCX to PDF using Word COM via PowerShell
async function convertWordToPdf(inputPath: string, outputPath: string, scriptPath: string): Promise<void> {
  const safeInputPath = inputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeOutputPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");

  const psScript = `
$ErrorActionPreference = 'Stop'
try {
  $wordApp = New-Object -ComObject Word.Application
  $wordApp.DisplayAlerts = 0
  $doc = $wordApp.Documents.Open('${safeInputPath}', $false, $true)
  # wdFormatPDF = 17
  $doc.SaveAs('${safeOutputPath}', 17)
  $doc.Close()
  $wordApp.Quit()
  Write-Output "SUCCESS"
} finally {
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}
`.trim();

  await writeFile(scriptPath, psScript, 'utf8');

  const { stdout, stderr } = await execAsync(
    `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`,
    { timeout: 90000 }
  );

  try {
    if (existsSync(scriptPath)) await unlink(scriptPath);
  } catch {}

  if (!existsSync(outputPath)) {
    throw new Error(`Word to PDF conversion failed: ${stderr || stdout}`);
  }
}

// Convert PDF to DOCX using Word COM via PowerShell
async function convertPdfToWord(inputPath: string, outputPath: string, scriptPath: string): Promise<void> {
  const safeInputPath = inputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeOutputPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");

  const psScript = `
$ErrorActionPreference = 'Stop'
try {
  # 1. Configure Trust Center registry keys for Temp path to prevent Protected View warnings
  $trustPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Word\\Security\\Trusted Locations\\PDFBulletTemp"
  if (-not (Test-Path $trustPath)) {
    New-Item -Path $trustPath -Force | Out-Null
  }
  Set-ItemProperty -Path $trustPath -Name "Path" -Value "C:\\Users\\BISHAL\\AppData\\Local\\Temp" -ErrorAction SilentlyContinue | Out-Null
  Set-ItemProperty -Path $trustPath -Name "AllowSubfolders" -Value 1 -ErrorAction SilentlyContinue | Out-Null
  Set-ItemProperty -Path $trustPath -Name "Description" -Value "Added via PDFBullet" -ErrorAction SilentlyContinue | Out-Null

  # 2. Disable conversion warning dialog
  $optionsPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Word\\Options"
  if (-not (Test-Path $optionsPath)) {
    New-Item -Path $optionsPath -Force | Out-Null
  }
  Set-ItemProperty -Path $optionsPath -Name "DisableConvertPdfWarning" -Value 1 -ErrorAction SilentlyContinue | Out-Null

  # 3. Open PDF in Word and SaveAs DOCX
  $wordApp = New-Object -ComObject Word.Application
  $wordApp.DisplayAlerts = 0
  $doc = $wordApp.Documents.Open('${safeInputPath}', $false, $true)
  # wdFormatXMLDocument = 16
  $doc.SaveAs('${safeOutputPath}', 16)
  $doc.Close()
  $wordApp.Quit()
  Write-Output "SUCCESS"
} finally {
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}
`.trim();

  await writeFile(scriptPath, psScript, 'utf8');

  const { stdout, stderr } = await execAsync(
    `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`,
    { timeout: 90000 }
  );

  try {
    if (existsSync(scriptPath)) await unlink(scriptPath);
  } catch {}

  if (!existsSync(outputPath)) {
    throw new Error(`PDF to Word conversion failed: ${stderr || stdout}`);
  }
}

export async function POST(request: Request) {
  const tmpDir = join(os.tmpdir(), 'pdfbullet-word');
  const sessionId = randomUUID();
  const sessionDir = join(tmpDir, sessionId);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string | null; // "word-to-pdf" or "pdf-to-word"

    if (!file || !action) {
      return NextResponse.json({ error: 'Missing file or action.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    // Create session dir
    if (!existsSync(tmpDir)) await mkdir(tmpDir, { recursive: true });
    await mkdir(sessionDir, { recursive: true });

    const inputPath = join(sessionDir, `input.${ext}`);
    let outputPath = '';
    let outputContentType = '';
    let outputExt = '';

    if (action === 'word-to-pdf') {
      if (!['doc', 'docx'].includes(ext ?? '')) {
        return NextResponse.json({ error: 'Unsupported Word file extension.' }, { status: 400 });
      }
      outputPath = join(sessionDir, 'output.pdf');
      outputContentType = 'application/pdf';
      outputExt = 'pdf';
    } else if (action === 'pdf-to-word') {
      if (ext !== 'pdf') {
        return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 });
      }
      outputPath = join(sessionDir, 'output.docx');
      outputContentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      outputExt = 'docx';
    } else {
      return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
    }

    // Save uploaded file to inputPath
    const bytes = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    const scriptPath = join(sessionDir, 'convert.ps1');

    if (process.platform !== 'win32') {
      throw new Error('Word COM conversion is only available on Windows servers.');
    }

    if (action === 'word-to-pdf') {
      await convertWordToPdf(inputPath, outputPath, scriptPath);
    } else {
      await convertPdfToWord(inputPath, outputPath, scriptPath);
    }

    const outputBuffer = await readFile(outputPath);

    // Cleanup session dir
    try {
      const { rm } = await import('fs/promises');
      await rm(sessionDir, { recursive: true, force: true });
    } catch {}

    const originalNameWithoutExt = file.name.replace(/\.[^.]+$/, '');
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': outputContentType,
        'Content-Disposition': `attachment; filename="${originalNameWithoutExt}.${outputExt}"`,
        'Content-Length': String(outputBuffer.length),
      },
    });
  } catch (err: any) {
    try {
      const { rm } = await import('fs/promises');
      await rm(sessionDir, { recursive: true, force: true });
    } catch {}

    console.error('Word conversion error:', err);
    return NextResponse.json(
      { error: err.message || 'Conversion failed.' },
      { status: 500 }
    );
  }
}
