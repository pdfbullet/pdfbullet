import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignature } from '../hooks/useSignature.ts';
import SignatureModal from '../components/SignatureModal.tsx';
import { FileIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';

// Icon for the "I ❤️ PDF Signature" header
const SignatureHeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-2 bg-blue-600 rounded-md inline-block ${className}`}>
    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  </div>
);

// A simple SVG illustration for the empty state, inspired by the screenshot
const EmptyStateIllustration: React.FC = () => (
    <svg className="w-48 h-auto text-gray-300 dark:text-gray-700" viewBox="0 0 150 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 70 C 25 55, 45 55, 65 70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M85 70 C 105 55, 125 55, 145 70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M75 40 V 65 M 65 50 H 85 M 65 50 C 65 45, 60 45, 60 50 V 55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="110" cy="60" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
        <path d="M105 55 l 10 10 M 115 55 l -10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <g transform="translate(30 15) scale(0.2)">
           <FileIcon className="text-gray-400 dark:text-gray-600" />
        </g>
    </svg>
);

const SentPage: React.FC = () => {
    const navigate = useNavigate();
    const { saveSignature } = useSignature();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
// FIX: Updated to accept both signature and initials data URLs to match the `onSave` prop of SignatureModal.
    const handleSaveSignature = (signatureDataUrl: string, initialsDataUrl: string) => {
        saveSignature(signatureDataUrl, initialsDataUrl);
        setIsModalOpen(false);
        // After creating a signature, the user should be taken to the sign tool to use it
        navigate('/sign-pdf');
    };

    return (
        <>
            <div className="w-full bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                {/* Header Section from screenshot */}
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Signature requests</h2>
                    
                    {/* Empty State */}
                    <div className="text-center py-16">
                        <EmptyStateIllustration />
                        <p className="mt-6 text-gray-500 dark:text-gray-400">
                            You have not sent any signature requests yet. 
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="text-brand-red font-semibold hover:underline ml-1"
                            >
                                Send your first signature request
                            </button>
                        </p>
                    </div>
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

export default SentPage;