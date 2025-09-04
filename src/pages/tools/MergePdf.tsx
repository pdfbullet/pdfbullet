
import React, { useState } from 'react';
import ToolPageLayout from '../../components/ToolPageLayout.tsx';
import { TOOLS } from '../../constants.ts';
import FileUpload from '../../components/FileUpload.tsx';
import { useLastTasks } from '../../hooks/useLastTasks.ts';
import { PDFDocument } from 'pdf-lib';

const MergePdf: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'merge-pdf')!;
    const [files, setFiles] = useState<File[]>([]);
    const [state, setState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [processedFile, setProcessedFile] = useState<Blob | null>(null);
    const { addTask } = useLastTasks();

    const handleProcess = async () => {
        if (files.length < 2) {
            setErrorMessage("Please select at least two PDF files to merge.");
            return;
        }
        setState('processing');
        setErrorMessage('');
        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                if (file.type !== 'application/pdf') throw new Error(`File "${file.name}" is not a PDF.`);
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            setProcessedFile(blob);
            addTask({ toolId: tool.id, toolTitle: tool.title, outputFilename: 'merged.pdf', fileBlob: blob });
            setState('success');
        } catch (e: any) {
            setErrorMessage(e.message || 'An error occurred while merging PDFs.');
            setState('error');
        }
    };
    
    // Placeholder for other states like success, error, loading
    if (state === 'processing') return <ToolPageLayout tool={tool}><p className="text-center">Merging PDFs...</p></ToolPageLayout>;
    if (state === 'success' && processedFile) {
        return (
            <ToolPageLayout tool={tool}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">PDFs Merged Successfully!</h2>
                    <a href={URL.createObjectURL(processedFile)} download="merged.pdf" className="bg-brand-red text-white font-bold py-3 px-6 rounded-lg">
                        Download Merged PDF
                    </a>
                </div>
            </ToolPageLayout>
        );
    }
     if (state === 'error') {
        return (
            <ToolPageLayout tool={tool}>
                 <div className="text-center text-red-500">
                    <p>{errorMessage}</p>
                    <button onClick={() => { setFiles([]); setState('idle'); }} className="mt-4 bg-brand-red text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
                </div>
            </ToolPageLayout>
        );
    }

    return (
        <ToolPageLayout tool={tool}>
            <FileUpload tool={tool} files={files} setFiles={setFiles}>
                 {files.length > 0 && (
                    <button
                        onClick={handleProcess}
                        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors ${tool.color} ${tool.hoverColor}`}
                    >
                        Merge PDF
                    </button>
                )}
            </FileUpload>
        </ToolPageLayout>
    );
};

export default MergePdf;
