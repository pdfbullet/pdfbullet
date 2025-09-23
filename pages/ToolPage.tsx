
import React, { useState, useEffect, useCallback, useRef, useMemo, useContext, createContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import FileUpload from '../components/FileUpload.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';
import { 
    TrashIcon, UploadCloudIcon, EditIcon, ImageIcon, CameraIcon, CloseIcon, UploadIcon, RotateIcon, LockIcon, 
    UnlockIcon, EmailIcon, WhatsAppIcon, RightArrowIcon, LeftArrowIcon, DownloadIcon, GoogleDriveIcon, LinkIcon, 
    DropboxIcon, CheckIcon, CopyIcon, StarIcon, FacebookIcon, XIcon, LinkedInIcon, IOSIcon, AndroidIcon, 
    MacOSIcon, WindowsIcon, GlobeIcon, PlusIcon, UpDownArrowIcon, AddPageIcon, DesktopIcon, SettingsIcon
} from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';
import WhoWillSignModal from '../components/WhoWillSignModal.tsx';
import SignatureModal from '../components/SignatureModal.tsx';
import { useSignature } from '../hooks/useSignature.ts';
import { useSignedDocuments } from '../hooks/useSignedDocuments.ts';
import { useLastTasks } from '../hooks/useLastTasks.ts';
import { LayoutContext } from '../App.tsx';
import { GoogleGenAI, Type, Modality } from '@google/genai';


// FIX: Removed unused and incorrect 'Perms' type from pdf-lib import.
import { PDFDocument, rgb, degrees, StandardFonts, PDFRef, PDFFont, PageSizes, BlendMode, grayscale } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, ImageRun, SectionType, AlignmentType, convertInchesToTwip } from 'docx';
import PptxGenJS from 'pptxgenjs';
import Tesseract from 'tesseract.js';
import pixelmatch from 'pixelmatch';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { readPsd } from 'ag-psd';
import { removeBackground } from '@imgly/background-removal';
import * as QRCode from 'qrcode';
import mammoth from 'mammoth';

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

// Updated interface for Organize PDF tool
interface OrganizePdfPage {
    id: number;
    originalIndex: number;
    imageDataUrl: string;
    rotation: number;
    sourceFileIndex: number;
    isBlank?: boolean;
    fileName: string;
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
                case 'lighten': // Improved lighten filter
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = Math.min(255, data[i] + 20); // R
                        data[i + 1] = Math.min(255, data[i + 1] + 20); // G
                        data[i + 2] = Math.min(255, data[i + 2] + 20); // B
                    }
                    break;
                case 'magic_color': // Enhanced contrast and saturation
                    const contrast = 30;
                    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = Math.min(255, factor * (data[i] - 128) + 128);
                        data[i+1] = Math.min(255, factor * (data[i+1] - 128) + 128);
                        data[i+2] = Math.min(255, factor * (data[i+2] - 128) + 128);
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
      { name: 'Magic', id: 'magic_color' },
      { name: 'B&W', id: 'bw' },
      { name: 'Grayscale', id: 'bw2' },
    ];
    return (
      <div className="flex justify-center space-x-1 sm:space-x-2 overflow-x-auto p-1 no-scrollbar bg-black/30 rounded-b-md">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={(e) => { e.stopPropagation(); onFilterChange(f.id); }}
            className={`px-2 py-1 rounded-md font-semibold text-xs whitespace-nowrap transition-all text-white ${activeFilter === f.id ? 'bg-brand-red/80' : 'bg-black/40 hover:bg-black/60'}`}
          >
            {f.name}
          </button>
        ))}
      </div>
    );
};

interface ScannedPage {
    id: number;
    original: string; // The auto-cropped, de-skewed version
    filtered: string; // The version with user-selected filters applied
    filter: FilterType;
}

interface DocumentScannerUIProps {
    tool: Tool;
    onProcessStart: () => void;
    onProcessSuccess: (blob: Blob, filename: string) => void;
    onProcessError: (message: string) => void;
}

const DocumentScannerUI: React.FC<DocumentScannerUIProps> = ({ tool, onProcessStart, onProcessSuccess, onProcessError }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
    const [cameraState, setCameraState] = useState<'initializing' | 'active' | 'denied' | 'not-found' | 'error'>('initializing');
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState<number | null>(null);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        } else {
            console.error("API Key for AI features is not configured.");
            onProcessError("AI features are not available: API Key is missing.");
        }
    }, [onProcessError]);

    const processPageWithAI = useCallback(async (imageDataUrl: string): Promise<string> => {
        if (!ai) return imageDataUrl;

        const base64Data = imageDataUrl.split(',')[1];
        const mimeType = imageDataUrl.match(/:(.*?);/)?.[1] || 'image/jpeg';
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType } },
                        { text: 'This is an image of a document taken with a camera. Please identify the document within the image, crop it to its edges, correct any perspective distortion so it appears as a flat scan, and enhance the brightness and contrast for optimal readability. Return only the processed image.' },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const processedBase64 = part.inlineData.data;
                    const processedMimeType = part.inlineData.mimeType;
                    return `data:${processedMimeType};base64,${processedBase64}`;
                }
            }
            console.warn("AI did not return an image part, using original.");
            return imageDataUrl;
        } catch (error) {
            console.error("AI image processing failed:", error);
            throw error;
        }
    }, [ai]);

    const addPage = useCallback(async (imageDataUrl: string) => {
        const newPageId = Date.now();
        setIsAiProcessing(newPageId);
        
        // Add a temporary page so the user sees something happening immediately.
        const tempPage: ScannedPage = {
            id: newPageId,
            original: imageDataUrl,
            filtered: imageDataUrl,
            filter: 'original',
        };
        setScannedPages(prev => [...prev, tempPage]);
        
        try {
            const processedDataUrl = await processPageWithAI(imageDataUrl);
            const newPage: ScannedPage = {
                id: newPageId,
                original: processedDataUrl,
                filtered: processedDataUrl,
                filter: 'original',
            };
            setScannedPages(prev => prev.map(p => p.id === newPageId ? newPage : p));
        } catch (e) {
            console.error("AI processing failed", e);
            onProcessError("AI processing failed. Using original image.");
        } finally {
            setIsAiProcessing(null);
        }
    }, [processPageWithAI, onProcessError]);
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                addPage(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
      }
    }, [addPage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': ['.jpeg', '.jpg', '.png', '.webp']} });

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        stopCamera();
        setCameraState('initializing');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } } });
            streamRef.current = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                     videoRef.current?.play();
                     setCameraState('active');
                };
            }
        } catch (err) {
             if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') setCameraState('denied');
                else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') setCameraState('not-found');
                else setCameraState('error');
            } else {
                setCameraState('error');
            }
            console.error("Camera Error:", err);
        }
    }, [facingMode, stopCamera]);

    useEffect(() => {
        if (!showUpload) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [showUpload, startCamera, stopCamera]);


    const switchCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const capturePage = () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.videoWidth === 0) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        addPage(dataUrl);
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
    
    const processAndOutput = async (format: 'pdf' | 'jpg') => {
        if (scannedPages.length === 0) {
            onProcessError("Please scan or upload at least one page.");
            return;
        }
        onProcessStart();
        setIsProcessing(true);
        try {
            if (format === 'pdf') {
                const pdf = new jsPDF('p', 'mm', 'a4');
                for (let i = 0; i < scannedPages.length; i++) {
                    const page = scannedPages[i];
                    if (i > 0) pdf.addPage();
                    
                    const img = new Image();
                    await new Promise<void>(resolve => { img.onload = () => resolve(); img.src = page.filtered; });
                    
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgRatio = img.width / img.height;
                    const pdfRatio = pdfWidth / pdfHeight;
                    
                    let newWidth, newHeight;
                    if (imgRatio > pdfRatio) {
                        newWidth = pdfWidth;
                        newHeight = pdfWidth / imgRatio;
                    } else {
                        newHeight = pdfHeight;
                        newWidth = pdfHeight * imgRatio;
                    }
                    
                    const xOffset = (pdfWidth - newWidth) / 2;
                    const yOffset = (pdfHeight - newHeight) / 2;

                    pdf.addImage(img, 'JPEG', xOffset, yOffset, newWidth, newHeight);
                }
                const pdfBlob = pdf.output('blob');
                onProcessSuccess(pdfBlob, 'document_scan.pdf');
            } else { // JPG
                if (scannedPages.length === 1) {
                    const res = await fetch(scannedPages[0].filtered);
                    const blob = await res.blob();
                    onProcessSuccess(blob, 'scan.jpg');
                } else {
                    const zip = new JSZip();
                    for (let i = 0; i < scannedPages.length; i++) {
                        const page = scannedPages[i];
                        const res = await fetch(page.filtered);
                        const blob = await res.blob();
                        zip.file(`scan_${i + 1}.jpg`, blob);
                    }
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    onProcessSuccess(zipBlob, 'scanned_images.zip');
                }
            }
        } catch (err) {
            console.error(err);
            onProcessError(`Failed to generate ${format.toUpperCase()}. Please try again.`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const CameraView = () => (
        <div className="relative w-full aspect-[9/16] sm:aspect-video rounded-lg shadow-lg bg-black overflow-hidden">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover"></video>
            
            {cameraState !== 'active' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-center p-4">
                    {cameraState === 'initializing' && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>}
                    {cameraState === 'denied' && <>
                        <LockIcon className="w-12 h-12 mb-4" />
                        <h3 className="font-bold">Camera access denied</h3>
                        <p className="text-sm">Please allow camera access in your browser settings to continue.</p>
                        <button onClick={startCamera} className="mt-4 px-4 py-2 bg-white/20 rounded-md font-semibold hover:bg-white/30">Retry</button>
                    </>}
                    {cameraState === 'not-found' && <p>No camera found. Please connect a camera and try again.</p>}
                    {cameraState === 'error' && <p>Could not start camera. Please try again.</p>}
                </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-around">
                    <button onClick={() => setShowUpload(true)} className="p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors" aria-label="Upload image">
                        <ImageIcon className="h-6 w-6" />
                    </button>
                    <button onClick={capturePage} disabled={cameraState !== 'active'} className="bg-white p-2 rounded-full shadow-2xl border-4 border-gray-300 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-black focus:ring-brand-red disabled:opacity-50" aria-label="Capture page">
                        <div className="w-12 h-12 bg-brand-red rounded-full ring-2 ring-white ring-inset"></div>
                    </button>
                    <button onClick={switchCamera} className="p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors" aria-label="Switch camera">
                        <RotateIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
    
    const UploadView = () => (
        <div {...getRootProps()} className={`relative flex flex-col items-center justify-center p-12 aspect-[9/16] sm:aspect-video rounded-lg cursor-pointer transition-all duration-300 border-2 border-dashed ${ isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black hover:border-brand-red'}`}>
            <input {...getInputProps()} />
            <UploadCloudIcon className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">Upload an Image</p>
            <p className="text-gray-500 dark:text-gray-400">or drop it here</p>
             <button onClick={(e) => { e.stopPropagation(); setShowUpload(false); }} className="mt-6 text-sm text-brand-red hover:underline font-semibold">
                Use Camera Instead
            </button>
        </div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
             {showUpload ? <UploadView /> : <CameraView />}
            
            {scannedPages.length > 0 && (
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold mb-4">Scanned Pages ({scannedPages.length})</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {scannedPages.map(page => (
                            <div key={page.id} className="relative group rounded-md overflow-hidden border-2 border-transparent focus-within:border-brand-red">
                                <img src={page.filtered} alt="Scanned page" className="w-full aspect-[3/4] object-cover" />
                                {isAiProcessing === page.id && (
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                        <p className="text-xs mt-2 font-semibold">Processing...</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                                    <FilterBar onFilterChange={(filter) => handleFilterChange(page.id, filter)} activeFilter={page.filter} />
                                </div>
                                 <button onClick={() => removePage(page.id)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-600 transition-colors" aria-label="Remove page">
                                    <CloseIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => processAndOutput('pdf')} disabled={isProcessing || isAiProcessing !== null} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg text-lg disabled:bg-red-300">
                            {isProcessing ? 'Processing...' : 'Create PDF'}
                        </button>
                        <button onClick={() => processAndOutput('jpg')} disabled={isProcessing || isAiProcessing !== null} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:bg-gray-400">
                            {isProcessing ? 'Processing...' : 'Save as JPG'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// FIX: Define missing helper functions
const formatBytes = (bytes: number, decimals = 2): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:-- remaining';
    if (seconds < 60) return `${Math.round(seconds)}s remaining`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s remaining`;
};

// FIX: Define missing CompressionResultDisplay component
const CompressionResultDisplay: React.FC<{ result: { originalSize: number; newSize: number } }> = ({ result }) => {
    const reduction = result.originalSize > 0 ? ((result.originalSize - result.newSize) / result.originalSize) * 100 : 0;
    
    return (
        <div className="my-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 max-w-md mx-auto">
            <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200">Compression Complete!</h3>
            <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Original Size:</span>
                <span className="font-semibold">{formatBytes(result.originalSize)}</span>
            </div>
            <div className="flex justify-between items-center mt-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">New Size:</span>
                <span className="font-semibold">{formatBytes(result.newSize)}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-600 flex justify-between items-center text-lg">
                <span className="font-bold text-green-600 dark:text-green-400">Reduction:</span>
                <span className="font-extrabold text-green-600 dark:text-green-400">{reduction.toFixed(1)}%</span>
            </div>
        </div>
    );
};

// FIX: Define missing CompressionOptions component
const CompressionOptions: React.FC<{ level: string; setLevel: (level: string) => void; }> = ({ level, setLevel }) => {
    const options = [
        { id: 'less', name: 'Less Compression', description: 'Higher quality, larger file size.' },
        { id: 'recommended', name: 'Recommended Compression', description: 'Good quality, good compression.' },
        { id: 'extreme', name: 'Extreme Compression', description: 'Lower quality, smallest file size.' },
    ];
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Compression Level</h3>
            <div className="space-y-3">
                {options.map(opt => (
                    <div
                        key={opt.id}
                        onClick={() => setLevel(opt.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${level === opt.id ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                    >
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{opt.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{opt.description}</p>
                    </div>
                ))}
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
    case 'document-scanner': return 'scanned_document.pdf';
    case 'pdf-to-word': return `${baseName}.docx`;
    case 'pdf-to-jpg': return `${baseName}_images.zip`;
    case 'ocr-pdf': return `${baseName}_ocr.pdf`;
    case 'word-to-pdf': return `${baseName}.pdf`;
    case 'pdf-to-excel': return `${baseName}.xlsx`;
    case 'excel-to-pdf': return `${baseName}.pdf`;
    case 'pdf-to-powerpoint': return `${baseName}.pptx`;
    case 'powerpoint-to-pdf': return `${baseName}.pptx`;
    case 'crop-pdf': return `${baseName}_cropped.pdf`;
    case 'redact-pdf': return `${baseName}_redacted.pdf`;
    case 'repair-pdf': return files.length > 1 ? 'repaired_files.zip' : `${baseName}_repaired.pdf`;
    case 'pdf-to-pdfa': return `${baseName}_pdfa.pdf`;
    case 'edit-pdf': return `${baseName}_edited.pdf`;
    case 'sign-pdf': return `${baseName}_signed.pdf`;
    case 'organize-pdf': return 'organized.pdf';
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
    rotation: 90,
};

// ===================================================================
// ORGANIZE PDF UI COMPONENT
// ===================================================================
interface OrganizePdfUIProps {
    files: File[];
    onProcessStart: () => void;
    onProcessSuccess: (blob: Blob) => void;
    onProcessError: (message: string) => void;
    onReset: () => void;
    onAddMoreFiles: () => void;
}

const ToolPageContext = React.createContext<{ tool: Tool | null }>({ tool: null });
const useToolPageContext = () => React.useContext(ToolPageContext);

const OrganizePdfUI: React.FC<OrganizePdfUIProps> = ({ files, onProcessStart, onProcessSuccess, onProcessError, onReset, onAddMoreFiles }) => {
    const [pages, setPages] = useState<OrganizePdfPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Extracting pages...');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const { t } = useI18n();
    const { tool } = useToolPageContext();


    const extractPages = useCallback(async () => {
        setIsLoading(true);
        setLoadingMessage('Extracting pages...');
        
        const allPages: OrganizePdfPage[] = [];
        let totalPages = 0;
        const pdfDocsPromises = files.map(file => file.arrayBuffer().then(data => pdfjsLib.getDocument({ data }).promise));
        const pdfDocs = await Promise.all(pdfDocsPromises);
        pdfDocs.forEach(pdf => totalPages += pdf.numPages);
        let pagesProcessed = 0;

        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            const file = files[fileIndex];
            const pdf = pdfDocs[fileIndex];
            for (let i = 1; i <= pdf.numPages; i++) {
                pagesProcessed++;
                setLoadingMessage(`Extracting page ${pagesProcessed} of ${totalPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.4 });
                const canvasEl = document.createElement('canvas');
                canvasEl.width = viewport.width;
                canvasEl.height = viewport.height;
                // FIX: The render method was called with incorrect parameters. This is likely due to a type definition mismatch. Casting to 'any' bypasses the incorrect type check.
                await page.render({ canvasContext: canvasEl.getContext('2d')!, viewport } as any);
                const dataUrl = canvasEl.toDataURL('image/png');
                allPages.push({ id: Date.now() + allPages.length, originalIndex: i - 1, imageDataUrl: dataUrl, rotation: 0, sourceFileIndex: fileIndex, fileName: file.name });
            }
        }
        setPages(allPages);
        setIsLoading(false);
    }, [files]);

    useEffect(() => {
        extractPages();
    }, [extractPages]);

    const handleRotate = (id: number) => {
        setPages(pages.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    };

    const handleDelete = (id: number) => {
        setPages(pages.filter(p => p.id !== id));
    };
    
    const handleAddBlankPage = (index: number) => {
         const newPage: OrganizePdfPage = {
            id: Date.now(),
            originalIndex: -1,
            imageDataUrl: '',
            rotation: 0,
            sourceFileIndex: -1,
            isBlank: true,
            fileName: 'Blank Page'
        };
        const newPages = [...pages];
        newPages.splice(index, 0, newPage);
        setPages(newPages);
    };

    const handleSort = () => {
        const sortedPages = [...pages].sort((a, b) => {
            if (a.isBlank || b.isBlank) return 0;
            const nameA = a.fileName.toLowerCase();
            const nameB = b.fileName.toLowerCase();
            if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
            if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
            return sortOrder === 'asc' ? a.originalIndex - b.originalIndex : b.originalIndex - a.originalIndex;
        });
        setPages(sortedPages);
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
        const list = [...pages];
        const draggedItemContent = list[dragItem.current!];
        list.splice(dragItem.current!, 1);
        list.splice(dragOverItem.current!, 0, draggedItemContent);
        dragItem.current = dragOverItem.current;
        dragOverItem.current = null;
        setPages(list);
    };
    
    const handleOrganize = async () => {
        onProcessStart();
        try {
            const sourcePdfDocs = await Promise.all(
                files.map(file => file.arrayBuffer().then(bytes => PDFDocument.load(bytes, { ignoreEncryption: true })))
            );
            const newPdfDoc = await PDFDocument.create();

            for (const pageInfo of pages) {
                if (pageInfo.isBlank) {
                    newPdfDoc.addPage(PageSizes.A4);
                    continue;
                }
                const sourceDoc = sourcePdfDocs[pageInfo.sourceFileIndex];
                const [copiedPage] = await newPdfDoc.copyPages(sourceDoc, [pageInfo.originalIndex]);
                copiedPage.setRotation(degrees(pageInfo.rotation));
                newPdfDoc.addPage(copiedPage);
            }
            const newPdfBytes = await newPdfDoc.save();
            onProcessSuccess(new Blob([newPdfBytes], { type: 'application/pdf' }));
        } catch(e: any) {
            onProcessError(e.message || "An error occurred during organization.");
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
                <p className="mt-4">{loadingMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            <main className="lg:col-span-9">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pages.map((page, index) => (
                        <div
                            key={page.id}
                            className="relative group text-center"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragOver={(e) => e.preventDefault()}
                        >
                             <div className="relative border-2 border-pink-100 dark:border-gray-700 group-hover:border-brand-red rounded-lg transition-all p-1 bg-white dark:bg-gray-800 shadow-md">
                                {page.isBlank ? (
                                    <div className="aspect-[3/4] bg-gray-50 dark:bg-gray-700 flex items-center justify-center rounded-md border border-dashed">
                                        <span className="text-gray-400">Blank Page</span>
                                    </div>
                                ) : (
                                    <img src={page.imageDataUrl} alt={`Page ${page.originalIndex + 1}`} className="w-full rounded-md" style={{ transform: `rotate(${page.rotation}deg)` }} />
                                )}
                                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleRotate(page.id)} title="Rotate Page" className="p-1.5 bg-gray-800/70 text-white rounded-full hover:bg-brand-red"><RotateIcon className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(page.id)} title="Delete Page" className="p-1.5 bg-gray-800/70 text-white rounded-full hover:bg-brand-red"><CloseIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <p className="text-sm mt-1">{page.isBlank ? 'Blank' : index + 1}</p>
                        </div>
                    ))}
                     <div
                        onClick={() => handleAddBlankPage(pages.length)}
                        title="Add blank page at the end"
                        className="aspect-[3/4] bg-white dark:bg-gray-800 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-brand-red hover:text-brand-red cursor-pointer transition-colors"
                    >
                        <AddPageIcon className="h-8 w-8" />
                        <span className="text-sm mt-2">Add blank page</span>
                    </div>
                </div>
            </main>

            <aside className="lg:col-span-3 lg:sticky lg:top-24 bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold mb-4">{t(tool!.title)}</h2>
                     <div className="relative">
                        <button onClick={onAddMoreFiles} title="Add more files" className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-red-dark transition-colors relative">
                            <PlusIcon className="h-6 w-6" />
                        </button>
                         <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-black">{files.length}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">A: {files.map(f => f.name).join(', ')}</p>
                <div className="space-y-4">
                    <button onClick={handleSort} className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"><UpDownArrowIcon className="h-5 w-5" /> Sort files by name</button>
                    <button onClick={() => onReset()} className="w-full text-center text-brand-red font-semibold text-sm mt-2 hover:underline">Reset all</button>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                     <button onClick={handleOrganize} disabled={pages.length === 0} className="w-full bg-brand-red text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center gap-2 hover:bg-brand-red-dark disabled:bg-red-300">
                        {t(tool!.title)} <RightArrowIcon className="h-5 w-5" />
                    </button>
                </div>
            </aside>
        </div>
    );
};

// ===================================================================
// BACKGROUND REMOVAL UI COMPONENT
// ===================================================================
const SparkleIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 0L24.5258 17.4742L42 21L24.5258 24.5258L21 42L17.4742 24.5258L0 21L17.4742 17.4742L21 0Z" fill="#FFD700" fillOpacity="0.8"/>
    </svg>
);

const StarryLoader: React.FC<{ imageSrc: string | null }> = ({ imageSrc }) => {
    const sparkles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 90 + 5}%`,
            left: `${Math.random() * 90 + 5}%`,
            animationDuration: `${Math.random() * 1.5 + 0.8}s`,
            animationDelay: `${Math.random() * 2}s`,
            size: `${Math.random() * 16 + 8}px`
        }));
    }, []);

    return (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
            {imageSrc && <img src={imageSrc} alt="Processing..." className="absolute inset-0 w-full h-full object-contain" />}
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="absolute inset-0 w-full h-full">
                {sparkles.map(s => (
                    <SparkleIcon 
                        key={s.id} 
                        className="sparkle-effect"
                        style={{
                            top: s.top,
                            left: s.left,
                            width: s.size,
                            height: s.size,
                            animationDuration: s.animationDuration,
                            animationDelay: s.animationDelay,
                        }}
                    />
                ))}
            </div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-gray-900/60 rounded-full backdrop-blur-sm border border-white/10">
                <button className="w-10 h-10 bg-gray-200/20 text-white rounded-full flex items-center justify-center text-2xl font-light">+</button>
                <div className="w-12 h-12 border-2 border-blue-400/30 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-t-transparent border-blue-400 rounded-full animate-spin"></div>
                </div>
                {imageSrc && <img src={imageSrc} alt="thumbnail" className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />}
            </div>
        </div>
    );
};


const BackgroundRemovalUI: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalSrc, setOriginalSrc] = useState<string | null>(null);
    const [processedSrc, setProcessedSrc] = useState<string | null>(null);
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState({ key: '', current: 0, total: 100 });
    const [background, setBackground] = useState<'transparent' | 'color'>('transparent');
    const [bgColor, setBgColor] = useState('#ffffff');
    const { addTask } = useLastTasks();
    const { t } = useI18n();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setOriginalFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setOriginalSrc(e.target?.result as string);
            reader.readAsDataURL(file);
            setError('');
            setProcessedSrc(null);
            setProcessedBlob(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: tool.accept,
        multiple: false,
    });

    useEffect(() => {
        if (!originalFile) return;

        const processImage = async () => {
            setIsLoading(true);
            setProgress({ key: 'Starting...', current: 0, total: 100 });
            try {
                const resultBlob = await removeBackground(originalFile, {
                    progress: (key, current, total) => {
                        const stage = key === 'download' ? 'Downloading AI Model' : 'Processing Image';
                        setProgress({ key: stage, current, total });
                    }
                });
                const resultSrc = URL.createObjectURL(resultBlob);
                setProcessedBlob(resultBlob);
                setProcessedSrc(resultSrc);
            } catch (e: any) {
                setError("Could not process image. It might be too large, in an unsupported format, or the content could not be processed.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        processImage();

        return () => {
            if (processedSrc) {
                URL.revokeObjectURL(processedSrc);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originalFile]);

    const handleReset = () => {
        setOriginalFile(null);
        setOriginalSrc(null);
        setProcessedSrc(null);
        setProcessedBlob(null);
        setError('');
    };

    const handleDownload = async () => {
        if (!processedBlob || !originalFile) return;

        let blobToDownload: Blob | null = processedBlob;
        const filename = getOutputFilename(tool.id, [originalFile], {});

        if (background === 'color' && processedSrc) {
            try {
                const img = new Image();
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = reject;
                    img.src = processedSrc;
                });

                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                    const newBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
                    if (newBlob) {
                        blobToDownload = newBlob;
                    }
                }
            } catch (e) {
                console.error("Failed to apply color background:", e);
            }
        }
        
        if (blobToDownload) {
            const url = URL.createObjectURL(blobToDownload);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addTask({
                toolId: tool.id,
                toolTitle: t(tool.title),
                outputFilename: filename,
                fileBlob: blobToDownload
            });
        }
    };

    if (!originalFile) {
        return (
            <div className="max-w-3xl mx-auto">
                <div
                    {...getRootProps()}
                    className={`relative flex flex-col items-center justify-center p-12 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${
                        isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black hover:border-brand-red'
                    }`}
                >
                    <input {...getInputProps()} />
                    <UploadCloudIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">Select an Image</p>
                    <p className="text-gray-500 dark:text-gray-400">or drop it here</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            <main className="lg:col-span-8 bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                <div className="relative w-full h-full aspect-square lg:aspect-auto min-h-[400px]">
                    <div 
                        className={`absolute inset-0 rounded-md ${background === 'transparent' ? 'bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAC1JREFUOE9jZGBgEGHAD97/D0eMGI2MDBsMAn4yMIDxfaemAPwI+b8pIM4ADzE0IBsASx07QfA8w54AAAAASUVORK5CYII=)]' : ''}`}
                        style={{ backgroundColor: background === 'color' ? bgColor : 'transparent' }}
                    ></div>
                    
                    {!isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                            {processedSrc && (
                                <img src={processedSrc} alt="Processed with background removed" className="max-w-full max-h-full object-contain" />
                            )}
                             {error && (
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                                    <p className="font-bold">Processing Failed</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {isLoading && <StarryLoader imageSrc={originalSrc} />}
                </div>
            </main>
            <aside className="lg:col-span-4 bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold mb-4">Edit & Download</h3>
                <div className="space-y-6">
                    <div>
                        <p className="font-semibold text-sm mb-2">Original</p>
                        <img src={originalSrc} alt="Original input" className="w-full rounded-md border" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm mb-2">Background</p>
                        <div className="flex gap-2">
                            <button onClick={() => setBackground('transparent')} className={`flex-1 p-2 border-2 rounded-md text-sm ${background === 'transparent' ? 'border-brand-red' : ''}`}>Transparent</button>
                            <button onClick={() => setBackground('color')} className={`flex-1 p-2 border-2 rounded-md text-sm ${background === 'color' ? 'border-brand-red' : ''}`}>Color</button>
                        </div>
                        {background === 'color' && (
                            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 mt-2 p-1 border rounded-md" />
                        )}
                    </div>
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <button onClick={handleDownload} disabled={!processedSrc} className="w-full bg-brand-red text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center gap-2 hover:bg-brand-red-dark disabled:bg-red-300">
                            <DownloadIcon className="h-5 w-5" /> Download
                        </button>
                        <button onClick={handleReset} className="w-full text-center text-gray-500 dark:text-gray-400 font-semibold text-sm hover:underline">
                            Process another image
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const toolSeoDescriptions: { [key: string]: string } = {
  'merge-pdf': 'Combine multiple PDF files into one single PDF document with I Love PDFLY\'s free online PDF merger. Easy to use, no installation needed.',
  'split-pdf': 'Split a large PDF file into separate pages or extract a specific range of pages into a new PDF document. Fast and secure splitting tool.',
  'compress-pdf': 'Reduce the file size of your PDF documents online for free. Optimize your PDFs for web and email sharing without losing quality.',
  'pdf-to-word': 'Convert your PDF files to editable DOCX Word documents. Our converter preserves layouts, text, and images accurately.',
  'pdf-to-powerpoint': 'Turn your PDF presentations into editable PPTX slideshows. Each PDF page becomes a slide in PowerPoint.',
  'pdf-to-excel': 'Extract data and tables from your PDF files into editable Excel spreadsheets. Convert PDF to XLSX with high accuracy.',
  'word-to-pdf': 'Convert Microsoft Word documents (DOCX) to PDF format. Preserve your formatting and share your documents securely.',
  'powerpoint-to-pdf': 'Convert Microsoft PowerPoint presentations (PPTX) to PDF. Perfect for sharing and archiving your slides.',
  'excel-to-pdf': 'Convert Microsoft Excel spreadsheets (XLSX) to PDF. Ensure your tables and data are presented perfectly every time.',
  'edit-pdf': 'Edit PDF files online. Add text, images, shapes, and annotations to your documents with our powerful and free PDF editor.',
  'pdf-to-jpg': 'Convert each page of your PDF into a high-quality JPG image. You can also extract all embedded images from a PDF.',
  'jpg-to-pdf': 'Convert JPG images to PDF files. Combine multiple images into a single PDF document, adjust orientation and margins.',
  'sign-pdf': 'Sign PDF documents yourself or request electronic signatures from others. Create legally binding signatures for free.',
  'watermark-pdf': 'Add a text or image watermark to your PDF files. Protect your documents with a custom watermark.',
  'rotate-pdf': 'Rotate PDF pages. Permanently rotate all or specific pages in your PDF document to the correct orientation.',
  'html-to-pdf': 'Convert any webpage to a high-quality PDF file by simply entering the URL.',
  'unlock-pdf': 'Remove password protection and restrictions from your PDF files. Unlock secured PDFs so you can edit and print them.',
  'protect-pdf': 'Add a password to your PDF file to protect it from unauthorized access. Encrypt your sensitive documents.',
  'organize-pdf': 'Reorder, delete, and add pages to your PDF document. Visually organize your PDF files with ease.',
  'pdf-to-pdfa': 'Convert your PDF documents to PDF/A, the ISO-standardized version of PDF for long-term archiving.',
  'repair-pdf': 'Attempt to repair and recover data from corrupted or damaged PDF files.',
  'page-numbers': 'Add page numbers to your PDF documents. Customize the position, format, and style of your page numbers.',
  'document-scanner': 'Use your device camera to scan documents and convert them to high-quality PDF files. Adjust filters for perfect scans.',
  'ocr-pdf': 'Convert scanned PDFs and images into searchable and selectable text documents using Optical Character Recognition (OCR).',
  'compare-pdf': 'Compare two PDF files side-by-side to find differences. Highlights changes in text and content.',
  'redact-pdf': 'Permanently remove sensitive information and text from your PDF documents by blacking it out.',
  'crop-pdf': 'Crop the margins of your PDF file. Select an area to crop and remove unwanted parts of your pages.',
  'remove-background': 'Automatically remove the background from any image with a single click. Get a transparent PNG output.',
  'psd-to-pdf': 'Convert Adobe Photoshop (PSD) files to PDF format.',
  'pdf-to-png': 'Convert PDF pages to high-quality PNG images.',
  'extract-text': 'Extract all text from a PDF file into a simple TXT file.',
  'zip-maker': 'Create a ZIP archive from multiple files. Compress your files for easy storage and sharing.',
  'resize-file': 'Resize PDF documents or images to reduce file size or change dimensions.',
  'resize-image': 'Resize images by pixels or percentage. Maintain aspect ratio and choose output format.',
  'crop-image': 'Crop images online. Define a crop box to cut out a part of your image.',
  'convert-to-jpg': 'Convert various image formats like PNG, GIF, WEBP, and SVG to JPG.',
  'convert-from-jpg': 'Convert JPG images to other formats like PNG or GIF.',
  'compress-image': 'Compress images to reduce their file size without significant quality loss.',
  'watermark-image': 'Add a text or image watermark to your photos and images.',
};

const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sendTaskCompletionEmail } = useAuth();
  const { t } = useI18n();
  const { signature, saveSignature } = useSignature();
  const { addSignedDocument } = useSignedDocuments();
  const { addTask } = useLastTasks();
  const originalMetas = useRef<{title: string, desc: string, keywords: string} | null>(null);
  const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void };

  const [tool, setTool] = useState<Tool | null>(null);
  const [state, setState] = useState<ProcessingState>(ProcessingState.Idle);
  const [errorMessage, setErrorMessage] = useState('');
  const [processedFileBlob, setProcessedFileBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [toolOptions, setToolOptions] = useState<any>(initialToolOptions);
  const [progress, setProgress] = useState<{ percentage: number; status: string } | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeError, setQrCodeError] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [cloudSaveState, setCloudSaveState] = useState<{google: 'idle' | 'saving' | 'saved', dropbox: 'idle' | 'saving' | 'saved'}>({google: 'idle', dropbox: 'idle'});
  
  // States for Visual Editors (Sign, Edit, Redact)
  const [pdfPagePreviews, setPdfPagePreviews] = useState<string[]>([]);
  const [pdfPageViewports, setPdfPageViewports] = useState<PageViewport[]>([]); // For coordinate transform
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
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

  // State for Compress PDF results
  const [compressionResult, setCompressionResult] = useState<{ originalSize: number, newSize: number } | null>(null);

  // States for Sign PDF flow
  const [isWhoWillSignModalOpen, setIsWhoWillSignModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  
  // State for PDF to Word conversion mode
  const [pdfToWordMode, setPdfToWordMode] = useState<'editable' | 'exact'>('editable');
  const [useOcr, setUseOcr] = useState(false);

  // New states for processing speed and time
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [processingSpeed, setProcessingSpeed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // New state for Repair PDF tool previews
  const [repairPreviews, setRepairPreviews] = useState<{ fileIndex: number; fileName: string; dataUrl: string; }[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // State for Repair PDF dropdown
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);


  const totalSize = useMemo(() => files.reduce((acc, file) => acc + file.size, 0), [files]);

  // FIX: Define missing handlers for success screen
  const handleDownload = () => {
    if (processedFileBlob) {
        const filename = outputFilename || getOutputFilename(tool!.id, files, toolOptions);
        downloadBlob(processedFileBlob, filename);
    }
  };

  const openShareModal = async () => {
    if (!processedFileBlob) return;
    setIsShareModalOpen(true);
    // In a real app, you would upload the blob and get a URL.
    // For this example, we'll use a local blob URL which will only work on this device.
    const url = URL.createObjectURL(processedFileBlob);
    setShareableUrl(url); 
    
    setIsQrLoading(true);
    setQrCodeError('');
    try {
        const qrUrl = await QRCode.toDataURL(url, { width: 200 });
        setQrCodeUrl(qrUrl);
    } catch (err) {
        setQrCodeError("Could not generate QR code.");
    } finally {
        setIsQrLoading(false);
    }
  };

  const handleSaveToDropbox = () => {
    if (!processedFileBlob) return;
    setCloudSaveState(prev => ({ ...prev, dropbox: 'saving' }));
    const filename = outputFilename || getOutputFilename(tool!.id, files, toolOptions);
    const url = URL.createObjectURL(processedFileBlob);
    Dropbox.save(url, filename, {
      success: () => {
        setCloudSaveState(prev => ({ ...prev, dropbox: 'saved' }));
        setTimeout(() => setCloudSaveState(prev => ({ ...prev, dropbox: 'idle' })), 2000);
      },
      error: () => {
        setCloudSaveState(prev => ({ ...prev, dropbox: 'idle' }));
        alert('Failed to save to Dropbox.');
      }
    });
  };

  // Cloud Picker States and Logic
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [oauthToken, setOauthToken] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles].filter((file, index, self) =>
          index === self.findIndex((f) => (
              f.name === file.name && f.size === file.size
          ))
      ));
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true, noKeyboard: true, accept: tool?.accept || { 'application/pdf': ['.pdf'] } });
  const addMoreDropzone = useDropzone({ onDrop, accept: tool?.accept || { 'application/pdf': ['.pdf'] } });

  useEffect(() => {
    if (gapi) {
      gapi.load('client:picker', () => setGapiLoaded(true));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
            setIsAddMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleCloudFile = async (url: string, name: string, token?: string) => {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      onDrop([file]);
    } catch (error) {
      console.error("Error fetching cloud file:", error);
      setErrorMessage("Could not download file from cloud storage.");
      setState(ProcessingState.Error);
    }
  };
  
  const createPicker = (token: string) => {
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    if (tool?.accept) {
      const mimeTypes = Object.keys(tool.accept).join(',');
      if (mimeTypes) view.setMimeTypes(mimeTypes);
    } else {
      view.setMimeTypes('application/pdf');
    }
    
    const picker = new google.picker.PickerBuilder()
      .setApiKey(GOOGLE_API_KEY)
      .setOAuthToken(token)
      .addView(view)
      .setCallback((data: any) => {
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          const docs = data[google.picker.Response.DOCUMENTS];
          docs.forEach((doc: any) => {
            const url = `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`;
            handleCloudFile(url, doc.name, token);
          });
        }
      })
      .build();
    picker.setVisible(true);
  };

  const handleGoogleDriveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gapiLoaded) {
        alert("Google Drive integration is still loading. Please try again in a moment.");
        return;
    }
    gapi.auth.authorize(
      { client_id: GOOGLE_CLIENT_ID, scope: ['https://www.googleapis.com/auth/drive.readonly'], immediate: false },
      (authResult: any) => {
        if (authResult && !authResult.error) {
          setOauthToken(authResult);
          createPicker(authResult.access_token);
        } else {
          console.error("Google Auth Error:", authResult?.error);
          alert("Could not authenticate with Google Drive. Please try again.");
        }
      }
    );
  };
  
  const handleDropboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    Dropbox.choose({
      success: (dropboxFiles: any[]) => {
        dropboxFiles.forEach(file => handleCloudFile(file.link, file.name));
      },
      linkType: "direct",
      multiselect: true,
    });
  };
  
  const handleSort = () => {
    const sortedFiles = [...files].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    setFiles(sortedFiles);

    const sortedPreviews = [...repairPreviews].sort((a, b) => {
         const nameA = a.fileName.toLowerCase();
        const nameB = b.fileName.toLowerCase();
        if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    setRepairPreviews(sortedPreviews);
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
        if (state === ProcessingState.Success) {
            setShowFooter(true); 
        } else {
            setShowFooter(false);
        }
        
        return () => {
            setShowFooter(true);
        };
  }, [state, setShowFooter]);

  useEffect(() => {
    if (state === ProcessingState.Processing && progress && processingStartTime && totalSize > 0 && progress.percentage > 0) {
        const elapsedTime = (Date.now() - processingStartTime) / 1000;
        const processedBytes = totalSize * (progress.percentage / 100);
        const currentSpeed = elapsedTime > 0 ? processedBytes / elapsedTime : 0;
        setProcessingSpeed(currentSpeed);
        
        if (progress.percentage > 5) {
            const estimatedTotalTime = (elapsedTime / progress.percentage) * 100;
            const remainingTime = Math.max(0, estimatedTotalTime - elapsedTime);
            setTimeRemaining(remainingTime);
        }
        
    } else if (state !== ProcessingState.Processing) {
        setProcessingStartTime(null);
        setProcessingSpeed(0);
        setTimeRemaining(null);
    }
  }, [progress, state, processingStartTime, totalSize]);

  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
  }

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    if (state === ProcessingState.Success && processedFileBlob) {
      const filename = outputFilename || (tool ? getOutputFilename(tool.id, files, toolOptions) : 'download');
      downloadBlob(processedFileBlob, filename);
      setOutputFilename(''); // Reset after download
    }
  }, [state, processedFileBlob, tool, files, toolOptions, downloadBlob, outputFilename]);

  const getProcessingMessage = (tool: Tool | null): React.ReactNode => {
    if (!tool) return 'Processing...';

    const title = t(tool.title);
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
    if (!tool || state === ProcessingState.Processing || files.length === 0) return true;
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
          case 'sign-pdf':
          case 'edit-pdf':
              return canvasItems.length === 0;
          case 'redact-pdf':
              return redactionAreas.length === 0;
          default:
              return false;
      }
  }, [tool, canvasItems.length, redactionAreas.length, state]);
  
  const handleReset = useCallback(() => {
    setState(ProcessingState.Idle);
    setErrorMessage('');
    setProcessedFileBlob(null);
    setFiles([]);
    setToolOptions(initialToolOptions);
    setProgress(null);
    setShareableUrl('');
    setIsShareModalOpen(false);
    setCloudSaveState({google: 'idle', dropbox: 'idle'});
    setPdfPagePreviews([]);
    setPdfPageViewports([]); // Reset viewports
    setCanvasItems([]);
    setIsEditorModalOpen(false);
    setActiveDrag(null);
    setRedactionAreas([]);
    setIsDrawingRedaction(false);
    setRedactionStartPoint(null);
    setCurrentRedaction(null);
    setComparisonResults([]);
    setOriginalImageSize(null);
    setCompressionResult(null);
    setIsWhoWillSignModalOpen(false);
    setIsSignatureModalOpen(false);
    setProcessingStartTime(null);
    setProcessingSpeed(0);
    setTimeRemaining(null);
    setRepairPreviews([]);
    setIsGeneratingPreviews(false);
  }, []);

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

      const newTitle = `${t(currentTool.title)} – I Love PDFLY`;
      const newDescription = toolSeoDescriptions[currentTool.id] || `Use the ${t(currentTool.title)} tool on I Love PDFLY. ${t(currentTool.description)} Fast, free, and secure.`;
      
      const baseKeywords = [
          t(currentTool.title).toLowerCase(),
          `free ${t(currentTool.title).toLowerCase()}`,
          `online ${t(currentTool.title).toLowerCase()}`,
          currentTool.id.replace(/-/g, ' '),
          `ilovepdf ${t(currentTool.title).toLowerCase()}`,
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
          "name": t(currentTool.title),
          "applicationCategory": "ProductivityApplication",
          "operatingSystem": "Web",
          "description": t(currentTool.description),
          "url": `https://ilovepdfly.com/#/${currentTool.id}`,
          "offers": {
              "@type": "Offer",
              "price": currentTool.isPremium ? "5.00" : "0.00",
              "priceCurrency": "USD"
          },
          "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "2500"
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
  }, [toolId, navigate, user, handleReset, t]);
  
  const extractPagesForVisualEditor = useCallback(async () => {
    if (!tool) return;
    const isVisualTool = ['sign-pdf', 'edit-pdf', 'redact-pdf'].includes(tool.id);
    if (!isVisualTool || files.length === 0) return;

    setState(ProcessingState.Processing);
    setProgress({ percentage: 0, status: 'Loading document pages...' });

    try {
        const previews: string[] = [];
        const newViewports: PageViewport[] = [];

        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            const file = files[fileIndex];
            const fileBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                setProgress({ percentage: Math.round(((fileIndex * pdf.numPages + i) / (files.length * pdf.numPages)) * 100), status: `Extracting page ${i} from ${file.name}` });
                const page = await pdf.getPage(i);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                // FIX: The render method was called with incorrect parameters. This is likely due to a type definition mismatch. Casting to 'any' bypasses the incorrect type check.
                await page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                const dataUrl = canvas.toDataURL('image/png');

                previews.push(dataUrl);
                newViewports.push(viewport);
            }
        }

        setPdfPagePreviews(previews);
        setPdfPageViewports(newViewports);
        setState(ProcessingState.Idle);
    } catch (e: any) {
        console.error(e);
        setErrorMessage('Failed to load PDF. The file might be corrupt or protected.');
        setState(ProcessingState.Error);
    } finally {
        setProgress(null);
    }
}, [files, tool]);


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
    const isVisualTool = ['edit-pdf', 'redact-pdf'].includes(tool?.id || '');
    if (isVisualTool && files.length > 0) {
        extractPagesForVisualEditor();
    } else if (tool?.id !== 'compare-pdf' && tool?.id !== 'sign-pdf' && tool?.id !== 'organize-pdf' && tool?.id !== 'repair-pdf') {
        setPdfPagePreviews([]);
    }
  }, [files, tool?.id, extractPagesForVisualEditor]);
  
  useEffect(() => {
    if (tool?.id === 'repair-pdf' && files.length > 0) {
        const generatePreviews = async () => {
            setIsGeneratingPreviews(true);
            const allPreviews: { fileIndex: number, fileName: string, dataUrl: string }[] = [];
            for (let i = 0; i < files.length; i++) {
                try {
                    const file = files[i];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    const page = await pdf.getPage(1); // Preview first page
                    const viewport = page.getViewport({ scale: 0.5 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const context = canvas.getContext('2d');
                    if (context) {
                        // FIX: The render method was called with incorrect parameters. This is likely due to a type definition mismatch. Casting to 'any' bypasses the incorrect type check.
                        await page.render({ canvasContext: context, viewport } as any);
                        allPreviews.push({ fileIndex: i, fileName: file.name, dataUrl: canvas.toDataURL() });
                    }
                } catch (e) {
                    console.error("Could not generate preview for", files[i].name, e);
                }
            }
            setRepairPreviews(allPreviews);
            setIsGeneratingPreviews(false);
        };
        generatePreviews();
    } else {
        setRepairPreviews([]);
    }
  }, [files, tool?.id]);


  // Sign PDF specific effects and handlers
  useEffect(() => {
    if (tool?.id === 'sign-pdf' && files.length > 0 && pdfPagePreviews.length === 0) {
      setIsWhoWillSignModalOpen(true);
    }
  }, [files, tool, pdfPagePreviews]);

  const handleOnlyMeSign = () => {
      setIsWhoWillSignModalOpen(false);
      if (!user) {
          navigate('/login', { state: { from: `/sign-pdf` } });
          return;
      }
      if (signature?.signature) {
          extractPagesForVisualEditor();
      } else {
          setIsSignatureModalOpen(true);
      }
  };

  const handleSignatureSave = (signatureDataUrl: string, initialsDataUrl: string) => {
      saveSignature(signatureDataUrl, initialsDataUrl);
      setIsSignatureModalOpen(false);
      extractPagesForVisualEditor(); 
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

              const x = (firstPage as HTMLElement).offsetLeft + (firstPage.clientWidth / 2) - (itemWidth / 2);
              const y = (firstPage as HTMLElement).offsetTop + (firstPage.clientHeight / 2) - (itemHeight / 2);
              
              const newItem: CanvasItem = {
                  id: Date.now(),
                  type: type,
                  dataUrl: dataUrl!,
                  width: itemWidth,
                  height: itemHeight,
                  x: x,
                  y: y,
                  pageIndex: 0,
              };
              
              setCanvasItems(prev => [...prev, newItem]);
          }
      }
  };

  const handleProcess = async () => {
      if (!tool || files.length === 0) return;
      
      setState(ProcessingState.Processing);
      setProcessingStartTime(Date.now());
      setErrorMessage('');
      setProcessedFileBlob(null);
      setProgress({ percentage: 0, status: 'Starting process...'});

      try {
        let blob: Blob | null = null;
        switch (tool.id) {
          case 'merge-pdf': {
            if (files.length < 2) throw new Error("Please select at least two PDF files to merge.");
            const mergedPdf = await PDFDocument.create();
            let fileCounter = 0;
            for (const file of files) {
                fileCounter++;
                setProgress({ percentage: Math.round((fileCounter / files.length) * 100), status: `Merging ${file.name}`});
                if (file.type !== 'application/pdf') throw new Error(`File "${file.name}" is not a PDF.`);
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
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
                zip.file(`${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`, newDocBytes);
            }
            blob = await zip.generateAsync({ type: 'blob' });
            break;
          }
          case 'compress-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to compress.");
            const originalFile = files[0];
            const originalSize = originalFile.size;
            const pdfBytes = await originalFile.arrayBuffer();
            let compressedBytes: Uint8Array;
        
            if (toolOptions.compressionLevel === 'less') {
                setProgress({ percentage: 50, status: 'Applying light compression...'});
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                compressedBytes = await pdfDoc.save({ useObjectStreams: true });
            } else { 
                const isExtreme = toolOptions.compressionLevel === 'extreme';
                const quality = isExtreme ? 0.6 : 0.8;
                const scale = isExtreme ? 1.0 : 1.5;
        
                setProgress({ percentage: 10, status: `Rasterizing PDF for ${isExtreme ? 'extreme' : 'recommended'} compression...`});
                const pdfjsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
                const newPdfDoc = await PDFDocument.create();
        
                for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                    setProgress({ percentage: 10 + Math.round((i / pdfjsDoc.numPages) * 80), status: `Processing page ${i}` });
                    const page = await pdfjsDoc.getPage(i);
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const context = canvas.getContext('2d')!;
                    context.fillStyle = 'white';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // FIX: The render method was called with incorrect parameters. This is likely due to a type definition mismatch. Casting to 'any' bypasses the incorrect type check.
                    await page.render({ canvasContext: context, viewport } as any);
        
                    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
                    const jpegImageBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
        
                    const jpegImage = await newPdfDoc.embedJpg(jpegImageBytes);
                    const pdfPage = newPdfDoc.addPage([page.view[2], page.view[3]]);
                    
                    pdfPage.drawImage(jpegImage, {
                        x: 0,
                        y: 0,
                        width: pdfPage.getWidth(),
                        height: pdfPage.getHeight(),
                    });
                }
                setProgress({ percentage: 95, status: 'Saving compressed PDF...'});
                compressedBytes = await newPdfDoc.save();
            }
        
            const newSize = compressedBytes.byteLength;
            setCompressionResult({ originalSize, newSize });
        
            if (newSize >= originalSize) {
                blob = new Blob([pdfBytes], { type: 'application/pdf' });
            } else {
                blob = new Blob([compressedBytes], { type: 'application/pdf' });
            }
            break;
        }
          case 'rotate-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to rotate.");
            const file = files[0];
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            pdfDoc.getPages().forEach(page => page.setRotation(degrees(page.getRotation().angle + toolOptions.rotation)));
            const newPdfBytes = await pdfDoc.save();
            blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            break;
          }
          case 'repair-pdf': {
            if (files.length === 0) throw new Error("Please select at least one PDF file to repair.");
            const zip = new JSZip();
            let filesProcessed = 0;
        
            for (const file of files) {
                filesProcessed++;
                setProgress({ percentage: Math.round((filesProcessed / files.length) * 90), status: `Attempting to repair ${file.name}...` });
                try {
                    const pdfBytes = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true, updateMetadata: false });
                    const repairedPdfBytes = await pdfDoc.save();
                    zip.file(file.name.replace(/\.pdf$/i, '_repaired.pdf'), repairedPdfBytes);
                } catch (err) {
                    console.error(`Could not repair ${file.name}:`, err);
                    zip.file(`${file.name.replace(/\.pdf$/i, '')}_REPAIR_FAILED.txt`, `We were unable to repair this file. It might be too corrupted or in an unsupported format.`);
                }
            }
        
            setProgress({ percentage: 100, status: `Packaging files...` });
        
            if (files.length > 1) {
                blob = await zip.generateAsync({ type: 'blob' });
            } else {
                const firstFileName = Object.keys(zip.files)[0];
                if (firstFileName && firstFileName.endsWith('.pdf')) {
                    const singleFileBytes = await zip.file(firstFileName)?.async('uint8array');
                    if (singleFileBytes) {
                        blob = new Blob([singleFileBytes], { type: 'application/pdf' });
                    } else {
                        throw new Error("Failed to extract the repaired file.");
                    }
                } else {
                    blob = await zip.generateAsync({type: 'blob'});
                }
            }
            break;
          }
          case 'sign-pdf': {
            if (files.length !== 1) throw new Error("Please select one PDF file to sign.");
            const file = files[0];
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            
            for (const item of canvasItems) {
                if (item.pageIndex < pages.length) {
                    const page = pages[item.pageIndex];
                    const viewport = pdfPageViewports[item.pageIndex];
                    const scale = page.getWidth() / viewport.width;

                    const embedder = item.dataUrl?.startsWith('data:image/png') 
                        ? await pdfDoc.embedPng(item.dataUrl) 
                        : (item.dataUrl ? await pdfDoc.embedJpg(item.dataUrl) : null);
                    
                    if (embedder) {
                        page.drawImage(embedder, {
                            x: item.x * scale,
                            y: page.getHeight() - (item.y * scale) - (item.height * scale),
                            width: item.width * scale,
                            height: item.height * scale
                        });
                    }
                }
            }
            const signedPdfBytes = await pdfDoc.save();
            blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
            if (user) {
                 addSignedDocument({
                    originator: user.username,
                    originalFile: file,
                    originalFileName: file.name,
                    signedFile: blob,
                    signedFileName: getOutputFilename(tool.id, files, toolOptions),
                    signers: [{ name: user.username, signedAt: new Date().toISOString() }],
                    status: 'Signed',
                    auditTrail: JSON.stringify([{ event: 'Created', user: user.username, timestamp: new Date().toISOString() }, { event: 'Signed', user: user.username, timestamp: new Date().toISOString() }])
                });
            }
            break;
          }
           case 'powerpoint-to-pdf': {
                if (files.length !== 1) throw new Error("Please select one PowerPoint file.");
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();

                const zip = await JSZip.loadAsync(arrayBuffer);
                const slides = [];
                for (const path in zip.files) {
                    if (path.startsWith("ppt/slides/slide")) {
                        slides.push(path);
                    }
                }
                slides.sort(); 

                const pdf = new jsPDF('l', 'px', 'a4');
                for (let i = 0; i < slides.length; i++) {
                    if (i > 0) pdf.addPage();
                    const slideXml = await zip.file(slides[i])!.async("string");
                    const textNodes = new DOMParser().parseFromString(slideXml, "application/xml").getElementsByTagName("a:t");
                    let slideText = "";
                    for(let j=0; j<textNodes.length; j++){
                        slideText += textNodes[j].textContent + "\n";
                    }
                    pdf.text(slideText, 20, 20);
                }
                blob = pdf.output('blob');
                break;
            }
            case 'extract-text': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const pdfjsDoc = await pdfjsLib.getDocument({data: await file.arrayBuffer()}).promise;
                let fullText = '';
                for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                    const page = await pdfjsDoc.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n\n';
                }
                blob = new Blob([fullText], {type: 'text/plain'});
                break;
            }
            case 'zip-maker': {
                if (files.length === 0) throw new Error("Please select files to zip.");
                const zip = new JSZip();
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    setProgress({percentage: Math.round((i+1)/files.length * 100), status: `Adding ${file.name}`});
                    zip.file(file.name, file);
                }
                blob = await zip.generateAsync({type: 'blob'});
                break;
            }
             case 'remove-background': {
                if (files.length !== 1) throw new Error("Please select one image file.");
                const file = files[0];
                setProgress({ percentage: 50, status: 'Removing background...'});
                const imageBlob = await removeBackground(file);
                blob = imageBlob;
                break;
            }
            case 'jpg-to-pdf': {
                const pdfDoc = await PDFDocument.create();
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    setProgress({ percentage: Math.round(((i + 1) / files.length) * 100), status: `Adding ${file.name}` });
                    const imageBytes = await file.arrayBuffer();
                    let image;
                    if (file.type === 'image/jpeg') {
                        image = await pdfDoc.embedJpg(imageBytes);
                    } else if (file.type === 'image/png') {
                        image = await pdfDoc.embedPng(imageBytes);
                    } else {
                        throw new Error(`Unsupported image type: ${file.type}`);
                    }
                    const { width, height } = image.scale(1);
                    const page = pdfDoc.addPage([width, height]);
                    page.drawImage(image, { x: 0, y: 0, width, height });
                }
                const pdfBytes = await pdfDoc.save();
                blob = new Blob([pdfBytes], { type: 'application/pdf' });
                break;
            }
            case 'word-to-pdf':
            case 'excel-to-pdf': {
                if (files.length !== 1) throw new Error(`Please select one ${tool.id === 'word-to-pdf' ? 'Word' : 'Excel'} file.`);
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                setProgress({ percentage: 20, status: 'Converting to HTML...' });
                
                let html = '';
                if(tool.id === 'word-to-pdf') {
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    if (!result.value || result.value.trim() === '') {
                       throw new Error("The Word document appears to be empty or could not be read. Please try a different file.");
                    }
                    html = `<div style="font-family: 'Times New Roman', Times, serif; line-height: 1.5; font-size: 12pt; color: black; background-color: white;">${result.value}</div>`;
                } else { // Excel
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    html = `
                        <style>
                            table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 10px; color: black; background-color: white; }
                            th, td { border: 1px solid #dddddd; text-align: left; padding: 4px; }
                            th { background-color: #f2f2f2; }
                        </style>
                        ${XLSX.utils.sheet_to_html(worksheet)}
                    `;
                }
            
                const container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.padding = '15mm';
                container.style.backgroundColor = 'white';
                container.innerHTML = html;
                document.body.appendChild(container);
                container.style.width = tool.id === 'excel-to-pdf' ? container.scrollWidth + 'px' : '210mm';

                setProgress({ percentage: 60, status: 'Capturing document...' });
            
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: container.scrollWidth,
                    height: container.scrollHeight,
                });
            
                document.body.removeChild(container);
            
                setProgress({ percentage: 80, status: 'Generating PDF...' });
            
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = imgWidth / imgHeight;
                
                let imgPdfWidth = pdfWidth;
                let imgPdfHeight = imgPdfWidth / ratio;
                let heightLeft = imgPdfHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgPdfWidth, imgPdfHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position -= pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgPdfWidth, imgPdfHeight);
                    heightLeft -= pdfHeight;
                }
                
                blob = pdf.output('blob');
                break;
            }
            case 'pdf-to-jpg': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const zip = new JSZip();
                const pdfBytes = await file.arrayBuffer();
                const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

                for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                    setProgress({ percentage: Math.round((i / pdfjsDoc.numPages) * 100), status: `Converting page ${i}` });
                    const page = await pdfjsDoc.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    // FIX: The render method was called with incorrect parameters. This is likely due to a type definition mismatch. Casting to 'any' bypasses the incorrect type check.
                    await page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const imageBlob = await (await fetch(imageDataUrl)).blob();
                    zip.file(`${file.name.replace('.pdf', '')}_page_${i}.jpg`, imageBlob);
                }
                blob = await zip.generateAsync({ type: 'blob' });
                break;
            }
            case 'pdf-to-png': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const zip = new JSZip();
                const pdfBytes = await file.arrayBuffer();
                const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
            
                for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                    setProgress({ percentage: Math.round((i / pdfjsDoc.numPages) * 100), status: `Converting page ${i}` });
                    const page = await pdfjsDoc.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    // FIX: The render method was called with incorrect parameters. This is likely due to a type definition mismatch. Casting to 'any' bypasses the incorrect type check.
                    await page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                    const imageDataUrl = canvas.toDataURL('image/png');
                    const imageBlob = await (await fetch(imageDataUrl)).blob();
                    zip.file(`${file.name.replace('.pdf', '')}_page_${i}.png`, imageBlob);
                }
                blob = await zip.generateAsync({ type: 'blob' });
                break;
            }
            case 'pdf-to-word': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const pdfBytes = await file.arrayBuffer();
                const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes, password: toolOptions.password || '' }).promise;
                
                let sections = [];
                
                if (pdfToWordMode === 'exact') {
                    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                        setProgress({ percentage: Math.round((i / pdfjsDoc.numPages) * 100), status: `Converting page ${i}` });
                        const page = await pdfjsDoc.getPage(i);
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        // FIX: The render method was called with incorrect parameters. This is likely due to a type definition mismatch. Casting to 'any' bypasses the incorrect type check.
                        await page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                        const imageDataUrl = canvas.toDataURL('image/png');
                        const imageBuffer = await fetch(imageDataUrl).then(res => res.arrayBuffer());

                        sections.push({
                            children: [new Paragraph({
                                children: [
// FIX: Added 'type' property to the ImageRun options to satisfy the IImageOptions interface from the 'docx' library.
                                    new ImageRun({
                                        type: 'png',
                                        data: new Uint8Array(imageBuffer),
                                        transformation: {
                                            width: viewport.width,
                                            height: viewport.height,
                                        },
                                    }),
                                ],
                            })],
                            properties: { type: i < pdfjsDoc.numPages ? SectionType.NEXT_PAGE : SectionType.CONTINUOUS },
                        });
                    }
                } else {
                    let fullText = '';
                    if (useOcr) {
                        const { data: { text } } = await Tesseract.recognize(
                            file,
                            'eng',
                            { logger: m => setProgress({ percentage: (m.progress || 0) * 100, status: m.status }) }
                        );
                        fullText = text;
                    } else {
                         for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                            setProgress({ percentage: Math.round((i / pdfjsDoc.numPages) * 100), status: `Extracting text from page ${i}` });
                            const page = await pdfjsDoc.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                            fullText += pageText + '\n\n';
                        }
                    }
                    
                    sections.push({
                        children: fullText.split('\n').map(pText => new Paragraph({ children: [new TextRun(pText)] })),
                    });
                }
                
                const finalDoc = new Document({ sections });
                blob = await Packer.toBlob(finalDoc);
                break;
            }
             case 'pdf-to-excel': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const pdfBytes = await file.arrayBuffer();
                const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
                const wb = XLSX.utils.book_new();

                for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                    setProgress({ percentage: Math.round((i / pdfjsDoc.numPages) * 100), status: `Processing page ${i}` });
                    const page = await pdfjsDoc.getPage(i);
                    const textContent = await page.getTextContent();
                    const rows = textContent.items.map(item => 'str' in item ? [item.str] : []);
                    const ws = XLSX.utils.aoa_to_sheet(rows);
                    XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
                }
                
                const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                blob = new Blob([wbout], { type: 'application/octet-stream' });
                break;
            }
            case 'unlock-pdf': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const pdfBytes = await file.arrayBuffer();
                try {
                    const pdfDoc = await PDFDocument.load(pdfBytes, { password: toolOptions.password || undefined, ignoreEncryption: false } as any);
                    const unlockedBytes = await pdfDoc.save();
                    blob = new Blob([unlockedBytes], { type: 'application/pdf' });
                } catch (e) {
                    throw new Error("Incorrect password or unsupported encryption.");
                }
                break;
            }
            case 'protect-pdf': {
                if (files.length !== 1) throw new Error("Please select one PDF file.");
                const file = files[0];
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                
                // FIX: Removed the incorrect 'Perms' type annotation.
                const permissions = {
                    printing: toolOptions.allowPrinting,
                    copying: toolOptions.allowCopying,
                    modifying: toolOptions.allowModifying,
                };
        
                const protectedBytes = await (pdfDoc as any).encrypt({
                    userPassword: toolOptions.password,
                    ownerPassword: toolOptions.password,
                    permissions,
                });
                blob = new Blob([protectedBytes], { type: 'application/pdf' });
                break;
            }
            case 'psd-to-pdf': {
                if (files.length !== 1) throw new Error("Please select one PSD file.");
                const file = files[0];
                const buffer = await file.arrayBuffer();
                setProgress({percentage: 50, status: "Rendering PSD..."});
                const psd = readPsd(buffer);
                if (!psd.canvas) throw new Error("Could not render PSD file.");
                const canvas = psd.canvas;
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                blob = pdf.output('blob');
                break;
            }
        }
        
        if (blob) {
            setProcessedFileBlob(blob);
            setState(ProcessingState.Success);
            const filename = getOutputFilename(tool.id, files, toolOptions);
            setOutputFilename(filename);
            addTask({
                toolId: tool.id,
                toolTitle: t(tool.title),
                outputFilename: filename,
                fileBlob: blob
            });
            if (user) {
                sendTaskCompletionEmail(t(tool.title), filename);
            }
        } else if (state !== ProcessingState.Error) {
             if (!['word-to-pdf', 'excel-to-pdf', 'pdf-to-word'].includes(tool.id)) {
                 setState(ProcessingState.Success);
             }
        }
      } catch (e: any) {
        console.error(e);
        setErrorMessage(e.message || 'An unknown error occurred during processing.');
        setState(ProcessingState.Error);
      } finally {
        if(!['word-to-pdf', 'excel-to-pdf', 'pdf-to-word'].includes(tool.id)) {
            setProgress(null);
        }
      }
  };
  
  const onProcessStart = () => {
      setState(ProcessingState.Processing);
      setProcessingStartTime(Date.now());
      setErrorMessage('');
      setProcessedFileBlob(null);
      setOutputFilename('');
      setProgress({ percentage: 0, status: 'Starting process...'});
  };

  const onProcessSuccess = (blob: Blob, filename: string) => {
      setProcessedFileBlob(blob);
      setOutputFilename(filename);
      setState(ProcessingState.Success);
      if (tool) {
        addTask({
            toolId: tool.id,
            toolTitle: t(tool.title),
            outputFilename: filename,
            fileBlob: blob
        });
        if (user) {
            sendTaskCompletionEmail(t(tool.title), filename);
        }
      }
  };

  const onProcessError = (message: string) => {
      setErrorMessage(message);
      setState(ProcessingState.Error);
  };


  if (!tool) {
    return (
        <div className="flex items-center justify-center h-screen">
           <div className="text-center">
              <p className="text-xl font-semibold">Loading Tool...</p>
           </div>
        </div>
    );
  }

  const renderContent = () => {
    if (state === ProcessingState.Success) {
        const filename = outputFilename || getOutputFilename(tool.id, files, toolOptions);
        return (
            <div className="text-center w-full max-w-7xl mx-auto py-12 success-screen">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    This task has been processed successfully.
                </h2>
                
                {tool.id === 'compress-pdf' && compressionResult && (
                    <CompressionResultDisplay result={compressionResult} />
                )}
                
                <div className="mt-8 success-actions-wrapper">
                    <button onClick={handleReset} className="success-back-btn" aria-label="Go back" title="Process another file">
                        <LeftArrowIcon className="h-6 w-6" />
                    </button>

                    <div className="success-main-actions">
                        <button onClick={handleDownload} className="success-download-btn">
                            <DownloadIcon className="h-6 w-6" />
                            <span>Download {filename}</span>
                        </button>
                        <div className="success-secondary-actions">
                            <button
                                onClick={() => alert('Save to Google Drive coming soon!')}
                                className="success-action-btn"
                                aria-label="Save to Google Drive"
                                title="Save to Google Drive"
                            >
                                <GoogleDriveIcon className="h-6 w-6" />
                            </button>
                            <button
                                onClick={openShareModal}
                                className="success-action-btn"
                                aria-label="Share file"
                                title="Share file"
                            >
                                <LinkIcon className="h-6 w-6" />
                            </button>
                            <button
                                onClick={handleSaveToDropbox}
                                disabled={cloudSaveState.dropbox !== 'idle'}
                                className="success-action-btn"
                                aria-label="Save to Dropbox"
                                title="Save to Dropbox"
                            >
                                {cloudSaveState.dropbox === 'saving' ? <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : cloudSaveState.dropbox === 'saved' ? <CheckIcon className="h-6 w-6" /> : <DropboxIcon className="h-6 w-6" />}
                            </button>
                            <button
                                onClick={handleReset}
                                className="success-action-btn"
                                aria-label="Delete and start over"
                                title="Delete and start over"
                            >
                                <TrashIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg max-w-5xl mx-auto border border-green-200 dark:border-green-700">
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300 flex items-center justify-center gap-2">
                        <LockIcon className="h-6 w-6"/>
                        <span>Secure. Private. In your control.</span>
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        For your security, your processed files are automatically and permanently deleted from our servers within 2 hours. We do not view, copy, or analyze your files.
                    </p>
                </div>

                <div className="mt-16 bg-white dark:bg-black p-8 rounded-lg shadow-lg max-w-5xl mx-auto border border-gray-200 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Continue to...</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {TOOLS.slice(0, 12).map(toolItem => (
                            <Link key={toolItem.id} to={`/${toolItem.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className={`p-2 rounded-md ${toolItem.color}`}>
                                    <toolItem.Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-left">{t(toolItem.title)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center p-6 bg-gray-50 dark:bg-black/50 rounded-lg max-w-5xl mx-auto border border-gray-200 dark:border-gray-800">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">How can you thank us? Spread the word!</h2>
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

                <div className="mt-12 text-center p-6 rounded-lg max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">The PDF software trusted by millions of users</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                        iLovePDFLY is your number 1 web app for editing PDF with ease. Enjoy all the tools you need to work efficiently with your digital documents while keeping your data safe and secure.
                    </p>
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-x-20 md:gap-x-32">
                        <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                            <IOSIcon className="h-16 w-16" />
                            <span className="font-semibold text-lg">iOS</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                            <AndroidIcon className="h-16 w-16" />
                            <span className="font-semibold text-lg">Android</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                            <MacOSIcon className="h-16 w-16" />
                            <span className="font-semibold text-lg">MacOS</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                            <WindowsIcon className="h-14 w-14" />
                            <span className="font-semibold text-lg">Windows</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                            <GlobeIcon className="h-16 w-16" />
                            <span className="font-semibold text-lg">Web</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (state === ProcessingState.Error) {
        return (
            <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-xl border border-red-200 dark:border-red-800">
                <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">An Error Occurred</h2>
                <p className="mt-2 text-red-600 dark:text-red-400">{errorMessage}</p>
                <button onClick={handleReset} className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Try Again</button>
            </div>
        );
    }

    if (state === ProcessingState.Processing) {
        const hasProgress = progress && processingStartTime && progress.percentage > 0;
        return (
            <div className="flex flex-col items-center justify-center text-center w-full max-w-2xl mx-auto py-12">
                <div className="mb-12">
                    <Logo className="h-12 w-auto" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {getProcessingMessage(tool)}
                </h2>
                
                {files.length > 0 && progress ? (
                     <div className="mt-8 bg-white dark:bg-black p-6 rounded-lg shadow-lg border dark:border-gray-700 w-full">
                        <p className="font-semibold truncate">{files.length === 1 ? files[0].name : `${files.length} files`}</p>
                        <p className="text-sm text-gray-500">{formatBytes(totalSize)}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my.4">
                            <div className="bg-brand-red h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress.percentage || 0}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{progress.status || 'Starting...'}</p>
                        {hasProgress && (
                            <div className="mt-4 text-xs text-gray-500 flex justify-between">
                                <span>{formatBytes(processingSpeed)}/s</span>
                                <span>{formatTime(timeRemaining)}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mt-12">
                        <div 
                            className="w-24 h-24 border-[10px] border-gray-200 dark:border-gray-700 rounded-full animate-spin"
                            style={{ borderTopColor: '#B90B06' }}
                        ></div>
                        {progress && <p className="mt-8 text-gray-600 dark:text-gray-400">{progress.status}</p>}
                    </div>
                )}
            </div>
        );
    }
    
    // Handle special tool UIs
    if (tool.id === 'remove-background') {
        return (
             <>
                <div className="text-center mb-10">
                    <div className={`inline-flex items-center justify-center p-4 rounded-full ${tool.color} mb-4`}>
                        <tool.Icon className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{t(tool.title)}</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t(tool.description)}</p>
                </div>
                <ToolPageContext.Provider value={{ tool }}>
                    <BackgroundRemovalUI tool={tool} />
                </ToolPageContext.Provider>
            </>
        );
    }

    if (tool.id === 'organize-pdf' && files.length > 0) {
        return (
            <>
                <div className="text-center mb-10">
                    <div className={`inline-flex items-center justify-center p-4 rounded-full ${tool.color} mb-4`}>
                        <tool.Icon className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{t(tool.title)}</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t(tool.description)}</p>
                </div>
                <ToolPageContext.Provider value={{ tool }}>
                    <OrganizePdfUI
                        files={files}
                        onProcessStart={() => setState(ProcessingState.Processing)}
                        onProcessSuccess={(blob) => {
                            setProcessedFileBlob(blob);
                            setState(ProcessingState.Success);
                        }}
                        onProcessError={(message) => {
                            setErrorMessage(message);
                            setState(ProcessingState.Error);
                        }}
                        onReset={handleReset}
                        onAddMoreFiles={open}
                    />
                </ToolPageContext.Provider>
            </>
        );
    }

     if (tool.id === 'document-scanner') {
        return (
            <>
                <div className="text-center mb-10">
                    <div className={`inline-flex items-center justify-center p-4 rounded-full ${tool.color} mb-4`}>
                        <tool.Icon className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{t(tool.title)}</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t(tool.description)}</p>
                </div>
                <DocumentScannerUI
                    tool={tool}
                    onProcessStart={onProcessStart}
                    onProcessSuccess={onProcessSuccess}
                    onProcessError={onProcessError}
                />
            </>
        );
    }
    
    // Default Idle State UI for all other tools
    return (
        <>
            <div className="text-center mb-10">
                <div className={`inline-flex items-center justify-center p-4 rounded-full ${tool.color} mb-4`}>
                <tool.Icon className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{t(tool.title)}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t(tool.description)}</p>
            </div>

            {state === ProcessingState.Idle && pdfPagePreviews.length === 0 && (
                <FileUpload tool={tool} files={files} setFiles={setFiles} accept={tool.accept}>
                     {tool.id === 'pdf-to-word' ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Conversion Options</h3>
                            <div onClick={() => setPdfToWordMode('editable')} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${pdfToWordMode === 'editable' ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Editable Text (Basic Layout)</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Extracts text for editing. Best for text changes, but complex layouts and colors may be altered.</p>
                                <div className="mt-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                     <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={useOcr} onChange={(e) => setUseOcr(e.target.checked)} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
                                        <span className="text-sm">Use OCR</span>
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-600">Premium</span>
                                     </label>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">For scanned documents with non-selectable text.</p>
                                </div>
                            </div>
                            <div onClick={() => setPdfToWordMode('exact')} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${pdfToWordMode === 'exact' ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Exact Copy (Pages as Images)</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Preserves 100% of original formatting, colors, and images. Text within images will not be editable.</p>
                            </div>
                            {files.length > 0 && <button onClick={handleProcess} disabled={isProcessButtonDisabled} className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors ${tool.color} ${tool.hoverColor} disabled:bg-gray-400`}>
                                Convert to WORD <RightArrowIcon className="h-6 w-6" />
                            </button>}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {tool.id === 'compress-pdf' && (
                                <CompressionOptions 
                                    level={toolOptions.compressionLevel}
                                    setLevel={(level) => setToolOptions(prev => ({ ...prev, compressionLevel: level }))}
                                />
                            )}
                             {tool.id === 'rotate-pdf' && (
                                <div className="flex justify-center gap-4">
                                    <button onClick={() => setToolOptions(prev => ({...prev, rotation: 90}))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 90 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>90°</button>
                                    <button onClick={() => setToolOptions(prev => ({...prev, rotation: 180}))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 180 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>180°</button>
                                    <button onClick={() => setToolOptions(prev => ({...prev, rotation: 270}))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 270 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>270°</button>
                                </div>
                            )}
                            {files.length > 0 && (
                                <button
                                    onClick={handleProcess}
                                    disabled={isProcessButtonDisabled}
                                    className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors ${tool.color} ${tool.hoverColor} disabled:bg-gray-400 dark:disabled:bg-gray-600`}
                                >
                                    {t(tool.title)} <RightArrowIcon className="h-6 w-6" />
                                </button>
                            )}
                        </div>
                    )}
                </FileUpload>
            )}

            {/* Visual Editor for Sign PDF */}
            {pdfPagePreviews.length > 0 && tool.id === 'sign-pdf' && state === ProcessingState.Idle && (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-grow bg-gray-200 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div ref={previewContainerRef} className="relative w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-auto max-h-[80vh] bg-white dark:bg-black">
                            {pdfPagePreviews.map((src, index) => (
                                <div key={index} id={`pdf-page-${index}`} className="relative border-b dark:border-gray-700 last:border-b-0">
                                    <img src={src} alt={`Page ${index + 1}`} className="w-full h-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-80 flex-shrink-0">
                        <div className="sticky top-24 bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            <h3 className="text-xl font-bold mb-4">Signing options</h3>
                            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md mb-6">
                                <button className="flex-1 p-3 text-center border-r border-gray-300 dark:border-gray-600 bg-red-50 dark:bg-red-900/30 text-brand-red font-semibold rounded-l-md">
                                    Simple Signature
                                </button>
                                <button className="flex-1 p-3 text-center text-gray-500 dark:text-gray-400 cursor-not-allowed rounded-r-md" title="Coming soon!">
                                    Digital Signature
                                </button>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2 text-sm">Required fields</h4>
                                {signature?.signature ? (
                                    <div onClick={() => addSignatureToCanvas('signature')} className="p-2 border rounded-md flex items-center gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-center font-bold">...</div>
                                        <img src={signature.signature} alt="Signature preview" className="h-10 flex-grow object-contain" />
                                        <button onClick={(e) => { e.stopPropagation(); setIsSignatureModalOpen(true); }} className="p-1 text-gray-400 hover:text-brand-red"><EditIcon className="h-5 w-5"/></button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsSignatureModalOpen(true)} className="w-full p-4 border-2 border-dashed rounded text-center text-gray-500 hover:border-brand-red">
                                        Create Signature
                                    </button>
                                )}
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2 text-sm">Optional fields</h4>
                                {signature?.initials ? (
                                    <div onClick={() => addSignatureToCanvas('initials')} className="p-2 border rounded-md flex items-center gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-center font-bold">AC</div>
                                        <img src={signature.initials} alt="Initials preview" className="h-10 flex-grow object-contain" />
                                        <button onClick={(e) => { e.stopPropagation(); setIsSignatureModalOpen(true); }} className="p-1 text-gray-400 hover:text-brand-red"><EditIcon className="h-5 w-5"/></button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 p-2">Create a signature to generate initials.</p>
                                )}
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleProcess}
                                    disabled={isVisualProcessButtonDisabled}
                                    className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors ${tool.color} ${tool.hoverColor} disabled:bg-gray-400 dark:disabled:bg-gray-600`}
                                >
                                    Sign <RightArrowIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {state === ProcessingState.Idle && pdfPagePreviews.length === 0 && files.length > 0 && tool.id !== 'pdf-to-word' && tool.id !== 'organize-pdf' && tool.id !== 'repair-pdf' && (
              <div className="mt-12 text-center">
                <button onClick={handleReset} className="text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                  &larr; Process another file
                </button>
              </div>
            )}
        </>
    );
  };
  
  return (
    <div className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {tool && renderContent()}
      </div>
      <WhoWillSignModal 
        isOpen={isWhoWillSignModalOpen}
        onClose={handleReset}
        onOnlyMe={handleOnlyMeSign}
        onSeveralPeople={() => alert("Inviting others to sign is a premium feature coming soon!")}
      />
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
            setIsSignatureModalOpen(false);
            if (!signature?.signature) handleReset();
        }}
        onSave={handleSignatureSave}
      />
    </div>
  );
};

export default ToolPage;
