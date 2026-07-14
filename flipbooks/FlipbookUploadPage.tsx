import React, { useState, useCallback, useContext, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from '../utils/routerCompat.tsx';
import { UploadCloudIcon, CheckCircleIcon, RefreshIcon } from '../components/icons.tsx';
import { addFlipbook } from '../hooks/useFlipbooks.ts';
import * as pdfjsLib from 'pdfjs-dist';
import { LayoutContext } from '../App.tsx';

const FlipbookUploadPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'success'>('idle');
    const [error, setError] = useState('');
    const [progressMessage, setProgressMessage] = useState('');
    const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void; };
    
    const [folders, setFolders] = useState<string[]>(['Default']);
    const [selectedFolder, setSelectedFolder] = useState('Default');

    useEffect(() => {
        setShowFooter(false);
        // Load folders from localStorage
        try {
            const storedFolders = JSON.parse(localStorage.getItem('flipbook_folders') || '["Default"]');
            setFolders(storedFolders);
            if (storedFolders.length > 0) {
                setSelectedFolder(storedFolders[0]);
            }
        } catch {
            setFolders(['Default']);
        }
        return () => setShowFooter(true);
    }, [setShowFooter]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setError('');
        setProcessingState('idle');
        if (fileRejections.length > 0) {
            setError('Please upload a single PDF file under 50MB.');
            return;
        }
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 50 * 1024 * 1024, // 50MB
        multiple: false,
    });

    const handleProcess = async () => {
        if (!file || !user) {
            setError('Please select a file and ensure you are logged in.');
            return;
        }

        setProcessingState('processing');
        setError('');
        setProgressMessage('Loading PDF...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const pageUrls: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                setProgressMessage(`Processing page ${i} of ${numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Could not get canvas context');

                await page.render({ canvasContext: context, viewport } as any).promise;
                pageUrls.push(canvas.toDataURL('image/jpeg', 0.8));
            }
            
            setProgressMessage('Saving flipbook...');
            // FIX: Added missing 'createdAt' property to align with the Flipbook interface.
            const flipbookId = await addFlipbook({
                title: file.name.replace('.pdf', ''),
                ownerId: user.uid,
                ownerName: user.username,
                pageUrls: pageUrls,
                public: true, // Default to public for now
                folder: selectedFolder,
                isPremium: !!user.isFlipbookPremium,
                createdAt: new Date(),
            });

            setProcessingState('success');
            setTimeout(() => {
                navigate(`/flip/${flipbookId}`);
            }, 1000);

        } catch (err: any) {
            console.error("Processing error:", err);
            setError(`Processing failed: ${err.message}`);
            setProcessingState('idle');
        }
    };
    
    const reset = () => {
        setFile(null);
        setProcessingState('idle');
        setError('');
        setProgressMessage('');
    };

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black min-h-screen">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Create a New Flipbook</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Upload your PDF document to automatically convert it into an interactive digital flipbook, right in your browser.
                    </p>
                </div>

                <div className="bg-white dark:bg-black p-8 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800">
                    {processingState !== 'success' && (
                        <>
                            <div 
                                {...getRootProps()} 
                                className={`p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
                                    isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-brand-red'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <UploadCloudIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                {file ? (
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{file.name}</p>
                                ) : (
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-200">Drag & drop a PDF here</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">or click to select a file</p>
                                    </div>
                                )}
                            </div>
                            {file && (
                                <div className="mt-4">
                                    <label htmlFor="folder-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Save to folder:</label>
                                    <select
                                        id="folder-select"
                                        value={selectedFolder}
                                        onChange={(e) => setSelectedFolder(e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red"
                                    >
                                        {folders.map(folder => <option key={folder} value={folder}>{folder}</option>)}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

                    {processingState === 'processing' && (
                        <div className="mt-6 text-center">
                            <RefreshIcon className="h-8 w-8 mx-auto animate-spin text-brand-red mb-2" />
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{progressMessage}</p>
                        </div>
                    )}

                    {processingState === 'success' && (
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-center">
                            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <p className="font-semibold text-green-800 dark:text-green-200">Processing Complete!</p>
                            <p className="text-sm text-green-700 dark:text-green-300">Redirecting to your new flipbook...</p>
                        </div>
                    )}
                    
                    <div className="mt-6">
                        {processingState === 'idle' && file ? (
                             <button
                                onClick={handleProcess}
                                disabled={!file || processingState !== 'idle'}
                                className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
                            >
                                Process & Create Flipbook
                            </button>
                        ) : processingState === 'success' ? (
                             <button
                                onClick={reset}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                            >
                                Create Another
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlipbookUploadPage;
