import React, { useState, useMemo, useEffect } from 'react';
import { CloseIcon, LeftArrowIcon, CheckCircleIcon } from './icons.tsx';

interface PurchaseSignaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchaseComplete: (signatureCount: number) => void;
}

const calculatePrice = (signatures: number): number => {
    if (signatures <= 0) return 0;
    if (signatures <= 4) return signatures * 2;
    if (signatures <= 9) return Math.ceil(signatures * 1.2);
    if (signatures <= 19) return Math.ceil(signatures * 1.1);
    if (signatures <= 49) return Math.ceil(signatures * 1);
    return Math.ceil(signatures * 0.9);
};

const PurchaseSignaturesModal: React.FC<PurchaseSignaturesModalProps> = ({ isOpen, onClose, onPurchaseComplete }) => {
    const [step, setStep] = useState(1);
    const [numSignatures, setNumSignatures] = useState(10);
    const price = useMemo(() => calculatePrice(numSignatures), [numSignatures]);
    
    const [isProcessing, setIsProcessing] = useState(false);
    
    const sliderPercentage = (numSignatures - 1) / (50 - 1) * 100;

    const handleConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            onPurchaseComplete(numSignatures);
            setStep(3); // Go to success step
            setTimeout(() => {
                onClose();
            }, 3000);
        }, 2000);
    };

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setNumSignatures(10);
            setIsProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-2xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                {step === 1 && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Get digital signatures</h2>
                            <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Sign documents or collect signatures from others with legal validity</p>
                        
                        <div className="mb-6">
                            <label className="font-semibold">How many digital signatures do you need?</label>
                            <div className="mt-4 p-4 text-center bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">{numSignatures} Signatures - ${price}</span>
                            </div>
                             <div className="mt-6 relative h-5">
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={numSignatures}
                                    onChange={(e) => setNumSignatures(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                    style={{ '--slider-percentage': `${sliderPercentage}%` } as React.CSSProperties}
                                />
                             </div>
                        </div>

                        <button onClick={() => setStep(2)} className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-lg transition-colors">
                            Proceed to checkout
                        </button>
                    </div>
                )}
                
                {step === 2 && (
                    <form onSubmit={handleConfirmPayment}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red"><LeftArrowIcon className="h-5 w-5"/> Back</button>
                                <h2 className="text-2xl font-bold">Order Summary</h2>
                                <div className="w-16"></div> {/* Spacer */}
                            </div>
                            
                            <div className="my-6 space-y-4">
                                <h3 className="font-semibold border-b pb-2">Purchase Details</h3>
                                <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span>{numSignatures} - Signatures</span>
                                    <span className="font-bold">${price}</span>
                                </div>
                                
                                <div className="mt-4 text-center">
                                    <h3 className="font-semibold">Pay with Fonepay</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Scan the QR code below with your mobile banking app or digital wallet to complete the payment.</p>
                                    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg max-w-xs mx-auto">
                                        <img src="https://ik.imagekit.io/fonepay/fonepay%20qr.png?updatedAt=1752920160699" alt="Fonepay QR Code" className="w-48 h-48 mx-auto" width="192" height="192" />
                                        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Fonepay</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                            <button type="submit" disabled={isProcessing} className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-lg transition-colors disabled:bg-red-300">
                                {isProcessing ? 'Processing...' : 'Confirm payment'}
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-4">Secure. Private. In your control.</p>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="p-12 text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Payment Successful!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {numSignatures} signatures have been added to your account.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseSignaturesModal;