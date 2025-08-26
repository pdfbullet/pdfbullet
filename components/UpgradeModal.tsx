import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseIcon, CheckIcon, StarIcon, LockIcon } from './icons.tsx';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    
    const handleGoToPayment = () => {
        const selectedPlan = plan === 'yearly' ? 'premium' : 'pro';
        navigate('/payment', { state: { plan: selectedPlan } });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-black w-full max-w-4xl rounded-lg shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative p-6 md:p-8">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                    
                    <div className="bg-yellow-400/20 dark:bg-yellow-600/20 p-3 rounded-t-lg -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 flex items-center justify-center gap-3">
                        <StarIcon className="h-6 w-6 text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upgrade to Premium</h2>
                    </div>

                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-8">
                        Only Premium users can add members to their team. Get full access to all team features.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Plan Selection */}
                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setPlan('monthly')}
                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${plan === 'monthly' ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                                >
                                    <p className="font-semibold">Monthly</p>
                                    <p className="text-2xl font-bold">$7</p>
                                    <p className="text-xs text-gray-500">per month</p>
                                </button>
                                <button 
                                    onClick={() => setPlan('yearly')}
                                    className={`relative p-4 border-2 rounded-lg text-left transition-colors ${plan === 'yearly' ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                                >
                                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-32%</span>
                                    <p className="font-semibold">Yearly</p>
                                    <p className="text-2xl font-bold">$48</p>
                                    <p className="text-xs text-gray-500">$4 / month</p>
                                </button>
                            </div>
                             <div className="mt-8">
                                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <LockIcon className="h-3 w-3"/> Secure, Private, In your control
                                </p>
                                <div className="flex justify-center items-center gap-8 mt-4 opacity-50">
                                    <p className="font-bold text-xs">ISO CERTIFIED</p>
                                    <p className="font-bold text-xs">GDPR COMPLIANT</p>
                                    <p className="font-bold text-xs">SECURE</p>
                                </div>
                             </div>
                        </div>

                        {/* Right Column: Fonepay QR */}
                        <div className="space-y-4">
                            <h3 className="text-center font-semibold text-gray-700 dark:text-gray-300">Pay with Fonepay QR</h3>
                            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg max-w-xs mx-auto">
                                <img src="https://ik.imagekit.io/fonepay/fonepay%20qr.png?updatedAt=1752920160699" alt="Fonepay QR Code" className="w-48 h-48 mx-auto" width="192" height="192" />
                                <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Fonepay</p>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Scan with your mobile banking app or wallet.</p>
                            </div>
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">After payment, take a screenshot of the confirmation to complete your upgrade.</p>
                            <button 
                                onClick={handleGoToPayment}
                                className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                I Have Paid, Confirm Upgrade
                            </button>
                        </div>
                    </div>
                     <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><CheckIcon className="h-4 w-4 text-green-500" /> Cancel anytime</span>
                        <span className="flex items-center gap-1"><CheckIcon className="h-4 w-4 text-green-500" /> Money back guarantee</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;