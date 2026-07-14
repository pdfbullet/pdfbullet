import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons.tsx';

const CookieConsentBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            const consent = localStorage.getItem('cookie_consent');
            if (!consent) {
                // Delay showing the banner slightly to avoid layout shift on load
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 500);
                return () => clearTimeout(timer);
            }
        } catch (e) {
            console.error("Could not access localStorage:", e);
            // If localStorage is blocked, just show the banner.
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        try {
            localStorage.setItem('cookie_consent', 'true');
        } catch (e) {
            console.error("Could not set localStorage item:", e);
        }
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 rounded-lg shadow-2xl z-[100] animate-fade-in-up max-w-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                </p>
                <button
                    onClick={handleAccept}
                    className="flex-shrink-0 w-full sm:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CheckIcon className="h-5 w-5" />
                    Accept
                </button>
            </div>
        </div>
    );
};

export default CookieConsentBanner;