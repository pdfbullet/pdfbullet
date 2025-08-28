import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloudIcon, CheckIcon, DollarIcon, WhatsAppIcon } from '../components/icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const plan = (location.state?.plan || 'premium') as string;
    
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: 'pricing', plan } });
        }
    }, [user, navigate, plan]);

    const planDetails: { [key: string]: { name: string, price: string } } = {
        'premium': { name: 'Premium Yearly', price: '$5' },
        'pro': { name: 'Pro Lifetime', price: '$10' },
        'api-developer': { name: 'API Developer Plan', price: '$10/month' },
        'api-business': { name: 'API Business Plan', price: '$50/month' },
    };
    
    const currentPlan = planDetails[plan] || { name: 'Selected Plan', price: 'N/A' };

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const uploadedFile = acceptedFiles[0];
            setFile(uploadedFile);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(uploadedFile);

            setCurrentStep(3);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
        multiple: false,
    });

    const handleContactSupport = () => {
        if (!file) {
            alert("Please upload a payment proof screenshot before confirming.");
            return;
        }
        
        const message = `Hello! I have made a payment for the *${currentPlan.name}* plan on I Love PDFLY.\n\nMy username is: *${user?.username || 'Not available'}*\n\nPlease verify my payment and activate my account. I have attached the payment screenshot.`;
        const whatsappUrl = `https://wa.me/message/JYA22CVSYSZ4N1?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        setCurrentStep(4);
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

    if (!user) {
        return <div className="py-24 text-center">Redirecting to login...</div>;
    }

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Complete Your Purchase</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        You're just a few steps away from unlocking {currentPlan.name} features.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto bg-white dark:bg-black p-6 md:p-8 rounded-lg shadow-xl space-y-8 animated-border">
                    {/* Step 1: Payment */}
                    <div>
                        <StepHeader step={1} title="Make Payment" currentStep={currentStep} />
                        <div className={`pl-12 transition-all duration-500 overflow-hidden ${currentStep === 1 ? 'max-h-screen' : 'max-h-0'}`}>
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
                        <div className={`pl-12 transition-all duration-500 overflow-hidden ${currentStep === 2 ? 'max-h-screen' : 'max-h-0'}`}>
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
                         <div className={`pl-12 transition-all duration-500 overflow-hidden ${currentStep === 3 ? 'max-h-screen' : 'max-h-0'}`}>
                            {preview && (
                                <div className="mb-4">
                                    <p className="mb-2 text-gray-600 dark:text-gray-300"><strong>Uploaded Proof:</strong></p>
                                    <img src={preview} alt="Payment proof preview" className="max-w-xs mx-auto rounded-lg border border-gray-200 dark:border-gray-700" />
                                </div>
                            )}
                            <p className="my-4 text-gray-600 dark:text-gray-300"><strong>Step 3:</strong> Click the button below to open WhatsApp. Please send the payment screenshot you've just uploaded to our support team for verification. Your account will be activated shortly after.</p>
                            <button onClick={handleContactSupport} disabled={!file} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                Contact Support on WhatsApp
                                <WhatsAppIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Step 4: Pending */}
                    {currentStep === 4 && (
                        <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Activation Pending</h3>
                            <p className="mt-2 text-gray-700 dark:text-gray-400">We have received your request. Our team will verify your payment and activate your <strong>{currentPlan.name}</strong> plan shortly. Thank you for your patience!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;