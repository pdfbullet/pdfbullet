import React, { useState, useEffect, useRef } from 'react';
import { IOSIcon, AndroidIcon, FileIcon, DropboxIcon, GoogleDriveIcon } from '../components/icons.tsx';
import { usePwaLayout } from '../contexts/PwaLayoutContext.tsx';
import { useNavigate } from 'react-router-dom';

declare const Dropbox: any;

const PwaStoragePage: React.FC = () => {
    const { setTitle } = usePwaLayout();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const [osInfo, setOsInfo] = useState<{
        Icon: React.FC<{ className?: string }>;
        name: string;
    }>({ Icon: FileIcon, name: 'My Device' });

    useEffect(() => {
        setTitle('Storage');

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            setOsInfo({ Icon: IOSIcon, name: 'On my iPhone' });
        } else if (/android/i.test(userAgent)) {
            setOsInfo({ Icon: AndroidIcon, name: 'On my Android' });
        }
    }, [setTitle]);

    const handleDeviceFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files);
            navigate('/tools', { state: { files } });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleDropboxClick = () => {
        if (typeof Dropbox === 'undefined' || !Dropbox) {
            alert('Dropbox SDK is not available. Please check your internet connection and try again.');
            return;
        }
        Dropbox.choose({
            success: (files: any[]) => {
                // In a real app, you would probably download the file and pass the Blob
                // For this example, we'll just show an alert.
                alert(`Selected ${files.length} file(s) from Dropbox. Processing would happen next.`);
            },
            linkType: "direct",
            multiselect: true,
        });
    };

    const handleGoogleDriveClick = () => {
        alert('Google Drive integration is coming soon!');
    };

    return (
        <div className="p-4 sm:p-6 space-y-10 animate-fade-in-up">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Storage</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Access your files from your device or the cloud.</p>
            </header>

            <section>
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">From your device</h2>
                <div className="storage-card-device" onClick={handleDeviceFileClick}>
                    <div className="storage-card-device-glow"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 h-full">
                        <div className="p-4 rounded-full mb-4 bg-white/20">
                            <osInfo.Icon className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-white">{osInfo.name}</h3>
                        <p className="text-sm text-gray-200 mt-1 mb-6">Access files stored locally.</p>
                        <div className="mt-auto w-full px-4">
                            <div className="browse-button">
                                <FileIcon className="h-5 w-5" />
                                <span>Browse Files</span>
                            </div>
                        </div>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                />
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">From the cloud</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button 
                        onClick={handleDropboxClick} 
                        className="storage-card-cloud group"
                    >
                        <DropboxIcon className="h-10 w-10 text-blue-500 transition-transform group-hover:scale-110" />
                        <div>
                            <h3 className="font-bold text-base text-gray-800 dark:text-gray-100">Dropbox</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Import files from your Dropbox.</p>
                        </div>
                    </button>
                     <button 
                        onClick={handleGoogleDriveClick} 
                        className="storage-card-cloud group relative overflow-hidden"
                    >
                        <div className="soon-badge">Soon</div>
                        <GoogleDriveIcon className="h-10 w-10 text-gray-400 transition-transform group-hover:scale-110" />
                        <div>
                            <h3 className="font-bold text-base text-gray-800 dark:text-gray-100">
                                Google Drive
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Connect your Google Drive.</p>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default PwaStoragePage;