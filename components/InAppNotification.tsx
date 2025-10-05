import React, { useEffect } from 'react';
import { BellIcon, CloseIcon } from './icons.tsx';

interface InAppNotificationProps {
    message: string;
    onClose: () => void;
}

const InAppNotification: React.FC<InAppNotificationProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000); // Auto-close after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md p-4 animate-fade-in-down">
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-4">
                <div className="flex-shrink-0 bg-brand-red/10 p-2 rounded-full mt-1">
                    <BellIcon className="h-5 w-5 text-brand-red" />
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-gray-800 dark:text-gray-100">New Notification</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                </div>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default InAppNotification;
