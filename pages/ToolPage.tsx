import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import FileUpload from '../components/FileUpload.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { TrashIcon, UploadCloudIcon, EditIcon, ImageIcon, CameraIcon, CloseIcon, UploadIcon, RotateIcon, LockIcon, UnlockIcon } from '../components/icons.tsx';

import { PDFDocument, rgb, degrees, StandardFonts, PDFRef, PDFFont, PageSizes, BlendMode } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import { Document, Packer, Paragraph } from 'docx';
import mammoth from 'mammoth';
import PptxGenJS from 'pptxgenjs';
import Tesseract from 'tesseract.js';
import pixelmatch from 'pixelmatch';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { readPsd } from 'ag-psd';
import { removeBackground } from '@imgly/background-removal';


// Setup for pdfjs worker. This is a one-time setup.
const setupPdfjs = async () => {
    // Ensure this runs only once
    if ((window as any).pdfjsWorkerInitialized) return;
    
    // Using the version from the loaded module is more robust
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
    (window as any).pdfjsWorkerInitialized = true;
};
setupPdfjs();


enum ProcessingState {
  Idle = "IDLE",
  Processing = "PROCESSING",
  Success = "SUCCESS",
  Error = "ERROR"
}

interface PdfPage {
    originalIndex: number;
    imageDataUrl: string;
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

interface ComparisonResult {
    pageNumber: number;
    img1DataUrl: string;
    img2DataUrl: string;

    diffDataUrl: string;
    diffPercentage: number;
}

interface EditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (data: Partial<CanvasItem>, type: CanvasItem['type']) => void;
    type: 'signature' | 'text' | 'image'
}

type FilterType = 'original' | 'lighten' | 'magic_color' | 'bw' | 'bw2';

const applyFilter = (imageDataUrl: string, filter: FilterType): Promise<string> => {
    return new Promise((resolve) => {
        if (filter === 'original') {
            return resolve(imageDataUrl);
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(imageDataUrl);

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            switch (filter) {
                case 'lighten':
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = Math.min(255, data[i] + 25); // R
                        data[i + 1] = Math.min(255, data[i + 1] + 25); // G
                        data[i + 2] = Math.min(255, data[i + 2] + 25); // B
                    }
                    break;
                case 'magic_color':
                    const contrast = 40;
                    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = factor * (data[i] - 128) + 128; // R
                        data[i+1] = factor * (data[i+1] - 128) + 128; // G
                        data[i+2] = factor * (data[i+2] - 128) + 128; // B
                        // Teal tint
                        data[i] = data[i] * 0.95;
                        data[i+1] = data[i+1] * 1.02;
                        data[i+2] = data[i+2] * 1.05;
                    }
                    break;
                case 'bw': // High contrast B&W
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        const value = gray > 128 ? 255 : 0;
                        data[i] = data[i + 1] = data[i + 2] = value;
                    }
                    break;
                case 'bw2': // Grayscale
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        data[i] = data[i + 1] = data[i + 2] = gray;
                    }
                    break;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.src = imageDataUrl;
    });
};

const FilterBar: React.FC<{ onFilterChange: (filter: FilterType) => void, activeFilter: FilterType }> = ({ onFilterChange, activeFilter }) => {
    const filters: { name: string; id: FilterType }[] = [
      { name: 'Original', id: 'original' },
      { name: 'Lighten', id: 'lighten' },
      { name: 'Magic Color', id: 'magic_color' },
      { name: 'B&W', id: 'bw' },
      { name: 'Grayscale', id: 'bw2' },
    ];
    return (
      <div className="flex justify-center space-x-2 overflow-x-auto p-2 no-scrollbar">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`px-4 py-2 rounded-md font-semibold text-sm whitespace-nowrap transition-all ${activeFilter === f.id ? 'bg-brand-red text-white ring-2 ring-offset-2 ring-brand-red dark:ring-offset-black' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            {f.name}
          </button>
        ))}
      </div>
    );
};

interface ScannedPage {
    id: number;
    original: string;
    filtered: string;
    filter: FilterType;
}

const DocumentScannerUI = ({ tool }: { tool: Tool }): React.ReactElement => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
    const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError('');
        if (acceptedFiles.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const newPage = { id: Date.now(), original: dataUrl, filtered: dataUrl, filter: 'original' as FilterType };
                setScannedPages(p => [...p, newPage]);
                setSelectedPageIndex(scannedPages.length);
            };
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, [scannedPages.length]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop, noClick: true, noKeyboard: true,
        accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] }
    });

    const startCamera = useCallback(async () => {
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError('Could not access the camera. Please ensure you have given permission in your browser settings.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
      startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);

    const capturePage = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const newPage = { id: Date.now(), original: dataUrl, filtered: dataUrl, filter: 'original' as FilterType };
                setScannedPages(p => [...p, newPage]);
                setSelectedPageIndex(scannedPages.length);
                stopCamera();
            }
        }
    };

    const handleFilterChange = async (filter: FilterType) => {
        if (selectedPageIndex === null) return;
        const page = scannedPages[selectedPageIndex];
        if (page.filter === filter) return;

        const filteredImage = await applyFilter(page.original, filter);
        setScannedPages(pages => pages.map((p, i) => i === selectedPageIndex ? { ...p, filtered: filteredImage, filter } : p));
    };
    
    const rotateImage = (imageSrc: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                canvas.width = img.height;
                canvas.height = img.width;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(90 * Math.PI / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.src = imageSrc;
        });
    };
    
    const handleRotatePage = async (index: number) => {
        const page = scannedPages[index];
        const rotatedOriginal = await rotateImage(page.original);
        const filteredAfterRotation = await applyFilter(rotatedOriginal, page.filter);
        setScannedPages(pages => pages.map((p, i) => i === index ? { ...p, original: rotatedOriginal, filtered: filteredAfterRotation } : p));
    };

    const removePage = (index: number) => {
        setScannedPages(prevPages => {
            const newPages = prevPages.filter((_, i) => i !== index);
            setSelectedPageIndex(prevSelected => {
                if (prevSelected === null) return null;
                if (newPages.length === 0) return null;
                if (prevSelected === index) return 0;
                if (prevSelected > index) return prevSelected - 1;
                return prevSelected;
            });
            return newPages;
        });
    };

    const generatePdf = async () => {
        if (scannedPages.length === 0) return;
        setProcessing(true);
        setError('');
        try {
            const pdfDoc = await PDFDocument.create();
            for (const pageData of scannedPages) {
                const imageBytes = await fetch(pageData.filtered).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedJpg(imageBytes);
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
            }
            const pdfBytes = await pdfDoc.save();
            setPdfBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
        } catch (err) {
            console.error("Error generating PDF:", err);
            setError('Failed to generate PDF.');
        } finally {
            setProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scanned_document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const selectedPage = selectedPageIndex !== null ? scannedPages[selectedPageIndex] : null;

    if (stream) {
        return (
            <div className="w-full max-w-4xl bg-black p-4 rounded-lg shadow-xl relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg"></video>
                <div className="absolute inset-0 border-4 border-dashed border-red-500/50 m-4 rounded-lg pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
                    <button onClick={capturePage} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Capture</button>
                    <button onClick={stopCamera} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Close</button>
                </div>
            </div>
        )
    }

    if (pdfBlob) {
        return (
            <div className="text-center bg-white dark:bg-black p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-green-600">PDF Ready!</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Your scanned document is ready for download.</p>
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">Download PDF</button>
                    <button onClick={() => { setPdfBlob(null); setScannedPages([]); setSelectedPageIndex(null); }} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold py-3 px-8 rounded-lg text-lg transition-colors">Scan Again</button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl space-y-4">
            {error && <div className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4">{error}</div>}
            
            {scannedPages.length === 0 ? (
                 <div {...getRootProps()} className={`text-center p-12 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                     <input {...getInputProps()} />
                     <p className="mb-4 font-semibold text-lg text-gray-800 dark:text-gray-200">Start by adding a page</p>
                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <button onClick={(e) => { e.stopPropagation(); startCamera(); }} className={`flex items-center gap-2 justify-center flex-1 ${tool.color} ${tool.hoverColor} text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors`}>
                             <CameraIcon className="h-6 w-6"/> Use Camera
                         </button>
                         <button type="button" onClick={(e) => { e.stopPropagation(); open(); }} className="w-full flex items-center gap-2 justify-center flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                             <UploadIcon className="h-6 w-6"/> Upload File
                         </button>
                     </div>
                     <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Or drag and drop image files onto this area</p>
                 </div>
            ) : (
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-xl space-y-4">
                    <div className="h-[50vh] bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center p-2 shadow-inner">
                        {selectedPage ? (
                            <img src={selectedPage.filtered} alt={`Page ${selectedPageIndex! + 1}`} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <p className="text-gray-500">Select a page to view and edit</p>
                        )}
                    </div>
                    {selectedPage && <FilterBar onFilterChange={handleFilterChange} activeFilter={selectedPage.filter} />}
                    <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
                        <div {...getRootProps()} className="flex items-center gap-4 overflow-x-auto p-2 no-scrollbar">
                             <input {...getInputProps()} />
                             {scannedPages.map((page, index) => (
                                 <div key={page.id} onClick={() => setSelectedPageIndex(index)} className="relative flex-shrink-0 w-24 h-32 cursor-pointer group">
                                     <img src={page.filtered} alt={`thumbnail ${index+1}`} className={`w-full h-full object-cover rounded-md border-2 ${selectedPageIndex === index ? 'border-brand-red' : 'border-transparent'}`} />
                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                         <button onClick={(e) => { e.stopPropagation(); handleRotatePage(index) }} className="text-white bg-blue-600/80 rounded-full p-1.5 hover:bg-blue-600"><RotateIcon className="h-4 w-4"/></button>
                                         <button onClick={(e) => { e.stopPropagation(); removePage(index) }} className="text-white bg-red-600/80 rounded-full p-1.5 hover:bg-red-600"><TrashIcon className="h-4 w-4"/></button>
                                     </div>
                                 </div>
                             ))}
                             <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-32 p-2 border-2 border-dashed rounded-md text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors">
                                <button onClick={(e) => { e.stopPropagation(); startCamera(); }} className="w-full text-center p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><CameraIcon className="h-5 w-5 mx-auto"/> <span className="text-xs">Camera</span></button>
                                <button onClick={(e) => { e.stopPropagation(); open(); }} className="w-full text-center p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><UploadIcon className="h-5 w-5 mx-auto"/> <span className="text-xs">Upload</span></button>
                             </div>
                        </div>
                    </div>
                     <div className="text-center">
                        <button onClick={generatePdf} disabled={processing} className={`w-full max-w-sm ${tool.color} ${tool.hoverColor} text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors disabled:bg-gray-400`}>
                            {processing ? 'Generating...' : `Generate PDF (${scannedPages.length} pages)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const EditorModal: React.FC<EditorModalProps> = ({ isOpen, onClose, onApply, type }) => {
    const [activeTab, setActiveTab] = useState<'type' | 'initials' | 'upload'>(type === 'text' ? 'type' : 'upload');
    const [fullName, setFullName] = useState('');
    const [initials, setInitials] = useState('');

    const signatureFonts = ['Pacifico', 'Dancing Script', 'Caveat', 'Great Vibes', 'Homemade Apple', 'Kalam'];
    const [selectedFont, setSelectedFont] = useState(signatureFonts[0]);
    const signatureColors = [ { name: 'Black', value: '#000000' }, { name: 'Blue', value: '#0d6efd' }, { name: 'Red', value: '#dc3545' }, { name: 'Green', value: '#198754' }];
    const [selectedColor, setSelectedColor] = useState(signatureColors[0].value);
    
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    useEffect(() => {
        if(type === 'text') setActiveTab('type');
        else if (type === 'image') setActiveTab('upload');
    }, [type]);

    useEffect(() => {
        const words = fullName.trim().split(' ');
        const first = words[0] ? words[0][0] : '';
        const last = words.length > 1 ? words[words.length - 1][0] : '';
        setInitials((first + last).toUpperCase());
    }, [fullName]);
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result as string);
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple: false });

    const handleApply = async () => {
        if (activeTab === 'upload' && uploadedImage) {
            onApply({ dataUrl: uploadedImage }, type === 'image' ? 'image' : 'upload');
        } else {
            const textToRender = activeTab === 'type' ? fullName : initials;
            if (!textToRender) return;
            
            const renderDiv = document.createElement('div');
            renderDiv.innerText = textToRender;
            renderDiv.style.fontFamily = `'${selectedFont}', cursive`;
            renderDiv.style.color = selectedColor;
            renderDiv.style.fontSize = '64px';
            renderDiv.style.padding = '20px';
            renderDiv.style.display = 'inline-block';
            document.body.appendChild(renderDiv);
            
            const canvas = await html2canvas(renderDiv, { backgroundColor: null, scale: 2 });
            document.body.removeChild(renderDiv);
            const dataUrl = canvas.toDataURL('image/png');
            
            const itemType = type === 'text' ? 'text' : (activeTab === 'type' ? 'signature' : 'initials');
            onApply({
                dataUrl,
                text: textToRender,
                font: selectedFont,
                color: selectedColor,
                fontSize: 64
            }, itemType);
        }
        handleClose();
    };

    const handleClose = () => {
        setFullName('');
        setInitials('');
        setUploadedImage(null);
        onClose();
    };
    
    if (!isOpen) return null;

    const titleMap = {
        signature: 'Create Your Signature',
        text: 'Add Text',
        image: 'Upload Image'
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-black w-full max-w-md md:max-w-3xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-center">{titleMap[type]}</h3>
                </div>
                <div className="p-6">
                    {(type === 'signature') && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-4">
                                <button onClick={() => setActiveTab('type')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'type' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Type</button>
                                <button onClick={() => setActiveTab('initials')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'initials' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Initials</button>
                                <button onClick={() => setActiveTab('upload')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'upload' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Upload</button>
                            </nav>
                        </div>
                    )}

                    { (activeTab === 'type' || activeTab === 'initials') && (
                        <div className="py-4 md:flex md:gap-6">
                             <div className="w-full md:w-1/3 space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Text</label>
                                    <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your Text" className="w-full mt-1 px-3 py-2 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md" />
                                </div>
                                {activeTab === 'initials' && <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Initials</label>
                                    <input type="text" value={initials} readOnly className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                                </div>}
                            </div>
                            <div className="w-full md:w-2/3 mt-6 md:mt-0">
                                <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto pr-2">
                                    {signatureFonts.map(font => (
                                        <div key={font} className={`p-3 rounded-md border-2 ${selectedFont === font ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700'}`}>
                                            <label className="flex items-center cursor-pointer">
                                                <input type="radio" name="signature-style" value={font} checked={selectedFont === font} onChange={() => setSelectedFont(font)} className="h-4 w-4 text-brand-red" />
                                                <span style={{ fontFamily: font, color: selectedColor }} className="ml-4 text-2xl sm:text-3xl">{activeTab === 'type' ? (fullName || "Signature") : (initials || "IN")}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <span className="text-sm font-bold mr-3">Color:</span>
                                    {signatureColors.map(color => (
                                        <button key={color.name} onClick={() => setSelectedColor(color.value)} className={`w-6 h-6 rounded-full mr-2 border-2 ${selectedColor === color.value ? 'border-brand-red scale-110' : 'border-transparent'}`} style={{backgroundColor: color.value}}></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    { activeTab === 'upload' && (
                        <div className="py-4">
                            {uploadedImage ? (
                                <div className="text-center">
                                    <img src={uploadedImage} alt="Uploaded signature" className="max-h-40 mx-auto border p-2 bg-gray-100 dark:bg-gray-800" />
                                    <button onClick={() => setUploadedImage(null)} className="mt-2 text-sm text-brand-red hover:underline">Upload another image</button>
                                </div>
                            ) : (
                                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-brand-red bg-red-50' : 'border-gray-300 hover:border-brand-red'}`}>
                                    <input {...getInputProps()} />
                                    <UploadCloudIcon className="h-10 w-10 mx-auto text-gray-400" />
                                    <p className="mt-2 font-semibold">Drop image here or click to upload</p>
                                    <p className="text-xs text-gray-500">PNG or JPG file</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <button onClick={handleClose} className="px-4 py-2 font-semibold">Cancel</button>
                    <button onClick={handleApply} className="px-6 py-2 font-semibold text-white bg-brand-red rounded-md hover:bg-brand-red-dark">Apply</button>
                </div>
            </div>
        </div>
    );
};

const getOutputFilename = (toolId: string, files: File[], options: any): string => {
  const baseName = files.length > 0 ? files[0].name.replace(/\.[^/.]+$/, "") : 'file';
  const firstFile = files.length > 0 ? files[0] : null;

  switch (toolId) {
    case 'merge-pdf': return 'merged.pdf';
    case 'split-pdf': return 'split_files.zip';
    case 'compress-pdf': return `${baseName}_compressed.pdf`;
    case 'rotate-pdf': return `${baseName}_rotated.pdf`;
    case 'protect-pdf': return `${baseName}_protected.pdf`;
    case 'unlock-pdf': return `${baseName}_unlocked.pdf`;
    case 'watermark-pdf': return `${baseName}_watermarked.pdf`;
    case 'page-numbers': return `${baseName}_numbered.pdf`;
    case 'jpg-to-pdf': return `${baseName}.pdf`;
    case 'scan-to-pdf': return 'scanned_document.pdf';
    case 'pdf-to-word': return `${baseName}.docx`;
    case 'pdf-to-jpg': return `${baseName}_images.zip`;
    case 'ocr-pdf': return `${baseName}_ocr.pdf`;
    case 'word-to-pdf': return `${baseName}.pdf`;
    case 'pdf-to-excel': return `${baseName}.xlsx`;
    case 'excel-to-pdf': return `${baseName}.pdf`;
    case 'pdf-to-powerpoint': return `${baseName}.pptx`;
    case 'powerpoint-to-pdf': return `${baseName}.pdf`;
    case 'crop-pdf': return `${baseName}_cropped.pdf`;
    case 'redact-pdf': return `${baseName}_redacted.pdf`;
    case 'repair-pdf': return `${baseName}_repaired.pdf`;
    case 'pdf-to-pdfa': return `${baseName}_pdfa.pdf`;
    case 'edit-pdf': return `${baseName}_edited.pdf`;
    case 'sign-pdf': return `${baseName}_signed.pdf`;
    case 'organize-pdf': return `${baseName}_organized.pdf`;
    case 'remove-background': return `${baseName}_no_bg.png`;
    case 'psd-to-pdf': return `${baseName}.pdf`;
    case 'pdf-to-png': return `${baseName}_images.zip`;
    case 'extract-text': return `${baseName}.txt`;
    case 'zip-maker': return 'archive.zip';
    case 'resize-file': return firstFile ? `${baseName}_resized.${firstFile.name.split('.').pop()}` : 'resized_file';
    case 'resize-image': return files.length > 1 ? 'resized_images.zip' : (firstFile ? `${baseName}_resized.${options.resizeFormat || 'jpg'}` : 'resized_image');
    case 'crop-image': return firstFile ? `${baseName}_cropped.${firstFile.name.split('.').pop()}` : 'cropped_image';
    case 'convert-to-jpg': return files.length > 1 ? 'converted_to_jpg.zip' : `${baseName}.jpg`;
    case 'convert-from-jpg': return files.length > 1 ? 'converted_images.zip' : `${baseName}.${options.convertToFormat || 'png'}`;
    case 'compress-image': return files.length > 1 ? 'compressed_images.zip' : `${baseName}_compressed.jpg`;
    case 'watermark-image': return files.length > 1 ? 'watermarked_images.zip' : `${baseName}_watermarked.png`;
    default: return 'processed-file.pdf';
  }
};

const initialToolOptions = {
    compressionLevel: 'recommended',
    splitMode: 'all', splitRanges: '', splitFixedSize: 1,
    watermarkType: 'text', watermarkText: 'CONFIDENTIAL', watermarkImage: null,
    watermarkFont: 'Helvetica', watermarkSize: 50, watermarkColor: '#e53935',
    watermarkOpacity: 0.5, watermarkPosition: 'center', watermarkTiled: true, watermarkRotation: -45,
    pageNumberPosition: 'bottom-center', pageNumberFormat: 'n', pageNumberStart: 1,
    pageNumberPages: '', pageNumberSize: 12, pageNumberColor: '#000000',
    pageOrientation: 'auto', pageSize: 'fit', pageMargin: 'none',
    imageQuality: 1.5,
    ocrLanguage: 'eng',
    password: '', allowPrinting: true, allowCopying: true, allowModifying: true,
    top: 0, bottom: 0, left: 0, right: 0,
    resizeMode: 'percentage', // Kept for resize-file
    resizePercentage: 50, // Kept for resize-file
    resizePdfCompression: 'recommended',
    // New options for resize-image
    resizeUnit: 'percent',
    resizeWidth: 70,
    resizeHeight: 70,
    maintainAspectRatio: true,
    resizeResolution: 72,
    resizeFormat: 'jpg',
    resizeQuality: 90,
    resizeBackground: '#FFFFFF',
    cropX: 0, cropY: 0, cropWidth: 500, cropHeight: 500,
    convertToFormat: 'png',
    compressionQuality: 0.75,
};

const toolSeoDescriptions: Record<string, string> = {
  'merge-pdf': 'Combine and merge multiple PDF files into a single document online for free. Fast, secure, and no watermarks. Your go-to PDF merger.',
  'split-pdf': 'Split a PDF file into multiple documents or extract specific pages. Our free online PDF splitter is easy to use and secure.',
  'compress-pdf': 'Reduce the file size of your PDFs online for free. Our PDF compressor maintains the best quality while making files smaller and easier to share.',
  'jpg-to-pdf': 'Convert JPG, PNG, and other images to PDF format. Create a PDF from your images quickly and securely with our free online converter.',
  'pdf-to-word': 'Convert your PDF documents to editable Microsoft Word files (DOCX). Accurate and free conversion for your documents.',
  'remove-background': 'Automatically remove the background from any image with our AI-powered tool. Get a transparent background in seconds, for free.',
  'sign-pdf': 'Sign PDF documents yourself or request electronic signatures from others. Secure, legally binding, and free for basic use.',
  'edit-pdf': 'Edit PDF files online for free. Add text, images, shapes, and annotations to your documents with our powerful PDF editor.',
  'protect-pdf': 'Protect your sensitive PDF files with a strong password. Our free online tool encrypts your documents to keep them secure.'
};

const ToolPage = (): React.ReactElement => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const originalMetas = useRef<{title: string, desc: string, keywords: string} | null>(null);

  const [tool, setTool] = useState<Tool | null>(null);
  const [state, setState] = useState<ProcessingState>(ProcessingState.Idle);
  const [errorMessage, setErrorMessage] = useState('');
  const [processedFileBlob, setProcessedFileBlob] = useState<Blob | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [toolOptions, setToolOptions] = useState<any>(initialToolOptions);
  const [progress, setProgress] = useState<{ percentage: number; status: string } | null>(null);
  
  // States for Organize PDF
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  // States for Visual Editors (Sign, Edit, Redact)
  const [pdfPagePreviews, setPdfPagePreviews] = useState<string[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'signature' | 'text' | 'image'>('signature');
  const [activeDrag, setActiveDrag] = useState<{ id: number; offsetX: number; offsetY: number; } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  // States for Redact PDF
  const [redactionAreas, setRedactionAreas] = useState<{ id: number, pageIndex: number, x: number, y: number, width: number, height: number }[]>([]);
  const [isDrawingRedaction, setIsDrawingRedaction] = useState(false);
  const [redactionStartPoint, setRedactionStartPoint] = useState<{ x: number, y: number, pageIndex: number } | null>(null);
  const [currentRedaction, setCurrentRedaction] = useState<{ pageIndex: number, x: number, y: number, width: number, height: number } | null>(null);

  // State for Compare PDF
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);

  // State for resize-image
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);


  const isProcessButtonDisabled = useMemo(() => {
    if (!tool || state === ProcessingState.Processing) return true;
    switch (tool.id) {
        case 'protect-pdf':
            return !toolOptions.password || toolOptions.password.length === 0;
        case 'unlock-pdf':
            return files.length > 0 && (!toolOptions.password || toolOptions.password.length === 0);
        case 'watermark-pdf':
        case 'watermark-image':
            return toolOptions.watermarkType === 'text'
                ? (!toolOptions.watermarkText || toolOptions.watermarkText.trim().length === 0)
                : !toolOptions.watermarkImage;
        default:
            return false;
    }
  }, [tool, toolOptions, state, files]);

  const isVisualProcessButtonDisabled = useMemo(() => {
      if (!tool || state === ProcessingState.Processing) return true;
      switch (tool.id) {
          case 'organize-pdf':
              return pdfPages.length === 0;
          case 'sign-pdf':
          case 'edit-pdf':
              return canvasItems.length === 0;
          case 'redact-pdf':
              return redactionAreas.length === 0;
          default:
              return false;
      }
  }, [tool, pdfPages.length, canvasItems.length, redactionAreas.length, state]);
  
  // Capture original meta info on component mount for SEO and handle updates
  useEffect(() => {
    if (!originalMetas.current) {
        const metaDesc = document.getElementById('meta-description') as HTMLMetaElement;
        const metaKeywords = document.getElementById('meta-keywords') as HTMLMetaElement;
        originalMetas.current = {
            title: document.title,
            desc: metaDesc ? metaDesc.content : '',
            keywords: metaKeywords ? metaKeywords.content : ''
        };
    }
    
    const currentTool = TOOLS.find(t => t.id === toolId);
    
    // Cleanup function runs before next effect or on unmount
    const cleanupSeo = () => {
        const scriptToRemove = document.getElementById('tool-structured-data');
        if (scriptToRemove) scriptToRemove.remove();
    };

    if (currentTool) {
       if (currentTool.isPremium && !user?.isPremium) {
        navigate('/premium-feature', { state: { toolId: currentTool.id } });
        return;
      }
      setTool(currentTool);
      handleReset();

       // SEO Updates
      const newTitle = `${currentTool.title} – I Love PDFLY`;
      const newDescription = toolSeoDescriptions[currentTool.id] || `Use the ${currentTool.title} tool on I Love PDFLY. ${currentTool.description} Fast, free, and secure.`;
      
      const baseKeywords = [
          currentTool.title.toLowerCase(),
          `free ${currentTool.title.toLowerCase()}`,
          `online ${currentTool.title.toLowerCase()}`,
          currentTool.id.replace(/-/g, ' '),
          `ilovepdf ${currentTool.title.toLowerCase()}`,
          'pdf tools',
          'document management',
      ];
      if (currentTool.category?.includes('convert')) {
          baseKeywords.push('pdf converter', 'file converter');
      }
      if (currentTool.category === 'edit') {
          baseKeywords.push('pdf editor', 'edit pdf online');
      }
      if (currentTool.category === 'security') {
          baseKeywords.push('pdf security', 'secure pdf');
      }
      const toolKeywords = [...new Set(baseKeywords)].join(', ');

      document.title = newTitle;
      const metaDesc = document.getElementById('meta-description') as HTMLMetaElement;
      const metaKeywords = document.getElementById('meta-keywords') as HTMLMetaElement;

      if (metaDesc) metaDesc.content = newDescription;
      if (metaKeywords) metaKeywords.content = toolKeywords;

      // Add/Update JSON-LD structured data
      const scriptId = 'tool-structured-data';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.type = 'application/ld+json';
          document.head.appendChild(script);
      }

      const schema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": currentTool.title,
          "applicationCategory": "ProductivityApplication",
          "operatingSystem": "Web",
          "description": currentTool.description,
          "url": `https://ilovepdfly.com/#/${currentTool.id}`,
          "offers": {
              "@type": "Offer",
              "price": currentTool.isPremium ? "5.00" : "0.00",
              "priceCurrency": "USD"
          },
          "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "2500" // Example value
          },
          "publisher": {
            "@type": "Organization",
            "name": "I Love PDFLY"
          }
      };
      script.textContent = JSON.stringify(schema);


    } else {
      const knownGeneratorRoutes = ['invoice-generator', 'cv-generator', 'lesson-plan-creator', 'ai-question-generator', 'ai-image-generator'];
      if (!knownGeneratorRoutes.includes(toolId || '')) {
          navigate('/');
      }
    }

    return cleanupSeo;
  }, [toolId, navigate, user]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!activeDrag || !previewContainerRef.current) return;
        const container = previewContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        
        const x = e.clientX - containerRect.left + container.scrollLeft - activeDrag.offsetX;
        const y = e.clientY - containerRect.top + container.scrollTop - activeDrag.offsetY;

        let currentPageIndex = 0;
        for (let i = 0; i < pdfPagePreviews.length; i++) {
            const pageElement = document.getElementById(`pdf-page-${i}`);
            if (pageElement) {
                if (y >= pageElement.offsetTop && y < pageElement.offsetTop + pageElement.offsetHeight) {
                    currentPageIndex = i;
                    break;
                }
            }
        }
        
        setCanvasItems(items => items.map(item => 
            item.id === activeDrag.id 
                ? { ...item, x, y, pageIndex: currentPageIndex } 
                : item
        ));
    };

    const handleMouseUp = () => {
        if (activeDrag) setActiveDrag(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDrag, pdfPagePreviews.length]);
  
  const handleMouseMoveRedaction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRedaction || !redactionStartPoint || !previewContainerRef.current) return;
    const container = previewContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const currentX = e.clientX - containerRect.left + container.scrollLeft;
    const currentY = e.clientY - containerRect.top + container.scrollTop;

    const width = currentX - redactionStartPoint.x;
    const height = currentY - redactionStartPoint.y;

    setCurrentRedaction({
        pageIndex: redactionStartPoint.pageIndex,
        x: width > 0 ? redactionStartPoint.x : currentX,
        y: height > 0 ? redactionStartPoint.y : currentY,
        width: Math.abs(width),
        height: Math.abs(height)
    });
  };

  const extractPages = async () => {
      if (!tool || files.length === 0) return;
      if (tool.id !== 'compare-pdf' && files.length !== 1) return;
      
      setState(ProcessingState.Processing);
      setProgress({ percentage: 0, status: 'Loading document...' });

      const file = files[0];
      const fileBuffer = await file.arrayBuffer();
      
      try {
          if (['organize-pdf', 'sign-pdf', 'edit-pdf', 'redact-pdf'].includes(tool.id)) {
              const pages: PdfPage[] = [];
              const previews: string[] = [];
              const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

              for (let i = 1; i <= pdf.numPages; i++) {
                  setProgress({ percentage: Math.round((i / pdf.numPages) * 100), status: `Extracting page ${i}` });
                  const page = await pdf.getPage(i);
                  let scale = 1.5;
                  if(tool.id === 'organize-pdf') scale = 0.5;

                  const viewport = page.getViewport({ scale });
                  const canvas = document.createElement('canvas');
                  canvas.width = viewport.width;
                  canvas.height = viewport.height;
                  const context = canvas.getContext('2d')!;
                  await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
                  const dataUrl = canvas.toDataURL(tool.id === 'organize-pdf' ? 'image/png' : 'image/jpeg', 0.8)
                  
                  if(tool.id === 'organize-pdf') pages.push({ originalIndex: i - 1, imageDataUrl: dataUrl });
                  if(['sign-pdf', 'edit-pdf', 'redact-pdf'].includes(tool.id)) previews.push(dataUrl);
              }
              setPdfPages(pages);
              setPdfPagePreviews(previews);
          }
          setState(ProcessingState.Idle);
      } catch (e: any) {
          console.error(e);
          setErrorMessage('Failed to load PDF. The file might be corrupt or protected.');
          setState(ProcessingState.Error);
      } finally {
          setProgress(null);
      }
  };

    useEffect(() => {
        if (tool?.id === 'resize-image' && files.length > 0) {
            const file = files[0]; // Base dimensions on the first image
            const img = new Image();
            img.onload = () => {
                setOriginalImageSize({ width: img.width, height: img.height });
            };
            const url = URL.createObjectURL(file);
            img.src = url;
            
            return () => {
                URL.revokeObjectURL(url);
            }
        } else {
            setOriginalImageSize(null);
        }
    }, [files, tool?.id]);

  useEffect(() => {
    const isVisualTool = ['organize-pdf', 'sign-pdf', 'edit-pdf', 'redact-pdf'].includes(tool?.id || '');
    if (isVisualTool && files.length === 1) {
        extractPages();
    } else {
        if (tool?.id !== 'compare-pdf') {
            setPdfPages([]);
            setPdfPagePreviews([]);
        }
    }
  }, [files, tool?.id]);

  const handleProcess = async () => {
      if (!tool) return;
      const isVisualTool = ['organize-pdf', 'sign-pdf', 'edit-pdf', 'redact-pdf'].includes(tool.id);
      if (files.length === 0 && !isVisualTool) return;
      
      setState(ProcessingState.Processing);
      setErrorMessage('');
      setProcessedFileBlob(null);
      setProgress({ percentage: 0, status: 'Starting process...'});

      try {
        switch (tool.id) {
          case 'merge-pdf': {
            if (files.length < 2) throw new Error("Please select at least two PDF files to merge.");
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                if (file.type !== 'application/pdf') throw new Error(`File "${file.name}" is not a PDF.`);
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            setProcessedFileBlob(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
            break;
          }
          case 'split-pdf': {
            if (files.length !== 1) throw new Error("Please select exactly one PDF file to split.");
            const file = files[0];
            const zip = new JSZip();
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const pageCount = pdfDoc.getPageCount();

            for (let i = 0; i < pageCount; i++) {
                setProgress({ percentage: Math.round(((i + 1) / pageCount) * 100), status: `Splitting page ${i + 1} of ${pageCount}` });
                const newDoc = await PDFDocument.create();
                const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
                newDoc.addPage(copiedPage);
                const newDocBytes = await newDoc.save();
                zip.file(`page_${i + 1}.pdf`, newDocBytes);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            setProcessedFileBlob(zipBlob);
            break;
          }
          case 'compress-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to compress.");
            setProgress({ percentage: 50, status: 'Compressing PDF... This may take a moment.'});
            const pdfBytes = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const useStreams = toolOptions.compressionLevel !== 'basic';
            const compressedBytes = await pdfDoc.save({ useObjectStreams: useStreams });
            setProcessedFileBlob(new Blob([compressedBytes], { type: 'application/pdf' }));
            break;
          }
           case 'organize-pdf': {
            if (files.length !== 1 || pdfPages.length === 0) {
                throw new Error("Please upload a file and ensure pages are loaded.");
            }
            const pdfBytes = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const newPdfDoc = await PDFDocument.create();
            const pageIndicesToCopy = pdfPages.map(p => p.originalIndex);
            
            setProgress({ percentage: 20, status: 'Copying pages...' });
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndicesToCopy);
            
            setProgress({ percentage: 70, status: 'Assembling new PDF...' });
            copiedPages.forEach(page => newPdfDoc.addPage(page));
            
            const newPdfBytes = await newPdfDoc.save();
            setProcessedFileBlob(new Blob([newPdfBytes], { type: 'application/pdf' }));
            break;
          }
          case 'rotate-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to rotate.");
            const rotation = toolOptions.rotation || 90;
            const pdfBytes = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            pages.forEach(page => page.setRotation(degrees(page.getRotation().angle + rotation)));
            const rotatedBytes = await pdfDoc.save();
            setProcessedFileBlob(new Blob([rotatedBytes], { type: 'application/pdf' }));
            break;
          }
          case 'protect-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to protect.");
            if (!toolOptions.password) throw new Error("Please enter a password.");
            const pdfBytes = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const protectedBytes = await pdfDoc.save({ userPassword: toolOptions.password, ownerPassword: toolOptions.password } as any);
            setProcessedFileBlob(new Blob([protectedBytes], { type: 'application/pdf' }));
            break;
          }
          case 'unlock-pdf': {
              if (files.length !== 1) throw new Error("Please select one PDF file to unlock.");
              if (!toolOptions.password) throw new Error("Please enter the password to unlock the file.");
              const pdfBytes = await files[0].arrayBuffer();
              const pdfDoc = await PDFDocument.load(pdfBytes, { password: toolOptions.password } as any);
              const unlockedBytes = await pdfDoc.save();
              setProcessedFileBlob(new Blob([unlockedBytes], { type: 'application/pdf' }));
              break;
          }
          case 'watermark-pdf': {
              if (files.length !== 1) throw new Error("Please select one PDF file to watermark.");
              if (!toolOptions.watermarkText) throw new Error("Please enter watermark text.");
              const pdfBytes = await files[0].arrayBuffer();
              const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              const pages = pdfDoc.getPages();
              pages.forEach(page => {
                  const { width, height } = page.getSize();
                  page.drawText(toolOptions.watermarkText, {
                      x: width / 2 - 150,
                      y: height / 2,
                      font,
                      size: 50,
                      color: rgb(0.9, 0.2, 0.2),
                      opacity: 0.5,
                      rotate: degrees(45)
                  });
              });
              const watermarkedBytes = await pdfDoc.save();
              setProcessedFileBlob(new Blob([watermarkedBytes], { type: 'application/pdf' }));
            break;
          }
          case 'page-numbers': {
              if (files.length !== 1) throw new Error("Please select one PDF file to add page numbers.");
              const pdfBytes = await files[0].arrayBuffer();
              const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              const pages = pdfDoc.getPages();
              pages.forEach((page, i) => {
                  const { width } = page.getSize();
                  page.drawText(`${i + 1} / ${pages.length}`, {
                      x: width / 2 - 20,
                      y: 20,
                      font,
                      size: 12,
                      color: rgb(0, 0, 0)
                  });
              });
              const numberedBytes = await pdfDoc.save();
              setProcessedFileBlob(new Blob([numberedBytes], { type: 'application/pdf' }));
              break;
          }
          case 'jpg-to-pdf': {
              if (files.length === 0) throw new Error("Please select one or more image files.");
              const pdfDoc = await PDFDocument.create();
              for (const [index, file] of files.entries()) {
                  setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Adding image ${index + 1} of ${files.length}` });
                  const imageBytes = await file.arrayBuffer();
                  const image = await (file.type === 'image/png' ? pdfDoc.embedPng(imageBytes) : pdfDoc.embedJpg(imageBytes));
                  const page = pdfDoc.addPage([image.width, image.height]);
                  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
              }
              const pdfBytes = await pdfDoc.save();
              setProcessedFileBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
              break;
          }
          case 'pdf-to-jpg': {
            if (files.length !== 1) throw new Error("Please select one PDF file.");
            const file = files[0];
            const zip = new JSZip();
            const pdfData = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const numPages = pdf.numPages;
            
            for (let i = 1; i <= numPages; i++) {
                setProgress({ percentage: Math.round((i / numPages) * 100), status: `Converting page ${i} of ${numPages}` });
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d')!;
                await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
                
                const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.9));
                zip.file(`page_${i}.jpg`, blob);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            setProcessedFileBlob(zipBlob);
            break;
          }
          case 'pdf-to-png': {
            if (files.length !== 1) throw new Error("Please select one PDF file.");
            const file = files[0];
            const zip = new JSZip();
            const pdfData = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const numPages = pdf.numPages;
            
            for (let i = 1; i <= numPages; i++) {
                setProgress({ percentage: Math.round((i / numPages) * 100), status: `Converting page ${i} of ${numPages}` });
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d')!;
                await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
                
                const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
                zip.file(`page_${i}.png`, blob);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            setProcessedFileBlob(zipBlob);
            break;
          }
          case 'pdf-to-word': {
            if (files.length !== 1) throw new Error("Please select one PDF file.");
            const file = files[0];
            const pdfData = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            let fullText = '';
            const numPages = pdf.numPages;
            for (let i = 1; i <= numPages; i++) {
                setProgress({ percentage: Math.round(((i - 1) / numPages) * 90), status: `Extracting text from page ${i}` });
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                fullText += pageText + '\n\n';
            }
            
            setProgress({ percentage: 100, status: 'Building Word document...' });
            const doc = new Document({
                sections: [{ children: fullText.split('\n').map(line => new Paragraph(line)) }]
            });
            const blob = await Packer.toBlob(doc);
            setProcessedFileBlob(blob);
            break;
          }
          case 'word-to-pdf': {
             if (files.length !== 1) throw new Error("Please select one DOCX file.");
             const file = files[0];
             const arrayBuffer = await file.arrayBuffer();
             
             setProgress({ percentage: 20, status: 'Converting DOCX to HTML...' });
             let html;
             try {
                 const result = await mammoth.convertToHtml({ arrayBuffer });
                 html = result.value;
             } catch (e: any) {
                const errorMessage = String(e?.message || '');
                if (errorMessage.includes('Could not find the body element')) {
                    throw new Error("Invalid DOCX file. The file might be corrupted or an old .doc format. Please save it as .docx and try again.");
                }
                throw new Error(`Failed to process Word file. The file may be corrupted. Error: ${errorMessage}`);
             }

             const container = document.createElement('div');
             container.innerHTML = html;
             container.style.padding = '20px';
             container.style.width = '210mm'; // A4 width
             container.style.background = 'white';
             document.body.appendChild(container);

             setProgress({ percentage: 60, status: 'Rendering document...' });
             const canvas = await html2canvas(container, { scale: 2 });
             document.body.removeChild(container);
             
             setProgress({ percentage: 90, status: 'Generating PDF...' });
             const imgData = canvas.toDataURL('image/png');
             const pdf = new jsPDF('p', 'mm', 'a4');
             const pdfWidth = pdf.internal.pageSize.getWidth();
             const pdfHeight = pdf.internal.pageSize.getHeight();
             const canvasWidth = canvas.width;
             const canvasHeight = canvas.height;
             const ratio = canvasWidth / pdfWidth;
             const scaledHeight = canvasHeight / ratio;
             
             let heightLeft = scaledHeight;
             let position = 0;
             
             pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
             heightLeft -= pdfHeight;

             while (heightLeft > 0) {
                 position = heightLeft - scaledHeight;
                 pdf.addPage();
                 pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
                 heightLeft -= pdfHeight;
             }
             const blob = pdf.output('blob');
             setProcessedFileBlob(blob);
             break;
          }
          case 'pdf-to-excel': {
            if (files.length !== 1) throw new Error("Please select one PDF file.");
            const file = files[0];
            const pdfData = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            const wb = XLSX.utils.book_new();
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                setProgress({ percentage: Math.round(((i - 1) / numPages) * 90), status: `Processing page ${i} of ${numPages}` });
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const data = textContent.items.map(item => ('str' in item ? [item.str] : [''])); // Simple one-column extraction
                const ws = XLSX.utils.aoa_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
            }
            
            setProgress({ percentage: 100, status: 'Generating Excel file...' });
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            setProcessedFileBlob(new Blob([wbout], { type: 'application/octet-stream' }));
            break;
          }
          case 'excel-to-pdf': {
            if (files.length !== 1) throw new Error("Please select one Excel file.");
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            
            setProgress({ percentage: 20, status: 'Reading Excel file...' });
            let workbook;
            try {
                workbook = XLSX.read(arrayBuffer, { type: 'array' });
            } catch (e: any) {
                const errorMessage = String(e?.message || 'Unknown error');
                throw new Error(`Failed to read the Excel file. It might be corrupted or in an unsupported format. Error: ${errorMessage}`);
            }
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error("The selected Excel file appears to be empty or contains no sheets.");
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);

            setProgress({ percentage: 60, status: 'Rendering spreadsheet...' });
            const container = document.createElement('div');
            container.innerHTML = `<style>table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 10px; } th, td { border: 1px solid #dddddd; text-align: left; padding: 4px; } th { background-color: #f2f2f2; }</style>${html}`;
            container.style.padding = '10px';
            container.style.width = 'fit-content';
            container.style.background = 'white';
            document.body.appendChild(container);

            const canvas = await html2canvas(container, { scale: 2 });
            document.body.removeChild(container);

            setProgress({ percentage: 90, status: 'Generating PDF...' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const scaledHeight = canvasHeight / ratio;

            let heightLeft = scaledHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - scaledHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
                heightLeft -= pdfHeight;
            }
            const blob = pdf.output('blob');
            setProcessedFileBlob(blob);
            break;
          }
          case 'pdf-to-powerpoint': {
            if (files.length !== 1) throw new Error("Please select one PDF file.");
            const file = files[0];
            const pdfData = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

            const pptx = new PptxGenJS();
            pptx.layout = 'LAYOUT_16x9';

            const numPages = pdf.numPages;
            for (let i = 1; i <= numPages; i++) {
                setProgress({ percentage: Math.round(((i-1) / numPages) * 100), status: `Processing page ${i}` });
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d')!;
                await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;

                const slide = pptx.addSlide();
                const imgData = canvas.toDataURL('image/png');
                slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
            }
            
            setProgress({ percentage: 100, status: 'Generating PowerPoint file...' });
            const pptxBlob = await (pptx.write({ outputType: 'blob' }) as Promise<Blob>);
            setProcessedFileBlob(pptxBlob);
            break;
          }
          case 'powerpoint-to-pdf': {
            if (files.length !== 1) throw new Error("Please select one PPTX file.");
            const file = files[0];
            const pdfDoc = await PDFDocument.create();
            const zip = await JSZip.loadAsync(await file.arrayBuffer());

            const imagePromises: Promise<{ name: string, data: Uint8Array }>[] = [];
            zip.folder("ppt/media")?.forEach((relativePath, fileEntry) => {
                if (/\.(jpe?g|png|gif|bmp|tiff)$/i.test(relativePath)) {
                    imagePromises.push(
                        fileEntry.async("uint8array").then(data => ({ name: relativePath, data }))
                    );
                }
            });

            if (imagePromises.length === 0) {
                throw new Error("No images could be extracted. This tool works by converting each slide into an image. Please ensure your PowerPoint file contains slides with visual content.");
            }

            const images = await Promise.all(imagePromises);
            setProgress({ percentage: 50, status: 'Extracting images from PowerPoint...'});
            images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

            for (const [index, image] of images.entries()) {
                setProgress({ percentage: 50 + Math.round(((index + 1) / images.length) * 50), status: `Adding image ${index + 1}`});
                try {
                    let embeddedImage;
                    if (image.name.toLowerCase().endsWith('.png')) {
                        embeddedImage = await pdfDoc.embedPng(image.data);
                    } else {
                        embeddedImage = await pdfDoc.embedJpg(image.data);
                    }
                    
                    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
                    page.drawImage(embeddedImage, { x: 0, y: 0, width: embeddedImage.width, height: embeddedImage.height });
                } catch (e) {
                    console.warn(`Could not embed image ${image.name}:`, e);
                }
            }

            if (pdfDoc.getPageCount() === 0) {
                throw new Error("No compatible images could be extracted from the PowerPoint file.");
            }

            const pdfBytes = await pdfDoc.save();
            setProcessedFileBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
            break;
          }
          case 'ocr-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file for OCR.");
            const file = files[0];
            const worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress({ percentage: Math.round(m.progress * 90), status: m.status });
                    }
                },
            });

            const pdfData = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const numPages = pdf.numPages;
            
            const ocrPdf = await PDFDocument.create();
            const font = await ocrPdf.embedFont(StandardFonts.Helvetica);

            for (let i = 1; i <= numPages; i++) {
                setProgress({ percentage: Math.round(((i-1)/numPages)*90), status: `Processing page ${i} of ${numPages}`});
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 }); // Higher scale for better OCR
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d')!;
                await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;

                const { data: ocrData } = await worker.recognize(canvas);
                
                const imageData = canvas.toDataURL('image/jpeg', 0.9);
                const imageBytes = await fetch(imageData).then(res => res.arrayBuffer());
                const pdfImage = await ocrPdf.embedJpg(imageBytes);

                const newPage = ocrPdf.addPage([viewport.width, viewport.height]);
                newPage.drawImage(pdfImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });

                if (ocrData && Array.isArray((ocrData as any).words)) {
                    for (const word of (ocrData as any).words) {
                        if (word.confidence < 50) continue;
                        const { x0, y1, y0 } = word.bbox;
                        const fontSize = y1 - y0;
                        
                        newPage.drawText(word.text, {
                            x: x0,
                            y: viewport.height - y1,
                            font,
                            size: fontSize,
                            opacity: 0,
                        });
                    }
                }
            }
            await worker.terminate();
            setProgress({ percentage: 100, status: "Finalizing PDF..." });
            const pdfBytes = await ocrPdf.save();
            setProcessedFileBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
            break;
          }
           case 'crop-pdf': {
                if (files.length !== 1) throw new Error("Please select one PDF file to crop.");
                const { top = 0, bottom = 0, left = 0, right = 0 } = toolOptions;
                const pdfBytes = await files[0].arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const pages = pdfDoc.getPages();
                pages.forEach(page => {
                    const { width, height } = page.getSize();
                    page.setCropBox(left, bottom, width - left - right, height - top - bottom);
                });
                const croppedBytes = await pdfDoc.save();
                setProcessedFileBlob(new Blob([croppedBytes], { type: 'application/pdf' }));
                break;
            }
            case 'compare-pdf': {
                if (files.length !== 2) throw new Error("Please select exactly two PDF files to compare.");
                
                const results: ComparisonResult[] = [];
                const file1 = files[0];
                const file2 = files[1];

                const pdf1 = await pdfjsLib.getDocument({ data: await file1.arrayBuffer() }).promise;
                const pdf2 = await pdfjsLib.getDocument({ data: await file2.arrayBuffer() }).promise;
                
                const numPages = Math.max(pdf1.numPages, pdf2.numPages);

                for(let i=1; i<=numPages; i++){
                     setProgress({ percentage: Math.round((i / numPages) * 100), status: `Comparing page ${i}` });

                    const renderPage = async (pdf: PDFDocumentProxy, pageNum: number) => {
                         if(pageNum > pdf.numPages) return null;
                         const page = await pdf.getPage(pageNum);
                         const viewport = page.getViewport({ scale: 1.5 });
                         const canvas = document.createElement('canvas');
                         canvas.width = viewport.width;
                         canvas.height = viewport.height;
                         const context = canvas.getContext('2d')!;
                         await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
                         return canvas;
                    }
                    
                    const canvas1 = await renderPage(pdf1, i);
                    const canvas2 = await renderPage(pdf2, i);
                    
                    const width = Math.max(canvas1?.width || 0, canvas2?.width || 0);
                    const height = Math.max(canvas1?.height || 0, canvas2?.height || 0);

                    const diffCanvas = document.createElement('canvas');
                    diffCanvas.width = width;
                    diffCanvas.height = height;
                    const diffCtx = diffCanvas.getContext('2d')!;

                    const getImageData = (canvas: HTMLCanvasElement | null, width: number, height: number) => {
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = width;
                        tempCanvas.height = height;
                        const ctx = tempCanvas.getContext('2d')!;
                        if (canvas) {
                            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
                        }
                        return ctx.getImageData(0, 0, width, height);
                    };

                    const img1Data = getImageData(canvas1, width, height);
                    const img2Data = getImageData(canvas2, width, height);
                    const diffImageData = diffCtx.createImageData(width, height);
                    
                    const numDiffPixels = pixelmatch(img1Data.data, img2Data.data, diffImageData.data, width, height, { threshold: 0.1, includeAA: true });
                    diffCtx.putImageData(diffImageData, 0, 0);

                    results.push({
                        pageNumber: i,
                        img1DataUrl: canvas1?.toDataURL() || '',
                        img2DataUrl: canvas2?.toDataURL() || '',
                        diffDataUrl: diffCanvas.toDataURL(),
                        diffPercentage: (width * height) > 0 ? (numDiffPixels / (width * height)) * 100 : 0,
                    });
                }

                setComparisonResults(results);
                setProcessedFileBlob(null); // No download for this tool
                break;
            }
            case 'edit-pdf': case 'sign-pdf': {
                if (files.length !== 1 || canvasItems.length === 0) {
                    throw new Error("Please upload a PDF and add at least one item (text, image, or signature).");
                }
                const pdfBytes = await files[0].arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                
                setProgress({ percentage: 20, status: 'Applying edits...'});
                for (const [i, item] of canvasItems.entries()) {
                    setProgress({ percentage: 20 + Math.round((i / canvasItems.length) * 70), status: `Applying item ${i+1}`});
                    const page = pdfDoc.getPages()[item.pageIndex];
                    const pageElement = document.getElementById(`pdf-page-${item.pageIndex}`);
                    if (!page || !pageElement) continue;

                    const scale = pageElement.getBoundingClientRect().width / page.getWidth();

                    const itemXOnPage = item.x - pageElement.offsetLeft;
                    const itemYOnPage = item.y - pageElement.offsetTop;

                    const pdfX = itemXOnPage / scale;
                    const pdfY = page.getHeight() - (itemYOnPage / scale) - (item.height / scale);
                    
                    if (item.dataUrl) {
                        const imageBytes = await fetch(item.dataUrl).then(res => res.arrayBuffer());
                        const embeddedImage = item.dataUrl.startsWith('data:image/png') 
                           ? await pdfDoc.embedPng(imageBytes) 
                           : await pdfDoc.embedJpg(imageBytes);
                       page.drawImage(embeddedImage, {
                           x: pdfX, y: pdfY,
                           width: item.width / scale, height: item.height / scale,
                       });
                    }
                }
                
                setProgress({ percentage: 100, status: 'Saving document...'});
                const finalBytes = await pdfDoc.save();
                setProcessedFileBlob(new Blob([finalBytes], { type: 'application/pdf' }));
                break;
            }
            case 'remove-background': {
                if (files.length !== 1) throw new Error("Please select one image file to remove the background.");
                setProgress({ percentage: 10, status: 'Loading model... This might take a moment.'});
                setProgress({ percentage: 50, status: 'Processing image...'});
                const blob = await removeBackground(files[0], {
                    progress: (key, current, total) => {
                        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
                        setProgress({ percentage, status: `Processing: ${key}` });
                    }
                });
                setProcessedFileBlob(blob);
                break;
          }
          case 'repair-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to repair.");
            const pdfBytes = await files[0].arrayBuffer();
            setProgress({ percentage: 30, status: 'Attempting to repair file structure...'});
            const pdfDoc = await PDFDocument.load(pdfBytes, {
                updateMetadata: false,
                ignoreEncryption: true
            });
            setProgress({ percentage: 70, status: 'Rebuilding and saving PDF...'});
            const repairedBytes = await pdfDoc.save();
            setProcessedFileBlob(new Blob([repairedBytes], { type: 'application/pdf' }));
            break;
          }
          case 'pdf-to-pdfa': {
            if (files.length !== 1) throw new Error("Please select one PDF file to convert.");
            const pdfBytes = await files[0].arrayBuffer();
            setProgress({ percentage: 30, status: 'Loading PDF document...'});
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            pdfDoc.setProducer('I Love PDFLY');
            pdfDoc.setCreator('I Love PDFLY');
            pdfDoc.setTitle(files[0].name);
            pdfDoc.setModificationDate(new Date());

            setProgress({ percentage: 70, status: 'Re-saving with standardized metadata...'});
            const pdfaBytes = await pdfDoc.save();
            setProcessedFileBlob(new Blob([pdfaBytes], { type: 'application/pdf' }));
            break;
          }
          case 'redact-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to redact.");
            if (redactionAreas.length === 0) throw new Error("Please draw at least one redaction area.");
            
            const pdfBytes = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            setProgress({ percentage: 20, status: 'Applying redactions...'});

            for (const [i, area] of redactionAreas.entries()) {
                setProgress({ percentage: 20 + Math.round((i / redactionAreas.length) * 70), status: `Redacting area ${i+1}`});
                const page = pdfDoc.getPages()[area.pageIndex];
                const pageElement = document.getElementById(`pdf-page-${area.pageIndex}`);
                if (!page || !pageElement) continue;

                const scale = pageElement.getBoundingClientRect().width / page.getWidth();
                
                const areaXOnPage = area.x - pageElement.offsetLeft;
                const areaYOnPage = area.y - pageElement.offsetTop;

                const pdfX = areaXOnPage / scale;
                const pdfY = page.getHeight() - (areaYOnPage / scale) - (area.height / scale);
                const pdfWidth = area.width / scale;
                const pdfHeight = area.height / scale;

                page.drawRectangle({
                    x: pdfX,
                    y: pdfY,
                    width: pdfWidth,
                    height: pdfHeight,
                    color: rgb(0, 0, 0),
                });
            }
            
            setProgress({ percentage: 100, status: 'Saving document...'});
            const redactedBytes = await pdfDoc.save();
            setProcessedFileBlob(new Blob([redactedBytes], { type: 'application/pdf' }));
            break;
          }
          case 'psd-to-pdf': {
            if (files.length !== 1) throw new Error("Please select one PSD file.");
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();

            setProgress({ percentage: 20, status: 'Parsing PSD file...'});
            const psd = readPsd(arrayBuffer);
            
            if (!psd.width || !psd.height || (!psd.imageData && !psd.canvas)) {
                throw new Error("Could not render PSD file. It might be an unsupported format or corrupted.");
            }
            
            setProgress({ percentage: 60, status: 'Generating PDF...'});
            const pdfDoc = await PDFDocument.create();

            const imageCanvas = psd.canvas || (() => {
                const c = document.createElement('canvas');
                c.width = psd.width;
                c.height = psd.height;
                const ctx = c.getContext('2d')!;
                const psdData = psd.imageData;
                if (psdData) {
                    const targetArray = new Uint8ClampedArray(psd.width * psd.height * 4);
                    if (psdData instanceof Uint16Array) {
                        for (let i = 0; i < psdData.length; i++) {
                            targetArray[i] = psdData[i] >> 8; // Convert 16-bit to 8-bit
                        }
                    } else if ('set' in psdData) {
                        targetArray.set(psdData as unknown as ArrayLike<number>);
                    }
                    const imageData = new ImageData(targetArray, psd.width, psd.height);
                    ctx.putImageData(imageData, 0, 0);
                }
                return c;
            })();
            
            const pngBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
                imageCanvas.toBlob(blob => {
                    if (!blob) {
                      reject(new Error("Canvas to Blob conversion failed"));
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }, 'image/png');
            });

            const pngImage = await pdfDoc.embedPng(pngBytes);
            const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
            page.drawImage(pngImage, { x: 0, y: 0, width: pngImage.width, height: pngImage.height });
            
            const pdfBytes = await pdfDoc.save();
            setProcessedFileBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
            break;
          }
           case 'extract-text': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const pdfData = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                let fullText = '';
                const numPages = pdf.numPages;
                for (let i = 1; i <= numPages; i++) {
                    setProgress({ percentage: Math.round(((i - 1) / numPages) * 100), status: `Extracting text from page ${i}` });
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                    fullText += pageText + '\n\n';
                }
                setProcessedFileBlob(new Blob([fullText], { type: 'text/plain' }));
                break;
            }
            case 'zip-maker': {
                if (files.length === 0) throw new Error("Please select at least one file to zip.");
                const zip = new JSZip();
                for (const [index, file] of files.entries()) {
                    setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Adding file ${index + 1} of ${files.length}` });
                    const fileData = await file.arrayBuffer();
                    zip.file(file.name, fileData);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                setProcessedFileBlob(zipBlob);
                break;
            }
            case 'resize-file': {
                if (files.length !== 1) throw new Error("Please select one file to resize.");
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    const processImageResize = (imgFile: File): Promise<Blob> => new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            let { width, height } = img;
                            if (toolOptions.resizeMode === 'percentage') {
                                width = img.width * (toolOptions.resizePercentage / 100);
                                height = img.height * (toolOptions.resizePercentage / 100);
                            }
                            const canvas = document.createElement('canvas');
                            canvas.width = width;
                            canvas.height = height;
                            canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
                            canvas.toBlob(blob => blob ? resolve(blob) : reject(), file.type);
                        };
                        img.src = URL.createObjectURL(imgFile);
                    });
                    const blob = await processImageResize(file);
                    setProcessedFileBlob(blob);
                } else if (file.type === 'application/pdf') {
                    // This is just compression for now.
                    setProgress({ percentage: 50, status: 'Optimizing PDF... This may take a moment.' });
                    const pdfBytes = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                    const useStreams = toolOptions.resizePdfCompression !== 'basic';
                    const compressedBytes = await pdfDoc.save({ useObjectStreams: useStreams });
                    setProcessedFileBlob(new Blob([compressedBytes], { type: 'application/pdf' }));
                } else {
                    throw new Error(`Unsupported file type for resizing: ${file.type}`);
                }
                break;
            }
            case 'resize-image': {
                if (files.length === 0) throw new Error("Please select one or more images to resize.");
                
                const processImageResize = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        let newWidth, newHeight;
                        if (toolOptions.resizeUnit === 'percent') {
                            newWidth = img.width * (toolOptions.resizeWidth / 100);
                            newHeight = img.height * (toolOptions.resizeHeight / 100);
                        } else { // pixels
                            newWidth = toolOptions.resizeWidth;
                            newHeight = toolOptions.resizeHeight;
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = newWidth;
                        canvas.height = newHeight;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject('Could not get canvas context');

                        // Handle background color for formats without transparency
                        if (toolOptions.resizeFormat === 'jpg' || toolOptions.resizeFormat === 'jpeg') {
                            ctx.fillStyle = toolOptions.resizeBackground;
                            ctx.fillRect(0, 0, newWidth, newHeight);
                        }

                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                        
                        const mimeType = `image/${toolOptions.resizeFormat}`;
                        const quality = toolOptions.resizeQuality / 100;

                        canvas.toBlob(blob => {
                            if (blob) resolve(blob);
                            else reject('Canvas to blob failed');
                        }, mimeType, quality);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });

                if (files.length === 1) {
                    const blob = await processImageResize(files[0]);
                    setProcessedFileBlob(blob);
                } else {
                    const zip = new JSZip();
                    for (const [index, file] of files.entries()) {
                        setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Resizing image ${index + 1}` });
                        const blob = await processImageResize(file);
                        const baseName = file.name.replace(/\.[^/.]+$/, "");
                        zip.file(`${baseName}_resized.${toolOptions.resizeFormat || 'jpg'}`, blob);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    setProcessedFileBlob(zipBlob);
                }
                break;
            }
            case 'crop-image': {
                if (files.length !== 1) throw new Error("Please select one image file to crop.");
                const file = files[0];
                const { cropX, cropY, cropWidth, cropHeight } = toolOptions;

                const processImageCrop = (imgFile: File): Promise<Blob> => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = cropWidth;
                        canvas.height = cropHeight;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject(new Error('Could not get canvas context'));
                        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                        canvas.toBlob(blob => {
                            if (blob) resolve(blob);
                            else reject(new Error('Failed to create blob from canvas'));
                        }, imgFile.type);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(imgFile);
                });

                const blob = await processImageCrop(file);
                setProcessedFileBlob(blob);
                break;
            }
            case 'convert-to-jpg': {
                const processConversion = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject('Could not get canvas context');
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob(blob => {
                            if (blob) resolve(blob);
                            else reject('Canvas to blob failed');
                        }, 'image/jpeg', 0.9);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });

                if (files.length === 1) {
                    const blob = await processConversion(files[0]);
                    setProcessedFileBlob(blob);
                } else if (files.length > 1) {
                    const zip = new JSZip();
                    for (const [index, file] of files.entries()) {
                        setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Converting file ${index + 1}` });
                        const blob = await processConversion(file);
                        const baseName = file.name.replace(/\.[^/.]+$/, "");
                        zip.file(`${baseName}.jpg`, blob);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    setProcessedFileBlob(zipBlob);
                } else {
                    throw new Error("Please select one or more image files.");
                }
                break;
            }
            case 'convert-from-jpg': {
                const format = toolOptions.convertToFormat || 'png';
                const mimeType = `image/${format}`;

                const processImage = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject('Could not get canvas context');
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob(blob => {
                            if (blob) resolve(blob);
                            else reject('Canvas to blob conversion failed');
                        }, mimeType);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });

                if (files.length === 1) {
                    const blob = await processImage(files[0]);
                    setProcessedFileBlob(blob);
                } else {
                    const zip = new JSZip();
                    for (const [index, file] of files.entries()) {
                        setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Converting file ${index + 1}` });
                        const blob = await processImage(file);
                        const baseName = file.name.replace(/\.[^/.]+$/, "");
                        zip.file(`${baseName}.${format}`, blob);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    setProcessedFileBlob(zipBlob);
                }
                break;
            }
            case 'compress-image': {
                const quality = toolOptions.compressionQuality || 0.75;
                const processImage = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject('Could not get canvas context');
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob(blob => {
                            if (blob) resolve(blob);
                            else reject('Canvas to blob conversion failed');
                        }, 'image/jpeg', quality);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });

                if (files.length === 1) {
                    const blob = await processImage(files[0]);
                    setProcessedFileBlob(blob);
                } else {
                    const zip = new JSZip();
                    for (const [index, file] of files.entries()) {
                        setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Compressing file ${index + 1}` });
                        const blob = await processImage(file);
                        const baseName = file.name.replace(/\.[^/.]+$/, "");
                        zip.file(`${baseName}_compressed.jpg`, blob);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    setProcessedFileBlob(zipBlob);
                }
                break;
            }
            case 'watermark-image': {
                const processImage = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
                    const baseImage = new Image();
                    baseImage.onload = async () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = baseImage.width;
                        canvas.height = baseImage.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject('Could not get canvas context');
                        ctx.drawImage(baseImage, 0, 0);
                        
                        ctx.globalAlpha = toolOptions.watermarkOpacity || 0.5;

                        if (toolOptions.watermarkType === 'image' && toolOptions.watermarkImage) {
                            const watermarkImage = new Image();
                            watermarkImage.onload = () => {
                                ctx.drawImage(watermarkImage, canvas.width / 2 - watermarkImage.width / 2, canvas.height / 2 - watermarkImage.height / 2);
                                canvas.toBlob(blob => resolve(blob!), 'image/png');
                            };
                            watermarkImage.onerror = reject;
                            watermarkImage.src = toolOptions.watermarkImage;
                        } else if (toolOptions.watermarkType === 'text') {
                            const text = toolOptions.watermarkText || 'I LOVE PDFLY';
                            const size = toolOptions.watermarkSize || 50;
                            ctx.font = `bold ${size}px Arial`;
                            ctx.fillStyle = toolOptions.watermarkColor || '#e53935';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            ctx.save();
                            ctx.translate(canvas.width / 2, canvas.height / 2);
                            ctx.rotate((toolOptions.watermarkRotation || -45) * Math.PI / 180);
                            
                            if (toolOptions.watermarkTiled) {
                                const patternCanvas = document.createElement('canvas');
                                const patternCtx = patternCanvas.getContext('2d')!;
                                const textWidth = ctx.measureText(text).width;
                                patternCanvas.width = textWidth + size;
                                patternCanvas.height = textWidth + size;
                                patternCtx.font = `bold ${size}px Arial`;
                                patternCtx.fillStyle = toolOptions.watermarkColor || '#e53935';
                                patternCtx.textAlign = 'center';
                                patternCtx.textBaseline = 'middle';
                                patternCtx.fillText(text, patternCanvas.width / 2, patternCanvas.height / 2);
                                
                                const pattern = ctx.createPattern(patternCanvas, 'repeat');
                                if (pattern) {
                                  ctx.fillStyle = pattern;
                                  ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
                                }
                            } else {
                                ctx.fillText(text, 0, 0);
                            }
                            ctx.restore();
                            canvas.toBlob(blob => resolve(blob!), 'image/png');
                        } else {
                           canvas.toBlob(blob => resolve(blob!), 'image/png');
                        }
                    };
                    baseImage.onerror = reject;
                    baseImage.src = URL.createObjectURL(file);
                });

                if (files.length === 1) {
                    const blob = await processImage(files[0]);
                    setProcessedFileBlob(blob);
                } else {
                    const zip = new JSZip();
                    for (const [index, file] of files.entries()) {
                        setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Watermarking file ${index + 1}` });
                        const blob = await processImage(file);
                        const baseName = file.name.replace(/\.[^/.]+$/, "");
                        zip.file(`${baseName}_watermarked.png`, blob);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    setProcessedFileBlob(zipBlob);
                }
                break;
            }
          default:
            throw new Error(`Tool "${tool.id}" is not yet implemented.`);
        }
        setState(ProcessingState.Success);
      } catch (e: any) {
        console.error(e);
        let message = 'An unexpected error occurred during processing.';
        if (e instanceof Error) {
            message = e.message;
        } else if (typeof e === 'string') {
            message = e;
        } else if (e && typeof e.message === 'string') {
            message = e.message;
        }
        setErrorMessage(message);
        setState(ProcessingState.Error);
      } finally {
        setProgress(null);
      }
  };
  
  const handleReset = () => {
    setState(ProcessingState.Idle);
    setErrorMessage('');
    setProcessedFileBlob(null);
    setFiles([]);
    setToolOptions(initialToolOptions);
    setProgress(null);
    setPdfPages([]);
    setPdfPagePreviews([]);
    setCanvasItems([]);
    setComparisonResults([]);
    setRedactionAreas([]);
    setOriginalImageSize(null);
  };

  const handleDownload = () => {
    if (!processedFileBlob || !tool) return;
    
    const url = URL.createObjectURL(processedFileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getOutputFilename(tool.id, files, toolOptions));
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === index) return;
      const newPages = [...pdfPages];
      const [removed] = newPages.splice(draggedItemIndex, 1);
      newPages.splice(index, 0, removed);
      setPdfPages(newPages);
      setDraggedItemIndex(null);
  };

  const handleDeletePage = (indexToDelete: number) => { setPdfPages(pdfPages.filter((_, index) => index !== indexToDelete)); };
  
  const handleApplyCanvasItem = (data: Partial<CanvasItem>, type: CanvasItem['type']) => {
      if (!data.dataUrl) return;
      const img = new Image();
      img.onload = () => {
          const newWidth = type === 'text' ? img.width / 2 : 150;
          const scale = newWidth / img.width;
          const newHeight = img.height * scale;

          let initialPageIndex = 0;
          let initialX = 0;
          let initialY = 0;

          if (previewContainerRef.current) {
              const container = previewContainerRef.current;
              const centerY = container.scrollTop + container.clientHeight / 2;

              for (let i = 0; i < pdfPagePreviews.length; i++) {
                  const pageElement = document.getElementById(`pdf-page-${i}`);
                  if (pageElement && centerY >= pageElement.offsetTop && centerY < pageElement.offsetTop + pageElement.offsetHeight) {
                      initialPageIndex = i;
                      break;
                  }
              }

              initialX = container.scrollLeft + container.clientWidth / 2 - newWidth / 2;
              initialY = centerY - newHeight / 2;
          }

          setCanvasItems(items => [...items, {
              ...data,
              id: Date.now(),
              type,
              width: newWidth,
              height: newHeight,
              x: initialX,
              y: initialY,
              pageIndex: initialPageIndex,
          } as CanvasItem]);
      };
      img.src = data.dataUrl;
      setIsModalOpen(false);
  };
  
  const handleItemDragStart = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      setActiveDrag({ id, offsetX: e.clientX - target.getBoundingClientRect().left, offsetY: e.clientY - target.getBoundingClientRect().top });
  };
  
  const openEditorModal = (type: 'signature' | 'text' | 'image') => {
    setModalType(type);
    setIsModalOpen(true);
  }
  
  const handleMouseDownRedaction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current || tool?.id !== 'redact-pdf') return;
    setIsDrawingRedaction(true);
    const container = previewContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left + container.scrollLeft;
    const y = e.clientY - containerRect.top + container.scrollTop;

    let pageIndex = 0;
    for (let i = 0; i < pdfPagePreviews.length; i++) {
        const pageEl = document.getElementById(`pdf-page-${i}`);
        if (pageEl && y >= pageEl.offsetTop && y < pageEl.offsetTop + pageEl.offsetHeight) {
            pageIndex = i;
            break;
        }
    }
    setRedactionStartPoint({ x, y, pageIndex });
    setCurrentRedaction({ x, y, width: 0, height: 0, pageIndex });
  };
  
  const handleMouseUpRedaction = () => {
    if (!isDrawingRedaction || !currentRedaction || currentRedaction.width < 5 || currentRedaction.height < 5) {
        setIsDrawingRedaction(false);
        setCurrentRedaction(null);
        return;
    }
    setRedactionAreas(prev => [...prev, { ...currentRedaction, id: Date.now() }]);
    setIsDrawingRedaction(false);
    setCurrentRedaction(null);
    setRedactionStartPoint(null);
  };
  
  const removeRedactionArea = (id: number) => {
    setRedactionAreas(areas => areas.filter(area => area.id !== id));
  };

  const editorToolbar = (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {tool?.id === 'sign-pdf' && (
            <>
                <button onClick={() => openEditorModal('signature')} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
                    <EditIcon className="h-5 w-5" /> Signature
                </button>
                <button onClick={() => openEditorModal('text')} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
                    <strong>T</strong> Text
                </button>
                 <button onClick={() => openEditorModal('image')} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
                    <ImageIcon className="h-5 w-5" /> Image
                </button>
            </>
        )}
        {tool?.id === 'edit-pdf' && (
             <>
                 <button onClick={() => openEditorModal('text')} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
                    <strong>T</strong> Text
                </button>
                 <button onClick={() => openEditorModal('image')} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
                    <ImageIcon className="h-5 w-5" /> Image
                </button>
            </>
        )}
        {tool?.id === 'redact-pdf' && (
            <p className="text-sm p-2 text-gray-600 dark:text-gray-300">Click and drag on the document to draw redaction areas.</p>
        )}
        {(canvasItems.length > 0 || redactionAreas.length > 0) && (
            <button onClick={() => { setCanvasItems([]); setRedactionAreas([]); }} className="flex items-center gap-2 p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 ml-auto text-sm">
                <TrashIcon className="h-5 w-5" /> Clear All
            </button>
        )}
    </div>
  );

  if (!tool) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading tool...</div>
      </div>
    );
  }

  const isVisualEditor = ['organize-pdf', 'sign-pdf', 'edit-pdf', 'redact-pdf'].includes(tool.id);
  const showVisualEditor = (isVisualEditor && files.length > 0) || (tool.id === 'compare-pdf' && comparisonResults.length > 0);
  
  const renderToolOptions = () => {
    switch (tool.id) {
        case 'compress-pdf':
            return (
                <div className="space-y-2 text-center">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Compression Level:</p>
                    <div className="flex justify-center gap-4 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                        {['low', 'recommended', 'high'].map(level => (
                            <label key={level} className="flex-1 cursor-pointer">
                                <input type="radio" name="compression" value={level} checked={toolOptions.compressionLevel === level} onChange={(e) => setToolOptions({ ...toolOptions, compressionLevel: e.target.value })} className="sr-only peer" />
                                <div className="p-3 rounded-md text-center peer-checked:bg-brand-red peer-checked:text-white peer-checked:shadow-lg transition-all">
                                    <p className="font-bold capitalize">{level === 'recommended' ? 'Recommended' : level}</p>
                                    <p className="text-xs">{level === 'low' ? 'Best Quality' : level === 'high' ? 'Smallest Size' : 'Good Balance'}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            );
        case 'split-pdf':
            return (
                <div className="space-y-4">
                    <select value={toolOptions.splitMode} onChange={e => setToolOptions({ ...toolOptions, splitMode: e.target.value })} className="w-full p-2 border rounded-md">
                        <option value="all">Extract all pages</option>
                        <option value="ranges">Select ranges</option>
                        <option value="fixed">Fixed range split</option>
                    </select>
                    {toolOptions.splitMode === 'ranges' && <input type="text" value={toolOptions.splitRanges} onChange={e => setToolOptions({...toolOptions, splitRanges: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g., 1, 3-5, 8" />}
                    {toolOptions.splitMode === 'fixed' && <input type="number" value={toolOptions.splitFixedSize} onChange={e => setToolOptions({...toolOptions, splitFixedSize: parseInt(e.target.value) || 1})} className="w-full p-2 border rounded-md" placeholder="Split every X pages" />}
                </div>
            );
         case 'jpg-to-pdf':
            return (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="font-semibold">Orientation</label><select value={toolOptions.pageOrientation} onChange={e => setToolOptions({...toolOptions, pageOrientation: e.target.value})} className="w-full p-2 border rounded-md mt-1"><option value="auto">Auto</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
                    <div><label className="font-semibold">Page Size</label><select value={toolOptions.pageSize} onChange={e => setToolOptions({...toolOptions, pageSize: e.target.value})} className="w-full p-2 border rounded-md mt-1"><option value="fit">Fit Image</option><option value="a4">A4</option><option value="letter">US Letter</option></select></div>
                    <div><label className="font-semibold">Margin</label><select value={toolOptions.pageMargin} onChange={e => setToolOptions({...toolOptions, pageMargin: e.target.value})} className="w-full p-2 border rounded-md mt-1"><option value="none">None</option><option value="small">Small</option><option value="big">Big</option></select></div>
                 </div>
            );
        case 'pdf-to-jpg': case 'pdf-to-png':
            return (
                <div><label className="font-semibold">Image Quality (DPI Scale)</label><input type="range" min="0.5" max="3" step="0.1" value={toolOptions.imageQuality} onChange={e => setToolOptions({...toolOptions, imageQuality: parseFloat(e.target.value)})} className="w-full mt-1"/></div>
            );
        case 'ocr-pdf':
            return (
                <div><label className="font-semibold">Document Language</label><select value={toolOptions.ocrLanguage} onChange={e => setToolOptions({...toolOptions, ocrLanguage: e.target.value})} className="w-full p-2 border rounded-md mt-1"><option value="eng">English</option><option value="spa">Spanish</option><option value="fra">French</option><option value="deu">German</option><option value="chi_sim">Chinese (Simplified)</option></select></div>
            );
         case 'protect-pdf':
            return (
                <div className="space-y-4">
                     <input type="password" value={toolOptions.password || ''} onChange={(e) => setToolOptions({ ...toolOptions, password: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Enter password" />
                     <fieldset className="border p-4 rounded-md"><legend className="font-semibold px-2">Permissions</legend><div className="flex flex-wrap gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={toolOptions.allowPrinting} onChange={e => setToolOptions({...toolOptions, allowPrinting: e.target.checked})} /> Allow Printing</label><label className="flex items-center gap-2"><input type="checkbox" checked={toolOptions.allowCopying} onChange={e => setToolOptions({...toolOptions, allowCopying: e.target.checked})} /> Allow Copying</label><label className="flex items-center gap-2"><input type="checkbox" checked={toolOptions.allowModifying} onChange={e => setToolOptions({...toolOptions, allowModifying: e.target.checked})} /> Allow Modifying</label></div></fieldset>
                </div>
            );
        case 'unlock-pdf':
             return (
                <div className="space-y-2">
                    <label className="font-semibold">Password</label>
                    <input type="password" value={toolOptions.password || ''} onChange={(e) => setToolOptions({ ...toolOptions, password: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Enter current password" />
                </div>
            );
        case 'resize-image': {
            const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
                const numericValue = parseInt(value, 10) || 0;
                if (toolOptions.maintainAspectRatio && originalImageSize) {
                    const aspectRatio = originalImageSize.width / originalImageSize.height;
                    if (dimension === 'width') {
                        setToolOptions(prev => ({ ...prev, resizeWidth: numericValue, resizeHeight: Math.round(numericValue / aspectRatio) }));
                    } else {
                        setToolOptions(prev => ({ ...prev, resizeHeight: numericValue, resizeWidth: Math.round(numericValue * aspectRatio) }));
                    }
                } else {
                    if (dimension === 'width') {
                        setToolOptions(prev => ({ ...prev, resizeWidth: numericValue }));
                    } else {
                        setToolOptions(prev => ({ ...prev, resizeHeight: numericValue }));
                    }
                }
            };

            const handleUnitChange = (unit: 'percent' | 'pixels') => {
                 if (unit === 'pixels' && originalImageSize) {
                    setToolOptions(prev => ({ ...prev, resizeUnit: unit, resizeWidth: originalImageSize.width, resizeHeight: originalImageSize.height }));
                } else {
                    setToolOptions(prev => ({ ...prev, resizeUnit: unit, resizeWidth: 70, resizeHeight: 70 }));
                }
            };
            
            return (
                 <div className="space-y-6 max-w-2xl mx-auto text-sm">
                    <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">Choose new size and format</h3>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <label htmlFor="width" className="w-16 font-semibold">Width</label>
                                <input type="number" id="width" value={toolOptions.resizeWidth} onChange={(e) => handleDimensionChange('width', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="height" className="w-16 font-semibold">Height</label>
                                <input type="number" id="height" value={toolOptions.resizeHeight} onChange={(e) => handleDimensionChange('height', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setToolOptions(prev => ({...prev, maintainAspectRatio: !prev.maintainAspectRatio}))} className={`p-2 rounded-md border ${toolOptions.maintainAspectRatio ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {toolOptions.maintainAspectRatio ? <LockIcon className="h-5 w-5"/> : <UnlockIcon className="h-5 w-5"/>}
                            </button>
                            <select value={toolOptions.resizeUnit} onChange={(e) => handleUnitChange(e.target.value as any)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black">
                                <option value="percent">Percent</option>
                                <option value="pixels">Pixels</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label htmlFor="resolution" className="font-semibold">Resolution</label>
                        <input type="number" id="resolution" value={toolOptions.resizeResolution} onChange={e => setToolOptions({...toolOptions, resizeResolution: parseInt(e.target.value) || 72})} className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" />
                        <span className="text-gray-500">DPI</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="font-semibold block mb-1">Format</label>
                            <select value={toolOptions.resizeFormat} onChange={e => setToolOptions({...toolOptions, resizeFormat: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black">
                                <option value="jpg">JPG</option>
                                <option value="png">PNG</option>
                            </select>
                        </div>
                        {toolOptions.resizeFormat === 'jpg' && (
                            <div>
                                <label className="font-semibold block mb-1">Quality</label>
                                <div className="flex items-center gap-2">
                                <input type="number" min="1" max="100" value={toolOptions.resizeQuality} onChange={e => setToolOptions({...toolOptions, resizeQuality: parseInt(e.target.value) || 90})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" />
                                <span>%</span>
                                </div>
                            </div>
                        )}
                        {toolOptions.resizeFormat === 'jpg' && (
                             <div>
                                <label className="font-semibold block mb-1">Background</label>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setToolOptions({...toolOptions, resizeBackground: '#FFFFFF'})} className={`w-8 h-8 rounded-full border-2 ${toolOptions.resizeBackground === '#FFFFFF' ? 'border-blue-500' : 'border-gray-300'}`} style={{backgroundColor: 'white'}}></button>
                                    <button onClick={() => setToolOptions({...toolOptions, resizeBackground: '#000000'})} className={`w-8 h-8 rounded-full border-2 ${toolOptions.resizeBackground === '#000000' ? 'border-blue-500' : 'border-gray-300'}`} style={{backgroundColor: 'black'}}></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        case 'crop-image': {
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-semibold">Width (px)</label>
                        <input type="number" value={toolOptions.cropWidth} onChange={e => setToolOptions({...toolOptions, cropWidth: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="font-semibold">Height (px)</label>
                        <input type="number" value={toolOptions.cropHeight} onChange={e => setToolOptions({...toolOptions, cropHeight: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="font-semibold">X offset</label>
                        <input type="number" value={toolOptions.cropX} onChange={e => setToolOptions({...toolOptions, cropX: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="font-semibold">Y offset</label>
                        <input type="number" value={toolOptions.cropY} onChange={e => setToolOptions({...toolOptions, cropY: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
            );
        }
        case 'convert-to-jpg': {
            return <p className="text-center text-gray-600 dark:text-gray-400">All selected images will be converted to JPG format.</p>;
        }
        case 'convert-from-jpg':
            return (
                <div>
                    <label className="font-semibold">Convert to Format</label>
                    <select value={toolOptions.convertToFormat} onChange={e => setToolOptions({...toolOptions, convertToFormat: e.target.value})} className="w-full p-2 border rounded-md mt-1">
                        <option value="png">PNG</option>
                        <option value="gif">GIF</option>
                    </select>
                </div>
            );
        case 'compress-image':
            return (
                <div>
                    <label className="font-semibold">Compression Quality ({Math.round(toolOptions.compressionQuality * 100)}%)</label>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.05" 
                        value={toolOptions.compressionQuality} 
                        onChange={e => setToolOptions({...toolOptions, compressionQuality: parseFloat(e.target.value)})} 
                        className="w-full mt-1"
                    />
                </div>
            );
        case 'watermark-image': {
            const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setToolOptions({ ...toolOptions, watermarkImage: event.target?.result as string });
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            };
            return (
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold">Watermark Type</label>
                        <select value={toolOptions.watermarkType} onChange={e => setToolOptions({...toolOptions, watermarkType: e.target.value})} className="w-full p-2 border rounded-md mt-1">
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                        </select>
                    </div>
                    {toolOptions.watermarkType === 'text' ? (
                         <input type="text" value={toolOptions.watermarkText} onChange={e => setToolOptions({...toolOptions, watermarkText: e.target.value})} className="w-full p-2 border rounded-md" placeholder="Your Text" />
                    ) : (
                        <input type="file" accept="image/*" onChange={handleWatermarkImageUpload} className="w-full p-2 border rounded-md" />
                    )}
                    {toolOptions.watermarkType === 'text' && (
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={toolOptions.watermarkSize} onChange={e => setToolOptions({...toolOptions, watermarkSize: parseInt(e.target.value)})} placeholder="Font Size" className="w-full p-2 border rounded-md" />
                            <input type="color" value={toolOptions.watermarkColor} onChange={e => setToolOptions({...toolOptions, watermarkColor: e.target.value})} className="w-full p-2 border rounded-md" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Opacity</label>
                            <input type="range" min="0" max="1" step="0.1" value={toolOptions.watermarkOpacity} onChange={e => setToolOptions({...toolOptions, watermarkOpacity: parseFloat(e.target.value)})} className="w-full" />
                        </div>
                         <div>
                            <label className="font-semibold">Rotation</label>
                            <input type="range" min="-180" max="180" value={toolOptions.watermarkRotation} onChange={e => setToolOptions({...toolOptions, watermarkRotation: parseInt(e.target.value)})} className="w-full" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={toolOptions.watermarkTiled} onChange={e => setToolOptions({...toolOptions, watermarkTiled: e.target.checked})} /> Tiled Watermark</label>
                </div>
            );
        }
        default: return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center py-12 px-6 bg-gray-50 dark:bg-black">
      <div className="text-center mb-10">
        <div className={`inline-block p-4 rounded-full ${tool.color}`}>
          <tool.Icon className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-gray-100">{tool.title}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{tool.description}</p>
      </div>

       <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center justify-center gap-2">
          <LockIcon className="h-4 w-4" />
          <span>All uploaded files are encrypted and deleted automatically after 2 hours.</span>
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-black p-8 rounded-lg shadow-xl animated-border">
        {tool.id === 'scan-to-pdf' ? (
           <DocumentScannerUI tool={tool} />
        ) : state === ProcessingState.Success ? (
          <div className="text-center">
            {tool.id === 'compare-pdf' ? (
                <div>
                     <h2 className="text-2xl font-bold text-green-600">Comparison Complete!</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Review the differences below.</p>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-green-600">Processing Complete!</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Your file is ready for download.</p>
                    <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleDownload}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                        >
                            Download File
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                        >
                            Process Another File
                        </button>
                    </div>
                </>
            )}
          </div>
        ) : state === ProcessingState.Processing ? (
          <div className="text-center py-12">
             <div className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-800 dark:text-gray-200">
                <svg className="animate-spin h-8 w-8 text-brand-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{progress?.status || 'Processing...'}</span>
             </div>
             {progress && (
                <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                    <div className="bg-brand-red h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                </div>
             )}
          </div>
        ) : state === ProcessingState.Error ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">An Error Occurred</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
            <button
                onClick={handleReset}
                className="mt-6 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
                Try Again
            </button>
          </div>
        ) : (
          <div>
            {/* File Upload Component or Initial State */}
            {!showVisualEditor && (
                <FileUpload tool={tool} files={files} setFiles={setFiles} accept={tool.accept} />
            )}

            {/* Visual Editor (for Organize, Sign, Edit, Redact) */}
            {showVisualEditor && tool.id === 'organize-pdf' && (
                <div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {pdfPages.map((page, index) => (
                            <div 
                                key={page.originalIndex} 
                                draggable 
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className="relative group cursor-move aspect-[210/297]"
                            >
                                <img src={page.imageDataUrl} alt={`Page ${page.originalIndex + 1}`} className="w-full h-full object-contain border-2 border-gray-300 dark:border-gray-700 rounded-md" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => handleDeletePage(index)} className="text-white bg-red-600/80 rounded-full p-2 hover:bg-red-600">
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{index + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {showVisualEditor && ['sign-pdf', 'edit-pdf'].includes(tool.id) && (
                <div>
                    {editorToolbar}
                    <div ref={previewContainerRef} onMouseDown={e => e.preventDefault()} className="relative h-[80vh] overflow-y-auto bg-gray-200 dark:bg-gray-800 p-4 space-y-4">
                        {pdfPagePreviews.map((src, index) => (
                            <img key={index} id={`pdf-page-${index}`} src={src} alt={`Page ${index+1}`} className="max-w-full mx-auto shadow-lg" />
                        ))}
                        {canvasItems.map(item => (
                            <div 
                                key={item.id}
                                onMouseDown={(e) => handleItemDragStart(e, item.id)}
                                className="absolute cursor-move border-2 border-dashed border-blue-500"
                                style={{
                                    left: item.x, top: item.y,
                                    width: item.width, height: item.height
                                }}
                            >
                                {item.dataUrl && <img src={item.dataUrl} alt="canvas item" className="w-full h-full object-contain" />}
                                <button onClick={() => setCanvasItems(items => items.filter(i => i.id !== item.id))} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5"><CloseIcon className="h-3 w-3"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {showVisualEditor && tool.id === 'redact-pdf' && (
                <div>
                    {editorToolbar}
                    <div ref={previewContainerRef} 
                        onMouseDown={handleMouseDownRedaction}
                        onMouseMove={handleMouseMoveRedaction}
                        onMouseUp={handleMouseUpRedaction}
                        onMouseLeave={handleMouseUpRedaction} // End redaction if mouse leaves area
                        className="relative h-[80vh] overflow-y-auto bg-gray-200 dark:bg-gray-800 p-4 space-y-4 cursor-crosshair">
                        
                        {pdfPagePreviews.map((src, index) => (
                            <img key={index} id={`pdf-page-${index}`} src={src} alt={`Page ${index+1}`} className="max-w-full mx-auto shadow-lg select-none" draggable="false" />
                        ))}
                        
                        {/* Render saved redaction areas */}
                        {redactionAreas.map(area => (
                            <div key={area.id}
                                className="absolute bg-black border border-red-500"
                                style={{ left: area.x, top: area.y, width: area.width, height: area.height }}>
                                <button onClick={() => removeRedactionArea(area.id)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><CloseIcon className="h-3 w-3"/></button>
                            </div>
                        ))}

                        {/* Render current drawing redaction */}
                        {currentRedaction && (
                            <div className="absolute bg-black/50 border-2 border-dashed border-red-500 pointer-events-none"
                                style={{ left: currentRedaction.x, top: currentRedaction.y, width: currentRedaction.width, height: currentRedaction.height }}>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {showVisualEditor && tool.id === 'compare-pdf' && (
                <div className="space-y-6">
                     {comparisonResults.map(result => (
                        <div key={result.pageNumber} className="border p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-2">Page {result.pageNumber} - <span className={result.diffPercentage > 0.1 ? 'text-red-500' : 'text-green-500'}>{result.diffPercentage.toFixed(2)}% difference</span></h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><h4 className="font-semibold mb-1">Original (File 1)</h4><img src={result.img1DataUrl} alt={`Original page ${result.pageNumber}`} className="border" /></div>
                                <div><h4 className="font-semibold mb-1">Modified (File 2)</h4><img src={result.img2DataUrl} alt={`Modified page ${result.pageNumber}`} className="border" /></div>
                                <div><h4 className="font-semibold mb-1">Differences</h4><img src={result.diffDataUrl} alt={`Difference page ${result.pageNumber}`} className="border bg-gray-200" /></div>
                            </div>
                        </div>
                     ))}
                </div>
            )}
            
            {/* Options and Process Button */}
            {files.length > 0 && !showVisualEditor && (
              <div className="mt-8">
                <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                    {renderToolOptions()}
                </div>
                <div className="text-center">
                    <button
                        onClick={handleProcess}
                        disabled={isProcessButtonDisabled}
                        className={`w-full max-w-sm ${tool.color} ${tool.hoverColor} text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                    >
                        {tool.title}
                    </button>
                </div>
              </div>
            )}

            {showVisualEditor && (
                <div className="mt-8 text-center">
                     <button
                        onClick={handleProcess}
                        disabled={isVisualProcessButtonDisabled}
                        className={`w-full max-w-sm ${tool.color} ${tool.hoverColor} text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                    >
                        {tool.title}
                    </button>
                </div>
            )}
          </div>
        )}
      </div>
       <div className="mt-12 text-center">
        <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
            &larr; Back to all tools
        </Link>
      </div>
      
       {isModalOpen && <EditorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onApply={handleApplyCanvasItem} type={modalType} />}
    </div>
  );
};

export default ToolPage;