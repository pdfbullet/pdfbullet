import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons.tsx';

const AppInstallBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isAndroid = /android/i.test(navigator.userAgent);
        const dismissed = sessionStorage.getItem('app_install_banner_dismissed');
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isAndroid && !dismissed && !isStandalone) {
            const timer = setTimeout(() => setIsVisible(true), 3000); // Show after 3 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('app_install_banner_dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 text-white p-3 shadow-lg animate-fade-in-up">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img src="/favicon.png" alt="Pdf Bullet Logo" className="h-10 w-10 rounded-lg" />
                    <div>
                        <p className="font-bold">Pdf Bullet</p>
                        <p className="text-sm text-gray-300">Get the official app on Google Play.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <a 
                        href="https://play.google.com/store/apps/details?id=com.pdfbullet.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-gray-800 font-bold py-2 px-4 rounded-lg text-sm"
                    >
                        Install
                    </a>
                    <button onClick={handleDismiss} className="text-gray-400 hover:text-white" aria-label="Dismiss">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppInstallBanner;
