import React, { lazy, Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import Preloader from '../components/Preloader.tsx';

// Lazily import all the new tool components
const LazyToolComponents: { [key: string]: React.LazyExoticComponent<React.FC<{}>> } = {
  'merge-pdf': lazy(() => import('./tools/MergePdf.tsx')),
  'split-pdf': lazy(() => import('./tools/SplitPdf.tsx')),
  'organize-pdf': lazy(() => import('./tools/OrganizePdf.tsx')),
  'rotate-pdf': lazy(() => import('./tools/RotatePdf.tsx')),
  'zip-maker': lazy(() => import('./tools/ZipMaker.tsx')),
  'compress-pdf': lazy(() => import('./tools/CompressPdf.tsx')),
  'repair-pdf': lazy(() => import('./tools/RepairPdf.tsx')),
  'resize-file': lazy(() => import('./tools/ResizeFile.tsx')),
  'jpg-to-pdf': lazy(() => import('./tools/JpgToPdf.tsx')),
  'psd-to-pdf': lazy(() => import('./tools/PsdToPdf.tsx')),
  'word-to-pdf': lazy(() => import('./tools/WordToPdf.tsx')),
  'powerpoint-to-pdf': lazy(() => import('./tools/PowerPointToPdf.tsx')),
  'excel-to-pdf': lazy(() => import('./tools/ExcelToPdf.tsx')),
  'html-to-pdf': lazy(() => import('./tools/HtmlToPdf.tsx')),
  'scan-to-pdf': lazy(() => import('./tools/ScanToPdf.tsx')),
  'pdf-to-jpg': lazy(() => import('./tools/PdfToJpg.tsx')),
  'pdf-to-png': lazy(() => import('./tools/PdfToPng.tsx')),
  'pdf-to-word': lazy(() => import('./tools/PdfToWord.tsx')),
  'pdf-to-powerpoint': lazy(() => import('./tools/PdfToPowerPoint.tsx')),
  'pdf-to-excel': lazy(() => import('./tools/PdfToExcel.tsx')),
  'pdf-to-pdfa': lazy(() => import('./tools/PdfToPdfA.tsx')),
  'extract-text': lazy(() => import('./tools/ExtractText.tsx')),
  'edit-pdf': lazy(() => import('./tools/EditPdf.tsx')),
  'page-numbers': lazy(() => import('./tools/PageNumbers.tsx')),
  'crop-pdf': lazy(() => import('./tools/CropPdf.tsx')),
  'ocr-pdf': lazy(() => import('./tools/OcrPdf.tsx')),
  'compare-pdf': lazy(() => import('./tools/ComparePdf.tsx')),
  'redact-pdf': lazy(() => import('./tools/RedactPdf.tsx')),
  'ai-question-generator': lazy(() => import('./AIQuestionGeneratorPage.tsx')),
  'unlock-pdf': lazy(() => import('./tools/UnlockPdf.tsx')),
  'protect-pdf': lazy(() => import('./tools/ProtectPdf.tsx')),
  'sign-pdf': lazy(() => import('./tools/SignPdf.tsx')),
  'watermark-pdf': lazy(() => import('./tools/WatermarkPdf.tsx')),
  'invoice-generator': lazy(() => import('./InvoiceGeneratorPage.tsx')),
  'cv-generator': lazy(() => import('./CVGeneratorPage.tsx')),
  'lesson-plan-creator': lazy(() => import('./LessonPlanCreatorPage.tsx')),
  'resize-image': lazy(() => import('./tools/ResizeImage.tsx')),
  'remove-background': lazy(() => import('./tools/RemoveBackground.tsx')),
  'crop-image': lazy(() => import('./tools/CropImage.tsx')),
  'convert-to-jpg': lazy(() => import('./tools/ConvertToJpg.tsx')),
  'convert-from-jpg': lazy(() => import('./tools/ConvertFromJpg.tsx')),
  'compress-image': lazy(() => import('./tools/CompressImage.tsx')),
  'watermark-image': lazy(() => import('./tools/WatermarkImage.tsx')),
};

const ToolPageDispatcher: React.FC = () => {
    const { toolId } = useParams<{ toolId: string }>();

    const knownTool = TOOLS.find(t => t.id === toolId);
    
    if (!toolId || !knownTool || !LazyToolComponents[toolId]) {
        return <Navigate to="/" replace />;
    }

    const ToolComponent = LazyToolComponents[toolId];

    return (
        <Suspense fallback={<Preloader />}>
            <ToolComponent />
        </Suspense>
    );
};

export default ToolPageDispatcher;
