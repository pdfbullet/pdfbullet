
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloudIcon, CheckIcon, DollarIcon, WhatsAppIcon, LockIcon } from '../components/icons.tsx';
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

    const planDetails: { [key: string]: { name: string, price: string, features: string[] } } = {
        'premium': { name: 'Premium Yearly', price: '$5', features: ['Unlimited documents', 'All Premium tools', 'No Ads'] },
        'pro': { name: 'Pro Lifetime', price: '$10', features: ['All Premium features', 'Team features', 'Priority support'] },
        'api-developer': { name: 'API Developer Plan', price: '$10/month', features: ['1,000 API calls/day', 'Access to all tools', 'Email support'] },
        'api-business': { name: 'API Business Plan', price: '$50/month', features: ['10,000 API calls/day', 'Priority support', 'Custom integrations'] },
    };
    
    const currentPlan = planDetails[plan] || { name: 'Selected Plan', price: 'N/A', features: [] };

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
        
        const message = `Hello! I have made a payment for the *${currentPlan.name}* plan on PDFBullet.\n\nMy username is: *${user?.username || 'Not available'}*\n\nPlease verify my payment and activate my account. I have attached the payment screenshot.`;
        const whatsappUrl = `https://wa.me/message/JYA22CVSYSZ4N1?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        setCurrentStep(4);
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

                <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Left Column: Order Summary */}
                    <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 h-fit">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-4">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">{currentPlan.name}</span>
                                <span className="font-bold">{currentPlan.price}</span>
                            </div>
                             <ul className="pl-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                {currentPlan.features.map(f => <li key={f} className="list-disc">{f}</li>)}
                             </ul>
                             <div className="border-t pt-4 mt-4 flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span>{currentPlan.price}</span>
                             </div>
                        </div>
                         <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 text-sm text-center">
                            <p className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"><LockIcon className="h-4 w-4 text-green-500"/> Secure Payment Process</p>
                            <p className="text-gray-500 dark:text-gray-500">Your transaction is verified manually for added security.</p>
                         </div>
                    </div>

                    {/* Right Column: Steps */}
                    <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                       {currentStep < 4 ? (
                         <ol className="space-y-8">
                            {/* Step 1 */}
                            <li className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= 1 ? 'bg-brand-red' : 'bg-gray-300'}`}>{currentStep > 1 ? <CheckIcon className="h-6 w-6"/> : '1'}</div>
                                    <div className="w-px h-full bg-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Make Payment via QR</h3>
                                    <p className="text-sm text-gray-500 mb-4">Scan the Fonepay QR code to pay <strong>{currentPlan.price}</strong> and take a screenshot of the confirmation.</p>
                                    <div className="text-center p-4 border rounded-lg max-w-xs">
                                        <img src="https://ik.imagekit.io/fonepay/fonepay%20qr.png?updatedAt=1752920160699" alt="Fonepay QR Code" className="w-40 h-40 mx-auto" />
                                        <p className="mt-2 text-sm font-semibold">Fonepay</p>
                                    </div>
                                    {currentStep === 1 && <button onClick={() => setCurrentStep(2)} className="mt-4 bg-green-600 text-white font-semibold py-2 px-4 rounded-md">I Have Paid</button>}
                                </div>
                            </li>
                             {/* Step 2 */}
                             <li className={`flex gap-4 transition-opacity duration-500 ${currentStep < 2 ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= 2 ? 'bg-brand-red' : 'bg-gray-300'}`}>{currentStep > 2 ? <CheckIcon className="h-6 w-6"/> : '2'}</div>
                                    <div className="w-px h-full bg-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Upload Proof</h3>
                                    {currentStep === 2 && (
                                        <div {...getRootProps()} className={`mt-2 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-brand-red bg-red-50' : 'border-gray-300 hover:border-brand-red'}`}>
                                            <input {...getInputProps()} />
                                            <UploadCloudIcon className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm">Drop screenshot here or click to upload</p>
                                        </div>
                                    )}
                                     {currentStep > 2 && (
                                         <div className="mt-2 flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                            <img src={preview!} alt="Proof preview" className="h-12 w-12 object-cover rounded"/>
                                            <span className="text-sm font-semibold">Screenshot uploaded</span>
                                         </div>
                                     )}
                                </div>
                             </li>
                              {/* Step 3 */}
                              <li className={`flex gap-4 transition-opacity duration-500 ${currentStep < 3 ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-brand-red flex-shrink-0">{currentStep > 3 ? <CheckIcon className="h-6 w-6"/> : '3'}</div>
                                <div>
                                    <h3 className="font-bold text-lg">Confirm via WhatsApp</h3>
                                    <p className="text-sm text-gray-500 mb-4">Contact our support on WhatsApp with your payment proof to activate your plan instantly.</p>
                                    {currentStep === 3 && <button onClick={handleContactSupport} disabled={!file} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2"><WhatsAppIcon className="h-5 w-5"/> Contact Support</button>}
                                </div>
                             </li>
                         </ol>
                       ) : (
                         <div className="text-center p-8">
                            <CheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                            <h3 className="text-2xl font-bold">Activation Pending</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Our team will verify your payment and activate your plan shortly. Thank you!</p>
                        </div>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
