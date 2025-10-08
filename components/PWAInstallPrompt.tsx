import React, { useState, useEffect } from 'react';
import { DownloadIcon, CloseIcon } from './icons.tsx';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';

const PWAInstallPrompt: React.FC = () => {
  const { canInstall, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the banner has been dismissed this session
    const dismissedInSession = sessionStorage.getItem('pwa_install_dismissed');

    if (canInstall && !dismissedInSession) {
      // Delay showing the banner to be less intrusive
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [canInstall]);

  const handleInstallClick = () => {
    promptInstall();
    setIsVisible(false); // Hide banner after prompting
  };
  
  const handleDismiss = () => {
      setIsVisible(false);
      // Remember dismissal for this session
      try {
        sessionStorage.setItem('pwa_install_dismissed', 'true');
      } catch (e) {
        console.error("Could not set sessionStorage item:", e);
      }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-fade-in-up w-full max-w-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-brand-red p-3 rounded-lg mt-1">
            <DownloadIcon className="h-6 w-6 text-white"/>
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Install PDFBullet App</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get a faster, offline-capable experience on your device.</p>
           <div className="mt-4 flex gap-2">
             <button
              onClick={handleInstallClick}
              className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors flex-shrink-0 text-sm"
            >
              Install
            </button>
             <button
              onClick={handleDismiss}
              className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Later
            </button>
           </div>
        </div>
        <button onClick={handleDismiss} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 absolute top-2 right-2" aria-label="Dismiss install prompt">
            <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
