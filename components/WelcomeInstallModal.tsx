import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';
import { Logo } from './Logo.tsx';
import { DownloadIcon, CloseIcon, StarIcon } from './icons.tsx';
import { Link } from 'react-router-dom';

// Simple platform-specific icons for instructions
const ShareIOSIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 5l-1.42 1.42L16 8H8v2h8l-1.42 1.58L16 13l4-4-4-4zM6 5H4v14h2V5z" />
        <path d="M13 11v-2l-4 4 4 4v-2h6v-2h-6z" transform="translate(-1, 0) rotate(90 12 12)" />
    </svg>
);
const MoreIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

const WelcomeInstallModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { promptInstall } = usePWAInstall();

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        const hasBeenShown = sessionStorage.getItem('welcome_install_modal_shown');

        if (!isStandalone && !hasBeenShown) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // Show after 3 seconds
            return () => clearTimeout(timer);
        }
    }, []);
    
    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('welcome_install_modal_shown', 'true');
    };

    const handleInstall = () => {
        promptInstall();
        handleClose();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in-down" onClick={handleClose}>
            <div className="bg-white dark:bg-black w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <Logo className="h-12 w-auto mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Welcome to iLovePDFLY!</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">For the best experience, install our app on your device.</p>

                    <div className="mt-6 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-center gap-2 text-yellow-500">
                            <StarIcon className="h-6 w-6" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Get a 7-Day FREE Premium Trial!</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            Install our PWA and sign up to automatically unlock a <strong>7-day free trial</strong> of all Premium features.
                        </p>
                    </div>

                    <div className="mt-6 text-left">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">How to Install:</h4>
                        <div className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="flex-shrink-0 font-bold w-4 text-center">1.</span>
                                <span>Tap your browser's menu (<MoreIcon className="h-4 w-4 inline-block align-middle"/>) or share icon (<ShareIOSIcon className="h-4 w-4 inline-block align-middle"/>).</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex-shrink-0 font-bold w-4 text-center">2.</span>
                                <span>Select '<strong>Install app</strong>' or '<strong>Add to Home Screen</strong>'.</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleInstall}
                        className="mt-8 w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                    >
                        <DownloadIcon className="h-6 w-6" />
                        Install App & Get Free Trial
                    </button>
                    
                    <p className="mt-4 text-xs text-gray-400">
                        By continuing, you agree to our <Link to="/terms-of-service" onClick={handleClose} className="underline hover:text-brand-red">Terms</Link> and <Link to="/privacy-policy" onClick={handleClose} className="underline hover:text-brand-red">Privacy Policy</Link>.
                    </p>
                </div>
                 <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 dark:hover:text-white bg-white/50 dark:bg-black/50 rounded-full p-1 transition-colors" aria-label="Close">
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default WelcomeInstallModal;