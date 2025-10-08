import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';
import { Logo } from './Logo.tsx';
import { DownloadIcon, CloseIcon, StarIcon, CheckIcon, BgRemoveIcon, RightArrowIcon } from './icons.tsx';
import { Link } from 'react-router-dom';

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

    const premiumFeatures = [
        'Unlimited document tasks',
        'Process multiple files at once',
        'Ad-free experience',
        'Access to all Premium tools'
    ];

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-black w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="relative p-3 text-center bg-gradient-to-br from-brand-red to-orange-500 text-white">
                    <Logo className="h-7 w-auto mx-auto mb-2" variant="dark" />
                    <h2 className="text-xl font-extrabold">Get the Full PDFBullet Experience</h2>
                    <p className="mt-1 text-xs opacity-90">Install the app for faster, offline access and unlock exclusive trial features.</p>
                </div>

                <div className="p-3 space-y-2">
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <StarIcon className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">7-Day Premium Trial on Install</h3>
                        </div>
                        <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300 pl-4">
                            {premiumFeatures.map(feature => (
                                <li key={feature} className="flex items-center gap-2">
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link to="/remove-background" onClick={handleClose} className="block p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-left group hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-200 dark:bg-purple-800 rounded-full">
                                <BgRemoveIcon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-purple-800 dark:text-purple-200">Try our new AI Tool</h4>
                                <p className="text-xs text-purple-700 dark:text-purple-300">Remove image backgrounds instantly.</p>
                            </div>
                            <RightArrowIcon className="h-5 w-5 ml-auto text-purple-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <div className="space-y-1 pt-1">
                        <button
                            onClick={handleInstall}
                            className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
                        >
                            <DownloadIcon className="h-5 w-5" />
                            Install App & Get Free Trial
                        </button>
                         <button
                            onClick={handleClose}
                            className="w-full text-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red transition-colors py-1"
                        >
                            Continue without Installing
                        </button>
                    </div>
                </div>
                 <button onClick={handleClose} className="absolute top-2 right-2 text-white/70 hover:text-white bg-black/20 rounded-full p-1 transition-colors" aria-label="Close">
                    <CloseIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default WelcomeInstallModal;