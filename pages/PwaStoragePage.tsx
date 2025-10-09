
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IOSIcon, AndroidIcon, FileIcon } from '../components/icons.tsx';

declare const Dropbox: any;

const PwaStoragePage: React.FC = () => {
    const [os, setOs] = useState<'ios' | 'android' | 'other'>('other');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            setOs('ios');
        } else if (/android/i.test(userAgent)) {
            setOs('android');
        }
    }, []);

    const handleDeviceFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files);
            navigate('/tools', { state: { files: files } });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleCloudFile = async (url: string, name: string): Promise<File | null> => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }
            const blob = await response.blob();
            return new File([blob], name, { type: blob.type });
        } catch (error) {
            console.error(`Error fetching cloud file "${name}":`, error);
            alert(`Could not download "${name}" from cloud storage.`);
            return null;
        }
    };

    const handleDropboxClick = () => {
        if (typeof Dropbox === 'undefined' || !Dropbox) {
            alert('Dropbox SDK is not available. Please check your internet connection and try again.');
            return;
        }
        Dropbox.choose({
            success: async (files: any[]) => {
                const filePromises = files.map(file => handleCloudFile(file.link, file.name));
                const processedFiles = (await Promise.all(filePromises)).filter((f): f is File => f !== null);
                if (processedFiles.length > 0) {
                    navigate('/tools', { state: { files: processedFiles } });
                }
            },
            linkType: "direct",
            multiselect: true,
        });
    };

    const handleGoogleDriveClick = () => {
        alert('Google Drive integration is coming soon!');
    };

    const DeviceStorageCard = () => {
        const isIOS = os === 'ios';
        const isAndroid = os === 'android';
        
        let Icon, name;
        if (isIOS) {
            Icon = IOSIcon;
            name = 'Apple Storage';
        } else if (isAndroid) {
            Icon = AndroidIcon;
            name = 'Android Storage';
        } else {
            Icon = FileIcon;
            name = 'My Device';
        }
        
        return (
            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                    <Icon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                    <h3 className="font-bold text-lg">{name}</h3>
                </div>
                <button onClick={handleDeviceFileClick} className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold text-gray-700 dark:text-gray-200 transition-colors">
                    <FileIcon className="h-5 w-5" />
                    <span>Browse Files</span>
                </button>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Storage</h1>

            <section>
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Device Storage</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DeviceStorageCard />
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
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Cloud Storage</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={handleDropboxClick} className="bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 text-left hover:border-blue-500 dark:hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <div className="flex items-center gap-4">
                            <img src="https://ik.imagekit.io/fonepay/dropbox.png?updatedAt=1759165408895" alt="Dropbox" className="h-10 w-10" />
                            <div>
                                <h3 className="font-bold text-lg">Dropbox</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Import files from Dropbox</p>
                            </div>
                        </div>
                    </button>

                    <button onClick={handleGoogleDriveClick} className="bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 text-left hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        <div className="flex items-center gap-4">
                            <img src="https://ik.imagekit.io/fonepay/google-drive-logo.png?updatedAt=1759166133225" alt="Google Drive" className="h-10 w-10" />
                            <div>
                                <h3 className="font-bold text-lg">Google Drive</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon!</p>
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default PwaStoragePage;
