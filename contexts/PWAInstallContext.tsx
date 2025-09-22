import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// Define the event type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallContextType {
  isPwa: boolean;
  canInstall: boolean;
  promptInstall: () => void;
  showInstallInstructions: boolean;
  closeInstallInstructions: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export const PWAInstallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsPwa(isStandalone);

    if (isStandalone) {
        document.body.style.paddingBottom = '72px';
    }
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (isStandalone) {
         document.body.style.paddingBottom = '0';
      }
    };
  }, []);

  const promptInstall = useCallback(() => {
    if (installPromptEvent) {
        installPromptEvent.prompt();
        installPromptEvent.userChoice.then(choiceResult => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the PWA installation');
            } else {
                console.log('User dismissed the PWA installation');
            }
            setInstallPromptEvent(null);
        });
    } else {
        setShowInstallInstructions(true);
    }
  }, [installPromptEvent]);

  const closeInstallInstructions = useCallback(() => {
    setShowInstallInstructions(false);
  }, []);

  const value = {
    isPwa,
    canInstall: !!installPromptEvent,
    promptInstall,
    showInstallInstructions,
    closeInstallInstructions,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
};

export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);
  if (context === undefined) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
};
