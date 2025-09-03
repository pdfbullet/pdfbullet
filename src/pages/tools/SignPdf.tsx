import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOLS } from '../../constants.ts';
import FileUpload from '../../components/FileUpload.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { CloseIcon, RightArrowIcon, DownloadIcon, LinkIcon, CheckIcon } from '../../components/icons.tsx';
import ToolPageLayout from '../../components/ToolPageLayout.tsx';
import WhoWillSignModal from '../../components/WhoWillSignModal.tsx';
import SignatureModal from '../../components/SignatureModal.tsx';
import { useSignature } from '../../hooks/useSignature.ts';
import { useSignedDocuments } from '../../hooks/useSignedDocuments.ts';
import { useLastTasks } from '../../hooks/useLastTasks.ts';

import { PDFDocument, rgb, degrees, StandardFonts, BlendMode } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PageViewport } from 'pdfjs-dist';
import html2canvas from 'html2canvas';

enum ProcessingState {
  Idle = "IDLE",
  Processing = "PROCESSING",
  Success = "SUCCESS",
  Error = "ERROR"
}

interface CanvasItem {
    id: number;
    type: 'signature' | 'initials' | 'upload' | 'text' | 'image';
    dataUrl?: string;
    text?: string;
    font?: string;
    fontSize?: number;
    color?: string;
    width: number;
    height: number;
    x: number;
    y: number;
    pageIndex: number;
}

const SignPdf: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'sign-pdf')!;
    const navigate = useNavigate();
    const { user } = useAuth();
    const { signature, saveSignature } = useSignature();
    const { addSignedDocument } = useSignedDocuments();
    const { addTask } = useLastTasks();

    const [state, setState] = useState<ProcessingState>(ProcessingState.Idle);
    const [errorMessage, setErrorMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [processedFileBlob, setProcessedFileBlob] = useState<Blob | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string>('');

    const [pdfPagePreviews, setPdfPagePreviews] = useState<string[]>([]);
    const [pdfPageViewports, setPdfPageViewports] = useState<PageViewport[]>([]);
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [activeDrag, setActiveDrag] = useState<{ id: number; offsetX: number; offsetY: number; } | null>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const [isWhoWillSignModalOpen, setWhoWillSignModalOpen] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    const handleReset = useCallback(() => {
        setState(ProcessingState.Idle);
        setErrorMessage('');
        setFiles([]);
        setProcessedFileBlob(null);
        setDownloadUrl('');
        setPdfPagePreviews([]);
        setPdfPageViewports([]);
        setCanvasItems([]);
        setActiveDrag(null);
        setWhoWillSignModalOpen(false);
        setIsSignatureModalOpen(false);
    }, []);

    useEffect(() => {
        if (files.length > 0 && pdfPagePreviews.length === 0) {
            setWhoWillSignModalOpen(true);
        }
    }, [files, pdfPagePreviews]);

    const extractPages = async () => {
        if (files.length !== 1) return;
        
        setState(ProcessingState.Processing);
        const file = files[0];
        const fileBuffer = await file.arrayBuffer();
        
        try {
            const previews: string[] = [];
            const newViewports: PageViewport[] = [];
            const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d')!;
                await page.render({ canvasContext: context, viewport: viewport } as any).promise;
                previews.push(canvas.toDataURL('image/jpeg', 0.8));
                newViewports.push(viewport);
            }
            setPdfPagePreviews(previews);
            setPdfPageViewports(newViewports);
            setState(ProcessingState.Idle);
        } catch (e: any) {
            setErrorMessage('Failed to load PDF. The file might be corrupt or password protected.');
            setState(ProcessingState.Error);
        }
    };

    const handleOnlyMeSign = () => {
        setWhoWillSignModalOpen(false);
        if (!user) {
            navigate('/login', { state: { from: `/${tool.id}` } });
            return;
        }
        if (signature?.signature) {
            extractPages();
        } else {
            setIsSignatureModalOpen(true);
        }
    };

    const handleSignatureSave = (signatureDataUrl: string, initialsDataUrl: string) => {
        saveSignature(signatureDataUrl, initialsDataUrl);
        setIsSignatureModalOpen(false);
        if (files.length > 0) {
            extractPages();
        }
    };

    const addSignatureToCanvas = (type: 'signature' | 'initials') => {
        if (!signature || (type === 'signature' && !signature.signature) || (type === 'initials' && !signature.initials)) {
            setIsSignatureModalOpen(true);
            return;
        }

        if (previewContainerRef.current) {
            const firstPage = previewContainerRef.current.querySelector('#pdf-page-0');
            if (firstPage) {
                const dataUrl = type === 'signature' ? signature.signature : signature.initials;
                const isSignature = type === 'signature';
                const itemWidth = isSignature ? 150 : 60;
                const itemHeight = isSignature ? 75 : 60;
                const x = (firstPage as HTMLElement).offsetLeft + 20;
                const y = (firstPage as HTMLElement).offsetTop + 20;
                
                setCanvasItems(prev => [...prev, { id: Date.now(), type, dataUrl: dataUrl!, width: itemWidth, height: itemHeight, x, y, pageIndex: 0 }]);
            }
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!activeDrag || !previewContainerRef.current) return;
            const container = previewContainerRef.current;
            const containerRect = container.getBoundingClientRect();
            let x = e.clientX - containerRect.left + container.scrollLeft - activeDrag.offsetX;
            let y = e.clientY - containerRect.top + container.scrollTop - activeDrag.offsetY;

            setCanvasItems(items => items.map(item => item.id === activeDrag.id ? { ...item, x, y } : item));
        };
        const handleMouseUp = () => setActiveDrag(null);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [activeDrag]);

    const handleProcess = async () => {
        if (files.length !== 1 || canvasItems.length === 0) return;
        setState(ProcessingState.Processing);
        setErrorMessage('');
        try {
            const pdfBytes = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const pdfLibPages = pdfDoc.getPages();

            for (let i = 0; i < pdfLibPages.length; i++) {
                const pageItems = canvasItems.filter(item => {
                    const pageElement = document.getElementById(`pdf-page-${i}`);
                    if (!pageElement) return false;
                    return item.y >= pageElement.offsetTop && item.y < pageElement.offsetTop + pageElement.offsetHeight;
                });
                
                if (pageItems.length === 0) continue;

                const pageElement = document.getElementById(`pdf-page-${i}`)!;
                const viewport = pdfPageViewports[i];
                const displayRect = pageElement.getBoundingClientRect();

                const overlayCanvas = await html2canvas(pageElement.parentElement!, {
                    backgroundColor: null,
                    width: displayRect.width,
                    height: displayRect.height,
                    x: pageElement.offsetLeft,
                    y: pageElement.offsetTop,
                    windowWidth: document.documentElement.scrollWidth,
                    windowHeight: document.documentElement.scrollHeight,
                    onclone: (clonedDoc) => {
                        Array.from(clonedDoc.querySelectorAll('.canvas-item')).forEach(el => {
                            const id = parseInt(el.getAttribute('data-id') || '0', 10);
                            if (!pageItems.some(item => item.id === id)) {
                                (el as HTMLElement).style.display = 'none';
                            }
                        });
                    }
                });

                const overlayImageBytes = await fetch(overlayCanvas.toDataURL('image/png')).then(res => res.arrayBuffer());
                const overlayImage = await pdfDoc.embedPng(overlayImageBytes);
                
                const pdfLibPage = pdfLibPages[i];
                const { width, height } = pdfLibPage.getSize();
                pdfLibPage.drawImage(overlayImage, { x: 0, y: 0, width, height, blendMode: BlendMode.Normal });
            }

            const finalBytes = await pdfDoc.save();
            const blob = new Blob([finalBytes], { type: 'application/pdf' });
            setProcessedFileBlob(blob);
            setDownloadUrl(URL.createObjectURL(blob));

            const outputFilename = `${files[0].name.replace(/\.[^/.]+$/, "")}_signed.pdf`;
            addTask({ toolId: tool.id, toolTitle: tool.title, outputFilename, fileBlob: blob });
            
            if (user) {
                await addSignedDocument({
                    originator: user.username,
                    originalFile: files[0],
                    originalFileName: files[0].name,
                    signedFile: blob,
                    signedFileName: outputFilename,
                    signers: [{ name: user.username, signedAt: new Date().toISOString() }],
                    status: 'Signed',
                    auditTrail: JSON.stringify([{ event: 'Document Signed', user: user.username, timestamp: new Date().toISOString() }])
                });
            }

            setState(ProcessingState.Success);
        } catch (e: any) {
            setErrorMessage(`An error occurred: ${e.message}`);
            setState(ProcessingState.Error);
        }
    };
    
    if (state === ProcessingState.Success) {
        return (
             <ToolPageLayout tool={tool}>
                 <div className="text-center w-full max-w-lg mx-auto py-12">
                     <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Document Signed!</h2>
                     <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <a href={downloadUrl} download={`${files[0].name.replace(/\.[^/.]+$/, "")}_signed.pdf`} className="flex-grow-0 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 px-8 rounded-lg text-xl flex items-center gap-3 transition-colors">
                            <DownloadIcon className="h-6 w-6" /> Download Signed PDF
                        </a>
                     </div>
                      <button onClick={handleReset} className="mt-8 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                        &larr; Sign another document
                    </button>
                 </div>
             </ToolPageLayout>
        );
    }

    if (state === ProcessingState.Error) {
        return (
             <ToolPageLayout tool={tool}>
                <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-xl border border-red-200 dark:border-red-800">
                    <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">An Error Occurred</h2>
                    <p className="mt-2 text-red-600 dark:text-red-400">{errorMessage}</p>
                    <button onClick={handleReset} className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Try Again</button>
                </div>
            </ToolPageLayout>
        );
    }

    return (
        <ToolPageLayout tool={tool}>
            {pdfPagePreviews.length === 0 ? (
                <FileUpload tool={tool} files={files} setFiles={setFiles} accept={{'application/pdf': ['.pdf']}} />
            ) : (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-grow bg-gray-200 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div ref={previewContainerRef} className="relative w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-auto max-h-[80vh] bg-white dark:bg-black">
                            {pdfPagePreviews.map((src, index) => <img key={index} id={`pdf-page-${index}`} src={src} alt={`Page ${index + 1}`} className="w-full h-auto border-b dark:border-gray-700 last:border-b-0" />)}
                            {canvasItems.map(item => (
                                <div
                                    key={item.id}
                                    data-id={item.id}
                                    className="absolute cursor-move border-2 border-dashed border-blue-500 hover:border-blue-700 canvas-item"
                                    style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
                                    onMouseDown={(e) => {
                                        const target = e.currentTarget as HTMLDivElement;
                                        const rect = target.getBoundingClientRect();
                                        setActiveDrag({ id: item.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
                                    }}
                                >
                                    <img src={item.dataUrl} alt={item.type} className="w-full h-full object-contain" />
                                    <button onClick={() => setCanvasItems(prev => prev.filter(i => i.id !== item.id))} className="absolute -top-3 -right-3 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 10 }}><CloseIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-80 flex-shrink-0">
                        <div className="sticky top-24 bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            <h3 className="text-xl font-bold mb-4">Add your signature</h3>
                            <div className="space-y-3">
                                <button onClick={() => addSignatureToCanvas('signature')} className="w-full p-3 border rounded-md flex items-center justify-center gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <span className="font-semibold">Signature</span>
                                    {signature?.signature && <img src={signature.signature} alt="Sig" className="h-8"/>}
                                </button>
                                <button onClick={() => addSignatureToCanvas('initials')} className="w-full p-3 border rounded-md flex items-center justify-center gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <span className="font-semibold">Initials</span>
                                    {signature?.initials && <img src={signature.initials} alt="Init" className="h-8"/>}
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button onClick={handleProcess} disabled={state === ProcessingState.Processing || canvasItems.length === 0} className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors ${tool.color} ${tool.hoverColor} disabled:bg-gray-400`}>
                                    {state === ProcessingState.Processing ? 'Processing...' : 'Sign'} <RightArrowIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <WhoWillSignModal isOpen={isWhoWillSignModalOpen} onClose={handleReset} onOnlyMe={handleOnlyMeSign} onSeveralPeople={() => alert("Inviting others is a premium feature coming soon!")} />
            <SignatureModal isOpen={isSignatureModalOpen} onClose={() => { setIsSignatureModalOpen(false); if (!signature?.signature) handleReset(); }} onSave={handleSignatureSave} />
        </ToolPageLayout>
    );
};

export default SignPdf;
