import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignature } from '../hooks/useSignature.ts';
import SignatureModal from '../components/SignatureModal.tsx';
import { Logo } from '../components/Logo.tsx';

// Icon for the "I ❤️ PDF Signature" header
const SignatureHeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-2 bg-blue-600 rounded-md inline-block ${className}`}>
    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  </div>
);


const TemplatesPage: React.FC = () => {
    const navigate = useNavigate();
    const { saveSignature } = useSignature();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // FIX: Updated to accept both signature and initials data URLs to match the `onSave` prop of SignatureModal.
    const handleSaveSignature = (signatureDataUrl: string, initialsDataUrl: string) => {
        saveSignature(signatureDataUrl, initialsDataUrl);
        setIsModalOpen(false);
        navigate('/sign-pdf');
    };

    return (
        <>
            <div className="w-full bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <SignatureHeaderIcon />
                        <div className="flex items-center gap-2">
                            <Logo className="h-7 w-auto" />
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                Signature
                            </h1>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        New signature
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Templates list</h2>
                    
                    {/* Empty State */}
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                            No templates have been saved. You can create and save templates to reuse in 
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="text-brand-red font-semibold hover:underline ml-1"
                            >
                                new signature processes
                            </button>.
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right text-xs text-gray-500">
                    © PDFBullet - {new Date().getFullYear()} - Your PDF Editor
                </div>
            </div>
            
            <SignatureModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSignature}
            />
        </>
    );
};

export default TemplatesPage;
