import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloudIcon, CheckIcon, DollarIcon, WhatsAppIcon } from '../components/icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const plan = (location.state?.plan || 'premium') as string;
    
    const planDetails: { [key: string]: { name: string, price: string } } = {
        'premium': { name: 'Premium Yearly', price: '$5' },
        'pro': { name: 'Pro Lifetime', price: '$10' },
        'api-developer': { name: 'API Developer Plan', price: '$10/month' },
        'api-business': { name: 'API Business Plan', price: '$50/month' },
    };
    
    const currentPlan = planDetails[plan] || { name: 'Selected Plan', price: 'N/A' };

    const [file, setFile] = useState<File | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSharing, setIsSharing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setCurrentStep(3); // Move to confirm step after upload
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
        multiple: false,
    });

    const handleConfirm = async () => {
        if (!file) {
            alert("Please upload a payment proof screenshot before confirming.");
            return;
        }
        setIsSharing(true);
        
        const message = `Hello! I've made a payment for the ${currentPlan.name} on ILovePDFLY.\nMy username is: ${user?.username || 'Not logged in'}.\nPlease activate my account.\n\nWebsite: https://ilovepdfly.com/`;
        const fallbackUrl = `https://wa.me/message/JYA22CVSYSZ4N1?text=${encodeURIComponent(message + "\n\nPlease attach your payment screenshot here.")}`;

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'I Love PDFLY Payment Proof',
                    text: message,
                });
            } catch (error) {
                console.error('Sharing failed, falling back to URL:', error);
                window.open(fallbackUrl, '_blank');
            }
        } else {
            // Fallback for browsers without Web Share API for files
            window.open(fallbackUrl, '_blank');
        }
        setIsSharing(false);
    };

    const StepHeader: React.FC<{ step: number; title: string; currentStep: number; }> = ({ step, title, currentStep }) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;
        return (
            <div className={`flex items-center gap-4 mb-4 transition-opacity duration-500 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isActive || isCompleted ? 'bg-brand-red' : 'bg-gray-400'}`}>
                    {isCompleted ? <CheckIcon className="h-5 w-5"/> : step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            </div>
        );
    };

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Complete Your Purchase</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        You're just a few steps away from unlocking {currentPlan.name} features.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto bg-white dark:bg-black p-6 md:p-8 rounded-lg shadow-xl space-y-8">
                    {/* Step 1: Payment */}
                    <div>
                        <StepHeader step={1} title="Make Payment" currentStep={currentStep} />
                        <div className={`pl-12 ${currentStep !== 1 ? 'block' : 'hidden'}`}>
                            <p className="text-gray-500 dark:text-gray-400">Payment completed.</p>
                        </div>
                        <div className={`pl-12 ${currentStep !== 1 ? 'hidden' : ''}`}>
                            <p className="mb-4 text-gray-600 dark:text-gray-300"><strong>Step 1:</strong> Scan the Fonepay QR code below to pay <strong>{currentPlan.price}</strong> for the <strong>{currentPlan.name}</strong> plan. Make sure to take a screenshot of the successful payment confirmation.</p>
                            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg max-w-xs mx-auto">
                                <img src="https://ik.imagekit.io/fonepay/fonepay%20qr.png?updatedAt=1752920160699" alt="Fonepay QR Code" className="w-48 h-48 mx-auto" width="192" height="192" />
                                <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Fonepay</p>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Scan with your mobile banking app</p>
                            </div>
                            <div className="mt-6 text-center">
                                <button onClick={() => setCurrentStep(2)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <DollarIcon className="h-5 w-5"/> I Have Paid, Next Step
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Upload */}
                    <div>
                        <StepHeader step={2} title="Upload Proof of Payment" currentStep={currentStep} />
                        <div className={`pl-12 ${currentStep !== 2 ? 'block' : 'hidden'}`}>
                            {currentStep > 2 && <p className="text-gray-500 dark:text-gray-400">Screenshot uploaded successfully.</p>}
                        </div>
                        <div className={`pl-12 ${currentStep !== 2 ? 'hidden' : ''}`}>
                            <p className="mb-4 text-gray-600 dark:text-gray-300"><strong>Step 2:</strong> Please upload the screenshot of your successful payment transaction.</p>
                            <div {...getRootProps()} className={`flex-grow flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-brand-red'}`}>
                                <input {...getInputProps()} />
                                <UploadCloudIcon className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="font-semibold text-gray-700 dark:text-gray-200">Drag & drop or click</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">to upload your payment screenshot</p>
                            </div>
                        </div>
                    </div>

                     {/* Step 3: Confirm */}
                     <div>
                        <StepHeader step={3} title="Confirm & Activate" currentStep={currentStep} />
                        <div className={`pl-12 ${currentStep !== 3 ? 'hidden' : ''}`}>
                            <div className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-green-500 bg-green-50 dark:bg-green-900/20">
                                <CheckIcon className="h-10 w-10 text-green-600 mb-2" />
                                <p className="font-semibold text-green-800 dark:text-green-200">Proof Uploaded!</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate max-w-full px-4">{file?.name}</p>
                                <button onClick={() => { setFile(null); setCurrentStep(2); }} className="mt-2 text-xs text-red-500 hover:underline">Choose a different file</button>
                            </div>
                            <p className="my-4 text-gray-600 dark:text-gray-300"><strong>Step 3:</strong> Click the button below to open WhatsApp and send your uploaded proof to our support team for verification. Your account will be activated shortly after.</p>
                            <button onClick={handleConfirm} disabled={!file || isSharing} className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {isSharing ? 'Opening...' : 'Confirm & Contact Support'}
                                <WhatsAppIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
