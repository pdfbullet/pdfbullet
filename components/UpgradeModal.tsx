import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseIcon, StarIcon, LockIcon } from './icons.tsx';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        navigate('/pricing');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-lg rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="relative p-6 md:p-8">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                    
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg flex items-center gap-4 mb-6">
                        <StarIcon className="h-8 w-8 text-yellow-500" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upgrade to Premium</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">This feature requires a Premium account.</p>
                        </div>
                    </div>
                    
                    <p className="text-center text-gray-700 dark:text-gray-300 mb-6">Unlock powerful team features, unlimited processing, and an ad-free experience by upgrading your plan.</p>

                    <button 
                        onClick={handleUpgrade}
                        className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        View Premium Plans
                    </button>
                     <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 mt-4">
                        <LockIcon className="h-3 w-3"/> Secure and easy upgrade process.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
