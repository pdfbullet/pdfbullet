import React, { useState, useEffect } from 'react';
import { DownloadIcon, CloseIcon } from './icons.tsx';

// Define the event type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) {
      return;
    }
    // Show the install prompt
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA installation');
      } else {
        console.log('User dismissed the PWA installation');
      }
      // We've used the prompt, and can't use it again, throw it away
      setInstallPromptEvent(null);
    });
  };
  
  const handleDismiss = () => {
      setInstallPromptEvent(null);
  };

  if (!installPromptEvent) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-fade-in-up w-full max-w-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-brand-red p-3 rounded-lg mt-1">
            <DownloadIcon className="h-6 w-6 text-white"/>
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Install I Love PDFLY App</h3>
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
