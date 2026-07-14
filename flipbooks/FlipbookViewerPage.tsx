import React, { useState, useEffect, useRef, useCallback, useContext, useLayoutEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from '../utils/routerCompat.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import HTMLFlipBook from 'react-pageflip';
import * as QRCode from 'qrcode';
import { getFlipbook, updateFlipbookStats, toggleLike, hasLiked, Flipbook } from '../hooks/useFlipbooks.ts';
import { 
    RefreshIcon, HomeIcon, CheckIcon, LeftArrowIcon, RightArrowIcon, CloseIcon, CopyIcon, 
    LikeIcon, ShareIcon, FullscreenIcon, ZoomInIcon, ZoomOutIcon, SoundOnIcon, SoundOffIcon,
    FirstPageIcon, LastPageIcon, FacebookIcon, XIcon, WhatsAppIcon, EmailIcon, PinterestIcon, RedditIcon, PlusIcon
} from '../components/icons.tsx';
import { LayoutContext } from '../App.tsx';
import { Logo } from '../components/Logo.tsx';
import { demoFlipbooks } from './demoData.ts';
import { exploreFlipbooks } from '../views/manage-flipbooks/exploreData.ts';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';

// --- SUB-COMPONENTS ---

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; url: string; title: string; coverUrl: string; }> = ({ isOpen, onClose, url, title, coverUrl }) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [isCopiedLink, setIsCopiedLink] = useState(false);
    const [isCopiedEmbed, setIsCopiedEmbed] = useState(false);
    
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const socialLinks = [
        { name: 'Facebook', icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'bg-blue-600' },
        { name: 'Twitter', icon: XIcon, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, color: 'bg-black' },
        { name: 'Email', icon: EmailIcon, href: `mailto:?subject=${encodedTitle}&body=Check%20out%20this%20flipbook:%20${encodedUrl}`, color: 'bg-gray-500' },
        { name: 'WhatsApp', icon: WhatsAppIcon, href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, color: 'bg-green-500' },
        { name: 'Pinterest', icon: PinterestIcon, href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(coverUrl)}&description=${encodedTitle}`, color: 'bg-red-600' },
        { name: 'Reddit', icon: RedditIcon, href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, color: 'bg-orange-500' },
    ];

    const embedCode = `<iframe src="${url}?embed=true" width="800" height="600" frameborder="0" allow="fullscreen"></iframe>`;

    useEffect(() => {
        if (isOpen) {
            setIsCopiedEmbed(false);
            setIsCopiedLink(false);
            QRCode.toDataURL(url, { width: 160, margin: 2, errorCorrectionLevel: 'H' })
                .then(setQrCodeDataUrl)
                .catch(err => console.error('Failed to generate QR code', err));
        }
    }, [isOpen, url]);

    if (!isOpen) return null;

    const copyToClipboard = (text: string, type: 'link' | 'embed') => {
        navigator.clipboard.writeText(text).then(() => {
            if (type === 'link') setIsCopiedLink(true);
            if (type === 'embed') setIsCopiedEmbed(true);
            setTimeout(() => {
                setIsCopiedLink(false);
                setIsCopiedEmbed(false);
            }, 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-fade-in-down" style={{animationDuration: '300ms'}} onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><ShareIcon className="h-5 w-5"/> Share</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center text-center">
                        {qrCodeDataUrl ? (
                            <img src={qrCodeDataUrl} alt="QR Code" className="w-40 h-40 rounded-lg border-4 border-white" />
                        ) : (
                            <div className="w-40 h-40 bg-gray-200 animate-pulse rounded-lg"></div>
                        )}
                        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Scan QR Code</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Share it:</h3>
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map(link => (
                                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" title={`Share on ${link.name}`} className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 ${link.color}`}>
                                        <link.icon className="h-5 w-5" />
                                    </a>
                                ))}
                                 <button onClick={() => alert("More share options coming soon!")} className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 bg-gray-400">
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <input type="text" readOnly value={url} className="w-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 p-2 pr-20 rounded-md border border-slate-300 dark:border-slate-600 text-sm" />
                                <button onClick={() => copyToClipboard(url, 'link')} className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-600 text-white rounded-md text-sm font-semibold hover:bg-gray-700">
                                    {isCopiedLink ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                         <div>
                             <div className="relative">
                                <textarea readOnly value={embedCode} rows={3} className="w-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 p-2 pr-20 rounded-md border border-slate-300 dark:border-slate-600 font-mono text-xs share-modal-textarea" />
                                <button onClick={() => copyToClipboard(embedCode, 'embed')} className="absolute right-1 top-1 px-3 py-1 bg-gray-600 text-white rounded-md text-sm font-semibold hover:bg-gray-700">
                                    {isCopiedEmbed ? 'Copied!' : 'Copy'}
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ViewerToolbar: React.FC<{
    currentPage: number; totalPages: number; onPrev: () => void; onNext: () => void; onGoToPage: (page: number) => void;
    onZoomIn: () => void; onZoomOut: () => void; onFullscreen: () => void; onShare: () => void; onLike: () => void; isLiked: boolean;
    isDemo: boolean; isSoundOn: boolean; onToggleSound: () => void; onFirstPage: () => void; onLastPage: () => void;
}> = (props) => {
    const [pageInput, setPageInput] = useState(String(props.currentPage + 1));
    useEffect(() => {
        setPageInput(String(props.currentPage + 1));
    }, [props.currentPage]);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setPageInput(e.target.value);
    const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(pageInput, 10);
            if (!isNaN(pageNum) && pageNum > 0 && pageNum <= props.totalPages) {
                props.onGoToPage(pageNum - 1);
            } else {
                setPageInput(String(props.currentPage + 1));
            }
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className="flex items-center justify-center gap-1">
            <button onClick={props.onFirstPage} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="First Page"><FirstPageIcon className="h-5 w-5"/></button>
            <button onClick={props.onPrev} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Previous Page"><LeftArrowIcon className="h-5 w-5"/></button>
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 font-semibold text-sm">
                <input
                    type="number"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputSubmit}
                    onBlur={() => setPageInput(String(props.currentPage + 1))}
                    className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-center p-1 w-10 text-sm"
                />
                <span>/</span>
                <span>{props.totalPages}</span>
            </div>
            <button onClick={props.onNext} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Next Page"><RightArrowIcon className="h-5 w-5"/></button>
            <button onClick={props.onLastPage} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Last Page"><LastPageIcon className="h-5 w-5"/></button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <div className="flex items-center gap-1">
                <button onClick={props.onZoomOut} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Zoom Out"><ZoomOutIcon className="h-5 w-5"/></button>
                <button onClick={props.onZoomIn} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Zoom In"><ZoomInIcon className="h-5 w-5"/></button>
                <button onClick={props.onFullscreen} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Fullscreen"><FullscreenIcon className="h-5 w-5"/></button>
                <button onClick={props.onToggleSound} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title={props.isSoundOn ? "Mute Sound" : "Unmute Sound"}>
                    {props.isSoundOn ? <SoundOnIcon className="h-5 w-5" /> : <SoundOffIcon className="h-5 w-5" />}
                </button>
            </div>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button onClick={props.onLike} className={`p-1.5 rounded-full transition-colors ${props.isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-800 ${props.isDemo ? 'cursor-not-allowed' : ''}`} title="Like"><LikeIcon className="h-5 w-5"/></button>
            <button onClick={props.onShare} className="p-1.5 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Share"><ShareIcon className="h-5 w-5"/></button>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

const FlipbookViewerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isPwa } = usePWAInstall();
    const isDemo = id?.startsWith('demo-');
    const isExplore = id?.startsWith('explore-');

    const [flipbook, setFlipbook] = useState<Flipbook | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [zoom, setZoom] = useState(1);
    const [bookSize, setBookSize] = useState({ width: 400, height: 560 });
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [isEmbedded, setIsEmbedded] = useState(false);
    const [isOwnerPremium, setIsOwnerPremium] = useState(false);
    const [ownerStatusConfirmed, setOwnerStatusConfirmed] = useState(false);
    const [isUiVisible, setIsUiVisible] = useState(true);

    const viewerRef = useRef<HTMLDivElement>(null);
    const flipbookContainerRef = useRef<HTMLDivElement>(null);
    const flipbookRef = useRef<any>(null);
    const pageTurnSoundRef = useRef<HTMLAudioElement>(null);
    const fullscreenSoundRef = useRef<HTMLAudioElement>(null);

    const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void; };

    const viewMode = useMemo(() => localStorage.getItem('viewMode'), []);
    const shouldShowPwaLayout = isPwa || (isMobile && viewMode !== 'browser');

    const isLiked = useMemo(() => {
        if (isDemo || isExplore || !user || !flipbook || !flipbook.likedBy) {
            return false;
        }
        return flipbook.likedBy.includes(user.uid);
    }, [flipbook, user, isDemo, isExplore]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setIsEmbedded(params.get('embed') === 'true');

        if (!shouldShowPwaLayout) {
            setShowFooter(false);
        }

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => {
            if (!shouldShowPwaLayout) {
                setShowFooter(true);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [setShowFooter, shouldShowPwaLayout]);

    const calculateSize = useCallback(() => {
        if (!flipbookContainerRef.current) return;
        const container = flipbookContainerRef.current;
        if (container.clientWidth === 0 || container.clientHeight === 0) return;
    
        const isFullscreen = !!document.fullscreenElement;
        const scaleFactor = isFullscreen ? 0.95 : (isMobile ? 0.9 : 0.9);
    
        const availableWidth = container.clientWidth * scaleFactor;
        const availableHeight = container.clientHeight * scaleFactor;
    
        const PAGE_ASPECT_RATIO = 1.4; // height / width
        let newPageWidth, newPageHeight;
        
        if (isMobile) {
            newPageWidth = availableWidth;
            newPageHeight = newPageWidth * PAGE_ASPECT_RATIO;
            if (newPageHeight > availableHeight) {
                newPageHeight = availableHeight;
                newPageWidth = newPageHeight / PAGE_ASPECT_RATIO;
            }
        } else {
            // For desktop, we consider a two-page spread (2 * width)
            newPageHeight = availableHeight;
            newPageWidth = newPageHeight / PAGE_ASPECT_RATIO;
            if (newPageWidth * 2 > availableWidth) {
                newPageWidth = availableWidth / 2;
                newPageHeight = newPageWidth * PAGE_ASPECT_RATIO;
            }
        }
        setBookSize({ width: Math.round(newPageWidth), height: Math.round(newPageHeight) });
    }, [isMobile]);

    useLayoutEffect(() => {
        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, [calculateSize]);
    
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (document.fullscreenElement) {
                setZoom(1);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            setError('');
            setOwnerStatusConfirmed(false);
            try {
                let data: Flipbook | null | undefined = null;

                if (isDemo || isExplore) {
                    const sourceData = isDemo ? demoFlipbooks : exploreFlipbooks;
                    const book = sourceData.find(b => b.id === id);
                    if (!book) {
                        throw new Error("This flipbook could not be found.");
                    }
                    data = {
                        id: Date.now(),
                        title: book.title,
                        ownerId: 'public-user',
                        ownerName: 'PDFBullet',
                        pageUrls: book.pageUrls,
                        public: true,
                        createdAt: new Date(),
                        views: Math.floor(Math.random() * 1000) + 100,
                        likes: Math.floor(Math.random() * 100) + 10,
                        likedBy: [],
                        isPremium: false,
                    };
                    setIsOwnerPremium(false);
                    setOwnerStatusConfirmed(true);
                } else {
                    data = await getFlipbook(Number(id));
                    if (!data) {
                        throw new Error("Flipbook not found. It may have been deleted or the link is incorrect.");
                    }

                    // Self-healing backup: If we retrieved the data, check if it's stored on the server, if not send it to backup
                    if (data && !isDemo && !isExplore) {
                        fetch(`/uploads/flipbooks/${id}.json`, { method: 'HEAD' })
                            .then(res => {
                                if (!res.ok) {
                                    fetch('/api/save-flipbook', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data),
                                    }).catch(err => console.error("Self-healing backup failed:", err));
                                }
                            }).catch(() => {});
                    }

                    if (!data.public && user?.uid !== data.ownerId) {
                        throw new Error("You do not have permission to view this flipbook.");
                    }

                    let currentOwnerIsPremium = data.isPremium;
                    setIsOwnerPremium(currentOwnerIsPremium);
                    setOwnerStatusConfirmed(true);
                    
                    await updateFlipbookStats(Number(id), 'views');
                }
                
                setFlipbook(data);

            } catch (err: any) {
                setError(err.message || "Failed to load flipbook.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user, isDemo, isExplore]);
    
    const handleLike = async () => {
        if (isDemo || isExplore) return;
        if (!user || !id || !flipbook) {
            alert("You must be logged in to like a flipbook.");
            return;
        }
    
        const originalFlipbook = { ...flipbook };
        const wasLiked = originalFlipbook.likedBy.includes(user.uid);
    
        setFlipbook(prev => {
            if (!prev) return null;
            const newLikedBy = wasLiked
                ? prev.likedBy.filter(uid => uid !== user.uid)
                : [...prev.likedBy, user.uid];
            const newLikes = wasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1;
            return {
                ...prev,
                likes: newLikes,
                likedBy: newLikedBy,
            };
        });
    
        try {
            await toggleLike(Number(id), user.uid);
        } catch (e) {
            console.error("Like toggle failed: ", e);
            setFlipbook(originalFlipbook);
            alert("Failed to save your like. Please try again.");
        }
    };

    const handleFullscreen = () => {
        if (isSoundOn && fullscreenSoundRef.current) {
            fullscreenSoundRef.current.currentTime = 0;
            const playPromise = fullscreenSoundRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'NotAllowedError') {
                        console.error("Fullscreen sound playback error:", error);
                    }
                });
            }
        }

        const elem = viewerRef.current;
        if (!elem) return;
    
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                console.error("Fullscreen error:", err);
                alert(`Could not enter fullscreen mode.`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleFlip = (e: any) => {
        setCurrentPage(e.data);
        if (isUiVisible && isMobile) {
            setIsUiVisible(false);
        }
        if (isSoundOn && pageTurnSoundRef.current) {
            pageTurnSoundRef.current.currentTime = 0;
            const playPromise = pageTurnSoundRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'NotAllowedError') {
                        console.error("Audio playback error:", error);
                    }
                });
            }
        }
    };
    
    const handlePrevPage = () => flipbookRef.current?.pageFlip().flipPrev();
    const handleNextPage = () => flipbookRef.current?.pageFlip().flipNext();
    const handleGoToPage = (page: number) => flipbookRef.current?.pageFlip().flip(page);
    
    const handleBookClick = (e: React.MouseEvent) => {
        if (isMobile || !flipbookRef.current) return;
        const bookRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - bookRect.left;
        if (clickX > bookRect.width / 2) {
            flipbookRef.current.pageFlip().flipNext();
        } else {
            flipbookRef.current.pageFlip().flipPrev();
        }
    };

    const totalPages = flipbook ? flipbook.pageUrls.length + 2 : 0;

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><RefreshIcon className="h-12 w-12 animate-spin text-brand-red" /></div>;
    }

    if (error || !flipbook) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center bg-gray-100 dark:bg-gray-900 p-4">
                <h2 className="text-2xl font-bold text-red-500">Error Loading Flipbook</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                <Link to="/flipbooks/public" className="mt-6 flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-md"><HomeIcon className="h-5 w-5"/> Go to Gallery</Link>
            </div>
        );
    }

    // FIX: Corrected 'backgroundImage' TypeScript error by defining it within the style object literal, preventing modification of a const object after creation.
    const containerStyle: React.CSSProperties = {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: flipbook.backgroundUrl
            ? `url('${flipbook.backgroundUrl}')`
            : "url('https://ik.imagekit.io/fonepay/flipbook%20/bg.png?updatedAt=1762104781415')",
    };
    
    const viewerLayout = (
        <div 
            ref={viewerRef} 
            className="relative bg-white dark:bg-gray-900 w-full h-full rounded-lg shadow-2xl flex flex-col"
        >
            {isMobile ? (
                <>
                    {isUiVisible && (
                        <div className="absolute top-0 left-0 right-0 z-30 p-2 flex justify-end items-center transition-opacity duration-300">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowShareModal(true)} className="p-1.5 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white"><ShareIcon className="h-4 w-4" /></button>
                                <button onClick={() => navigate(-1)} className="p-1.5 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white"><LeftArrowIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <header className="flex-shrink-0 flex items-center justify-between p-2 md:p-3 border-b border-gray-200 dark:border-gray-700 h-16 z-20">
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-base md:text-lg truncate pl-2">
                            {flipbook.title}
                        </h2>
                    </div>
                    <div className="flex-none mx-2">
                        <ViewerToolbar 
                            currentPage={currentPage} totalPages={totalPages}
                            onPrev={handlePrevPage} onNext={handleNextPage} onGoToPage={handleGoToPage} onFirstPage={() => handleGoToPage(0)} onLastPage={() => handleGoToPage(totalPages - 1)}
                            onZoomIn={() => setZoom(z => Math.min(z + 0.2, 3))} onZoomOut={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                            onFullscreen={handleFullscreen} onShare={() => setShowShareModal(true)} onLike={handleLike} isLiked={isLiked}
                            isDemo={!!isDemo || !!isExplore} isSoundOn={isSoundOn} onToggleSound={() => setIsSoundOn(!isSoundOn)}
                        />
                    </div>
                    <div className="flex-1 min-w-0 flex justify-end">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 w-10 h-10 flex items-center justify-center" title="Go Back">
                            <LeftArrowIcon className="h-6 w-6"/>
                        </button>
                    </div>
                </header>
            )}

            <div
                ref={flipbookContainerRef}
                className="flex-grow relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden"
                style={containerStyle}
            >
                {isMobile && (
                    <>
                        <div onClick={handlePrevPage} className="absolute left-0 top-0 h-full w-1/3 z-10" />
                        <div onDoubleClick={() => setIsUiVisible(p => !p)} className="absolute left-1/3 top-0 h-full w-1/3 z-10" />
                        <div onClick={handleNextPage} className="absolute right-0 top-0 h-full w-1/3 z-10" />
                    </>
                )}
                <div 
                    style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease-out' }}
                    onClick={handleBookClick}
                    className={!isMobile ? 'cursor-pointer' : ''}
                >
                    <HTMLFlipBook
                        key={`${isMobile}-${bookSize.width}`}
                        size="stretch"
                        width={bookSize.width}
                        height={bookSize.height}
                        minWidth={bookSize.width}
                        maxWidth={bookSize.width}
                        minHeight={bookSize.height}
                        maxHeight={bookSize.height}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={handleFlip}
                        ref={flipbookRef}
                        className="shadow-2xl"
                        usePortrait={isMobile}
                        drawShadow={true}
                        flippingTime={1200}
                        style={{}}
                        startPage={0}
                        startZIndex={0}
                        autoSize={false}
                        maxShadowOpacity={0.5}
                        useMouseEvents={!isMobile}
                        swipeDistance={30}
                        disableFlipByClick={true}
                        // FIX: Added the required showPageCorners prop.
                        showPageCorners={true}
                        clickEventForward={false}
                    >
                        <div className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-inner">
                            <div className="text-center p-4">
                                <h2 className="text-2xl font-bold">{flipbook.title}</h2>
                                <p className="text-sm text-gray-500 mt-2">by {flipbook.ownerName}</p>
                            </div>
                        </div>
                        {flipbook.pageUrls.map((url, i) => (
                            <div key={i} className="bg-white flex items-center justify-center"><img src={url} alt={`Page ${i + 1}`} className="max-w-full max-h-full object-contain" /></div>
                        ))}
                        <div className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-inner">
                            <div className="text-center text-gray-500"><Logo className="h-12 w-auto opacity-50" /><p className="mt-2 text-sm">Created with PDFBullet</p></div>
                        </div>
                    </HTMLFlipBook>
                </div>
            </div>
            {ownerStatusConfirmed && !isOwnerPremium && (
                <a 
                    href="/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-white/70 dark:bg-black/70 py-1 px-2 rounded-full shadow-md text-[9px] leading-none font-semibold text-gray-600 dark:text-gray-300 hover:scale-105 transition-transform"
                    title="Remove watermark with Premium"
                >
                    <Logo className="h-2.5 w-auto" />
                    <span>by PDFBullet</span>
                </a>
            )}
        </div>
    );

    return (
        <>
            <audio ref={pageTurnSoundRef} src="https://ik.imagekit.io/fonepay/page-flip-sound-created-pdf-bullet.mp3?updatedAt=1762325358421" preload="auto" />
            <audio ref={fullscreenSoundRef} src="https://ik.imagekit.io/fonepay/pdf-bullet-after-full-screen-button.mp3?updatedAt=1762328991663" preload="auto" />
            <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} url={window.location.href} title={flipbook.title} coverUrl={flipbook.pageUrls[0]} />
            {isEmbedded ? (
                <div className="fixed inset-0 z-[100]">{viewerLayout}</div>
            ) : shouldShowPwaLayout ? (
                <div className="w-full h-[calc(100vh-60px)]">
                    {viewerLayout}
                </div>
            ) : (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
                    <div className="w-full max-w-5xl h-full max-h-[90vh] rounded-lg shadow-2xl overflow-hidden">
                        {viewerLayout}
                    </div>
                </div>
            )}
        </>
    );
};

export default FlipbookViewerPage;