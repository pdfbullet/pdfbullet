import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
import { PDFDocument, degrees } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';
import { LayoutContext } from '../App.tsx';

import { 
    UploadIcon, ZoomInIcon, ZoomOutIcon, LeftArrowIcon, RightArrowIcon, 
    FirstPageIcon, LastPageIcon, RotateIcon, DownloadIcon, ShareIcon, 
    TrashIcon, BookmarkIcon, BookmarkOutlineIcon, ViewGridIcon, PencilIcon,
    ExportIcon, CloseIcon, CheckIcon, CopyIcon
} from '../components/icons.tsx';

type Bookmark = { page: number; };

const PdfReaderPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void };

    useEffect(() => {
        if (setShowFooter) {
            setShowFooter(false);
            return () => setShowFooter(true);
        }
    }, [setShowFooter]);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('document.pdf');
    const [isEditingName, setIsEditingName] = useState(false);
    
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(0.5);
    const [rotations, setRotations] = useState<Record<number, number>>({});
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [sidebarTab, setSidebarTab] = useState<'thumbnails' | 'bookmarks'>('thumbnails');
    const [thumbnails, setThumbnails] = useState<string[]>([]);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
    const [isUiVisible, setIsUiVisible] = useState(true);

    const mainContainerRef = useRef<HTMLDivElement>(null);
    const pagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileNameInputRef = useRef<HTMLInputElement>(null);

    const { isPwa } = usePWAInstall();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const viewMode = useMemo(() => localStorage.getItem('viewMode'), []);
    const shouldShowPwaLayout = isPwa || (isMobile && viewMode !== 'browser');

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleUiInteraction = () => {
        if (isUiVisible) {
            setIsUiVisible(false);
        }
    };

    const renderAllPages = useCallback(async () => {
        if (!pdfDoc || !mainContainerRef.current) return;
    
        setIsLoading(true);
        const container = mainContainerRef.current;
        const pagesContainer = pagesContainerRef.current;
        if (!pagesContainer) return;

        pagesContainer.innerHTML = '';
        const numPages = pdfDoc.numPages;

        // px-6 margin/padding gives 48px available spacing
        const containerPadding = 48; 
        const availableWidth = container.clientWidth - containerPadding;

        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const rotation = (page.rotate + (rotations[i] || 0)) % 360;
            const originalViewport = page.getViewport({ scale: 1.0 });

            const dpr = window.devicePixelRatio || 1;
            const qualityMultiplier = 2.0; // Render at 2x scale for ultra crisp quality
            const scaleToFit = (availableWidth / originalViewport.width) * scale;
            
            const displayViewport = page.getViewport({ scale: scaleToFit, rotation });
            const renderViewport = page.getViewport({ scale: scaleToFit * dpr * qualityMultiplier, rotation });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.width = renderViewport.width;
                canvas.height = renderViewport.height;
                canvas.style.width = `${displayViewport.width}px`;
                canvas.style.height = `${displayViewport.height}px`;
                canvas.style.marginBottom = '24px';
                canvas.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                canvas.dataset.pageNumber = String(i);
                
                pagesContainer.appendChild(canvas);
                const renderContext = {
                    canvasContext: context,
                    viewport: renderViewport,
                };
                await page.render(renderContext as any).promise;
            }
        }
        setIsLoading(false);
    }, [pdfDoc, rotations, scale]);

    const generateThumbnails = useCallback(async (pdf: PDFDocumentProxy) => {
        const thumbPromises: Promise<string>[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            thumbPromises.push(
                pdf.getPage(i).then(page => {
                    const viewport = page.getViewport({ scale: 0.3 });
                    const canvas = document.createElement('canvas');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const renderContext = {
                        canvasContext: canvas.getContext('2d')!,
                        viewport,
                    };
                    return page.render(renderContext as any).promise.then(() => canvas.toDataURL());
                })
            );
        }
        setThumbnails(await Promise.all(thumbPromises));
    }, []);

    const loadPdf = useCallback(async (fileToLoad: File) => {
        setIsLoading(true);
        setError('');
        setPdfDoc(null);
        setPageNum(1);
        setNumPages(0);
        setRotations({});
        setBookmarks([]);
        setThumbnails([]);
        setScale(0.5); // Default to 50% on load
        setFile(fileToLoad);
        setFileName(fileToLoad.name);

        try {
            const arrayBuffer = await fileToLoad.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            await generateThumbnails(pdf);
        } catch (e: any) {
            setError(`Failed to load PDF: ${e.message}. The file may be corrupt or protected.`);
        } finally {
            setIsLoading(false);
        }
    }, [generateThumbnails]);

    useEffect(() => {
        const launchedFile = location.state?.launchedFile as File | undefined;
        if (launchedFile) {
            loadPdf(launchedFile);
        }
    }, [location.state, loadPdf]);
    
    // Render all pages scrollably
    useEffect(() => {
        if (pdfDoc) {
            renderAllPages();
        }
    }, [pdfDoc, rotations, scale, renderAllPages]);

    // Scroll tracking observer to update active page number
    useEffect(() => {
        if (!pagesContainerRef.current || thumbnails.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const pageNumber = Number((entry.target as HTMLElement).dataset.pageNumber);
                        if (pageNumber) {
                            setPageNum(pageNumber);
                            return;
                        }
                    }
                }
            },
            { root: mainContainerRef.current, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
        );

        const canvases = pagesContainerRef.current.children;
        Array.from(canvases).forEach(canvas => observer.observe(canvas as Element));

        return () => {
            Array.from(canvases).forEach(canvas => observer.unobserve(canvas as Element));
        };
    }, [thumbnails, pdfDoc, scale, rotations]);

    useEffect(() => {
        if (isEditingName) {
            fileNameInputRef.current?.focus();
            fileNameInputRef.current?.select();
        }
    }, [isEditingName]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) loadPdf(file);
    };

    const goToPage = (num: number) => {
        const pageNumber = Math.max(1, Math.min(num, numPages));
        const pagesContainer = pagesContainerRef.current;
        if (pagesContainer && pagesContainer.children.length >= pageNumber) {
            const pageElement = pagesContainer.children[pageNumber - 1] as HTMLElement;
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setPageNum(pageNumber);
    };

    const handleRotate = () => {
        setRotations(prev => ({
            ...prev,
            [pageNum]: ((prev[pageNum] || 0) + 90) % 360,
        }));
    };
    
    const handleBookmark = () => {
        setBookmarks(prev => {
            if (prev.some(b => b.page === pageNum)) {
                return prev.filter(b => b.page !== pageNum);
            } else {
                return [...prev, { page: pageNum }].sort((a, b) => a.page - b.page);
            }
        });
    };

    const [progressMessage, setProgressMessage] = useState('');

    const handleDownload = async () => {
        if (!file) return;
        setIsLoading(true);
        setProgressMessage('Applying changes...');
        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDocLib = await PDFDocument.load(existingPdfBytes);
            
            Object.entries(rotations).forEach(([pageNumStr, angle]) => {
                const pageIndex = parseInt(pageNumStr, 10) - 1;
                if (pageIndex >= 0 && pageIndex < pdfDocLib.getPageCount()) {
                    const page = pdfDocLib.getPage(pageIndex);
                    page.setRotation(degrees(page.getRotation().angle + angle));
                }
            });

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            link.click();
            setTimeout(() => {
                URL.revokeObjectURL(link.href);
            }, 1000);
        } catch(e: any) {
            setError(`Failed to save PDF: ${e.message}`);
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    };

    const handleExport = async (format: 'png' | 'jpg') => {
        setIsLoading(true);
        setProgressMessage(`Exporting as ${format.toUpperCase()}...`);
        const pagesContainer = pagesContainerRef.current;
        if (pagesContainer) {
            const canvas = pagesContainer.children[pageNum - 1] as HTMLCanvasElement;
            if (canvas) {
                const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.9);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${fileName.replace('.pdf', '')}_page_${pageNum}.${format}`;
                link.click();
            }
        }
        setIsLoading(false);
        setProgressMessage('');
        setIsExportModalOpen(false);
    };

    const handleReset = () => {
        setPdfDoc(null);
        setFile(null);
    };

    if (!file) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 relative min-h-[500px]">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red transition-colors font-medium"
                >
                    <LeftArrowIcon className="h-5 w-5" />
                    <span>Back to All Tools</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                <UploadIcon className="h-24 w-24 text-gray-500 dark:text-gray-400 mb-4" />
                <h1 className="text-3xl font-bold mb-2">PDF Reader & Toolkit</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">View, read, and perform quick edits on your PDF documents.</p>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-8 py-4 bg-brand-red text-white font-bold rounded-lg hover:bg-brand-red-dark transition-colors text-xl"
                >
                    <UploadIcon className="h-6 w-6" />
                    <span>Open PDF File</span>
                </button>
                 {error && <p className="mt-4 text-red-400">{error}</p>}
            </div>
        );
    }
    
    if (shouldShowPwaLayout) {
        return (
            <div 
                className="h-full w-full relative bg-gray-200 dark:bg-gray-800 no-scrollbar"
                onScroll={handleUiInteraction}
                onDoubleClick={() => setIsUiVisible(p => !p)}
            >
                <div 
                    className={`fixed top-[68px] left-4 z-20 transition-all duration-300 ease-in-out ${
                    isUiVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'
                    }`}
                >
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-3 bg-slate-800 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-md text-white hover:bg-slate-700"
                        title="Toggle thumbnails"
                    >
                        <ViewGridIcon className="h-6 w-6" />
                    </button>
                </div>

                {isMobile && isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-30"></div>}
                <aside className={`pdf-reader-sidebar-mobile md:pdf-reader-sidebar-desktop w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700 flex flex-col text-white z-40 ${isSidebarOpen ? 'open' : ''}`}>
                     <div className="flex-shrink-0 border-b border-gray-700">
                        <div className="flex">
                            <button onClick={() => setSidebarTab('thumbnails')} className={`flex-1 p-3 font-semibold text-sm ${sidebarTab === 'thumbnails' ? 'bg-gray-700/50 text-white' : 'text-gray-400'}`}>Thumbnails</button>
                            <button onClick={() => setSidebarTab('bookmarks')} className={`flex-1 p-3 font-semibold text-sm ${sidebarTab === 'bookmarks' ? 'bg-gray-700/50 text-white' : 'text-gray-400'}`}>Bookmarks</button>
                        </div>
                     </div>
                     <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
                        {sidebarTab === 'thumbnails' && (
                            <div className="grid grid-cols-2 gap-2">
                                {thumbnails.map((thumb, i) => (
                                    <div key={i} onClick={() => { goToPage(i + 1); isMobile && setIsSidebarOpen(false); }} className={`thumbnail-item cursor-pointer rounded-md p-1 ${pageNum === i + 1 ? 'active' : ''}`}>
                                        <img src={thumb} alt={`Page ${i+1}`} className="w-full h-auto rounded-sm shadow-md" style={{ transform: `rotate(${rotations[i+1] || 0}deg)` }} />
                                        <p className="text-xs text-center mt-1">{i + 1}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {sidebarTab === 'bookmarks' && (
                            <div className="space-y-2">
                                 {bookmarks.length > 0 ? bookmarks.map(bm => (
                                    <div key={bm.page} onClick={() => { goToPage(bm.page); isMobile && setIsSidebarOpen(false); }} className="p-2 rounded-md hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                                        <BookmarkIcon className="h-4 w-4 text-brand-red flex-shrink-0" />
                                        <span className="font-semibold text-sm">Page {bm.page}</span>
                                    </div>
                                 )) : <p className="text-center text-sm text-gray-500 p-4">No bookmarks added yet.</p>}
                            </div>
                        )}
                     </div>
                </aside>

                <main ref={mainContainerRef} className="h-full w-full overflow-y-auto no-scrollbar">
                    <div ref={pagesContainerRef} className="flex flex-col items-center w-full px-6 pt-6 pb-6">
                        {/* Mobile page canvases are appended here by renderAllPagesMobile */}
                    </div>
                </main>
                 {(isLoading || progressMessage) && (
                    <div className="absolute inset-0 bg-black/50 z-30 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        {progressMessage && <p className="mt-4 text-white font-semibold">{progressMessage}</p>}
                    </div>
                 )}
                 {error && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 bg-red-900/50 p-4 rounded-md">{error}</p>}
            </div>
        );
    }


    return (
        <div 
            className={`pdf-reader-grid ${!isSidebarOpen ? 'sidebar-closed' : ''}`}
        >
            <header className="grid-area-header bg-gray-900/70 backdrop-blur-sm p-2 flex items-center justify-between border-b border-gray-700 h-16 flex-shrink-0 z-20 text-white">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-md hover:bg-gray-700 flex items-center gap-1 text-gray-300 hover:text-white"
                        title="Back to All Tools"
                    >
                        <LeftArrowIcon className="h-6 w-6" />
                    </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-700"><ViewGridIcon className="h-6 w-6" /></button>
                    {isEditingName ? (
                        <input
                            ref={fileNameInputRef}
                            type="text"
                            value={fileName}
                            onChange={e => setFileName(e.target.value)}
                            onBlur={() => setIsEditingName(false)}
                            onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                            className="bg-gray-700 text-white font-bold rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-red w-40 sm:w-auto"
                        />
                    ) : (
                        <h1 className="font-bold text-lg truncate max-w-32 sm:max-w-xs md:max-w-md">{fileName}</h1>
                    )}
                    <button onClick={() => setIsEditingName(true)} className="p-1 rounded-md hover:bg-gray-700"><PencilIcon className="h-4 w-4 text-gray-400" /></button>
                </div>
                
                {!isMobile && (
                    <div className="flex items-center gap-2 bg-gray-900/70 backdrop-blur-md p-2 rounded-full shadow-lg border border-gray-700">
                        <button onClick={() => goToPage(1)} disabled={pageNum <= 1} className="p-3 rounded-full disabled:opacity-50 hover:bg-gray-700"><FirstPageIcon className="h-5 w-5" /></button>
                        <button onClick={() => setPageNum(p => Math.max(p - 1, 1))} disabled={pageNum <= 1} className="p-3 rounded-full disabled:opacity-50 hover:bg-gray-700"><LeftArrowIcon className="h-5 w-5" /></button>
                        <span className="px-2 text-sm font-semibold">
                            Page {pageNum} of {numPages}
                        </span>
                        <button onClick={() => setPageNum(p => Math.min(p + 1, numPages))} disabled={pageNum >= numPages} className="p-3 rounded-full disabled:opacity-50 hover:bg-gray-700"><RightArrowIcon className="h-5 w-5" /></button>
                        <button onClick={() => goToPage(numPages)} disabled={pageNum >= numPages} className="p-3 rounded-full disabled:opacity-50 hover:bg-gray-700"><LastPageIcon className="h-5 w-5" /></button>
                    </div>
                )}
                
                <div className="flex items-center gap-1 sm:gap-2">
                    {!isMobile && (
                        <>
                            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md hover:bg-gray-700"><ShareIcon className="h-5 w-5"/> Share</button>
                            <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md hover:bg-gray-700"><ExportIcon className="h-5 w-5"/> Export</button>
                            <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 bg-brand-red text-white font-bold rounded-md hover:bg-brand-red-dark transition-colors text-sm"><DownloadIcon className="h-5 w-5" /> Download</button>
                            <button onClick={handleReset} className="p-2 rounded-md hover:bg-gray-700" title="Close document"><TrashIcon className="h-5 w-5" /></button>
                        </>
                    )}
                    {isMobile && (
                         <button onClick={handleReset} className="p-2 rounded-md hover:bg-gray-700" title="Close document"><CloseIcon className="h-6 w-6" /></button>
                    )}
                </div>
            </header>

            <aside className={`pdf-reader-sidebar-desktop bg-gray-900/50 backdrop-blur-sm border-r border-gray-700 flex flex-col text-white`}>
                 <div className="flex-shrink-0 border-b border-gray-700">
                    <div className="flex">
                        <button onClick={() => setSidebarTab('thumbnails')} className={`flex-1 p-3 font-semibold text-sm ${sidebarTab === 'thumbnails' ? 'bg-gray-700/50 text-white' : 'text-gray-400'}`}>Thumbnails</button>
                        <button onClick={() => setSidebarTab('bookmarks')} className={`flex-1 p-3 font-semibold text-sm ${sidebarTab === 'bookmarks' ? 'bg-gray-700/50 text-white' : 'text-gray-400'}`}>Bookmarks</button>
                    </div>
                 </div>
                 <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
                    {sidebarTab === 'thumbnails' && (
                        <div className="grid grid-cols-2 gap-2">
                            {thumbnails.map((thumb, i) => (
                                <div key={i} onClick={() => goToPage(i + 1)} className={`thumbnail-item cursor-pointer rounded-md p-1 ${pageNum === i + 1 ? 'active' : ''}`}>
                                    <img src={thumb} alt={`Page ${i+1}`} className="w-full h-auto rounded-sm shadow-md" style={{ transform: `rotate(${rotations[i+1] || 0}deg)` }} />
                                    <p className="text-xs text-center mt-1">{i + 1}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {sidebarTab === 'bookmarks' && (
                        <div className="space-y-2">
                             {bookmarks.length > 0 ? bookmarks.map(bm => (
                                <div key={bm.page} onClick={() => goToPage(bm.page)} className="p-2 rounded-md hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                                    <BookmarkIcon className="h-4 w-4 text-brand-red flex-shrink-0" />
                                    <span className="font-semibold text-sm">Page {bm.page}</span>
                                </div>
                             )) : <p className="text-center text-sm text-gray-500 p-4">No bookmarks added yet.</p>}
                        </div>
                    )}
                 </div>
            </aside>
            
            <main ref={mainContainerRef} className="grid-area-main flex-grow w-full flex items-start justify-center p-2 sm:p-4 overflow-auto no-scrollbar">
                 {(isLoading || progressMessage) && (
                    <div className="absolute inset-0 bg-black/50 z-30 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        {progressMessage && <p className="mt-4 text-white font-semibold">{progressMessage}</p>}
                    </div>
                 )}
                 {error && <p className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</p>}
                
                <div ref={pagesContainerRef} className={`flex flex-col items-center w-full transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
                    {/* Page canvases are appended here by renderAllPages */}
                </div>
            </main>

            <div className={`fixed right-6 top-1/2 -translate-y-1/2 z-20 transition-transform duration-300`}>
                 {!isMobile && (
                     <div className="flex flex-col items-center gap-2 bg-gray-900/70 backdrop-blur-md p-2 rounded-full shadow-lg border border-gray-700 text-white">
                         <button onClick={handleRotate} className="p-3 rounded-full hover:bg-gray-700" title="Rotate Page"><RotateIcon className="h-5 w-5" /></button>
                         <button onClick={handleBookmark} className="p-3 rounded-full hover:bg-gray-700" title="Add Bookmark">
                             {bookmarks.some(b => b.page === pageNum) ? <BookmarkIcon className="h-5 w-5 text-brand-red"/> : <BookmarkOutlineIcon className="h-5 w-5" />}
                         </button>
                         <div className="w-6 h-px bg-gray-600 my-1"></div>
                         <button onClick={() => setScale(s => Math.min(s + 0.25, 5))} className="p-3 rounded-full hover:bg-gray-700" title="Zoom In"><ZoomInIcon className="h-5 w-5" /></button>
                         <span className="py-1 text-xs font-semibold w-12 text-center">{Math.round(scale * 100)}%</span>
                         <button onClick={() => setScale(s => Math.max(s - 0.25, 0.25))} className="p-3 rounded-full hover:bg-gray-700" title="Zoom Out"><ZoomOutIcon className="h-5 w-5" /></button>
                     </div>
                 )}
            </div>
            
            {isShareModalOpen && <ShareModal url={window.location.href} title={fileName} onClose={() => setIsShareModalOpen(false)} />}
            {isExportModalOpen && <ExportModal onExport={handleExport} onClose={() => setIsExportModalOpen(false)} />}
        </div>
    );
};

const ShareModal: React.FC<{ url: string; title: string; onClose: () => void; }> = ({ url, title, onClose }) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    useEffect(() => {
        QRCode.toDataURL(url, { width: 160 }).then(setQrCodeDataUrl);
    }, [url]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-white" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Share Document</h3>
                <div className="text-center bg-white p-4 rounded-md"><img src={qrCodeDataUrl} alt="QR Code" className="mx-auto" /></div>
                <div className="relative mt-4">
                    <input type="text" readOnly value={url} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pr-10 text-sm" />
                    <button onClick={handleCopy} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                        {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
                    </button>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 font-semibold py-2 rounded-md">Close</button>
            </div>
        </div>
    );
};

const ExportModal: React.FC<{ onExport: (format: 'png' | 'jpg') => void; onClose: () => void; }> = ({ onExport, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-white" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Export Current Page</h3>
                <div className="space-y-3">
                    <button onClick={() => onExport('png')} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3 rounded-md">Export as PNG</button>
                    <button onClick={() => onExport('jpg')} className="w-full bg-green-600 hover:bg-green-700 font-semibold py-3 rounded-md">Export as JPG</button>
                </div>
                 <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 font-semibold py-2 rounded-md">Cancel</button>
            </div>
        </div>
    );
};

export default PdfReaderPage;