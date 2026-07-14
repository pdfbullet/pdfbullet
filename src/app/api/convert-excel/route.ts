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

// Convert Excel to PDF using Excel COM via PowerShell
async function convertExcelToPdf(inputPath: string, outputPath: string, scriptPath: string): Promise<void> {
  const safeInputPath = inputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeOutputPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");

  const psScript = `
$ErrorActionPreference = 'Stop'
try {
  $excelApp = New-Object -ComObject Excel.Application
  $excelApp.Visible = $false
  $excelApp.DisplayAlerts = $false
  # Open in read-only mode to prevent lockups
  $workbook = $excelApp.Workbooks.Open('${safeInputPath}', [System.Type]::Missing, $true)
  
  # Ensure all worksheets are selected or print layout is set to fit page widths
  foreach ($sheet in $workbook.Worksheets) {
    $sheet.PageSetup.FitToPagesWide = 1
    $sheet.PageSetup.FitToPagesTall = $false
    # Enable zoom to fit
    $sheet.PageSetup.Zoom = $false
    # Draw cell borders/gridlines on PDF
    $sheet.PageSetup.PrintGridlines = $true
  }

  # Export workbook to PDF (xlTypePDF = 0)
  $workbook.ExportAsFixedFormat(0, '${safeOutputPath}')
  $workbook.Close($false)
  $excelApp.Quit()
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
    throw new Error(`Excel to PDF conversion failed: ${stderr || stdout}`);
  }
}

// Convert PDF to Excel using Word (to HTML) and Excel (to XLSX) COM via PowerShell
async function convertPdfToExcel(inputPath: string, outputPath: string, scriptPath: string, tempHtmlPath: string, tempDir: string): Promise<void> {
  const safeInputPath = inputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeOutputPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeHtmlPath = tempHtmlPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeTempDir = tempDir.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\\\\$/, '');

  const psScript = `
$ErrorActionPreference = 'Stop'
try {
  # 1. Configure Trust Center registry keys for Temp path to prevent Protected View warnings
  $trustPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Word\\Security\\Trusted Locations\\PDFBulletTemp"
  if (-not (Test-Path $trustPath)) {
    New-Item -Path $trustPath -Force | Out-Null
  }
  Set-ItemProperty -Path $trustPath -Name "Path" -Value '${safeTempDir}' -ErrorAction SilentlyContinue | Out-Null
  Set-ItemProperty -Path $trustPath -Name "AllowSubfolders" -Value 1 -ErrorAction SilentlyContinue | Out-Null

  # 2. Disable conversion warning dialog
  $optionsPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Word\\Options"
  if (-not (Test-Path $optionsPath)) {
    New-Item -Path $optionsPath -Force | Out-Null
  }
  Set-ItemProperty -Path $optionsPath -Name "DisableConvertPdfWarning" -Value 1 -ErrorAction SilentlyContinue | Out-Null

  # 3. Unblock the file to prevent Zone Identifier protected view blocks
  Unblock-File -Path '${safeInputPath}' -ErrorAction SilentlyContinue

  # 4. Open PDF in Word and SaveAs HTML (wdFormatHTML = 8)
  $wordApp = New-Object -ComObject Word.Application
  $wordApp.Visible = $false
  $wordApp.DisplayAlerts = 0
  $doc = $wordApp.Documents.Open('${safeInputPath}', $false, $true)
  $doc.SaveAs('${safeHtmlPath}', 8)
  $doc.Close($false)
  $wordApp.Quit()

  # 5. Open HTML in Excel and SaveAs XLSX (xlOpenXMLWorkbook = 51)
  $excelApp = New-Object -ComObject Excel.Application
  $excelApp.Visible = $false
  $excelApp.DisplayAlerts = $false
  $workbook = $excelApp.Workbooks.Open('${safeHtmlPath}')
  $workbook.SaveAs('${safeOutputPath}', 51)
  $workbook.Close($false)
  $excelApp.Quit()
  
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
    if (existsSync(tempHtmlPath)) await unlink(tempHtmlPath);
  } catch {}

  if (!existsSync(outputPath)) {
    throw new Error(`PDF to Excel conversion failed: ${stderr || stdout}`);
  }
}

export async function POST(request: Request) {
  const tmpDir = join(os.tmpdir(), 'pdfbullet-excel');
  const sessionId = randomUUID();
  const sessionDir = join(tmpDir, sessionId);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string | null; // "excel-to-pdf" or "pdf-to-excel"

    if (!file || !action) {
      return NextResponse.json({ error: 'Missing file or action.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!['excel-to-pdf', 'pdf-to-excel'].includes(action)) {
      return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
    }

    if (action === 'excel-to-pdf' && !['xls', 'xlsx', 'xlsm'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Unsupported Excel file extension.' }, { status: 400 });
    }

    if (action === 'pdf-to-excel' && ext !== 'pdf') {
      return NextResponse.json({ error: 'Only PDF files can be converted to Excel.' }, { status: 400 });
    }

    if (process.platform !== 'win32') {
      throw new Error('Office COM conversion is only available on Windows servers.');
    }

    // Create session dir
    if (!existsSync(tmpDir)) await mkdir(tmpDir, { recursive: true });
    await mkdir(sessionDir, { recursive: true });

    const inputPath = join(sessionDir, `input.${ext}`);
    const scriptPath = join(sessionDir, 'convert.ps1');

    // Save uploaded file to inputPath
    const bytes = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    let outputPath = '';
    let outputBuffer: Buffer;
    let outputContentType = '';
    let outputExt = '';

    if (action === 'excel-to-pdf') {
      outputPath = join(sessionDir, 'output.pdf');
      await convertExcelToPdf(inputPath, outputPath, scriptPath);
      outputBuffer = await readFile(outputPath);
      outputContentType = 'application/pdf';
      outputExt = 'pdf';
    } else {
      // pdf-to-excel
      outputPath = join(sessionDir, 'output.xlsx');
      const tempHtmlPath = join(sessionDir, 'temp.html');
      const tempDirLocation = os.tmpdir();
      await convertPdfToExcel(inputPath, outputPath, scriptPath, tempHtmlPath, tempDirLocation);
      outputBuffer = await readFile(outputPath);
      outputContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      outputExt = 'xlsx';
    }

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

    console.error('Excel/PDF conversion error:', err);
    return NextResponse.json(
      { error: err.message || 'Conversion failed.' },
      { status: 500 }
    );
  }
}
