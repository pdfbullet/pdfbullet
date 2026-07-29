// Replaced incomplete file content with the full App component definition and default export to resolve the import error in index.tsx.
import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { TOOLS, blogPosts, toolSeoDescriptions } from '../constants.ts';
import { Tool } from '../types.ts';
import FileUpload from '../components/FileUpload.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';
import {
    TrashIcon, UploadCloudIcon, EditIcon, ImageIcon, CameraIcon, CloseIcon, UploadIcon, RotateIcon, LockIcon,
    UnlockIcon, EmailIcon, WhatsAppIcon, RightArrowIcon, LeftArrowIcon, DownloadIcon, LinkIcon,
    DropboxIcon, CheckIcon, CopyIcon, StarIcon, FacebookIcon, XIcon, LinkedInIcon, IOSIcon, AndroidIcon,
    MacOSIcon, WindowsIcon, GlobeIcon, PlusIcon, UpDownArrowIcon, AddPageIcon, DesktopIcon, SettingsIcon, BrainIcon,
    QrCodeIcon
} from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';
import WhoWillSignModal from '../components/WhoWillSignModal.tsx';
import SignatureModal from '../components/SignatureModal.tsx';
import ToolShareModal from '../components/ToolShareModal.tsx';
import { useSignature } from '../hooks/useSignature.ts';
import { useSignedDocuments } from '../hooks/useSignedDocuments.ts';
import { useLastTasks } from '../hooks/useLastTasks.ts';
import { LayoutContext } from '../App.tsx';
import { GoogleGenAI, Type } from '@google/genai';
import { ToolSeoFaqSection } from '../components/ToolSeoFaqSection.tsx';


// Dynamically imported libraries to improve performance
import type { PageViewport } from 'pdfjs-dist';

const importPdfjs = async () => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    return pdfjsLib;
};

declare const Dropbox: any;

// Google API constants removed.

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

const BeforeAfterSlider: React.FC<{ beforeSrc: string; afterSrc: string; }> = ({ beforeSrc, afterSrc }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPos(percent);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        handleMove(e.clientX);
    }, [isDragging, handleMove]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    }, [isDragging, handleMove]);

    useEffect(() => {
        const sliderElement = sliderRef.current;
        if (!sliderElement) return;

        sliderElement.addEventListener('mouseup', handleMouseUp);
        sliderElement.addEventListener('mouseleave', handleMouseUp);
        sliderElement.addEventListener('mousemove', handleMouseMove as any);
        sliderElement.addEventListener('touchend', handleMouseUp);
        sliderElement.addEventListener('touchmove', handleTouchMove as any);

        return () => {
            sliderElement.removeEventListener('mouseup', handleMouseUp);
            sliderElement.removeEventListener('mouseleave', handleMouseUp);
            sliderElement.removeEventListener('mousemove', handleMouseMove as any);
            sliderElement.removeEventListener('touchend', handleMouseUp);
            sliderElement.removeEventListener('touchmove', handleTouchMove as any);
        };
    }, [handleMouseUp, handleMouseMove, handleTouchMove]);

    return (
        <div
            ref={sliderRef}
            className="comparison-slider"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="after-image">
                <img src={afterSrc} alt="Car with background removed" draggable="false" />
            </div>
            <div className="before-image" style={{ width: `${sliderPos}%` }}>
                <img src={beforeSrc} alt="Car with original background" draggable="false" />
            </div>
            <div className="slider-handle" style={{ left: `${sliderPos}%` }}>
                <div className="slider-handle-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>
            </div>
        </div>
    );
};


const DraggableSignatureItem: React.FC<{
    item: CanvasItem;
    viewport: PageViewport;
    onUpdate: (updatedItem: CanvasItem) => void;
    onDelete: () => void;
}> = ({ item, viewport, onUpdate, onDelete }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = item.x;
        const initialY = item.y;
        
        const pageEl = document.getElementById(`pdf-page-${item.pageIndex}`);
        if (!pageEl) return;
        
        const rect = pageEl.getBoundingClientRect();
        const scaleX = viewport.width / rect.width;
        const scaleY = viewport.height / rect.height;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startX) * scaleX;
            const dy = (moveEvent.clientY - startY) * scaleY;
            
            const newX = Math.max(0, Math.min(viewport.width - item.width, initialX + dx));
            const newY = Math.max(0, Math.min(viewport.height - item.height, initialY + dy));
            
            onUpdate({ ...item, x: newX, y: newY });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const initialWidth = item.width;
        const initialHeight = item.height;
        const aspectRatio = item.width / item.height;

        const pageEl = document.getElementById(`pdf-page-${item.pageIndex}`);
        if (!pageEl) return;

        const rect = pageEl.getBoundingClientRect();
        const scaleX = viewport.width / rect.width;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startX) * scaleX;
            const newWidth = Math.max(40, Math.min(viewport.width - item.x, initialWidth + dx));
            const newHeight = newWidth / aspectRatio;

            if (item.y + newHeight <= viewport.height) {
                onUpdate({ ...item, width: newWidth, height: newHeight });
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const leftPct = (item.x / viewport.width) * 100;
    const topPct = (item.y / viewport.height) * 100;
    const widthPct = (item.width / viewport.width) * 100;
    const heightPct = (item.height / viewport.height) * 100;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                cursor: 'move',
            }}
            onMouseDown={handleMouseDown}
            className="group border-2 border-brand-red border-dashed rounded p-0.5 select-none bg-white/10 dark:bg-black/10 backdrop-blur-[0.5px] hover:bg-brand-red/10 transition-colors duration-150 active:border-solid active:border-brand-red"
        >
            {item.dataUrl && (
                <img
                    src={item.dataUrl}
                    alt={item.type}
                    className="w-full h-full object-contain pointer-events-none select-none"
                />
            )}
            
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="absolute -top-3.5 -right-3.5 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 cursor-pointer"
                style={{ width: '22px', height: '22px' }}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div
                onMouseDown={handleResizeMouseDown}
                className="absolute -bottom-1.5 -right-1.5 bg-brand-red text-white rounded-full w-3.5 h-3.5 border border-white flex items-center justify-center shadow-sm cursor-se-resize z-20 opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </div>
    );
};


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
                        data[i + 1] = Math.min(255, factor * (data[i + 1] - 128) + 128);
                        data[i + 2] = Math.min(255, factor * (data[i + 2] - 128) + 128);
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
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
        }
    }, []);

    const startCamera = useCallback(async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setCameraState('initializing');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraState('active');
        } catch (err) {
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError') setCameraState('denied');
                else if (err.name === 'NotFoundError') setCameraState('not-found');
                else setCameraState('error');
            } else {
                setCameraState('error');
            }
            console.error(err);
        }
    }, [stream, facingMode]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (!showUpload) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [startCamera, stopCamera, showUpload]);

    const switchCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const capturePage = () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        addPage(dataUrl);
    };

    const addPage = async (imageDataUrl: string) => {
        const newPageId = Date.now();
        setIsAiProcessing(newPageId);

        let processedDataUrl = imageDataUrl;
        if (ai) {
            processedDataUrl = await processPageWithAI(imageDataUrl);
        }

        const newPage: ScannedPage = {
            id: newPageId,
            original: processedDataUrl,
            filtered: processedDataUrl,
            filter: 'original',
        };
        setScannedPages(prev => [...prev, newPage]);
        setIsAiProcessing(null);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onload = (e) => addPage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] } });


    const processPageWithAI = async (imageDataUrl: string): Promise<string> => {
        // AI logic will go here
        return imageDataUrl; // Placeholder
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
                const { jsPDF } = await import('jspdf');
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
                const JSZip = (await import('jszip')).default;
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
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>

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
        <div {...getRootProps()} className={`relative flex flex-col items-center justify-center p-12 aspect-[9/16] sm:aspect-video rounded-lg cursor-pointer transition-all duration-300 border-2 border-dashed ${isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black hover:border-brand-red'}`}>
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
        case 'powerpoint-to-pdf': return `${baseName}.pdf`;
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

const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-gray-300', width: 'w-0' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { score, text: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score === 2 || score === 3) return { score, text: 'Medium', color: 'bg-yellow-500', width: 'w-2/3' };
    return { score, text: 'Strong', color: 'bg-green-500', width: 'w-full' };
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
    tool: Tool;
}

const OrganizePdfUI: React.FC<OrganizePdfUIProps> = ({ files, onProcessStart, onProcessSuccess, onProcessError, onReset, onAddMoreFiles, tool }) => {
    const [pages, setPages] = useState<OrganizePdfPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Extracting pages...');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const { t } = useI18n();

    const extractPages = useCallback(async () => {
        const pdfjsLib = await importPdfjs();
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
                // FIX: The render method expects an object that includes the canvas context and viewport.
                // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                const renderTask = page.render({ canvasContext: canvasEl.getContext('2d')!, viewport } as any);
                await renderTask.promise;
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
            const { PDFDocument, degrees, PageSizes } = await import('pdf-lib-plus-encrypt');
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
            onProcessSuccess(new Blob([newPdfBytes as unknown as BlobPart], { type: 'application/pdf' }));
        } catch (e: any) {
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
                    <h2 className="text-xl font-bold mb-4">{t(tool.title)}</h2>
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
                        {t(tool.title)} <RightArrowIcon className="h-5 w-5" />
                    </button>
                </div>
            </aside>
        </div>
    );
};

const Sparkle: React.FC<{ style: React.CSSProperties; }> = ({ style }) => (
    <span className="sparkle-effect" style={style}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" className="text-yellow-300">
            <path d="M10 0 L11.75 8.25 L20 10 L11.75 11.75 L10 20 L8.25 11.75 L0 10 L8.25 8.25 Z" />
        </svg>
    </span>
);

const SparkleEffect: React.FC = () => {
    const sparkles = useMemo(() => Array.from({ length: 30 }).map((_, i) => {
        const style: React.CSSProperties = {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 2.5}s`,
            animationDelay: `${Math.random() * 3}s`,
            transform: `scale(${Math.random() * 0.5 + 0.4})`,
        };
        return <Sparkle key={i} style={style} />;
    }), []);
    return <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">{sparkles}</div>;
};

// ===================================================================
// BACKGROUND REMOVAL UI COMPONENT
// ===================================================================
const BackgroundRemovalUI: React.FC<{ tool: Tool }> = ({ tool }) => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalSrc, setOriginalSrc] = useState<string | null>(null);
    const [processedSrc, setProcessedSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [backgroundTab, setBackgroundTab] = useState<'photo' | 'color'>('color');
    const [background, setBackground] = useState<'transparent' | 'color' | 'photo'>('transparent');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState<string | null>(null);

    const [blurBackground, setBlurBackground] = useState(false);
    const [blurAmount, setBlurAmount] = useState(4);
    const [addShadow, setAddShadow] = useState(false);
    const [shadowOpacity, setShadowOpacity] = useState(50);

    const imagePreviewContainerRef = useRef<HTMLDivElement>(null);
    const { addTask } = useLastTasks();
    const { t } = useI18n();

    const presetBgPhotos = [
        'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1528640/pexels-photo-1528640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/235621/pexels-photo-235621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2129796/pexels-photo-2129796.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/6782473/pexels-photo-6782473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/547114/pexels-photo-547114.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2478248/pexels-photo-2478248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/931018/pexels-photo-931018.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/957024/pexels-photo-957024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1236701/pexels-photo-1236701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2440061/pexels-photo-2440061.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/158028/bellingrath-gardens-and-home-scenic-pasture-158028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/3159981/pexels-photo-3159981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1757363/pexels-photo-1757363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2892618/pexels-photo-2892618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2694037/pexels-photo-2694037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2310641/pexels-photo-2310641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/33041/antelope-canyon-lower-canyon-arizona.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/207001/pexels-photo-207001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1210273/pexels-photo-1210273.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2365457/pexels-photo-2365457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/302804/pexels-photo-302804.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2629633/pexels-photo-2629633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2896668/pexels-photo-2896668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1394841/pexels-photo-1394841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2449600/pexels-photo-2449600.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/259988/pexels-photo-259988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/301599/pexels-photo-301599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/709552/pexels-photo-709552.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/624015/pexels-photo-624015.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/338936/pexels-photo-338936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/814499/pexels-photo-814499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/206673/pexels-photo-206673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/772803/pexels-photo-772803.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2104152/pexels-photo-2104152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2086622/pexels-photo-2086622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/165505/pexels-photo-165505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2070485/pexels-photo-2070485.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2253832/pexels-photo-2253832.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/2088205/pexels-photo-2088205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ];
    const presetColors = [
        '#FFFFFF', '#000000', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
        '#3F51B5', '#2196F3', '#00BCD4', '#4CAF50', '#8BC34A', '#FFEB3B',
        '#FFC107', '#FF9800', '#795548', '#9E9E9E'
    ];

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setOriginalFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setOriginalSrc(e.target?.result as string);
            reader.readAsDataURL(file);
            setError('');
            setProcessedSrc(null);
            setBackground('transparent');
            setBackgroundPhotoUrl(null);
            setBackgroundTab('color');
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
            try {
                const formData = new FormData();
                formData.append('file', originalFile);
                const res = await fetch('/api/remove-background', {
                    method: 'POST',
                    body: formData,
                });
                if (!res.ok) {
                    const errJson = await res.json().catch(() => ({ error: 'Background removal failed.' }));
                    throw new Error(errJson.error || 'Background removal failed.');
                }
                
                if (!res.body) throw new Error("No response body");
                
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let finalBase64 = null;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const data = JSON.parse(line);
                            if (data.error) throw new Error(data.error);
                            if (data.progress !== undefined) {
                                // Update local state for progress overlay if we had one here
                                // Since we don't have a local progress state for this UI yet, we can optionally add it or just let the loading state continue.
                                // Let's add a local state for the overlay text!
                                const progressText = document.getElementById('bg-remove-progress-text');
                                if (progressText) {
                                    progressText.innerText = `${data.progress}% - ${data.status}`;
                                }
                            }
                            if (data.success && data.image) {
                                finalBase64 = data.image;
                            }
                        } catch (e) {
                            if (e instanceof Error && !e.message.includes("JSON")) {
                                throw e;
                            }
                        }
                    }
                }

                if (!finalBase64) throw new Error("Did not receive final image from server.");

                const byteCharacters = atob(finalBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const resultBlob = new Blob([byteArray], { type: 'image/png' });
                const resultSrc = URL.createObjectURL(resultBlob);
                setProcessedSrc(resultSrc);
            } catch (e: any) {
                setError(e.message || "Could not process image. It might be too large or in an unsupported format.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        processImage();
    }, [originalFile]);

    const handleDownload = async () => {
        if (!processedSrc || !originalFile) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const outputSize = 1080;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const foregroundImg = new Image();
        await new Promise(resolve => { foregroundImg.onload = resolve; foregroundImg.src = processedSrc; });

        // 1. Draw background
        if (background === 'color' || background === 'photo') {
            const bgCanvas = document.createElement('canvas');
            bgCanvas.width = outputSize;
            bgCanvas.height = outputSize;
            const bgCtx = bgCanvas.getContext('2d');
            if (bgCtx) {
                if (background === 'color') {
                    bgCtx.fillStyle = bgColor;
                    bgCtx.fillRect(0, 0, outputSize, outputSize);
                } else if (background === 'photo' && backgroundPhotoUrl) {
                    const backgroundImg = new Image();
                    backgroundImg.crossOrigin = 'Anonymous';
                    await new Promise(resolve => { backgroundImg.onload = resolve; backgroundImg.src = backgroundPhotoUrl; });
                    const hRatio = outputSize / backgroundImg.width;
                    const vRatio = outputSize / backgroundImg.height;
                    const ratio = Math.max(hRatio, vRatio);
                    const centerShiftX = (outputSize - backgroundImg.width * ratio) / 2;
                    const centerShiftY = (outputSize - backgroundImg.height * ratio) / 2;
                    bgCtx.drawImage(backgroundImg, 0, 0, backgroundImg.width, backgroundImg.height, centerShiftX, centerShiftY, backgroundImg.width * ratio, backgroundImg.height * ratio);
                }

                if (blurBackground && blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`;
                ctx.drawImage(bgCanvas, 0, 0, outputSize, outputSize);
                ctx.filter = 'none';
            }
        }

        // 2. Draw foreground
        if (addShadow && shadowOpacity > 0) {
            ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity / 100})`;
            ctx.shadowBlur = blurAmount > 0 ? blurAmount * 1.5 : 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 10;
        }

        const hRatioFg = outputSize / foregroundImg.naturalWidth;
        const vRatioFg = outputSize / foregroundImg.naturalHeight;
        const ratioFg = Math.min(hRatioFg, vRatioFg) * 0.9; // Add padding
        const drawWidth = foregroundImg.naturalWidth * ratioFg;
        const drawHeight = foregroundImg.naturalHeight * ratioFg;
        const x = (outputSize - drawWidth) / 2;
        const y = (outputSize - drawHeight) / 2;

        ctx.drawImage(foregroundImg, x, y, drawWidth, drawHeight);

        const filename = getOutputFilename(tool.id, [originalFile], {});
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                // Delay revocation to prevent Chrome from falling back to UUID filename due to early revocation
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 1000);
                addTask({ toolId: tool.id, toolTitle: t(tool.title), outputFilename: filename, fileBlob: blob });
            }
        }, 'image/png');
    };

    // Initial upload screen
    if (!originalFile) {
        return (
            <div className="max-w-4xl mx-auto">
                <div {...getRootProps()} className={`relative flex flex-col items-center justify-center p-12 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black hover:border-brand-red'}`}>
                    <input {...getInputProps()} />
                    <UploadCloudIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">Select an Image</p>
                    <p className="text-gray-500 dark:text-gray-400">or drop it here</p>
                </div>
                <section className="mt-16 text-center" aria-labelledby="slider-heading">
                    <h2 id="slider-heading" className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">See Our Background Remover in Action</h2>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Slide the handle to compare the original image with the background-removed version.</p>
                    <div className="mt-8 max-w-3xl mx-auto">
                        <BeforeAfterSlider
                            beforeSrc="https://ik.imagekit.io/fonepay/without%20transparent.png?updatedAt=1760351523569"
                            afterSrc="https://ik.imagekit.io/fonepay/with%20transparent.png?updatedAt=1760351523511"
                        />
                    </div>
                </section>
            </div>
        );
    }

    // Main editor view
    return (
        <div className="max-w-7xl mx-auto">
            {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <main className="lg:col-span-7 bg-gray-100 dark:bg-black rounded-lg p-4 flex items-center justify-center">
                    <div ref={imagePreviewContainerRef} className="relative w-full aspect-square max-w-[500px] mx-auto rounded-md shadow-inner overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: background === 'photo' && backgroundPhotoUrl ? `url(${backgroundPhotoUrl})` : 'none',
                                backgroundColor: background === 'color' ? bgColor : 'transparent',
                                filter: blurBackground ? `blur(${blurAmount}px)` : 'none'
                            }}
                        />
                        <div className={`absolute inset-0 ${background === 'transparent' ? 'bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAC1JREFUOE9jZGBgEGHAD97/D0eMGI2MDBsMAn4yMIDxfaemAPwI+b8pIM4ADzE0IBsASx07QfA8w54AAAAASUVORK5CYII=)]' : ''}`}></div>
                        {isLoading ? (
                            <>
                                {originalSrc && <img src={originalSrc} alt="Processing..." className="relative w-full h-full object-contain opacity-50" />}
                                <div className="absolute inset-0 bg-black/40" />
                                <SparkleEffect />
                                <div id="bg-remove-progress-text" className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg bg-black/10 backdrop-blur-sm text-center px-4">
                                    0% - Preparing image...
                                </div>
                            </>
                        ) : (
                            <img
                                src={processedSrc || ''}
                                alt="Processed"
                                className="relative w-full h-full object-contain transition-all"
                                style={{ filter: addShadow ? `drop-shadow(5px 10px ${blurAmount > 0 ? blurAmount * 1.5 : 10}px rgba(0,0,0,${shadowOpacity / 100}))` : 'none' }}
                            />
                        )}
                    </div>
                </main>
                <aside className={`lg:col-span-5 bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold">Edit & Download</h2>
                        <button onClick={() => { setOriginalFile(null); setProcessedSrc(null); }} className="font-semibold text-sm hover:underline text-gray-500">Reset</button>
                    </div>

                    <div className="mt-4 space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2 text-sm text-gray-500">Original</h3>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md inline-block">
                                {originalSrc && <img src={originalSrc} alt="Original thumbnail" className="w-16 h-16 object-contain rounded-md bg-white" />}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2 text-sm text-gray-500">Background</h3>
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                <button onClick={() => setBackground('transparent')} className={`flex-1 p-3 text-sm font-semibold ${background === 'transparent' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-500'}`}>Transparent</button>
                                <button onClick={() => { setBackground(backgroundTab === 'photo' ? 'photo' : 'color'); }} className={`flex-1 p-3 text-sm font-semibold ${background === 'photo' || background === 'color' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-500'}`}>Edit</button>
                            </div>
                            {(background === 'color' || background === 'photo') && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-md">
                                    <div className="flex border-b mb-3">
                                        <button onClick={() => { setBackgroundTab('photo'); setBackground('photo'); }} className={`flex-1 p-2 text-xs font-semibold ${backgroundTab === 'photo' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-500'}`}>Photo</button>
                                        <button onClick={() => { setBackgroundTab('color'); setBackground('color'); }} className={`flex-1 p-2 text-xs font-semibold ${backgroundTab === 'color' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-500'}`}>Color</button>
                                    </div>
                                    {backgroundTab === 'color' && (
                                        <div className="grid grid-cols-8 gap-2">
                                            {presetColors.map(c => <button key={c} onClick={() => { setBgColor(c); setBackground('color'); }} style={{ backgroundColor: c }} className="w-full aspect-square rounded-full border border-gray-300 dark:border-gray-600 shadow-inner"></button>)}
                                            <div className="relative w-full aspect-square rounded-full border border-gray-300 dark:border-gray-600 overflow-hidden"><input type="color" value={bgColor} onChange={e => { setBgColor(e.target.value); setBackground('color'); }} className="absolute -top-1 -left-1 w-12 h-12 cursor-pointer" /></div>
                                        </div>
                                    )}
                                    {backgroundTab === 'photo' && (
                                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                            {presetBgPhotos.map(url => <img key={url} src={url} onClick={() => { setBackgroundPhotoUrl(url); setBackground('photo'); }} className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 border-2 border-transparent hover:border-brand-red" alt="background option" />)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2 text-sm text-gray-500">Adjustments</h3>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="blur-toggle" className="font-semibold">Blur background</label>
                                    <label className="toggle-switch"><input type="checkbox" id="blur-toggle" checked={blurBackground} onChange={(e) => setBlurBackground(e.target.checked)} /><span className="toggle-slider"></span></label>
                                </div>
                                {blurBackground && (<div><label className="text-sm font-medium">Blur amount</label><input type="range" min="0" max="20" value={blurAmount} onChange={e => setBlurAmount(Number(e.target.value))} className="slider mt-2" /></div>)}

                                <div className="flex justify-between items-center">
                                    <label htmlFor="shadow-toggle" className="font-semibold flex items-center gap-2">Add Shadow <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Beta</span></label>
                                    <label className="toggle-switch"><input type="checkbox" id="shadow-toggle" checked={addShadow} onChange={(e) => setAddShadow(e.target.checked)} /><span className="toggle-slider"></span></label>
                                </div>
                                {addShadow && (<div><label className="text-sm font-medium">Opacity</label><input type="range" min="0" max="100" value={shadowOpacity} onChange={e => setShadowOpacity(Number(e.target.value))} className="slider mt-2" /></div>)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button onClick={handleDownload} disabled={!processedSrc} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-300">
                            <DownloadIcon className="h-5 w-5" /> Download
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};



// ===================================================================
// MAIN TOOL PAGE COMPONENT
// ===================================================================

const ToolPage: React.FC = () => {
    const { toolId } = useParams<{ toolId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, sendTaskCompletionEmail, logTask } = useAuth();
    const { t } = useI18n();
    const { signature, saveSignature } = useSignature();
    const { addSignedDocument } = useSignedDocuments();
    const { addTask } = useLastTasks();
    const originalMetas = useRef<{ title: string, desc: string, keywords: string } | null>(null);
    const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void };

    const [tool, setTool] = useState<Tool | null>(null);
    const [state, setState] = useState<ProcessingState>(ProcessingState.Idle);
    const [errorMessage, setErrorMessage] = useState('');
    const [processedFileBlob, setProcessedFileBlob] = useState<Blob | null>(null);
    const [outputFilename, setOutputFilename] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [toolOptions, setToolOptions] = useState<any>(initialToolOptions);
    const [showPassword, setShowPassword] = useState(false);
    const [progress, setProgress] = useState<{ percentage: number; status: string } | null>(null);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareableUrl, setShareableUrl] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrCodeError, setQrCodeError] = useState('');
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [cloudSaveState, setCloudSaveState] = useState<{ dropbox: 'idle' | 'saving' | 'saved' }>({ dropbox: 'idle' });

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
        setIsQrLoading(true);
        setQrCodeError('');
        setShareableUrl('');
        setQrCodeUrl('');

        try {
            // Upload to tmpfiles.org
            const formData = new FormData();
            const filename = outputFilename || getOutputFilename(tool!.id, files, toolOptions);
            formData.append('file', processedFileBlob, filename);

            const response = await fetch('https://tmpfiles.org/api/v1/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();

            // Format: https://tmpfiles.org/XXXX/filename.pdf -> https://tmpfiles.org/dl/XXXX/filename.pdf
            const directLink = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            setShareableUrl(directLink);

            const QRCode = await import('qrcode');
            const qrUrl = await QRCode.toDataURL(directLink, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            setQrCodeUrl(qrUrl);
        } catch (err) {
            console.error('Sharing error:', err);
            // Local sharing URL fallback removed. In a real app, upload blob and get URL.
            // In our implementation, we upload to tmpfiles.org in openShareModal.
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
    // gapiLoaded state removed.
    const [oauthToken, setOauthToken] = useState<any>(null);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections?: any[]) => {
        const rejections = fileRejections || [];
        console.log('ToolPage parent onDrop called. Accepted:', acceptedFiles.map(f => f.name), 'Rejected:', rejections.map(r => `${r.file.name}: ${r.errors.map((e: any) => e.message).join(', ')}`));
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles].filter((file, index, self) =>
            index === self.findIndex((f) => (
                f.name === file.name && f.size === file.size
            ))
        ));
    }, []);

    const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true, noKeyboard: true, accept: tool?.accept || { 'application/pdf': ['.pdf'] } });
    const addMoreDropzone = useDropzone({ onDrop, accept: tool?.accept || { 'application/pdf': ['.pdf'] } });

    // gapi useEffect removed.

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

    // Google Drive methods removed.

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
        // Hide the footer when any tool page is active.
        setShowFooter(false);

        // Show the footer again when the user leaves the tool page.
        return () => {
            setShowFooter(true);
        };
    }, [setShowFooter]);

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
        // Delay revocation to prevent Chrome from falling back to UUID filename due to early revocation
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }, []);

    useEffect(() => {
        if (state === ProcessingState.Success && processedFileBlob) {
            const filename = outputFilename || (tool ? getOutputFilename(tool.id, files, toolOptions) : 'download');
            setOutputFilename(filename);
        }
    }, [state, processedFileBlob, tool, files, toolOptions, outputFilename]);


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
                return false;
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
        setCloudSaveState({ dropbox: 'idle' });
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
        setQrCodeUrl('');
        setQrCodeError('');
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
            if (currentTool.isPremium && !user?.isToolsPremium) {
                navigate('/premium-feature', { state: { toolId: currentTool.id } });
                return;
            }
            setTool(currentTool);
            handleReset();

            const newTitle = `${t(currentTool.title)} â€“ PDFBullet`;
            const newDescription = toolSeoDescriptions[currentTool.id] || `Use the ${t(currentTool.title)} tool on PDFBullet. ${t(currentTool.description)} Fast, free, and secure.`;

            const baseKeywords = [
                t(currentTool.title).toLowerCase(),
                `free ${t(currentTool.title).toLowerCase()}`,
                `online ${t(currentTool.title).toLowerCase()}`,
                currentTool.id.replace(/-/g, ' '),
                `pdfbullet ${t(currentTool.title).toLowerCase()}`,
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
                "url": `https://pdfbullet.com/#/${currentTool.id}`,
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
                    "name": "PDFBullet"
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
            const pdfjsLib = await importPdfjs();
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

                    // FIX: The render method expects an object that includes the canvas context and viewport.
                    // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                    const renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                    await renderTask.promise;
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
                const pdfjsLib = await importPdfjs();
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
                            // FIX: The render method expects an object that includes the canvas context and viewport.
                            // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                            const renderTask = page.render({ canvasContext: context, viewport } as any);
                            await renderTask.promise;
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

        if (pdfPageViewports.length > 0) {
            const viewport = pdfPageViewports[0];
            const dataUrl = type === 'signature' ? signature.signature : signature.initials;
            const isSignature = type === 'signature';
            const itemWidth = isSignature ? 150 : 60;
            const itemHeight = isSignature ? 75 : 60;

            const x = (viewport.width / 2) - (itemWidth / 2);
            const y = (viewport.height / 2) - (itemHeight / 2);

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
    };

    const handlePageClick = (pageIndex: number, e: React.MouseEvent) => {
        if (e.target !== e.currentTarget && !(e.target as HTMLElement).tagName.match(/img/i)) {
            return;
        }

        if (!signature || !signature.signature) {
            setIsSignatureModalOpen(true);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const viewport = pdfPageViewports[pageIndex];
        if (!viewport) return;

        const scaleX = viewport.width / rect.width;
        const scaleY = viewport.height / rect.height;

        const itemWidth = 150;
        const itemHeight = 75;

        const x = (clickX * scaleX) - (itemWidth / 2);
        const y = (clickY * scaleY) - (itemHeight / 2);

        const newItem: CanvasItem = {
            id: Date.now(),
            type: 'signature',
            dataUrl: signature.signature,
            width: itemWidth,
            height: itemHeight,
            x: Math.max(0, Math.min(viewport.width - itemWidth, x)),
            y: Math.max(0, Math.min(viewport.height - itemHeight, y)),
            pageIndex: pageIndex,
        };

        setCanvasItems(prev => [...prev, newItem]);
    };

    const handleProcess = async () => {
        if (!tool || files.length === 0) return;

        setState(ProcessingState.Processing);
        setProcessingStartTime(Date.now());
        setErrorMessage('');
        setProcessedFileBlob(null);
        setProgress({ percentage: 0, status: 'Preparing...' });

        try {
            let blob: Blob | null = null;
            switch (tool.id) {
                case 'merge-pdf': {
                    const { PDFDocument } = await import('pdf-lib-plus-encrypt');
                    if (files.length < 2) throw new Error("Please select at least two PDF files to merge.");
                    const mergedPdf = await PDFDocument.create();
                    let fileCounter = 0;
                    for (const file of files) {
                        fileCounter++;
                        setProgress({ percentage: Math.round((fileCounter / files.length) * 100), status: `Merging ${file.name}` });
                        if (file.type !== 'application/pdf') throw new Error(`File "${file.name}" is not a PDF.`);
                        const pdfBytes = await file.arrayBuffer();
                        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        copiedPages.forEach(page => mergedPdf.addPage(page));
                    }
                    const mergedPdfBytes = await mergedPdf.save();
                    blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                    break;
                }
                case 'split-pdf': {
                    const { PDFDocument } = await import('pdf-lib-plus-encrypt');
                    const JSZip = (await import('jszip')).default;
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
                    const { PDFDocument } = await import('pdf-lib-plus-encrypt');
                    const pdfjsLib = await importPdfjs();
                    if (files.length !== 1) throw new Error("Please select one PDF file to compress.");
                    const originalFile = files[0];
                    const originalSize = originalFile.size;
                    const pdfBytes = await originalFile.arrayBuffer();
                    let compressedBytes: Uint8Array;

                    if (toolOptions.compressionLevel === 'less') {
                        setProgress({ percentage: 50, status: 'Applying light compression...' });
                        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                        compressedBytes = await pdfDoc.save({ useObjectStreams: true });
                    } else {
                        const isExtreme = toolOptions.compressionLevel === 'extreme';
                        const quality = isExtreme ? 0.3 : 0.6;
                        const scale = isExtreme ? 0.7 : 1.0;

                        setProgress({ percentage: 10, status: `Rasterizing PDF for ${isExtreme ? 'extreme' : 'recommended'} compression...` });
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

                            // FIX: The render method expects an object that includes the canvas context and viewport.
                            // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                            const renderTask = page.render({ canvasContext: context, viewport } as any);
                            await renderTask.promise;

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
                        setProgress({ percentage: 95, status: 'Saving compressed PDF...' });
                        compressedBytes = await newPdfDoc.save();
                    }

                    let newSize = compressedBytes.byteLength;
                    if (newSize >= originalSize) {
                        // If rasterization made it larger, let's try light compression first
                        const freshPdfBytes = await originalFile.arrayBuffer();
                        const pdfDoc = await PDFDocument.load(freshPdfBytes, { ignoreEncryption: true });
                        const lightCompressedBytes = await pdfDoc.save({ useObjectStreams: true });
                        if (lightCompressedBytes.byteLength < originalSize) {
                            compressedBytes = lightCompressedBytes;
                            newSize = lightCompressedBytes.byteLength;
                            blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
                        } else {
                            newSize = originalSize;
                            const fallbackPdfBytes = await originalFile.arrayBuffer();
                            blob = new Blob([fallbackPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                        }
                    } else {
                        blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
                    }

                    setCompressionResult({ originalSize, newSize });
                    break;
                }
                case 'rotate-pdf': {
                    const { PDFDocument, degrees } = await import('pdf-lib-plus-encrypt');
                    if (files.length !== 1) throw new Error("Please select one PDF file to rotate.");
                    const file = files[0];
                    const pdfBytes = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                    pdfDoc.getPages().forEach(page => page.setRotation(degrees(page.getRotation().angle + toolOptions.rotation)));
                    const newPdfBytes = await pdfDoc.save();
                    blob = new Blob([newPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                    break;
                }
                case 'repair-pdf': {
                    const { PDFDocument } = await import('pdf-lib-plus-encrypt');
                    const JSZip = (await import('jszip')).default;
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
                                blob = new Blob([singleFileBytes as unknown as BlobPart], { type: 'application/pdf' });
                            } else {
                                throw new Error("Failed to extract the repaired file.");
                            }
                        } else {
                            blob = await zip.generateAsync({ type: 'blob' });
                        }
                    }
                    break;
                }
                case 'sign-pdf': {
                    const { PDFDocument } = await import('pdf-lib-plus-encrypt');
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
                    blob = new Blob([signedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
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

                    // ── PRIMARY PATH: Server-side conversion via PowerPoint COM / LibreOffice ──
                    setProgress({ percentage: 10, status: 'Uploading to server for conversion...' });
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const serverRes = await fetch('/api/convert-ppt', {
                            method: 'POST',
                            body: formData,
                            signal: AbortSignal.timeout(120000),
                        });

                        if (serverRes.ok) {
                            const method = serverRes.headers.get('X-Conversion-Method') ?? 'server';
                            setProgress({ percentage: 90, status: `Converted via ${method}. Preparing download...` });
                            blob = await serverRes.blob();
                            break;
                        }
                        // Server error — fall through to client-side
                        const errJson = await serverRes.json().catch(() => ({ error: 'Server error' }));
                        console.warn('Server conversion failed, using client-side fallback:', errJson.error);
                    } catch (serverErr) {
                        console.warn('Server unreachable, using client-side fallback:', serverErr);
                    }

                    // ── FALLBACK PATH: Client-side visual renderer ──
                    setProgress({ percentage: 15, status: 'Using client-side renderer...' });
                    const JSZip = (await import('jszip')).default;
                    const html2canvas = (await import('html2canvas')).default;
                    const { jsPDF } = await import('jspdf');
                    const arrayBuffer = await file.arrayBuffer();
                    const bytes = new Uint8Array(arrayBuffer);
                    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B;

                    setProgress({ percentage: 20, status: 'Loading presentation...' });

                    const SLIDE_W = 1280;
                    const SLIDE_H = 720;
                    const emuToPx = (emu: number) => (emu / 9144000) * SLIDE_W;
                    const emuToPxH = (emu: number) => (emu / 5143500) * SLIDE_H;

                    const getAttr = (el: Element | null, attr: string): string => el?.getAttribute(attr) ?? '';

                    const PRESET_COLORS: Record<string, string> = {
                        black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#008000',
                        blue: '#0000FF', yellow: '#FFFF00', gray: '#808080', grey: '#808080',
                        darkGray: '#A9A9A9', lightGray: '#D3D3D3', orange: '#FFA500',
                        purple: '#800080', pink: '#FFC0CB', cyan: '#00FFFF', navy: '#000080',
                        lime: '#00FF00', maroon: '#800000', olive: '#808000', teal: '#008080',
                        silver: '#C0C0C0', aqua: '#00FFFF', fuchsia: '#FF00FF', coral: '#FF7F50',
                        darkBlue: '#00008B', darkGreen: '#006400', darkRed: '#8B0000',
                        chocolate: '#D2691E', crimson: '#DC143C', goldenrod: '#DAA520',
                        indigo: '#4B0082', khaki: '#F0E68C', lavender: '#E6E6FA',
                        lightBlue: '#ADD8E6', lightGreen: '#90EE90', lightYellow: '#FFFFE0',
                        limeGreen: '#32CD32', magenta: '#FF00FF', mintCream: '#F5FFFA',
                        mistyRose: '#FFE4E1', moccasin: '#FFE4B5', navajoWhite: '#FFDEAD',
                        oldLace: '#FDF5E6', orangeRed: '#FF4500', orchid: '#DA70D6',
                        paleGoldenrod: '#EEE8AA', paleGreen: '#98FB98', paleTurquoise: '#AFEEEE',
                        paleVioletRed: '#DB7093', papayaWhip: '#FFEFD5', peachPuff: '#FFDAB9',
                        peru: '#CD853F', plum: '#DDA0DD', powderBlue: '#B0E0E6', rosyBrown: '#BC8F8F',
                        royalBlue: '#4169E1', saddleBrown: '#8B4513', salmon: '#FA8072',
                        sandyBrown: '#F4A460', seaGreen: '#2E8B57', seaShell: '#FFF5EE',
                        sienna: '#A0522D', skyBlue: '#87CEEB', slateBlue: '#6A5ACD',
                        slateGray: '#708090', springGreen: '#00FF7F', steelBlue: '#4682B4',
                        tan: '#D2B48C', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE',
                        wheat: '#F5DEB3', yellowGreen: '#9ACD32',
                    };

                    const parseSolidFill = (el: Element, themeColors?: Record<string, string>): string | null => {
                        const solidFill = el.getElementsByTagName('a:solidFill')[0];
                        if (!solidFill) return null;
                        const srgb = solidFill.getElementsByTagName('a:srgbClr')[0];
                        if (srgb) {
                            let hex = '#' + getAttr(srgb, 'val');
                            // Apply lumMod/lumOff
                            const lumMod = srgb.getElementsByTagName('a:lumMod')[0];
                            const lumOff = srgb.getElementsByTagName('a:lumOff')[0];
                            if (lumMod || lumOff) {
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                const mod = lumMod ? parseInt(getAttr(lumMod, 'val')) / 100000 : 1;
                                const off = lumOff ? parseInt(getAttr(lumOff, 'val')) / 100000 : 0;
                                const adj = (c: number) => Math.min(255, Math.max(0, Math.round(c * mod + off * 255)));
                                hex = '#' + [adj(r), adj(g), adj(b)].map(v => v.toString(16).padStart(2, '0')).join('');
                            }
                            return hex;
                        }
                        const sysClr = solidFill.getElementsByTagName('a:sysClr')[0];
                        if (sysClr) return '#' + getAttr(sysClr, 'lastClr');
                        const schemeClr = solidFill.getElementsByTagName('a:schemeClr')[0];
                        if (schemeClr && themeColors) {
                            const val = getAttr(schemeClr, 'val');
                            let hex = themeColors[val] || '#888888';
                            const lumMod = schemeClr.getElementsByTagName('a:lumMod')[0];
                            const lumOff = schemeClr.getElementsByTagName('a:lumOff')[0];
                            if ((lumMod || lumOff) && hex.startsWith('#')) {
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                const mod = lumMod ? parseInt(getAttr(lumMod, 'val')) / 100000 : 1;
                                const off = lumOff ? parseInt(getAttr(lumOff, 'val')) / 100000 : 0;
                                const adj = (c: number) => Math.min(255, Math.max(0, Math.round(c * mod + off * 255)));
                                hex = '#' + [adj(r), adj(g), adj(b)].map(v => v.toString(16).padStart(2, '0')).join('');
                            }
                            return hex;
                        }
                        const prstClr = solidFill.getElementsByTagName('a:prstClr')[0];
                        if (prstClr) return PRESET_COLORS[getAttr(prstClr, 'val')] ?? '#888888';
                        return null;
                    };

                    const parseGradFill = (el: Element, themeColors?: Record<string, string>): string | null => {
                        const gradFill = el.getElementsByTagName('a:gradFill')[0];
                        if (!gradFill) return null;
                        const stops = Array.from(gradFill.getElementsByTagName('a:gs'));
                        if (stops.length === 0) return null;
                        const colorStops = stops.map(gs => {
                            const pos = parseInt(getAttr(gs, 'pos')) / 100000;
                            const color = parseSolidFill(gs, themeColors) || '#888888';
                            return `${color} ${Math.round(pos * 100)}%`;
                        });
                        const lin = gradFill.getElementsByTagName('a:lin')[0];
                        const angle = lin ? (parseInt(getAttr(lin, 'ang')) / 60000) - 90 : 90;
                        return `linear-gradient(${angle}deg, ${colorStops.join(', ')})`;
                    };

                    const parseThemeColors = (themeXml: string | null): Record<string, string> => {
                        if (!themeXml) return {};
                        const themeDoc = new DOMParser().parseFromString(themeXml, 'application/xml');
                        const clrScheme = themeDoc.getElementsByTagName('a:clrScheme')[0];
                        if (!clrScheme) return {};
                        const result: Record<string, string> = {};
                        const colorNames = ['dk1','lt1','dk2','lt2','accent1','accent2','accent3','accent4','accent5','accent6','hlink','folHlink'];
                        for (const name of colorNames) {
                            const el = clrScheme.getElementsByTagName(`a:${name}`)[0];
                            if (!el) continue;
                            const srgb = el.getElementsByTagName('a:srgbClr')[0];
                            const sysClr = el.getElementsByTagName('a:sysClr')[0];
                            if (srgb) result[name] = '#' + getAttr(srgb, 'val');
                            else if (sysClr) result[name] = '#' + getAttr(sysClr, 'lastClr');
                        }
                        // Map theme color names
                        if (result.dk1) result.tx1 = result.dk1;
                        if (result.lt1) result.bg1 = result.lt1;
                        if (result.dk2) result.tx2 = result.dk2;
                        if (result.lt2) result.bg2 = result.lt2;
                        return result;
                    };

                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                    const pdfW = pdf.internal.pageSize.getWidth();
                    const pdfH = pdf.internal.pageSize.getHeight();

                    if (!isZip) {
                        // Legacy .ppt binary: proper recursive container parser
                        const XLSX = await import('xlsx');
                        setProgress({ percentage: 20, status: 'Parsing legacy .ppt file...' });
                        try {
                            const cfb = XLSX.CFB.read(bytes, { type: 'array' });
                            const entry = cfb.FileIndex.find((f: any) => f.name === 'PowerPointDocument' || f.name === 'PowerPoint Document');
                            if (!entry) throw new Error('Not a valid .ppt file. Please save it as .pptx from PowerPoint.');
                            const pptData = new Uint8Array(entry.content);
                            // Recursively extract all text atoms from a byte range
                            const extractText = (data: Uint8Array, s: number, e: number): string[] => {
                                const out: string[] = [];
                                let j = s;
                                while (j < e - 8) {
                                    const ver = data[j] & 0x0F;
                                    const rType = data[j + 2] | (data[j + 3] << 8);
                                    const rLen = data[j + 4] | (data[j + 5] << 8) | (data[j + 6] << 16) | (data[j + 7] << 24);
                                    if (rLen < 0 || j + 8 + rLen > e) { j++; continue; }
                                    if (ver === 0xF) { out.push(...extractText(data, j + 8, j + 8 + rLen)); }
                                    else if (rType === 4008) {
                                        const t = new TextDecoder('ascii').decode(data.subarray(j + 8, j + 8 + rLen)).trim();
                                        if (t.length > 1 && !t.startsWith('Click to')) out.push(t);
                                    } else if (rType === 4000) {
                                        const t = new TextDecoder('utf-16le').decode(data.subarray(j + 8, j + 8 + rLen)).trim();
                                        if (t.length > 1 && !t.startsWith('Click to')) out.push(t);
                                    }
                                    j += 8 + rLen;
                                }
                                return out;
                            };
                            // Walk top level, collect slides via RT_Slide (1006)
                            const slideTexts: string[][] = [];
                            let jj = 0;
                            while (jj < pptData.length - 8) {
                                const ver = pptData[jj] & 0x0F;
                                const rType = pptData[jj + 2] | (pptData[jj + 3] << 8);
                                const rLen = pptData[jj + 4] | (pptData[jj + 5] << 8) | (pptData[jj + 6] << 16) | (pptData[jj + 7] << 24);
                                if (rLen < 0 || jj + 8 + rLen > pptData.length) { jj++; continue; }
                                if (ver === 0xF && rType === 1006) {
                                    // RT_Slide container
                                    const texts = extractText(pptData, jj + 8, jj + 8 + rLen);
                                    if (texts.length > 0) slideTexts.push(texts);
                                    jj += 8 + rLen;
                                } else if (ver === 0xF && (rType === 1016 || rType === 1010 || rType === 1017)) {
                                    jj += 8 + rLen; // skip MainMaster/HandOut/Notes
                                } else if (ver === 0xF) {
                                    jj += 8; // enter other containers
                                } else {
                                    jj += 8 + rLen;
                                }
                            }
                            // Fallback: if RT_Slide detection found nothing, split flat text list
                            if (slideTexts.length === 0) {
                                const allTexts: string[] = [];
                                let kk = 0;
                                while (kk < pptData.length - 8) {
                                    const rType = pptData[kk + 2] | (pptData[kk + 3] << 8);
                                    const rLen = pptData[kk + 4] | (pptData[kk + 5] << 8) | (pptData[kk + 6] << 16) | (pptData[kk + 7] << 24);
                                    if (rLen < 0 || rLen > 65536 || kk + 8 + rLen > pptData.length) { kk++; continue; }
                                    if (rType === 4008) {
                                        const t = new TextDecoder('ascii').decode(pptData.subarray(kk + 8, kk + 8 + rLen)).trim();
                                        if (t.length > 1 && !t.startsWith('Click to')) allTexts.push(t);
                                        kk += 8 + rLen;
                                    } else if (rType === 4000) {
                                        const t = new TextDecoder('utf-16le').decode(pptData.subarray(kk + 8, kk + 8 + rLen)).trim();
                                        if (t.length > 1 && !t.startsWith('Click to')) allTexts.push(t);
                                        kk += 8 + rLen;
                                    } else { kk += 8 + Math.max(0, rLen); }
                                }
                                for (let mm = 0; mm < allTexts.length; mm += 5) slideTexts.push(allTexts.slice(mm, mm + 5));
                            }
                            setProgress({ percentage: 50, status: 'Rendering slides...' });
                            let firstPage = true;
                            for (const [slideIdx, texts] of slideTexts.entries()) {
                                const slideDiv = document.createElement('div');
                                slideDiv.style.cssText = 'position:absolute;left:-9999px;width:' + SLIDE_W + 'px;height:' + SLIDE_H + 'px;background:#1a1a2e;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:64px;box-sizing:border-box;font-family:Calibri,Arial,sans-serif;overflow:hidden;';
                                const accent = 'hsl(' + ((slideIdx * 53) % 360) + ',72%,58%)';
                                const bar = document.createElement('div');
                                bar.style.cssText = 'width:8px;height:100%;position:absolute;left:0;top:0;background:' + accent + ';border-radius:0 4px 4px 0;';
                                slideDiv.appendChild(bar);
                                const snum = document.createElement('div');
                                snum.style.cssText = 'position:absolute;top:20px;right:28px;color:rgba(255,255,255,0.3);font-size:14px;';
                                snum.textContent = String(slideIdx + 1);
                                slideDiv.appendChild(snum);
                                if (texts[0]) {
                                    const h = document.createElement('div');
                                    h.style.cssText = 'color:' + accent + ';font-size:44px;font-weight:bold;margin-bottom:28px;line-height:1.15;max-width:100%;';
                                    h.textContent = texts[0];
                                    slideDiv.appendChild(h);
                                }
                                for (let kk = 1; kk < texts.length; kk++) {
                                    const p = document.createElement('div');
                                    p.style.cssText = 'color:#d0d0d0;font-size:22px;margin-bottom:12px;line-height:1.55;max-width:100%;word-break:break-word;';
                                    p.textContent = texts[kk];
                                    slideDiv.appendChild(p);
                                }
                                document.body.appendChild(slideDiv);
                                const canvas = await html2canvas(slideDiv, { scale: 2, backgroundColor: '#1a1a2e', logging: false, width: SLIDE_W, height: SLIDE_H });
                                document.body.removeChild(slideDiv);
                                if (!firstPage) pdf.addPage();
                                firstPage = false;
                                pdf.addImage(canvas.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, pdfW, pdfH);
                                setProgress({ percentage: 50 + Math.round(((slideIdx + 1) / slideTexts.length) * 46), status: 'Rendering slide ' + (slideIdx + 1) + ' of ' + slideTexts.length + '...' });
                            }
                        } catch (e: any) { throw new Error((e as any).message || 'Failed to parse legacy .ppt file.'); }
                    } else {
                        // Modern PPTX: full visual rendering with real images
                        setProgress({ percentage: 15, status: 'Extracting PPTX content...' });
                        const zip = await JSZip.loadAsync(arrayBuffer);

                        // â”€â”€ Pre-load ALL media as base64 data URLs â”€â”€
                        const mediaCache: Record<string, string> = {};
                        const MIME_MAP: Record<string, string> = {
                            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
                            gif: 'image/gif', bmp: 'image/bmp', tiff: 'image/tiff',
                            svg: 'image/svg+xml', emf: 'image/x-emf', wmf: 'image/x-wmf',
                            webp: 'image/webp',
                        };
                        setProgress({ percentage: 20, status: 'Loading media assets...' });
                        const mediaFiles = Object.keys(zip.files).filter(p => p.startsWith('ppt/media/'));
                        for (const mediaPath of mediaFiles) {
                            try {
                                const ext = mediaPath.split('.').pop()?.toLowerCase() ?? 'png';
                                const mime = MIME_MAP[ext] ?? 'image/png';
                                const b64 = await zip.file(mediaPath)!.async('base64');
                                mediaCache[mediaPath] = `data:${mime};base64,${b64}`;
                            } catch {}
                        }

                        // â”€â”€ Load theme â”€â”€
                        let themeXml: string | null = null;
                        try { themeXml = await zip.file('ppt/theme/theme1.xml')?.async('string') ?? null; } catch {}
                        const themeColors = parseThemeColors(themeXml);

                        // â”€â”€ Parse slide relationship file into a map â”€â”€
                        const parseRels = async (relPath: string): Promise<Record<string, string>> => {
                            try {
                                const xml = await zip.file(relPath)?.async('string');
                                if (!xml) return {};
                                const doc = new DOMParser().parseFromString(xml, 'application/xml');
                                const result: Record<string, string> = {};
                                for (const rel of Array.from(doc.getElementsByTagName('Relationship'))) {
                                    const id = getAttr(rel, 'Id');
                                    let target = getAttr(rel, 'Target');
                                    if (!target.startsWith('ppt/') && !target.startsWith('/')) {
                                        target = relPath.split('_rels')[0] + target.replace('../', '');
                                    }
                                    result[id] = target;
                                }
                                return result;
                            } catch { return {}; }
                        };

                        // â”€â”€ Sorted slide list â”€â”€
                        const slideFiles = Object.keys(zip.files)
                            .filter(p => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
                            .sort((a, b) => (parseInt(a.match(/\d+/)?.[0]||'0')) - (parseInt(b.match(/\d+/)?.[0]||'0')));

                        // â”€â”€ Helper: render one shape container â”€â”€
                        const renderTextBox = (sp: Element, x: number, y: number, w: number, h: number, bgColor: string, themeC: Record<string, string>): HTMLElement => {
                            const box = document.createElement('div');
                            box.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:hidden;box-sizing:border-box;`;

                            // Shape fill
                            const spPr = sp.getElementsByTagName('p:spPr')[0];
                            if (spPr) {
                                const sf = parseSolidFill(spPr, themeC);
                                if (sf) box.style.background = sf;
                                else {
                                    const gf = parseGradFill(spPr, themeC);
                                    if (gf) box.style.background = gf;
                                    const noFill = spPr.getElementsByTagName('a:noFill')[0];
                                    if (noFill) box.style.background = 'transparent';
                                }
                                // Border
                                const ln = spPr.getElementsByTagName('a:ln')[0];
                                if (ln) {
                                    const lnFill = parseSolidFill(ln, themeC);
                                    const lnW = parseInt(getAttr(ln, 'w') || '12700') / 12700;
                                    if (lnFill) box.style.border = `${Math.max(1, Math.round(lnW))}px solid ${lnFill}`;
                                    const noFill = ln.getElementsByTagName('a:noFill')[0];
                                    if (noFill) box.style.border = 'none';
                                }
                                // Border radius
                                const prstGeom = spPr.getElementsByTagName('a:prstGeom')[0];
                                if (prstGeom) {
                                    const prst = getAttr(prstGeom, 'prst');
                                    if (prst === 'roundRect') box.style.borderRadius = '8px';
                                    else if (prst === 'ellipse' || prst === 'circle') box.style.borderRadius = '50%';
                                }
                            }

                            // Text body
                            const txBody = sp.getElementsByTagName('p:txBody')[0];
                            if (txBody) {
                                const bodyPr = txBody.getElementsByTagName('a:bodyPr')[0];
                                const anchor = bodyPr?.getAttribute('anchor') ?? 't';
                                const insetL = bodyPr ? parseInt(getAttr(bodyPr, 'lIns') || '91440') / 914400 * 96 : 7;
                                const insetT = bodyPr ? parseInt(getAttr(bodyPr, 'tIns') || '45720') / 914400 * 96 : 3.5;
                                box.style.padding = `${insetT}px ${insetL}px`;
                                if (anchor === 'ctr') { box.style.display = 'flex'; box.style.flexDirection = 'column'; box.style.justifyContent = 'center'; }
                                else if (anchor === 'b') { box.style.display = 'flex'; box.style.flexDirection = 'column'; box.style.justifyContent = 'flex-end'; }

                                const isDarkBg = (() => {
                                    if (!bgColor || bgColor === '#FFFFFF' || bgColor === '#ffffff') return false;
                                    const hex = bgColor.replace('#', '');
                                    if (hex.length !== 6) return false;
                                    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
                                    return (0.299*r + 0.587*g + 0.114*b) < 128;
                                })();

                                for (const para of Array.from(txBody.getElementsByTagName('a:p'))) {
                                    const pPr = para.getElementsByTagName('a:pPr')[0];
                                    const align = pPr?.getAttribute('algn') ?? 'l';
                                    const spcBef = parseInt(pPr?.getElementsByTagName('a:spcBef')[0]?.getElementsByTagName('a:spcPts')[0]?.getAttribute('val') ?? '0') / 100;
                                    const pDiv = document.createElement('p');
                                    pDiv.style.cssText = `margin:0;padding:0;line-height:1.3;white-space:pre-wrap;word-break:break-word;`;
                                    if (spcBef > 0) pDiv.style.marginTop = `${spcBef * 0.5}px`;
                                    pDiv.style.textAlign = align === 'ctr' ? 'center' : align === 'r' ? 'right' : align === 'just' ? 'justify' : 'left';

                                    const runs = para.getElementsByTagName('a:r');
                                    if (runs.length === 0) { pDiv.innerHTML = '&nbsp;'; }
                                    for (const run of Array.from(runs)) {
                                        const rPr = run.getElementsByTagName('a:rPr')[0];
                                        const t = run.getElementsByTagName('a:t')[0];
                                        if (!t) continue;
                                        const span = document.createElement('span');
                                        let fontSize = 18;
                                        if (rPr) {
                                            const sz = rPr.getAttribute('sz');
                                            if (sz) fontSize = parseInt(sz) / 100;
                                            if (rPr.getAttribute('b') === '1') span.style.fontWeight = 'bold';
                                            if (rPr.getAttribute('i') === '1') span.style.fontStyle = 'italic';
                                            if (rPr.getAttribute('u') === 'sng') span.style.textDecoration = 'underline';
                                            if (rPr.getAttribute('strike') === 'sngStrike') span.style.textDecoration = 'line-through';
                                            const clr = parseSolidFill(rPr, themeC);
                                            span.style.color = clr || (isDarkBg ? '#ffffff' : '#000000');
                                            const latin = rPr.getElementsByTagName('a:latin')[0];
                                            if (latin) {
                                                const tf = getAttr(latin, 'typeface');
                                                if (tf && tf !== '+mj-lt' && tf !== '+mn-lt') span.style.fontFamily = `"${tf}",Calibri,Arial,sans-serif`;
                                            }
                                        } else { span.style.color = isDarkBg ? '#ffffff' : '#000000'; }
                                        span.style.fontSize = Math.min(fontSize, 96) + 'px';
                                        span.textContent = t.textContent;
                                        pDiv.appendChild(span);
                                    }
                                    box.appendChild(pDiv);
                                }
                            }
                            return box;
                        };

                        // â”€â”€ Main slide renderer â”€â”€
                        const renderSlide = async (slideXml: string, slideRels: Record<string, string>, layoutXml: string | null, layoutRels: Record<string, string>, masterXml: string | null, masterRels: Record<string, string>): Promise<HTMLElement> => {
                            const parser = new DOMParser();
                            const sDoc = parser.parseFromString(slideXml, 'application/xml');
                            const lDoc = layoutXml ? parser.parseFromString(layoutXml, 'application/xml') : null;
                            const mDoc = masterXml ? parser.parseFromString(masterXml, 'application/xml') : null;

                            const slide = document.createElement('div');
                            slide.style.cssText = `width:${SLIDE_W}px;height:${SLIDE_H}px;position:absolute;left:-9999px;overflow:hidden;font-family:Calibri,Arial,sans-serif;background:#ffffff;`;

                            // â”€â”€ Background â”€â”€
                            let bgColor = '#FFFFFF';
                            const setBgFromDoc = (doc: Document) => {
                                const bg = doc.getElementsByTagName('p:bg')[0];
                                if (!bg) return false;
                                const bgPr = bg.getElementsByTagName('p:bgPr')[0];
                                if (!bgPr) return false;
                                const sf = parseSolidFill(bgPr, themeColors);
                                if (sf) { bgColor = sf; slide.style.background = sf; return true; }
                                const gf = parseGradFill(bgPr, themeColors);
                                if (gf) { slide.style.background = gf; return true; }
                                // Background image
                                const blip = bgPr.getElementsByTagName('a:blip')[0];
                                if (blip) {
                                    const rEmbed = blip.getAttribute('r:embed') ?? blip.getAttribute('r:link');
                                    const rels = doc === sDoc ? slideRels : (doc === lDoc ? layoutRels : masterRels);
                                    if (rEmbed && rels[rEmbed]) {
                                        const imgPath = rels[rEmbed].startsWith('ppt/') ? rels[rEmbed] : 'ppt/' + rels[rEmbed];
                                        const imgUrl = mediaCache[imgPath];
                                        if (imgUrl) { slide.style.backgroundImage = `url("${imgUrl}")`; slide.style.backgroundSize = 'cover'; slide.style.backgroundPosition = 'center'; return true; }
                                    }
                                }
                                return false;
                            };
                            if (!setBgFromDoc(sDoc) && lDoc && !setBgFromDoc(lDoc)) { mDoc && setBgFromDoc(mDoc); }

                            // â”€â”€ Render shape trees (master â†’ layout â†’ slide order) â”€â”€
                            const renderSpTree = async (spTree: Element, doc: Document, rels: Record<string, string>) => {
                                // Render connector shapes (lines)
                                for (const cxnSp of Array.from(spTree.getElementsByTagName('p:cxnSp'))) {
                                    const xfrm = cxnSp.getElementsByTagName('p:xfrm')[0];
                                    if (!xfrm) continue;
                                    const off = xfrm.getElementsByTagName('a:off')[0];
                                    const ext = xfrm.getElementsByTagName('a:ext')[0];
                                    if (!off || !ext) continue;
                                    const x = emuToPx(parseInt(getAttr(off, 'x') || '0'));
                                    const y = emuToPxH(parseInt(getAttr(off, 'y') || '0'));
                                    const w = emuToPx(parseInt(getAttr(ext, 'cx') || '0'));
                                    const h = emuToPxH(parseInt(getAttr(ext, 'cy') || '0'));
                                    const spPr = cxnSp.getElementsByTagName('p:spPr')[0];
                                    const ln = spPr?.getElementsByTagName('a:ln')[0];
                                    const lineColor = ln ? parseSolidFill(ln, themeColors) || '#000000' : '#000000';
                                    const lineW = ln ? Math.max(1, parseInt(getAttr(ln, 'w') || '12700') / 12700) : 1;
                                    const line = document.createElement('div');
                                    const angle = Math.atan2(h, w) * 180 / Math.PI;
                                    const length = Math.sqrt(w * w + h * h);
                                    line.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${length}px;height:${lineW}px;background:${lineColor};transform-origin:0 50%;transform:rotate(${angle}deg);`;
                                    slide.appendChild(line);
                                }

                                // Render text shapes
                                for (const sp of Array.from(spTree.getElementsByTagName('p:sp'))) {
                                    const xfrm = sp.getElementsByTagName('p:xfrm')[0];
                                    if (!xfrm) continue;
                                    const off = xfrm.getElementsByTagName('a:off')[0];
                                    const ext = xfrm.getElementsByTagName('a:ext')[0];
                                    if (!off || !ext) continue;
                                    const x = emuToPx(parseInt(getAttr(off, 'x') || '0'));
                                    const y = emuToPxH(parseInt(getAttr(off, 'y') || '0'));
                                    const w = emuToPx(parseInt(getAttr(ext, 'cx') || '0'));
                                    const h = emuToPxH(parseInt(getAttr(ext, 'cy') || '0'));
                                    const rot = parseInt(xfrm.getAttribute('rot') || '0') / 60000;
                                    const box = renderTextBox(sp, x, y, w, h, bgColor, themeColors);
                                    if (rot) { box.style.transformOrigin = 'center center'; box.style.transform = `rotate(${rot}deg)`; }
                                    slide.appendChild(box);
                                }

                                // Render pictures (real images!)
                                for (const pic of Array.from(spTree.getElementsByTagName('p:pic'))) {
                                    const xfrm = pic.getElementsByTagName('p:xfrm')[0] || pic.getElementsByTagName('a:xfrm')[0];
                                    if (!xfrm) continue;
                                    const off = xfrm.getElementsByTagName('a:off')[0];
                                    const ext = xfrm.getElementsByTagName('a:ext')[0];
                                    if (!off || !ext) continue;
                                    const x = emuToPx(parseInt(getAttr(off, 'x') || '0'));
                                    const y = emuToPxH(parseInt(getAttr(off, 'y') || '0'));
                                    const w = emuToPx(parseInt(getAttr(ext, 'cx') || '0'));
                                    const h = emuToPxH(parseInt(getAttr(ext, 'cy') || '0'));
                                    const rot = parseInt(xfrm.getAttribute('rot') || '0') / 60000;
                                    const flipH = xfrm.getAttribute('flipH') === '1';
                                    const flipV = xfrm.getAttribute('flipV') === '1';

                                    const blip = pic.getElementsByTagName('a:blip')[0];
                                    const rEmbed = blip?.getAttribute('r:embed') ?? blip?.getAttribute('r:link') ?? '';
                                    const imgRelPath = rels[rEmbed];
                                    if (!imgRelPath) continue;
                                    const imgPath = imgRelPath.startsWith('ppt/') ? imgRelPath : 'ppt/slides/' + imgRelPath.replace('../', '');
                                    const imgUrl = mediaCache[imgPath] || mediaCache['ppt/' + imgRelPath.replace('../', '')];
                                    if (!imgUrl) continue;

                                    const img = document.createElement('img');
                                    img.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:fill;`;
                                    if (rot || flipH || flipV) {
                                        const transforms: string[] = [];
                                        if (rot) transforms.push(`rotate(${rot}deg)`);
                                        if (flipH) transforms.push('scaleX(-1)');
                                        if (flipV) transforms.push('scaleY(-1)');
                                        img.style.transformOrigin = 'center center';
                                        img.style.transform = transforms.join(' ');
                                    }
                                    img.src = imgUrl;
                                    slide.appendChild(img);
                                }

                                // Render graphic frames (tables, charts)
                                for (const gf of Array.from(spTree.getElementsByTagName('p:graphicFrame'))) {
                                    const xfrm = gf.getElementsByTagName('p:xfrm')[0];
                                    if (!xfrm) continue;
                                    const off = xfrm.getElementsByTagName('a:off')[0];
                                    const ext = xfrm.getElementsByTagName('a:ext')[0];
                                    if (!off || !ext) continue;
                                    const x = emuToPx(parseInt(getAttr(off, 'x') || '0'));
                                    const y = emuToPxH(parseInt(getAttr(off, 'y') || '0'));
                                    const w = emuToPx(parseInt(getAttr(ext, 'cx') || '0'));
                                    const h = emuToPxH(parseInt(getAttr(ext, 'cy') || '0'));

                                    // Table rendering
                                    const tbl = gf.getElementsByTagName('a:tbl')[0];
                                    if (tbl) {
                                        const tableWrapper = document.createElement('div');
                                        tableWrapper.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:hidden;box-sizing:border-box;`;
                                        const table = document.createElement('table');
                                        table.style.cssText = `border-collapse:collapse;width:100%;height:100%;table-layout:fixed;`;
                                        const rows = Array.from(tbl.getElementsByTagName('a:tr'));
                                        for (const row of rows) {
                                            const tr = document.createElement('tr');
                                            const cells = Array.from(row.getElementsByTagName('a:tc'));
                                            for (const cell of cells) {
                                                const td = document.createElement('td');
                                                td.style.cssText = `border:1px solid #ccc;padding:4px 8px;vertical-align:top;font-size:${Math.min(16, h / rows.length * 0.5)}px;`;
                                                const tcPr = cell.getElementsByTagName('a:tcPr')[0];
                                                if (tcPr) {
                                                    const sf = parseSolidFill(tcPr, themeColors);
                                                    if (sf) td.style.background = sf;
                                                }
                                                const cellRuns = cell.getElementsByTagName('a:r');
                                                for (const run of Array.from(cellRuns)) {
                                                    const t = run.getElementsByTagName('a:t')[0];
                                                    if (t) {
                                                        const rPr = run.getElementsByTagName('a:rPr')[0];
                                                        const span = document.createElement('span');
                                                        if (rPr?.getAttribute('b') === '1') span.style.fontWeight = 'bold';
                                                        const clr = rPr ? parseSolidFill(rPr, themeColors) : null;
                                                        if (clr) span.style.color = clr;
                                                        span.textContent = t.textContent;
                                                        td.appendChild(span);
                                                    }
                                                }
                                                tr.appendChild(td);
                                            }
                                            table.appendChild(tr);
                                        }
                                        tableWrapper.appendChild(table);
                                        slide.appendChild(tableWrapper);
                                        continue;
                                    }

                                    // Chart: try to find cached chart image from relationships
                                    const chartRef = gf.getElementsByTagName('c:chart')[0];
                                    if (chartRef) {
                                        const rId = chartRef.getAttribute('r:id');
                                        if (rId && rels[rId]) {
                                            const chartPath = rels[rId].startsWith('ppt/') ? rels[rId] : 'ppt/slides/' + rels[rId].replace('../', '');
                                            // Look for cached raster in chart rels
                                            const chartRelPath = chartPath.replace('/charts/', '/charts/_rels/').replace('.xml', '.xml.rels');
                                            try {
                                                const chartRelXml = await zip.file(chartRelPath)?.async('string');
                                                if (chartRelXml) {
                                                    const crDoc = new DOMParser().parseFromString(chartRelXml, 'application/xml');
                                                    for (const rel of Array.from(crDoc.getElementsByTagName('Relationship'))) {
                                                        const target = getAttr(rel, 'Target');
                                                        if (target.includes('media/') || target.match(/\.(png|jpg|jpeg|gif|bmp)$/i)) {
                                                            const imgPath = target.startsWith('ppt/') ? target : 'ppt/charts/' + target.replace('../', '');
                                                            const imgUrl = mediaCache[imgPath];
                                                            if (imgUrl) {
                                                                const img = document.createElement('img');
                                                                img.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:fill;`;
                                                                img.src = imgUrl;
                                                                slide.appendChild(img);
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                            } catch {}
                                        }
                                    }
                                }

                                // Render grouped shapes recursively
                                for (const grpSp of Array.from(spTree.getElementsByTagName('p:grpSp'))) {
                                    const innerTree = grpSp;
                                    await renderSpTree(innerTree, doc, rels);
                                }
                            };

                            // Render master â†’ layout â†’ slide (layers)
                            if (mDoc) {
                                const mTree = mDoc.getElementsByTagName('p:spTree')[0];
                                if (mTree) await renderSpTree(mTree, mDoc, masterRels);
                            }
                            if (lDoc) {
                                const lTree = lDoc.getElementsByTagName('p:spTree')[0];
                                if (lTree) await renderSpTree(lTree, lDoc, layoutRels);
                            }
                            const sTree = sDoc.getElementsByTagName('p:spTree')[0];
                            if (sTree) await renderSpTree(sTree, sDoc, slideRels);

                            return slide;
                        };

                        // â”€â”€ Process each slide â”€â”€
                        let firstPage = true;
                        for (let idx = 0; idx < slideFiles.length; idx++) {
                            const slidePath = slideFiles[idx];
                            const slideNum = slidePath.match(/\d+/)?.[0] ?? `${idx + 1}`;
                            const slideRels = await parseRels(`ppt/slides/_rels/slide${slideNum}.xml.rels`);
                            const slideXml = await zip.file(slidePath)!.async('string');

                            // Layout
                            const layoutTarget = Object.values(slideRels).find(t => t.includes('slideLayout'));
                            const layoutPath = layoutTarget ? (layoutTarget.startsWith('ppt/') ? layoutTarget : `ppt/slides/${layoutTarget.replace('../', '')}`) : null;
                            const layoutXml = layoutPath ? (await zip.file(layoutPath)?.async('string') ?? null) : null;
                            const layoutNum = layoutPath?.match(/\d+/)?.[0] ?? '1';
                            const layoutRels = layoutPath ? await parseRels(`ppt/slideLayouts/_rels/slideLayout${layoutNum}.xml.rels`) : {};

                            // Master
                            const masterTarget = Object.values(layoutRels).find(t => t.includes('slideMaster'));
                            const masterPath = masterTarget ? (masterTarget.startsWith('ppt/') ? masterTarget : `ppt/slideLayouts/${masterTarget.replace('../', '')}`) : null;
                            const masterXml = masterPath ? (await zip.file(masterPath)?.async('string') ?? null) : null;
                            const masterNum = masterPath?.match(/\d+/)?.[0] ?? '1';
                            const masterRels = masterPath ? await parseRels(`ppt/slideMasters/_rels/slideMaster${masterNum}.xml.rels`) : {};

                            setProgress({ percentage: 25 + Math.round(((idx + 1) / slideFiles.length) * 70), status: `Rendering slide ${idx + 1} of ${slideFiles.length}...` });

                            const slideEl = await renderSlide(slideXml, slideRels, layoutXml, layoutRels, masterXml, masterRels);
                            document.body.appendChild(slideEl);

                            // Wait for images to load
                            const imgs = Array.from(slideEl.getElementsByTagName('img'));
                            if (imgs.length > 0) {
                                await Promise.all(imgs.map(img => new Promise<void>(res => {
                                    if (img.complete) { res(); return; }
                                    img.onload = () => res();
                                    img.onerror = () => res();
                                    setTimeout(res, 3000);
                                })));
                            }

                            const canvas = await html2canvas(slideEl, {
                                scale: 2,
                                useCORS: true,
                                allowTaint: true,
                                logging: false,
                                width: SLIDE_W,
                                height: SLIDE_H,
                                backgroundColor: '#ffffff',
                            });
                            document.body.removeChild(slideEl);

                            if (!firstPage) pdf.addPage();
                            firstPage = false;
                            pdf.addImage(canvas.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, pdfW, pdfH);
                        }
                    }

                    setProgress({ percentage: 99, status: 'Finalizing PDF...' });
                    blob = pdf.output('blob');
                    break;
                }
                case 'extract-text': {
                    const pdfjsLib = await importPdfjs();
                    if (files.length !== 1) throw new Error("Please select one PDF file.");
                    const file = files[0];
                    const pdfjsDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                        const page = await pdfjsDoc.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n\n';
                    }
                    blob = new Blob([fullText], { type: 'text/plain' });
                    break;
                }
                case 'zip-maker': {
                    const JSZip = (await import('jszip')).default;
                    if (files.length === 0) throw new Error("Please select files to zip.");
                    const zip = new JSZip();
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        setProgress({ percentage: Math.round((i + 1) / files.length * 100), status: `Adding ${file.name}` });
                        zip.file(file.name, file);
                    }
                    blob = await zip.generateAsync({ type: 'blob' });
                    break;
                }
                case 'remove-background': {
                    if (files.length !== 1) throw new Error("Please select one image file.");
                    const file = files[0];
                    setProgress({ percentage: 10, status: 'Initializing background removal model...' });

                    try {
                        const { removeBackground } = await import('@imgly/background-removal');
                        blob = await removeBackground(file, {
                            model: 'isnet_fp16',
                            publicPath: 'https://unpkg.com/@imgly/background-removal-data@1.7.0/dist/',
                            progress: (key, current, total) => {
                                const percent = Math.round((current / total) * 100);
                                setProgress({ 
                                    percentage: Math.min(10 + Math.round(percent * 0.85), 95), 
                                    status: `Removing background (${percent}%)...` 
                                });
                            }
                        });
                    } catch (err: any) {
                        console.error("Client background removal error:", err);
                        throw new Error('Background removal failed: ' + (err.message || err));
                    }
                    break;
                }
                case 'jpg-to-pdf': {
                    const { PDFDocument } = await import('pdf-lib-plus-encrypt');
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
                    blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                    break;
                }
                case 'word-to-pdf': {
                    if (files.length !== 0 && files.length !== 1) throw new Error("Please select one Word file.");
                    const file = files[0];

                    // ── PRIMARY PATH: Server-side conversion via Word COM ──
                    setProgress({ percentage: 10, status: 'Uploading to server for conversion...' });
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('action', 'word-to-pdf');

                        const serverRes = await fetch('/api/convert-word', {
                            method: 'POST',
                            body: formData,
                            signal: AbortSignal.timeout(120000),
                        });

                        if (serverRes.ok) {
                            setProgress({ percentage: 95, status: 'Conversion complete. Preparing download...' });
                            blob = await serverRes.blob();
                            break;
                        }
                        const errJson = await serverRes.json().catch(() => ({ error: 'Server error' }));
                        console.warn('Server Word-to-PDF failed, using client-side fallback:', errJson.error);
                    } catch (serverErr) {
                        console.warn('Server unreachable, using client-side fallback:', serverErr);
                    }

                    // ── FALLBACK PATH: Client-side mammoth + html2canvas renderer ──
                    setProgress({ percentage: 15, status: 'Using client-side fallback renderer...' });
                    const mammoth = (await import('mammoth')).default;
                    const html2canvas = (await import('html2canvas')).default;
                    const { jsPDF } = await import('jspdf');
                    if (file.name.toLowerCase().endsWith('.doc')) {
                        throw new Error("Legacy Word format (.doc) is not supported client-side. Please save it as .docx from Microsoft Word first, or let our server handle it.");
                    }
                    const arrayBuffer = await file.arrayBuffer();
                    setProgress({ percentage: 20, status: 'Converting to HTML...' });

                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    if (!result.value || result.value.trim() === '') {
                        throw new Error("The Word document appears to be empty or could not be read. Please try a different file.");
                    }
                    const html = `<div style="font-family: 'Times New Roman', Times, serif; line-height: 1.5; font-size: 12pt; color: black; background-color: white;">${result.value}</div>`;

                    const container = document.createElement('div');
                    container.style.position = 'absolute';
                    container.style.left = '-9999px';
                    container.style.padding = '15mm';
                    container.style.backgroundColor = 'white';
                    container.innerHTML = html;
                    document.body.appendChild(container);
                    container.style.width = '210mm';

                    setProgress({ percentage: 60, status: 'Capturing document...' });

                    const canvas = await html2canvas(container, {
                        scale: 3.5,
                        useCORS: true,
                        logging: false,
                        width: container.scrollWidth,
                        height: container.scrollHeight,
                    });

                    document.body.removeChild(container);

                    setProgress({ percentage: 80, status: 'Generating PDF...' });

                    const imgData = canvas.toDataURL('image/jpeg', 0.98);
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

                    pdf.addImage(imgData, 'JPEG', 0, position, imgPdfWidth, imgPdfHeight);
                    heightLeft -= pdfHeight;

                    while (heightLeft > 0) {
                        position -= pdfHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, imgPdfWidth, imgPdfHeight);
                        heightLeft -= pdfHeight;
                    }

                    blob = pdf.output('blob');
                    break;
                }
                case 'excel-to-pdf': {
                    if (files.length !== 1) throw new Error("Please select one Excel file.");
                    const file = files[0];

                    // ── PRIMARY PATH: Server-side conversion via Excel COM ──
                    setProgress({ percentage: 10, status: 'Uploading to server for conversion...' });
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('action', 'excel-to-pdf');

                        const serverRes = await fetch('/api/convert-excel', {
                            method: 'POST',
                            body: formData,
                            signal: AbortSignal.timeout(120000),
                        });

                        if (serverRes.ok) {
                            setProgress({ percentage: 95, status: 'Conversion complete. Preparing download...' });
                            blob = await serverRes.blob();
                            break;
                        }
                        const errJson = await serverRes.json().catch(() => ({ error: 'Server error' }));
                        console.warn('Server Excel-to-PDF failed, using client-side fallback:', errJson.error);
                    } catch (serverErr) {
                        console.warn('Server unreachable, using client-side fallback:', serverErr);
                    }

                    // ── FALLBACK PATH: Client-side sheetjs + jspdf renderer ──
                    setProgress({ percentage: 15, status: 'Using client-side fallback renderer...' });
                    const XLSX = await import('xlsx');
                    const { jsPDF } = await import('jspdf');
                    const arrayBuffer = await file.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    
                    setProgress({ percentage: 40, status: 'Parsing sheets...' });
                    const sheetData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
                    if (sheetData.length === 0) {
                        throw new Error("The Excel sheet is empty.");
                    }

                    let numCols = 0;
                    sheetData.forEach(row => {
                        if (row && row.length > numCols) {
                            numCols = row.length;
                        }
                    });
                    if (numCols === 0) numCols = 1;

                    const isLandscape = numCols > 6;
                    const pdf = new jsPDF({
                        orientation: isLandscape ? 'landscape' : 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });

                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    
                    const margin = 10;
                    const contentWidth = pageWidth - (margin * 2);
                    
                    // Proportional column width calculation
                    const colMaxLengths = new Array(numCols).fill(1);
                    sheetData.forEach(row => {
                        if (row) {
                            for (let colIdx = 0; colIdx < numCols; colIdx++) {
                                const valStr = String(row[colIdx] || '');
                                if (valStr.length > colMaxLengths[colIdx]) {
                                    colMaxLengths[colIdx] = valStr.length;
                                }
                            }
                        }
                    });

                    const cappedLengths = colMaxLengths.map(len => Math.min(len, 40));
                    const totalLengthSum = cappedLengths.reduce((a, b) => a + b, 0);

                    const colWidths = cappedLengths.map(len => {
                        const proportion = len / totalLengthSum;
                        return Math.max(proportion * contentWidth, 12);
                    });

                    const currentTotalWidth = colWidths.reduce((a, b) => a + b, 0);
                    const normalizedColWidths = colWidths.map(w => (w / currentTotalWidth) * contentWidth);

                    const rowHeight = 7;
                    const headerHeight = 8;
                    const titleHeight = 12;
                    let y = margin + titleHeight;
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(file.name.replace(/\.[^/.]+$/, ""), margin, margin + 6);
                    
                    const drawCellText = (text: string, x: number, currY: number, width: number, height: number, isHeader: boolean) => {
                        pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');
                        pdf.setFontSize(isHeader ? 8 : 7);
                        pdf.setTextColor(0, 0, 0);
                        
                        const textY = currY + (height / 2) + 1.2;
                        
                        let cellText = text.trim();
                        const maxAllowedWidth = width - 2;
                        if (pdf.getTextWidth(cellText) > maxAllowedWidth) {
                            let truncated = cellText;
                            while (truncated.length > 0 && pdf.getTextWidth(truncated + '...') > maxAllowedWidth) {
                                truncated = truncated.slice(0, -1);
                            }
                            cellText = truncated + '...';
                        }
                        
                        pdf.text(cellText, x + 1, textY);
                    };

                    const drawHeaderRow = (currentY: number) => {
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFillColor(230, 230, 230);
                        pdf.setDrawColor(200, 200, 200);
                        
                        let currentX = margin;
                        for (let colIdx = 0; colIdx < numCols; colIdx++) {
                            const w = normalizedColWidths[colIdx];
                            pdf.rect(currentX, currentY, w, headerHeight, 'FD');
                            const val = sheetData[0] ? String(sheetData[0][colIdx] || '') : '';
                            drawCellText(val, currentX, currentY, w, headerHeight, true);
                            currentX += w;
                        }
                    };

                    setProgress({ percentage: 60, status: 'Drawing tables...' });

                    if (sheetData.length === 1) {
                        drawHeaderRow(y);
                        y += headerHeight;
                    }

                    for (let rowIdx = 1; rowIdx < sheetData.length; rowIdx++) {
                        if (y + rowHeight > pageHeight - margin) {
                            pdf.addPage();
                            y = margin;
                            drawHeaderRow(y);
                            y += headerHeight;
                        }
                        
                        if (rowIdx === 1) {
                            drawHeaderRow(y);
                            y += headerHeight;
                        }

                        let currentX = margin;
                        const rowData = sheetData[rowIdx] || [];
                        
                        for (let colIdx = 0; colIdx < numCols; colIdx++) {
                            const w = normalizedColWidths[colIdx];
                            pdf.setDrawColor(200, 200, 200);
                            pdf.rect(currentX, y, w, rowHeight, 'S');
                            const val = String(rowData[colIdx] ?? '');
                            drawCellText(val, currentX, y, w, rowHeight, false);
                            currentX += w;
                        }
                        
                        y += rowHeight;
                        
                        if (rowIdx % 500 === 0) {
                            const currentPercentage = 60 + Math.round((rowIdx / sheetData.length) * 30);
                            setProgress({ percentage: currentPercentage, status: `Drawing row ${rowIdx}...` });
                        }
                    }
                    
                    setProgress({ percentage: 95, status: 'Finalizing PDF...' });
                    blob = pdf.output('blob');
                    break;
                }
                case 'pdf-to-jpg': {
                    const JSZip = (await import('jszip')).default;
                    const pdfjsLib = await importPdfjs();
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
                        // FIX: The render method expects an object that includes the canvas context and viewport.
                        // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                        const renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                        await renderTask.promise;
                        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                        const imageBlob = await (await fetch(imageDataUrl)).blob();
                        zip.file(`${file.name.replace('.pdf', '')}_page_${i}.jpg`, imageBlob);
                    }
                    blob = await zip.generateAsync({ type: 'blob' });
                    break;
                }
                case 'pdf-to-png': {
                    const JSZip = (await import('jszip')).default;
                    const pdfjsLib = await importPdfjs();
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
                        // FIX: The render method expects an object that includes the canvas context and viewport.
                        // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                        const renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                        await renderTask.promise;
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

                    // ── PRIMARY PATH: Server-side conversion via Word COM ──
                    setProgress({ percentage: 10, status: 'Uploading to server for conversion...' });
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('action', 'pdf-to-word');

                        const serverRes = await fetch('/api/convert-word', {
                            method: 'POST',
                            body: formData,
                            signal: AbortSignal.timeout(120000),
                        });

                        if (serverRes.ok) {
                            setProgress({ percentage: 95, status: 'Conversion complete. Preparing download...' });
                            blob = await serverRes.blob();
                            break;
                        }
                        const errJson = await serverRes.json().catch(() => ({ error: 'Server error' }));
                        console.warn('Server PDF-to-Word failed, using client-side fallback:', errJson.error);
                    } catch (serverErr) {
                        console.warn('Server unreachable, using client-side fallback:', serverErr);
                    }

                    // ── FALLBACK PATH: Client-side docx builder fallback ──
                    setProgress({ percentage: 15, status: 'Using client-side fallback renderer...' });
                    const pdfjsLib = await importPdfjs();
                    const { Document, Packer, Paragraph, TextRun, ImageRun, SectionType } = await import('docx');
                    const pdfBytes = await file.arrayBuffer();
                    const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes, password: toolOptions.password || '' }).promise;

                    let sections: any[] = [];

                    if (pdfToWordMode === 'exact') {
                        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                            setProgress({ percentage: Math.round((i / pdfjsDoc.numPages) * 100), status: `Converting page ${i}` });
                            const page = await pdfjsDoc.getPage(i);
                            const viewport = page.getViewport({ scale: 1.5 });
                            const canvas = document.createElement('canvas');
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            // FIX: The render method expects an object that includes the canvas context and viewport.
                            // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                            const renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                            await renderTask.promise;
                            const imageDataUrl = canvas.toDataURL('image/png');
                            const imageBuffer = await fetch(imageDataUrl).then(res => res.arrayBuffer());

                            sections.push({
                                children: [new Paragraph({
                                    children: [
                                        new ImageRun({
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
                    } else { // editable mode
                        let fullText = '';
                        if (useOcr) {
                            const TesseractModule = await import('tesseract.js');
                            const createWorker = TesseractModule.createWorker;
                            if (!createWorker) throw new Error('Could not initialize Tesseract.js for OCR.');

                            const worker = await createWorker('eng', 1, {
                                logger: m => { setProgress({ percentage: (m.progress || 0) * 100, status: m.status }); }
                            });

                            const numPages = pdfjsDoc.numPages;
                            for (let i = 1; i <= numPages; i++) {
                                setProgress({ percentage: Math.round((i / numPages) * 100), status: `Recognizing text on page ${i}` });
                                const page = await pdfjsDoc.getPage(i);
                                const viewport = page.getViewport({ scale: 2.0 }); // Higher res for better OCR
                                const canvas = document.createElement('canvas');
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                // FIX: The render method expects an object that includes the canvas context and viewport.
                                // FIX: Cast to 'any' to resolve type mismatch with pdfjs-dist RenderParameters.
                                const renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                                await renderTask.promise;

                                const { data: { text } } = await worker.recognize(canvas);
                                fullText += text + '\n\n';
                            }
                            await worker.terminate();

                        } else { // Standard text extraction
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

                    // ── PRIMARY PATH: Server-side conversion via Word & Excel COM ──
                    setProgress({ percentage: 10, status: 'Uploading to server for conversion...' });
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('action', 'pdf-to-excel');

                        const serverRes = await fetch('/api/convert-excel', {
                            method: 'POST',
                            body: formData,
                            signal: AbortSignal.timeout(120000),
                        });

                        if (serverRes.ok) {
                            setProgress({ percentage: 95, status: 'Conversion complete. Preparing download...' });
                            blob = await serverRes.blob();
                            break;
                        }
                        const errJson = await serverRes.json().catch(() => ({ error: 'Server error' }));
                        console.warn('Server PDF-to-Excel failed, using client-side fallback:', errJson.error);
                    } catch (serverErr) {
                        console.warn('Server unreachable, using client-side fallback:', serverErr);
                    }

                    // ── FALLBACK PATH: Client-side sheetjs parser ──
                    setProgress({ percentage: 15, status: 'Using client-side fallback renderer...' });
                    const pdfjsLib = await importPdfjs();
                    const XLSX = await import('xlsx');
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

                    setProgress({ percentage: 10, status: 'Checking encryption status...' });
                    let encrypted = false;
                    try {
                        const { PDFDocument } = await import('pdf-lib-plus-encrypt');
                        await PDFDocument.load(pdfBytes, { ignoreEncryption: false });
                    } catch (e: any) {
                        if (e.message.includes('encrypted') || e.message.includes('password')) {
                            encrypted = true;
                        }
                    }

                    if (!encrypted) {
                        setProgress({ percentage: 100, status: 'Document is already unlocked.' });
                        blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                        break;
                    }

                    if (!toolOptions.password) {
                        throw new Error("This PDF is password-protected. Please enter the password to unlock it.");
                    }

                    setProgress({ percentage: 40, status: 'Decrypting PDF on server...' });
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('password', toolOptions.password);

                    const res = await fetch('/api/unlock-pdf', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!res.ok) {
                        const errJson = await res.json().catch(() => ({ error: 'Incorrect password or decryption error.' }));
                        throw new Error(errJson.error || 'Incorrect password or decryption error.');
                    }

                    setProgress({ percentage: 90, status: 'Preparing decrypted file download...' });
                    blob = await res.blob();
                    break;
                }
                case 'protect-pdf': {
                    const { PDFDocument } = await import('pdf-lib-plus-encrypt');
                    if (files.length !== 1) throw new Error("Please select one PDF file.");
                    const file = files[0];
                    const pdfBytes = await file.arrayBuffer();

                    if (!toolOptions.password) throw new Error("Please enter a password to protect the PDF.");

                    setProgress({ percentage: 30, status: 'Loading PDF...' });
                    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

                    setProgress({ percentage: 70, status: 'Applying password protection...' });
                    await (pdfDoc as any).encrypt({
                        userPassword: toolOptions.password,
                        ownerPassword: toolOptions.password + '_owner_master_pdfbullet_secret_777',
                        permissions: {
                            printing: toolOptions.allowPrinting ? 'highResolution' : 'none',
                            copying: toolOptions.allowCopying,
                            modifying: toolOptions.allowModifying,
                            annotating: true,
                            fillingForms: true,
                            contentAccessibility: true,
                            documentAssembly: true,
                        },
                    });
                    const protectedBytes = await pdfDoc.save();
                    blob = new Blob([protectedBytes as unknown as BlobPart], { type: 'application/pdf' });
                    break;
                }
                case 'psd-to-pdf': {
                    const { readPsd } = await import('ag-psd');
                    const { jsPDF } = await import('jspdf');
                    if (files.length !== 1) throw new Error("Please select one PSD file.");
                    const file = files[0];
                    const buffer = await file.arrayBuffer();
                    setProgress({ percentage: 50, status: "Rendering PSD..." });
                    const psd = readPsd(buffer);
                    if (!psd.canvas) throw new Error("Could not render PSD file.");
                    const originalCanvas = psd.canvas;
                    const canvas = document.createElement('canvas');
                    canvas.width = originalCanvas.width;
                    canvas.height = originalCanvas.height;
                    const context = canvas.getContext('2d')!;
                    context.fillStyle = 'white';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(originalCanvas, 0, 0);

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdf = new jsPDF({
                        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [canvas.width, canvas.height]
                    });
                    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                    blob = pdf.output('blob');
                    break;
                }
                case 'ocr-pdf': {
                    if (files.length !== 1) throw new Error("Please select one PDF file for OCR.");
                    const file = files[0];

                    const updateProgress = (p: number, s: string) => {
                        const friendlyStatus = s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        setProgress({ percentage: p, status: friendlyStatus });
                    };

                    // ── PRIMARY PATH: Server-side conversion via Word COM OCR ──
                    updateProgress(10, 'Uploading to server for premium OCR...');
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const serverRes = await fetch('/api/ocr-pdf', {
                            method: 'POST',
                            body: formData,
                            signal: AbortSignal.timeout(120000),
                        });

                        if (serverRes.ok) {
                            updateProgress(95, 'OCR complete. Preparing download...');
                            blob = await serverRes.blob();
                            break;
                        }
                        const errJson = await serverRes.json().catch(() => ({ error: 'Server error' }));
                        console.warn('Server OCR failed, using client-side fallback:', errJson.error);
                    } catch (serverErr) {
                        console.warn('Server unreachable, using client-side fallback:', serverErr);
                    }

                    // ── FALLBACK PATH: Client-side Tesseract.js OCR ──
                    try {
                        updateProgress(15, 'Using client-side fallback OCR engine...');
                        const pdfjsLib = await importPdfjs();
                        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
                        const numPages = pdf.numPages;

                        updateProgress(20, 'Loading OCR Engine...');
                        const TesseractModule = await import('tesseract.js');
                        const createWorker = TesseractModule.createWorker;

                        if (!createWorker) {
                            throw new Error('Failed to load Tesseract.js OCR library.');
                        }

                        updateProgress(25, 'Initializing Worker...');
                        const worker = await createWorker(toolOptions.ocrLanguage || 'eng', 1, {
                            logger: m => {
                                if (m.status === 'recognizing text') {
                                    const pageProgress = (m.progress || 0) * (65 / numPages);
                                    const totalProgress = 30 + ((worker as any)._currentJob.page - 1) * (65 / numPages) + pageProgress;
                                    updateProgress(totalProgress, `Recognizing page ${(worker as any)._currentJob.page}...`);
                                }
                            }
                        });

                        const { PDFDocument } = await import('pdf-lib-plus-encrypt');
                        const newPdfDoc = await PDFDocument.create();

                        for (let i = 1; i <= numPages; i++) {
                            updateProgress(30 + ((i - 1) / numPages * 65), `Rendering page ${i}...`);
                            const page = await pdf.getPage(i);
                            const viewport = page.getViewport({ scale: 2.0 });
                            const canvas = document.createElement('canvas');
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            const context = canvas.getContext('2d')!;
                            await page.render({ canvasContext: context, viewport } as any).promise;

                            const { data } = await worker.recognize(canvas, {}, { pdf: true });
                            const ocrPdfBytes = new Uint8Array(data.pdf as number[]);
                            const ocrPdfDoc = await PDFDocument.load(ocrPdfBytes);
                            const [copiedPage] = await newPdfDoc.copyPages(ocrPdfDoc, [0]);
                            newPdfDoc.addPage(copiedPage);
                        }

                        updateProgress(98, 'Finalizing PDF...');
                        await worker.terminate();
                        const pdfBytes = await newPdfDoc.save();
                        blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                    } catch (err) {
                        console.error("OCR Error:", err);
                        throw new Error(`OCR processing failed: ${err instanceof Error ? err.message : String(err)}`);
                    }
                    break;
                }
                case 'pdf-to-powerpoint': {
                    if (files.length !== 1) throw new Error("Please select one PDF file.");
                    const file = files[0];

                    // ── PRIMARY PATH: Server-side conversion via Word + PowerPoint COM ──
                    setProgress({ percentage: 10, status: 'Uploading to server for conversion...' });
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('action', 'pdf-to-powerpoint');

                        const serverRes = await fetch('/api/convert-ppt', {
                            method: 'POST',
                            body: formData,
                            signal: AbortSignal.timeout(120000),
                        });

                        if (serverRes.ok) {
                            setProgress({ percentage: 95, status: 'Conversion complete. Preparing download...' });
                            blob = await serverRes.blob();
                            break;
                        }
                        const errJson = await serverRes.json().catch(() => ({ error: 'Server error' }));
                        console.warn('Server PDF-to-PowerPoint failed, using client-side fallback:', errJson.error);
                    } catch (serverErr) {
                        console.warn('Server unreachable, using client-side fallback:', serverErr);
                    }

                    // ── FALLBACK PATH: Client-side renderer (pages as images in PPTX) ──
                    setProgress({ percentage: 15, status: 'Using client-side fallback renderer...' });
                    const pdfjsLib = await importPdfjs();
                    const pptxgenModule = await import('pptxgenjs');
                    const PptxGenJS = pptxgenModule.default || pptxgenModule;
                    const pdfBytes = await file.arrayBuffer();
                    const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
                    const pptx = new PptxGenJS();

                    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                        setProgress({ percentage: 15 + Math.round((i / pdfjsDoc.numPages) * 80), status: `Converting page ${i}...` });
                        const page = await pdfjsDoc.getPage(i);
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport } as any);
                        await renderTask.promise;

                        const imgData = canvas.toDataURL('image/png');
                        const slide = pptx.addSlide();
                        slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
                    }

                    setProgress({ percentage: 96, status: 'Finalizing PowerPoint...' });
                    blob = await pptx.write({ outputType: 'blob' }) as Blob;
                    break;
                }
            }

            if (blob) {
                setProcessedFileBlob(blob);
                setState(ProcessingState.Success);
                const filename = getOutputFilename(tool.id, files, toolOptions);
                const taskData = {
                    toolId: tool.id,
                    toolTitle: t(tool.title),
                    outputFilename: filename,
                    fileBlob: blob
                };
                addTask(taskData);
                logTask(taskData);
                if (user) {
                    sendTaskCompletionEmail(t(tool.title), filename);
                }
            } else if (state !== ProcessingState.Error) {
                throw new Error('Processing failed to produce a result file. The input file may be unsupported or corrupt.');
            }
        } catch (e: any) {
            console.error("Processing Error in handleProcess:", e);
            let message = 'An unknown error occurred during processing.';
            if (e instanceof Error) {
                message = e.message;
            } else if (typeof e === 'string') {
                message = e;
            } else if (e && typeof e.toString === 'function') {
                const errorString = e.toString();
                if (errorString !== '[object Object]') {
                    message = errorString;
                }
            }
            setErrorMessage(message);
            setState(ProcessingState.Error);
        } finally {
            setProgress(null);
        }
    };

    const onProcessStart = () => {
        setState(ProcessingState.Processing);
        setProcessingStartTime(Date.now());
        setErrorMessage('');
        setProcessedFileBlob(null);
        setOutputFilename('');
        setProgress({ percentage: 0, status: 'Preparing...' });
    };

    const onProcessSuccess = (blob: Blob, filename: string) => {
        setProcessedFileBlob(blob);
        setOutputFilename(filename);
        setState(ProcessingState.Success);
        if (tool) {
            const taskData = {
                toolId: tool.id,
                toolTitle: t(tool.title),
                outputFilename: filename,
                fileBlob: blob
            };
            addTask(taskData);
            logTask(taskData); // Log the task
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
                            <button onClick={handleDownload} className="success-download-btn" title="Download processed file">
                                <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7z" />
                                </svg>
                            </button>
                            <div className="success-secondary-actions">
                                <button
                                    onClick={openShareModal}
                                    className="success-action-btn"
                                    aria-label="Share with QR code"
                                    title="Share with QR code"
                                >
                                    <QrCodeIcon className="h-6 w-6" />
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
                            <LockIcon className="h-6 w-6" />
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
                            <a href="https://www.trustpilot.com/review/pdfbullet.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <StarIcon className="h-5 w-5 text-green-500" />
                                <span>Trustpilot</span>
                            </a>
                            <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpdfbullet.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <FacebookIcon className="h-5 w-5 text-blue-600" />
                                <span>Facebook</span>
                            </a>
                            <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fpdfbullet.com&text=Check%20out%20PDFBullet,%20the%20best%20free%20online%20PDF%20toolkit!" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <XIcon className="h-5 w-5" />
                                <span>Twitter</span>
                            </a>
                            <a href="https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fpdfbullet.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <LinkedInIcon className="h-5 w-5 text-blue-700" />
                                <span>LinkedIn</span>
                            </a>
                        </div>
                    </div>

                    <div className="mt-12 text-center p-6 rounded-lg max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">The PDF software trusted by millions of users</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                            PDFBullet helps you convert, edit, e-sign, and protect PDF files quickly and easily. Enjoy a full suite of tools to effectively manage documents â€”no matter where you're working.
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
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my-4">
                                <div className="bg-brand-red h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress.percentage || 0}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{progress.status || 'Initializing...'}</p>
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
                    <BackgroundRemovalUI tool={tool} />
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
                        tool={tool}
                    />
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
                                        <button onClick={() => setToolOptions(prev => ({ ...prev, rotation: 90 }))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 90 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>90Â°</button>
                                        <button onClick={() => setToolOptions(prev => ({ ...prev, rotation: 180 }))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 180 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>180Â°</button>
                                        <button onClick={() => setToolOptions(prev => ({ ...prev, rotation: 270 }))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 270 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>270Â°</button>
                                    </div>
                                )}
                                {(tool.id === 'unlock-pdf' || tool.id === 'protect-pdf') && (
                                    <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-4 shadow-sm text-gray-900 dark:text-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900">
                                                <LockIcon className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                                {tool.id === 'unlock-pdf' ? 'Enter PDF Password' : 'Set Protection Password'}
                                            </h3>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={toolOptions.password || ''}
                                                onChange={(e) => setToolOptions(prev => ({ ...prev, password: e.target.value }))}
                                                placeholder={tool.id === 'unlock-pdf' ? "Enter the current password..." : "Enter a new strong password..."}
                                                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all dark:text-white text-sm"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                                title={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                                ) : (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                )}
                                            </button>
                                        </div>

                                        {tool.id === 'protect-pdf' && toolOptions.password && (
                                            <div className="space-y-1.5 animate-fade-in-down" style={{ animationDuration: '200ms' }}>
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-gray-500">Password Strength:</span>
                                                    <span className={
                                                        getPasswordStrength(toolOptions.password).score <= 1 ? 'text-red-500' :
                                                        getPasswordStrength(toolOptions.password).score <= 3 ? 'text-yellow-500' : 'text-green-500'
                                                    }>
                                                        {getPasswordStrength(toolOptions.password).text}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrength(toolOptions.password).color} ${getPasswordStrength(toolOptions.password).width}`}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {tool.id === 'protect-pdf' && (
                                            <div className="space-y-3 pt-2">
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Configure Restrictions</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-gray-300 transition-colors">
                                                        <input type="checkbox" checked={toolOptions.allowPrinting} onChange={(e) => setToolOptions(prev => ({ ...prev, allowPrinting: e.target.checked }))} className="h-4 w-4 rounded text-black dark:text-white focus:ring-black" />
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allow Printing</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-gray-300 transition-colors">
                                                        <input type="checkbox" checked={toolOptions.allowCopying} onChange={(e) => setToolOptions(prev => ({ ...prev, allowCopying: e.target.checked }))} className="h-4 w-4 rounded text-black dark:text-white focus:ring-black" />
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allow Copying</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-gray-300 transition-colors">
                                                        <input type="checkbox" checked={toolOptions.allowModifying} onChange={(e) => setToolOptions(prev => ({ ...prev, allowModifying: e.target.checked }))} className="h-4 w-4 rounded text-black dark:text-white focus:ring-black" />
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allow Editing</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
                                            {tool.id === 'unlock-pdf'
                                                ? 'Note: You must know the correct password to decrypt and download this document.'
                                                : 'Note: Encryption uses professional security standards to secure your document.'}
                                        </p>
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
                                    <div 
                                        key={index} 
                                        id={`pdf-page-${index}`} 
                                        className="relative border-b dark:border-gray-700 last:border-b-0 cursor-crosshair group/page select-none"
                                        onClick={(e) => handlePageClick(index, e)}
                                    >
                                        <img src={src} alt={`Page ${index + 1}`} className="w-full h-auto select-none pointer-events-none" />
                                        
                                        <div className="absolute top-3 left-3 bg-black/75 text-white text-xs px-2.5 py-1 rounded-md font-semibold opacity-0 group-hover/page:opacity-100 transition-opacity pointer-events-none shadow-md backdrop-blur-sm z-10">
                                            Page {index + 1} • Click to place signature
                                        </div>

                                        {/* Draggable signatures overlays */}
                                        {canvasItems
                                            .filter(item => item.pageIndex === index)
                                            .map(item => {
                                                const viewport = pdfPageViewports[index];
                                                if (!viewport) return null;
                                                return (
                                                    <DraggableSignatureItem
                                                        key={item.id}
                                                        item={item}
                                                        viewport={viewport}
                                                        onUpdate={(updatedItem) => {
                                                            setCanvasItems(prev => prev.map(c => c.id === item.id ? updatedItem : c));
                                                        }}
                                                        onDelete={() => {
                                                            setCanvasItems(prev => prev.filter(c => c.id !== item.id));
                                                        }}
                                                    />
                                                );
                                            })
                                        }
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
                                            <button onClick={(e) => { e.stopPropagation(); setIsSignatureModalOpen(true); }} className="p-1 text-gray-400 hover:text-brand-red"><EditIcon className="h-5 w-5" /></button>
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
                                            <button onClick={(e) => { e.stopPropagation(); setIsSignatureModalOpen(true); }} className="p-1 text-gray-400 hover:text-brand-red"><EditIcon className="h-5 w-5" /></button>
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
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red transition-colors font-medium"
                    >
                        <LeftArrowIcon className="h-5 w-5" />
                        <span>Back to All Tools</span>
                    </button>
                </div>
                {tool && (
                    <>
                        {renderContent()}
                        <ToolSeoFaqSection toolId={tool.id} toolTitle={t(tool.title)} />
                    </>
                )}
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
            <ToolShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                qrCodeUrl={qrCodeUrl}
                shareableUrl={shareableUrl}
                fileName={outputFilename || (tool ? getOutputFilename(tool.id, files, toolOptions) : 'document.pdf')}
            />
        </div>
    );
};

export default ToolPage;

