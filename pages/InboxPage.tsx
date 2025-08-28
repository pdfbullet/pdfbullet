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

// SVG illustration for the empty state, inspired by the screenshot
const EmptyStateIllustration: React.FC = () => (
    <svg className="w-48 h-auto text-gray-300 dark:text-gray-700 mx-auto" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ground */}
        <path d="M10 90 H 190" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Cactus */}
        <path d="M70 90 V 55 C 70 45, 60 45, 60 55 V 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M70 70 H 85 C 95 70, 95 80, 85 80 V 90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Tumbleweed */}
        <circle cx="130" cy="80" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
        <path d="M125 75 l 10 10 M 135 75 l -10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        
        {/* Mountains */}
        <path d="M20 90 L 40 70 L 60 90" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M90 90 L 110 65 L 130 90" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const InboxPage: React.FC = () => {
    const navigate = useNavigate();
    const { saveSignature } = useSignature();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveSignature = (dataUrl: string) => {
        saveSignature(dataUrl);
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Pending documents</h2>
                    
                    {/* Empty State */}
                    <div className="text-center py-16">
                        <EmptyStateIllustration />
                        <p className="mt-6 text-gray-500 dark:text-gray-400">
                            No documents to be signed... so far!
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

export default InboxPage;