import { NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import os from 'os';

const execAsync = promisify(exec);

export const runtime = 'nodejs';
export const maxDuration = 120;

// ── PowerPoint → PDF via COM ──
async function convertPptToPdf(inputPath: string, outputPath: string, scriptPath: string): Promise<void> {
  const safeInputPath = inputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeOutputPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");

  const psScript = `
$ErrorActionPreference = 'Stop'
try {
  Add-Type -AssemblyName Microsoft.Office.Interop.PowerPoint -ErrorAction SilentlyContinue
} catch {}
$pptApp = New-Object -ComObject PowerPoint.Application
try {
  Unblock-File -Path '${safeInputPath}' -ErrorAction SilentlyContinue
  $cleanPres = $pptApp.Presentations.Add([Microsoft.Office.Core.MsoTriState]::msoFalse)
  $cleanPres.Slides.InsertFromFile('${safeInputPath}', 0)
  foreach ($slide in $cleanPres.Slides) {
    $targets = @()
    for ($i = 1; $i -le $slide.Shapes.Count; $i++) {
      $shape = $slide.Shapes.Item($i)
      if ($shape.HasChart -eq -1 -or $shape.Type -eq 7 -or $shape.Type -eq 12) {
        $targets += $shape
      }
    }
    foreach ($shape in $targets) {
      $tempPng = [System.IO.Path]::GetTempFileName() + '.png'
      try {
        $shape.Export($tempPng, 3, 0, 0, 1)
        $pic = $slide.Shapes.AddPicture($tempPng, 0, -1, $shape.Left, $shape.Top, $shape.Width, $shape.Height)
        $pic.ZOrder(1)
        $shape.Delete()
      } catch {} finally {
        Remove-Item $tempPng -ErrorAction SilentlyContinue
      }
    }
  }
  $cleanPres.SaveAs('${safeOutputPath}', 32)
  $cleanPres.Close()
  Write-Output "SUCCESS"
} finally {
  $pptApp.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null
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
    throw new Error(`PowerPoint conversion failed: ${stderr || stdout}`);
  }
}

// ── PDF → PowerPoint via Word + PowerPoint COM ──
// Opens PDF in Word COM to get structured content, saves as HTML,
// then opens the HTML in PowerPoint COM and saves as PPTX.
async function convertPdfToPptx(inputPath: string, outputPath: string, scriptPath: string, tempDir: string): Promise<void> {
  // 1. Split PDF into individual pages first using pdf-lib
  const pdfBytes = await readFile(inputPath);
  const srcDoc = await PDFDocument.load(pdfBytes);
  const pageCount = srcDoc.getPageCount();

  for (let i = 0; i < pageCount; i++) {
    const subDoc = await PDFDocument.create();
    const [copiedPage] = await subDoc.copyPages(srcDoc, [i]);
    subDoc.addPage(copiedPage);
    const subPdfBytes = await subDoc.save();
    const subPdfPath = join(tempDir, `page_${i}.pdf`);
    await writeFile(subPdfPath, Buffer.from(subPdfBytes));
  }

  const safeOutputPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  const safeTempDir = tempDir.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\\\\$/, '');

  const psScript = `
$ErrorActionPreference = 'Stop'

# Configure Trust Center for temp path
$trustPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Word\\Security\\Trusted Locations\\PDFBulletTemp"
if (-not (Test-Path $trustPath)) {
  New-Item -Path $trustPath -Force | Out-Null
}
Set-ItemProperty -Path $trustPath -Name "Path" -Value "C:\\Users\\BISHAL\\AppData\\Local\\Temp" -ErrorAction SilentlyContinue | Out-Null
Set-ItemProperty -Path $trustPath -Name "AllowSubfolders" -Value 1 -ErrorAction SilentlyContinue | Out-Null
$optionsPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Word\\Options"
if (-not (Test-Path $optionsPath)) {
  New-Item -Path $optionsPath -Force | Out-Null
}
Set-ItemProperty -Path $optionsPath -Name "DisableConvertPdfWarning" -Value 1 -ErrorAction SilentlyContinue | Out-Null

$wordApp = $null
$pptApp = $null
try {
  Write-Host "Initializing Word..."
  $wordApp = New-Object -ComObject Word.Application
  $wordApp.Visible = $false
  $wordApp.DisplayAlerts = 0

  Write-Host "Initializing PowerPoint..."
  Add-Type -AssemblyName Microsoft.Office.Interop.PowerPoint -ErrorAction SilentlyContinue
  $pptApp = New-Object -ComObject PowerPoint.Application
  $pres = $pptApp.Presentations.Add([Microsoft.Office.Core.MsoTriState]::msoFalse)

  for ($i = 0; $i -lt ${pageCount}; $i++) {
    $subPdfPath = "${safeTempDir}\\\\page_" + $i + ".pdf"
    $doc = $wordApp.Documents.Open($subPdfPath, $false, $true)

    # Get original page dimensions dynamically to support A4 portrait/landscape
    $pageWidth = $doc.Sections.Item(1).PageSetup.PageWidth
    $pageHeight = $doc.Sections.Item(1).PageSetup.PageHeight

    if ($i -eq 0) {
      $pres.PageSetup.SlideWidth = $pageWidth
      $pres.PageSetup.SlideHeight = $pageHeight
    }

    # 1. Export page as HTML to extract inline/vector images to disk
    $htmlPath = "${safeTempDir}\\\\page_" + $i + ".htm"
    $filesDir = "${safeTempDir}\\\\page_" + $i + "_files"
    $doc.SaveAs([ref]$htmlPath, [ref]10) # wdFormatFilteredHTML = 10

    # Add the initial blank slide
    $activeSlide = $pres.Slides.Add(($pres.Slides.Count + 1), 12)  # ppLayoutBlank = 12

    # 2. Sequential stack layout with automatic overflow slide splitting
    $currentTop = 54
    $marginL = 72
    $contentW = $pageWidth - 144
    $maxTop = $pageHeight - 240

    # Helper to style paragraph text natively using standard parameter binding
    function Format-Paragraph {
      param(
        $textBox,
        $wordPara,
        $isFirst
      )
      $tf = $textBox.TextFrame.TextRange
      try {
        # Enforce exact 18pt for headers, 10.5pt for all body paragraphs
        if ($isFirst) {
          $fontSize = 18
        } else {
          $fontSize = 10.5
        }

        # Explicit float casting is REQUIRED for PowerPoint COM Size property
        $tf.Font.Size = [float]$fontSize
        
        $fontName = $wordPara.Range.Font.Name
        if ($fontName) { $tf.Font.Name = $fontName }
        if ($wordPara.Range.Font.Bold -eq -1) { $tf.Font.Bold = -1 }
        if ($wordPara.Range.Font.Italic -eq -1) { $tf.Font.Italic = -1 }
        if ($wordPara.Range.Font.Underline -ne 0) { $tf.Font.Underline = -1 }
        
        $wordColor = $wordPara.Range.Font.Color
        if ($wordColor -ne $null -and $wordColor -ne 9999999 -and $wordColor -ge 0) {
          $tf.Font.Color.RGB = $wordColor
        }
        switch ($wordPara.Alignment) {
          0 { $tf.ParagraphFormat.Alignment = 1 }  # Left
          1 { $tf.ParagraphFormat.Alignment = 2 }  # Center
          2 { $tf.ParagraphFormat.Alignment = 3 }  # Right
          3 { $tf.ParagraphFormat.Alignment = 4 }  # Justify
        }
      } catch {}
    }

    $wordParas = $doc.Paragraphs
    $firstPara = $true
    for ($pIdx = 1; $pIdx -le $wordParas.Count; $pIdx++) {
      $wordPara = $wordParas.Item($pIdx)
      $paraText = $wordPara.Range.Text.TrimEnd([char]13, [char]10, [char]7)
      if ($paraText.Length -eq 0) { continue }
      if ($wordPara.Range.Tables.Count -gt 0) { continue }

      # Create box with a large temporary height and AutoSize = 0 to strictly prevent PowerPoint text shrinking
      $textBox = $activeSlide.Shapes.AddTextbox(1, $marginL, $currentTop, $contentW, 400)
      $textBox.TextFrame.WordWrap = -1
      $textBox.TextFrame.AutoSize = 0
      
      $tf = $textBox.TextFrame.TextRange
      $tf.Text = $paraText

      Format-Paragraph -textBox $textBox -wordPara $wordPara -isFirst $firstPara

      # Measure exact text render height
      $boxHeight = $tf.BoundHeight
      if ($boxHeight -le 0) { $boxHeight = 15 }
      $textBox.Height = $boxHeight

      # Wrap to a new slide if the paragraph overflows the height limit
      if (($currentTop + $boxHeight) -gt $maxTop) {
        $textBox.Delete()
        
        $activeSlide = $pres.Slides.Add(($pres.Slides.Count + 1), 12)
        $currentTop = 54
        
        $textBox = $activeSlide.Shapes.AddTextbox(1, $marginL, $currentTop, $contentW, 400)
        $textBox.TextFrame.WordWrap = -1
        $textBox.TextFrame.AutoSize = 0
        
        $tf = $textBox.TextFrame.TextRange
        $tf.Text = $paraText
        
        Format-Paragraph -textBox $textBox -wordPara $wordPara -isFirst $firstPara
        
        $boxHeight = $tf.BoundHeight
        if ($boxHeight -le 0) { $boxHeight = 15 }
        $textBox.Height = $boxHeight
      }

      $currentTop = $currentTop + $boxHeight + 8
      $firstPara = $false
    }

    # 3. Create editable tables below the text stack (split slide if space is tight)
    for ($t = 1; $t -le $doc.Tables.Count; $t++) {
      $wordTable = $doc.Tables.Item($t)
      $rows = $wordTable.Rows.Count
      $cols = $wordTable.Columns.Count
      if ($rows -gt 0 -and $cols -gt 0) {
        if (($pageHeight - $currentTop) -lt 200) {
          $activeSlide = $pres.Slides.Add(($pres.Slides.Count + 1), 12)
          $currentTop = 54
        }

        $pptTableShape = $activeSlide.Shapes.AddTable($rows, $cols, $marginL, $currentTop, $contentW, 150)
        for ($r = 1; $r -le $rows; $r++) {
          for ($c = 1; $c -le $cols; $c++) {
            try {
              $cellText = $wordTable.Cell($r, $c).Range.Text.TrimEnd([char]13, [char]10, [char]7)
              $cellRange = $pptTableShape.Table.Cell($r, $c).Shape.TextFrame.TextRange
              $cellRange.Text = $cellText
              
              $wordCellFont = $wordTable.Cell($r, $c).Range.Font
              $cellRange.Font.Name = $wordCellFont.Name
              
              $wCellSize = $wordCellFont.Size
              if ($wCellSize -le 0 -or $wCellSize -ge 9999999) { $cSize = 10 } else { $cSize = $wCellSize }
              if ($cSize -gt 12) { $cSize = 11 }
              $cellRange.Font.Size = $cSize

              if ($wordCellFont.Bold -eq -1) { $cellRange.Font.Bold = -1 }
              if ($wordCellFont.Italic -eq -1) { $cellRange.Font.Italic = -1 }
            } catch {}
          }
        }
        $currentTop = $currentTop + $pptTableShape.Height + 10
      }
    }

    # 4. Insert graphics/images centered below the tables/text stack (split slide if space is tight)
    if (Test-Path $filesDir) {
      $images = Get-ChildItem -Path $filesDir -File
      $imgCount = 0
      foreach ($img in $images) {
        $pWidth = 360
        $pHeight = 200
        $pLeft = ($pageWidth - $pWidth) / 2 + ($imgCount * 30)

        if (($pageHeight - $currentTop) -lt 220) {
          $activeSlide = $pres.Slides.Add(($pres.Slides.Count + 1), 12)
          $currentTop = 54
        }

        $activeSlide.Shapes.AddPicture($img.FullName, $false, $true, $pLeft, $currentTop, $pWidth, $pHeight) | Out-Null
        $currentTop = $currentTop + $pHeight + 10
        $imgCount++
      }
    }

    $doc.Close([ref]0)

    # Clean up page temp files
    Remove-Item $htmlPath -Force -ErrorAction SilentlyContinue
    Remove-Item $filesDir -Recurse -Force -ErrorAction SilentlyContinue
  }

  Write-Host "Saving presentation..."
  $pres.SaveAs('${safeOutputPath}', 24)
  $pres.Close()
  Write-Host "SUCCESS"
} catch {
  Write-Error $_.Exception.Message
  throw $_
} finally {
  if ($wordApp -ne $null) {
    try { $wordApp.Quit() } catch {}
    try { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($wordApp) | Out-Null } catch {}
  }
  if ($pptApp -ne $null) {
    try { $pptApp.Quit() } catch {}
    try { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null } catch {}
  }
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
    throw new Error(`PDF to PowerPoint conversion failed: ${stderr || stdout}`);
  }
}

// LibreOffice fallback (cross-platform)
async function convertWithLibreOffice(inputPath: string, outputDir: string): Promise<string> {
  const loPaths = [
    'soffice',
    'libreoffice',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    '/usr/bin/libreoffice',
    '/usr/bin/soffice',
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
  ];

  let loPath = 'soffice';
  for (const p of loPaths) {
    try {
      await execAsync(`"${p}" --version`, { timeout: 5000 });
      loPath = p;
      break;
    } catch {}
  }

  await execAsync(
    `"${loPath}" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
    { timeout: 90000 }
  );

  const baseName = inputPath.split(/[/\\]/).pop()?.replace(/\.[^.]+$/, '') ?? 'output';
  const outputPath = join(outputDir, `${baseName}.pdf`);
  if (!existsSync(outputPath)) {
    throw new Error('LibreOffice conversion produced no output file.');
  }
  return outputPath;
}

export async function POST(request: Request) {
  const tmpDir = join(os.tmpdir(), 'pdfbullet-ppt');
  const sessionId = randomUUID();
  const sessionDir = join(tmpDir, sessionId);

  try {
    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const action = (formData.get('action') as string | null) ?? 'powerpoint-to-pdf';

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    // Validate action & file extension
    if (action === 'powerpoint-to-pdf' && !['ppt', 'pptx'].includes(ext)) {
      return NextResponse.json({ error: 'Only .ppt and .pptx files are supported.' }, { status: 400 });
    }
    if (action === 'pdf-to-powerpoint' && ext !== 'pdf') {
      return NextResponse.json({ error: 'Only PDF files can be converted to PowerPoint.' }, { status: 400 });
    }

    if (process.platform !== 'win32' && action === 'pdf-to-powerpoint') {
      return NextResponse.json({ error: 'PDF to PowerPoint conversion requires a Windows server with Office.' }, { status: 500 });
    }

    // Create temp session dir
    if (!existsSync(tmpDir)) await mkdir(tmpDir, { recursive: true });
    await mkdir(sessionDir, { recursive: true });

    const inputPath = join(sessionDir, `input.${ext}`);

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    if (action === 'pdf-to-powerpoint') {
      // ── PDF → PPTX ──
      const outputPath = join(sessionDir, 'output.pptx');
      const scriptPath = join(sessionDir, 'convert.ps1');

      await convertPdfToPptx(inputPath, outputPath, scriptPath, sessionDir);

      const pptxBuffer = await readFile(outputPath);

      // Cleanup
      try {
        const { rm } = await import('fs/promises');
        await rm(sessionDir, { recursive: true, force: true });
      } catch {}

      return new NextResponse(new Uint8Array(pptxBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^.]+$/, '.pptx')}"`,
          'X-Conversion-Method': 'PowerPoint',
          'Content-Length': String(pptxBuffer.length),
        },
      });
    } else {
      // ── PowerPoint → PDF (existing logic) ──
      const outputPath = join(sessionDir, 'output.pdf');
      let pdfPath = outputPath;
      let method = 'unknown';

      if (process.platform === 'win32') {
        try {
          const scriptPath = join(sessionDir, 'convert.ps1');
          await convertPptToPdf(inputPath, outputPath, scriptPath);
          method = 'PowerPoint';
          pdfPath = outputPath;
        } catch (pptErr) {
          console.warn('PowerPoint COM failed, trying LibreOffice:', pptErr);
          try {
            pdfPath = await convertWithLibreOffice(inputPath, sessionDir);
            method = 'LibreOffice';
          } catch (loErr) {
            throw new Error(`Both PowerPoint and LibreOffice conversion failed.\nPowerPoint: ${(pptErr as Error).message}\nLibreOffice: ${(loErr as Error).message}`);
          }
        }
      } else {
        pdfPath = await convertWithLibreOffice(inputPath, sessionDir);
        method = 'LibreOffice';
      }

      const pdfBuffer = await readFile(pdfPath);

      // Cleanup temp files
      try {
        await unlink(inputPath);
        await unlink(pdfPath);
      } catch {}

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^.]+$/, '.pdf')}"`,
          'X-Conversion-Method': method,
          'Content-Length': String(pdfBuffer.length),
        },
      });
    }
  } catch (err: any) {
    // Cleanup on error
    try {
      const { rm } = await import('fs/promises');
      await rm(sessionDir, { recursive: true, force: true });
    } catch {}

    console.error('PPT conversion error:', err);
    return NextResponse.json(
      { error: err.message || 'Conversion failed.' },
      { status: 500 }
    );
  }
}
