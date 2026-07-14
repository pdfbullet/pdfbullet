import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchIcon, ChevronDownIcon, TrashIcon, DownloadIcon, StarIcon, CheckCircleIcon, CogIcon, UploadIcon, PlusIcon } from '../../components/icons.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getFlipbooksForUser, deleteFlipbook, Flipbook, addFlipbook } from '../../hooks/useFlipbooks.ts';
import { jsPDF } from 'jspdf';
import AddNewBookForm from './AddNewBookForm.tsx';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;


const BatchUploadModalComponent: React.FC<{ onClose: () => void; onSave: () => void; folder: string; }> = ({ onClose, onSave, folder }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'success'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const { user } = useAuth();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
    });

    const handleBatchProcess = async () => {
        if (files.length === 0 || !user) return;
        setUploadState('processing');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProgressMessage(`Processing file ${i + 1}/${files.length}: ${file.name}`);
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const pageUrls: string[] = [];
                for (let j = 1; j <= pdf.numPages; j++) {
                    const page = await pdf.getPage(j);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const context = canvas.getContext('2d');
                    if (!context) throw new Error('Canvas context failed');
                    await page.render({ canvasContext: context, viewport: viewport } as any).promise;
                    pageUrls.push(canvas.toDataURL('image/jpeg', 0.7));
                }

                await addFlipbook({
                    title: file.name.replace('.pdf', ''),
                    ownerId: user.uid,
                    ownerName: user.username,
                    pageUrls: pageUrls,
                    public: true,
                    folder: folder,
                    isPremium: true,
                    createdAt: new Date(),
                });
            } catch (err) {
                console.error(`Failed to process ${file.name}`, err);
            }
            setProgress(Math.round(((i + 1) / files.length) * 100));
        }

        setProgressMessage('All files processed!');
        setUploadState('success');
        setTimeout(() => {
            onSave();
        }, 1500);
    };

    if (uploadState === 'processing' || uploadState === 'success') {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                 <div className="bg-white/50 dark:bg-black/60 backdrop-blur-xl border border-white/20 p-8 rounded-lg shadow-xl text-center max-w-sm text-white" onClick={e => e.stopPropagation()}>
                    {uploadState === 'success' ? <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto" /> : <CogIcon className="h-12 w-12 text-blue-400 mx-auto animate-spin" />}
                    <h3 className="text-lg font-bold mt-4">{uploadState === 'success' ? 'Batch Upload Complete!' : 'Processing Files...'}</h3>
                    <p className="text-sm mt-2">{progressMessage}</p>
                    {uploadState === 'processing' && <div className="w-full bg-black/20 rounded-full h-2.5 mt-4"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white/50 dark:bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-lg shadow-xl w-full max-w-lg text-white" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Batch Upload</h2>
                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-400' : 'border-gray-500'}`}>
                    <input {...getInputProps()} />
                    <UploadIcon className="h-8 w-8 mx-auto text-gray-300 mb-2"/>
                    <p>Drag & drop PDF files here, or click to select files</p>
                </div>
                <ul className="mt-4 max-h-40 overflow-y-auto space-y-1 pr-2">
                    {files.map((file, i) => <li key={i} className="text-sm p-1 bg-black/20 rounded truncate">{file.name}</li>)}
                </ul>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-500 rounded-md font-semibold hover:bg-gray-800">Cancel</button>
                    <button onClick={handleBatchProcess} disabled={files.length === 0} className="px-4 py-2 bg-blue-600 rounded-md font-semibold disabled:bg-gray-500">Process ({files.length}) Files</button>
                </div>
            </div>
        </div>
    );
};


const ManageBooksView: React.FC<{ folder: string }> = ({ folder }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [flipbooks, setFlipbooks] = useState<Flipbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddBookForm, setShowAddBookForm] = useState(true);
    const addBookFormRef = useRef<HTMLDivElement>(null);

    const [isBatchUploadModalOpen, setIsBatchUploadModalOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc'>('newest');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    const fetchBooks = async () => {
        if (user) {
            setLoading(true);
            const userBooks = await getFlipbooksForUser(user.uid);
            setFlipbooks(userBooks);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [user]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (showAddBookForm) {
            setTimeout(() => {
                addBookFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [showAddBookForm]);
    
    const handleAddNewBook = () => {
        if (showAddBookForm) {
            addBookFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            setShowAddBookForm(true);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            await deleteFlipbook(id);
            fetchBooks(); // Refresh the list
        }
    };

    const handleDownload = async (flipbook: Flipbook) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        for (let i = 0; i < flipbook.pageUrls.length; i++) {
            if (i > 0) pdf.addPage();
            const img = new Image();
            img.src = flipbook.pageUrls[i];
            await new Promise(resolve => img.onload = resolve);
            
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
        pdf.save(`${flipbook.title}.pdf`);
    };

    const filteredFlipbooks = useMemo(() => {
        let booksInFolder = flipbooks.filter(fb => (fb.folder || 'Default') === folder);
        
        if (searchTerm) {
            booksInFolder = booksInFolder.filter(fb => fb.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return booksInFolder.sort((a, b) => {
            switch (sortOrder) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });
    }, [flipbooks, folder, searchTerm, sortOrder]);

    const sortOptions = {
        newest: 'Date: Newest',
        oldest: 'Date: Oldest',
        title_asc: 'Title: A-Z',
        title_desc: 'Title: Z-A',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Manage Books in '{folder}'</h1>
                <span className="text-sm text-gray-300">Total: {filteredFlipbooks.length}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleAddNewBook} className="w-full bg-blue-600 text-white font-bold py-3 rounded-md text-lg hover:bg-blue-700 transition-colors">
                    + ADD NEW BOOK
                </button>
                <button onClick={() => setIsBatchUploadModalOpen(true)} className="w-full bg-orange-500 text-white font-bold py-3 rounded-md text-lg hover:bg-orange-600 transition-colors">
                    + BATCH UPLOAD
                </button>
            </div>
            
            <div ref={addBookFormRef}>
              {showAddBookForm && (
                <AddNewBookForm
                    onCancel={() => setShowAddBookForm(false)}
                    onSave={() => {
                        setShowAddBookForm(false);
                        fetchBooks();
                    }}
                />
              )}
            </div>

            {/* Filters */}
            <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl p-4 rounded-lg flex flex-wrap items-center gap-4">
                <div className="relative flex-grow">
                    <input type="text" placeholder="Search in this folder..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md pr-10 bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 placeholder-gray-300 dark:placeholder-gray-400 text-white dark:text-white" />
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="relative" ref={sortMenuRef}>
                    <button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="flex items-center gap-1 p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100">
                        <span>{sortOptions[sortOrder]}</span>
                        <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    {isSortMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white/80 dark:bg-black/70 backdrop-blur-md border border-white/20 rounded-md shadow-lg z-10">
                            {Object.entries(sortOptions).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => { setSortOrder(key as any); setIsSortMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-white dark:text-gray-100 hover:bg-black/10 dark:hover:bg-white/10"
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Flipbooks Grid */}
            {loading ? <div className="text-white text-center p-8 text-lg">Loading books...</div> : (
                filteredFlipbooks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredFlipbooks.map(fb => (
                             <div key={fb.id} className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl p-3 rounded-lg group">
                                <Link to={`/flip/${fb.id}`} className="relative aspect-[3/4] block rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                                    <img src={fb.pageUrls[0]} alt={fb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={(e) => { e.preventDefault(); handleDelete(fb.id, fb.title); }} title="Delete" className="p-2 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white"><TrashIcon className="h-5 w-5"/></button>
                                        <button onClick={(e) => { e.preventDefault(); handleDownload(fb); }} title="Download as PDF" className="p-2 bg-white/80 rounded-full text-blue-500 hover:bg-blue-500 hover:text-white"><DownloadIcon className="h-5 w-5"/></button>
                                    </div>
                                </Link>
                                <h3 className="text-sm font-semibold truncate mt-2 text-white dark:text-gray-100">{fb.title}</h3>
                                <p className="text-xs text-gray-300 dark:text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-lg">
                        <p className="text-white dark:text-gray-200 text-lg">No books in this folder yet.</p>
                    </div>
                )
            )}

            {isBatchUploadModalOpen && (
                user?.isFlipbookPremium ? (
                    <BatchUploadModalComponent 
                        onClose={() => setIsBatchUploadModalOpen(false)} 
                        onSave={() => {
                            fetchBooks();
                            setIsBatchUploadModalOpen(false);
                        }}
                        folder={folder}
                    />
                ) : (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsBatchUploadModalOpen(false)}>
                        <div className="bg-white/50 dark:bg-black/60 backdrop-blur-xl border border-white/20 p-8 rounded-lg shadow-xl text-center max-w-sm text-white" onClick={e => e.stopPropagation()}>
                            <StarIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4"/>
                            <h3 className="text-xl font-bold">Batch Upload is a Premium Feature</h3>
                            <p className="mt-2 text-gray-100 dark:text-gray-200">Upgrade to Premium to upload and convert multiple PDFs at once.</p>
                            <Link to="/pricing" onClick={() => setIsBatchUploadModalOpen(false)} className="mt-6 inline-block bg-yellow-500 text-white font-bold py-2 px-6 rounded-md hover:bg-yellow-600">Upgrade Now</Link>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default ManageBooksView;