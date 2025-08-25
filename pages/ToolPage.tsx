import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import FileUpload from '../components/FileUpload.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
    TrashIcon, UploadCloudIcon, EditIcon, ImageIcon, CameraIcon, CloseIcon, UploadIcon, RotateIcon, LockIcon, 
    UnlockIcon, EmailIcon, WhatsAppIcon, RightArrowIcon, LeftArrowIcon, DownloadIcon, GoogleDriveIcon, LinkIcon, 
    DropboxIcon, CheckIcon, CopyIcon, StarIcon, FacebookIcon, XIcon, LinkedInIcon 
} from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';

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
import * as QRCode from 'https://esm.sh/qrcode@1.5.3';

// Setup for pdfjs worker. This is a one-time setup.
const setupPdfjs = async () => {
    // Ensure this runs only once
    if ((window as any).pdfjsWorkerInitialized) return;
    
    // Using the version from the loaded module is more robust
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
    (window as any).pdfjsWorkerInitialized = true;
};
setupPdfjs();

// These declarations are needed to access the cloud picker SDKs loaded in index.html
declare const gapi: any;
declare const Dropbox: any;
declare const google: any;

const GOOGLE_API_KEY = 'AIzaSyD3MDVQ3bkz0n3Hu3ju-sGCIMCybUQGbVU';
const GOOGLE_CLIENT_ID = '415789226795-0mu2ru52dcc5b649njfarn059lkjkcnk.apps.googleusercontent.com';

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
            <div className="bg-white dark:bg-surface-dark w-full max-w-md md:max-w-3xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
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

interface DocumentScannerUIProps {
    tool: Tool;
}

const DocumentScannerUI: React.FC<DocumentScannerUIProps> = ({ tool }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
    const [error, setError] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const startCamera = async () => {
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error(err);
            setError('Could not access the camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };
    
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const capturePage = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const newPage: ScannedPage = {
            id: Date.now(),
            original: dataUrl,
            filtered: dataUrl,
            filter: 'original',
        };
        setScannedPages(prev => [...prev, newPage]);
    };

    const handleFilterChange = async (id: number, filter: FilterType) => {
        const pageToUpdate = scannedPages.find(p => p.id === id);
        if (!pageToUpdate) return;

        const filteredImage = await applyFilter(pageToUpdate.original, filter);
        setScannedPages(prev => prev.map(p => p.id === id ? { ...p, filtered: filteredImage, filter } : p));
    };

    const removePage = (id: number) => {
        setScannedPages(prev => prev.filter(p => p.id !== id));
    };
    
    const generatePdf = async () => {
        if (scannedPages.length === 0) {
            setError("Please scan at least one page.");
            return;
        }
        setProcessing(true);
        setError('');
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            for (let i = 0; i < scannedPages.length; i++) {
                const page = scannedPages[i];
                const img = new Image();
                img.src = page.filtered;
                await new Promise(resolve => img.onload = resolve);
                
                if (i > 0) pdf.addPage();
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgRatio = img.width / img.height;
                const pdfRatio = pdfWidth / pdfHeight;
                
                let imgWidth, imgHeight;
                if (imgRatio > pdfRatio) {
                    imgWidth = pdfWidth;
                    imgHeight = pdfWidth / imgRatio;
                } else {
                    imgHeight = pdfHeight;
                    imgWidth = pdfHeight * imgRatio;
                }
                
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;

                pdf.addImage(page.filtered, 'JPEG', x, y, imgWidth, imgHeight);
            }
            pdf.save('scanned_document.pdf');
        } catch (err) {
            setError("Failed to generate PDF. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {stream ? (
                <div className="relative mb-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg shadow-lg border-2 border-gray-700"></video>
                    <button onClick={capturePage} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-full shadow-lg border-2 border-gray-300 hover:bg-gray-200">
                        <CameraIcon className="h-8 w-8 text-brand-red" />
                    </button>
                </div>
            ) : (
                <div className="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-gray-400">
                    {error ? <p className="text-red-400">{error}</p> : <p>Starting camera...</p>}
                    <button onClick={startCamera} className="mt-4 bg-brand-red text-white font-bold py-2 px-4 rounded">Retry Camera</button>
                </div>
            )}
            
            {scannedPages.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Scanned Pages ({scannedPages.length})</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {scannedPages.map(page => (
                            <div key={page.id} className="relative group">
                                <img src={page.filtered} alt="Scanned page" className="w-full rounded-md" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                                    <button onClick={() => removePage(page.id)} className="self-end p-1 bg-red-600 rounded-full text-white">
                                        <CloseIcon className="h-4 w-4" />
                                    </button>
                                    <div className="text-white text-xs">
                                        <FilterBar onFilterChange={(filter) => handleFilterChange(page.id, filter)} activeFilter={page.filter} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-center">
                        <button onClick={generatePdf} disabled={processing} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:bg-green-800">
                            {processing ? 'Generating PDF...' : 'Create PDF'}
                        </button>
                    </div>
                </div>
            )}
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

const getSuccessMessage = (tool: Tool): React.ReactNode => {
    switch (tool.id) {
        case 'merge-pdf': return <>PDFs have been merged!</>;
        case 'split-pdf': return <>Your PDF has been split!</>;
        case 'compress-pdf': return <>Your PDF has been compressed!</>;
        case 'organize-pdf': return <>Your PDF has been organized!</>;
        case 'remove-background': return <>Background has been removed!</>;
    }
    
    if (tool.title.toLowerCase().includes(' to ')) {
        const parts = tool.title.split(/ to /i);
        const fromType = parts[0].replace(/convert/i, '').trim();
        const toType = parts[1].trim();
        return <>{fromType.toUpperCase()} have been converted to <strong>{toType}</strong>!</>;
    }

    const noun = tool.fileTypeNounPlural ? tool.fileTypeNounPlural.charAt(0).toUpperCase() + tool.fileTypeNounPlural.slice(1) : 'Files';
    return <>{noun} have been processed successfully!</>;
};

const getDownloadButtonText = (tool: Tool): string => {
     switch (tool.id) {
        case 'merge-pdf': return 'Download merged PDF';
        case 'split-pdf': return 'Download split PDF files';
        case 'compress-pdf': return 'Download compressed PDF';
        case 'remove-background': return 'Download image';
        case 'zip-maker': return 'Download ZIP file';
    }

    if (tool.title.toLowerCase().startsWith('pdf to ')) {
        const target = tool.title.substring(7);
        return `Download as ${target}`;
    }
    
    if (tool.title.toLowerCase().endsWith(' to pdf')) {
        return 'Download as PDF';
    }

    return `Download ${tool.fileTypeDisplayName || 'file'}`;
};


const ToolPage: React.FC = () => {
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
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeError, setQrCodeError] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [cloudSaveState, setCloudSaveState] = useState<{google: 'idle' | 'saving' | 'saved', dropbox: 'idle' | 'saving' | 'saved'}>({google: 'idle', dropbox: 'idle'});
  
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

  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
  }

  useEffect(() => {
    let objectUrl: string | null = null;
    if (processedFileBlob) {
        objectUrl = URL.createObjectURL(processedFileBlob);
        setDownloadUrl(objectUrl);
    }

    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            setDownloadUrl('');
        }
    };
  }, [processedFileBlob]);

  const getProcessingMessage = (tool: Tool | null): React.ReactNode => {
    if (!tool) return 'Processing...';

    const title = tool.title;
    if (title.toLowerCase().startsWith('convert ')) {
        const rest = title.substring(8);
        const parts = rest.split(/ to /i);
        return <>Converting <strong>{parts[0]}</strong> to <strong>{parts[1]}</strong>...</>;
    }
    if (title.includes(' to ')) {
         const parts = title.split(/ to /i);
         return <>Converting <strong>{parts[0]}</strong> to <strong>{parts[1]}</strong>...</>;
    }
    const words = title.split(' ');
    let action = words[0];
    const rest = words.slice(1).join(' ');
    
    let gerund = action;
    if (action.endsWith('e')) {
        gerund = action.slice(0, -1) + 'ing';
    } else if (['split', 'compress', 'redact'].some(s => action.toLowerCase().includes(s))) {
         gerund = action + action.slice(-1) + 'ing';
    } else {
        gerund = action + 'ing';
    }
    if (title === 'Create ZIP file') {
        return <>Creating ZIP file...</>
    }

    return <>{gerund.charAt(0).toUpperCase() + gerund.slice(1)} {rest}...</>;
  };

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
  
  const handleReset = useCallback(() => {
    setState(ProcessingState.Idle);
    setErrorMessage('');
    setProcessedFileBlob(null);
    setFiles([]);
    setToolOptions(initialToolOptions);
    setProgress(null);
    setDownloadUrl('');
    setShareableUrl('');
    setIsShareModalOpen(false);
    setCloudSaveState({google: 'idle', dropbox: 'idle'});
    setPdfPages([]);
    setPdfPagePreviews([]);
    setCanvasItems([]);
    setIsModalOpen(false);
    setActiveDrag(null);
    setRedactionAreas([]);
    setIsDrawingRedaction(false);
    setRedactionStartPoint(null);
    setCurrentRedaction(null);
    setComparisonResults([]);
    setOriginalImageSize(null);
  }, []);

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
  }, [toolId, navigate, user, handleReset]);
  
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
                    } else if (psdData instanceof Uint8Array || psdData instanceof Uint8ClampedArray) {
                       targetArray.set(psdData);
                    }
                    const imageData = new ImageData(targetArray, psd.width, psd.height);
                    ctx.putImageData(imageData, 0, 0);
                }
                return c;
            })();

            const pngBytes = await new Promise<ArrayBuffer>((resolve) => {
                imageCanvas.toBlob(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
                    reader.readAsArrayBuffer(blob!);
                }, 'image/png');
            });

            const embeddedImage = await pdfDoc.embedPng(pngBytes);
            const page = pdfDoc.addPage([psd.width, psd.height]);
            page.drawImage(embeddedImage);

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
            for (let i = 1; i <= pdf.numPages; i++) {
                setProgress({ percentage: Math.round(((i - 1) / pdf.numPages) * 100), status: `Extracting text from page ${i}` });
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                fullText += pageText + '\n\n';
            }
            setProcessedFileBlob(new Blob([fullText], { type: 'text/plain' }));
            break;
          }
          case 'zip-maker': {
            if (files.length === 0) throw new Error("Please select at least one file to zip.");
            const zip = new JSZip();
            for (const [index, file] of files.entries()) {
                 setProgress({ percentage: Math.round(((index + 1) / files.length) * 100), status: `Adding file ${index + 1}` });
                 zip.file(file.name, file);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            setProcessedFileBlob(zipBlob);
            break;
          }
          case 'resize-file': {
              if (files.length !== 1) throw new Error("Please select exactly one file to resize.");
              const file = files[0];
              if (file.type.startsWith('image/')) {
                  // Handle image resizing
                  const image = new Image();
                  image.src = URL.createObjectURL(file);
                  await new Promise(resolve => image.onload = resolve);
                  const canvas = document.createElement('canvas');
                  const newWidth = image.width * (toolOptions.resizePercentage / 100);
                  const newHeight = image.height * (toolOptions.resizePercentage / 100);
                  canvas.width = newWidth;
                  canvas.height = newHeight;
                  const ctx = canvas.getContext('2d')!;
                  ctx.drawImage(image, 0, 0, newWidth, newHeight);
                  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, file.type, 0.9));
                  if (!blob) throw new Error("Could not resize image.");
                  setProcessedFileBlob(blob);
              } else if (file.type === 'application/pdf') {
                  // Handle PDF compression as "resizing"
                   setProgress({ percentage: 50, status: 'Compressing PDF... This may take a moment.'});
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

        }
        setState(ProcessingState.Success);
      } catch (e: any) {
        console.error(e);
        setErrorMessage(e.message || 'An unknown error occurred during processing.');
        setState(ProcessingState.Error);
      } finally {
        setProgress(null);
      }
  };

  if (!tool) {
    // This can happen briefly on load, or if the toolId is invalid.
    // A loading spinner could be shown here.
    return (
        <div className="flex items-center justify-center h-screen">
           <div className="text-center">
              <p className="text-xl font-semibold">Loading Tool...</p>
           </div>
        </div>
    );
  }
  
  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = getOutputFilename(tool.id, files, toolOptions);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleSaveToDropbox = async () => {
    if (!processedFileBlob) return;
    setCloudSaveState(prev => ({ ...prev, dropbox: 'saving' }));
    try {
        const dataUrl = await blobToDataURL(processedFileBlob);

        Dropbox.save(dataUrl, getOutputFilename(tool.id, files, toolOptions), {
            success: () => setCloudSaveState(prev => ({ ...prev, dropbox: 'saved' })),
            error: (err: any) => { console.error("Dropbox save error:", err); setCloudSaveState(prev => ({...prev, dropbox: 'idle'})); },
            cancel: () => setCloudSaveState(prev => ({...prev, dropbox: 'idle'})),
        });
    } catch (e) {
        console.error("Error preparing file for Dropbox", e);
        setCloudSaveState(prev => ({...prev, dropbox: 'idle'}));
    }
  };

    const openShareModal = async () => {
        if (!processedFileBlob) return;
        
        setIsShareModalOpen(true);
        setShareableUrl('');
        setQrCodeUrl('');
        setQrCodeError('');
        setIsQrLoading(true);

        let dataUrl = '';
        try {
            dataUrl = await blobToDataURL(processedFileBlob);
            setShareableUrl(dataUrl);
        } catch (error) {
            console.error("Error converting blob to data URL:", error);
            setShareableUrl('Error: Could not generate link.');
            setQrCodeError('Could not generate QR code link.');
            setIsQrLoading(false);
            return;
        }

        try {
            // Using a client-side library is more robust, private, and removes the network dependency.
            // Using 'L' for low errorCorrectionLevel to maximize data capacity.
            const generatedUrl = await QRCode.toDataURL(dataUrl, { width: 150, errorCorrectionLevel: 'L' });
            setQrCodeUrl(generatedUrl);
            setQrCodeError('');
        } catch (error) {
            console.error("Error generating QR code:", error);
            // This error typically happens if the data URL is too long for the QR code standard.
            setQrCodeError("This file is too large to generate a scannable QR code. Please use the 'Copy' button to share the download link.");
        } finally {
            setIsQrLoading(false);
        }
    };

    const closeShareModal = () => {
        if (qrCodeUrl.startsWith('blob:')) {
            URL.revokeObjectURL(qrCodeUrl);
        }
        setIsShareModalOpen(false);
    };

  const handleCopyLink = () => {
    if (!shareableUrl || shareableUrl.startsWith('Error')) return;
    navigator.clipboard.writeText(shareableUrl).then(() => {
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
    });
  }

  if (tool.id === 'scan-to-pdf') {
     return (
          <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-white">{tool.title}</h1>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl">{tool.description}</p>
              </div>
              <DocumentScannerUI tool={tool} />
          </div>
     );
  }

  return (
    <div className="py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {state !== ProcessingState.Processing && (
          <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center p-4 rounded-full ${tool.color} mb-4`}>
              <tool.Icon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{tool.title}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{tool.description}</p>
          </div>
        )}

        {state === ProcessingState.Idle && (
            <FileUpload tool={tool} files={files} setFiles={setFiles} accept={tool.accept}>
                 {files.length > 0 && (
                    <button
                        onClick={handleProcess}
                        disabled={isProcessButtonDisabled}
                        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors ${tool.color} ${tool.hoverColor} disabled:bg-gray-400 dark:disabled:bg-gray-600`}
                    >
                        {tool.title} <RightArrowIcon className="h-6 w-6" />
                    </button>
                )}
            </FileUpload>
        )}
        
        {state === ProcessingState.Processing && (
            <div className="flex flex-col items-center justify-center text-center w-full min-h-[60vh] py-12">
                <div className="mb-12">
                    <Logo className="h-12 w-auto" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {getProcessingMessage(tool)}
                </h2>
                <div className="mt-12">
                    <div 
                        className="w-24 h-24 border-[10px] border-gray-200 dark:border-gray-700 rounded-full animate-spin"
                        style={{ borderTopColor: '#B90B06' }}
                    ></div>
                </div>
                 {progress && (
                    <p className="mt-8 text-gray-600 dark:text-gray-400">{progress.status}</p>
                 )}
            </div>
        )}

        {state === ProcessingState.Error && (
            <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-xl border border-red-200 dark:border-red-800">
                <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">An Error Occurred</h2>
                <p className="mt-2 text-red-600 dark:text-red-400">{errorMessage}</p>
                <button onClick={handleReset} className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Try Again</button>
            </div>
        )}
        
        {state === ProcessingState.Success && (
            <div className="text-center w-full max-w-7xl mx-auto py-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {getSuccessMessage(tool)}
                </h2>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={handleDownload} className="flex-grow-0 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 px-8 rounded-lg text-xl flex items-center gap-3 transition-colors">
                        <DownloadIcon className="h-6 w-6" />
                        {getDownloadButtonText(tool)}
                    </button>
                    <div className="flex gap-4">
                         <button onClick={handleSaveToDropbox} disabled={cloudSaveState.dropbox !== 'idle'} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Save to Dropbox" title="Save to Dropbox">
                             {cloudSaveState.dropbox === 'saving' ? <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : cloudSaveState.dropbox === 'saved' ? <CheckIcon className="h-6 w-6 text-green-500" /> : <DropboxIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />}
                        </button>
                        <button onClick={openShareModal} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Share download link" title="Share download link">
                            <LinkIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                        </button>
                    </div>
                </div>

                <div className="mt-16 bg-white dark:bg-black p-8 rounded-lg shadow-lg max-w-5xl mx-auto border border-gray-200 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Continue to...</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {TOOLS.slice(0, 12).map(t => (
                            <Link key={t.id} to={`/${t.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className={`p-2 rounded-md ${t.color}`}>
                                    <t.Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-left">{t.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center p-6 bg-gray-50 dark:bg-black/50 rounded-lg max-w-5xl mx-auto border border-gray-200 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">How can you thank us? Spread the word!</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Please share the tool to inspire more productive people!</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <a href="https://www.trustpilot.com/review/ilovepdfly.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <StarIcon className="h-5 w-5 text-green-500" />
                            <span>Trustpilot</span>
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Filovepdfly.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <FacebookIcon className="h-5 w-5 text-blue-600" />
                            <span>Facebook</span>
                        </a>
                        <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Filovepdfly.com&text=Check%20out%20iLovePDFLY,%20the%20best%20free%20online%20PDF%20toolkit!" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <XIcon className="h-5 w-5" />
                            <span>Twitter</span>
                        </a>
                        <a href="https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Filovepdfly.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <LinkedInIcon className="h-5 w-5 text-blue-700" />
                            <span>LinkedIn</span>
                        </a>
                    </div>
                </div>

                <div className="mt-12 text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-5xl mx-auto border border-blue-200 dark:border-blue-700">
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Secure. Private. In your control.</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Your files are processed with end-to-end encryption and are deleted from our servers automatically.</p>
                </div>
            </div>
        )}

        {isShareModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeShareModal}>
                <div className="bg-white dark:bg-black w-full max-w-md rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Copy & Send download link</h3>
                            <button onClick={closeShareModal} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><CloseIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex">
                            <input 
                                type="text" 
                                readOnly 
                                value={shareableUrl.startsWith('Error') ? shareableUrl : shareableUrl.substring(0, 60) + '...'}
                                placeholder="Generating link..."
                                className="flex-grow w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm truncate text-gray-800 dark:text-gray-200"
                            />
                            <button 
                                onClick={handleCopyLink}
                                disabled={!shareableUrl || isCopying || shareableUrl.startsWith('Error')}
                                className="bg-brand-red text-white font-bold px-4 rounded-r-md text-sm disabled:bg-red-300 dark:disabled:bg-red-800 w-24"
                            >
                                {isCopying ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Instantly download to your phone</h3>
                        <div className="mt-4 bg-white dark:bg-gray-900 p-2 rounded inline-block shadow-md">
                            {isQrLoading ? (
                                <div className="w-[150px] h-[150px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                                    <svg className="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            ) : qrCodeError ? (
                                <div className="w-[150px] h-[150px] flex items-center justify-center p-2 text-sm text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded">
                                    {qrCodeError}
                                </div>
                            ) : (
                                <img 
                                    src={qrCodeUrl} 
                                    alt="QR code for file download"
                                    width="150"
                                    height="150"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {state !== ProcessingState.Processing && (
          <div className="mt-12 text-center">
            <button onClick={handleReset} className="text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
              &larr; Process another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolPage;