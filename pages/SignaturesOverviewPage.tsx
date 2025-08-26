import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignature } from '../hooks/useSignature.ts';
import SignatureModal from '../components/SignatureModal.tsx';
import { SettingsIcon, TrashIcon, EditIcon, FileIcon } from '../components/icons.tsx';

// Specific icon for the "I ❤️ PDF Signature" header
const SignatureHeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-2 bg-blue-600 rounded-md inline-block ${className}`}>
    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  </div>
);

const SignatureSettingsDropdown: React.FC<{ onEdit: () => void; onDelete: () => void; }> = ({ onEdit, onDelete }) => (
    <div className="absolute top-8 right-4 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
        <button onClick={onEdit} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <EditIcon className="h-4 w-4" /> Edit Signature
        </button>
        <button onClick={onDelete} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <TrashIcon className="h-4 w-4" /> Delete Signature
        </button>
    </div>
);


const SignaturesOverviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { signature, saveSignature, deleteSignature } = useSignature();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'sent' | 'inbox' | 'signed'>('sent');

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete your saved signature?')) {
            deleteSignature();
            setIsSettingsOpen(false);
        }
    };

    const handleEdit = () => {
        setIsSettingsOpen(false);
        setIsModalOpen(true);
    };

    const handleSaveSignature = (dataUrl: string) => {
        saveSignature(dataUrl);
        setIsModalOpen(false);
        navigate('/sign-pdf');
    };

    return (
        <>
            <div className="w-full space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <SignatureHeaderIcon />
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                            I<span className="text-brand-red">♥</span>PDF Signature
                        </h1>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors">
                        New signature
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Your Signature Card */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold mb-4">Your signature</h2>
                        <div className="relative flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                            {signature ? (
                                <>
                                    <img src={signature} alt="Your saved signature" className="max-h-24" />
                                    <div className="absolute top-2 right-2">
                                        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                            <SettingsIcon className="h-5 w-5" />
                                        </button>
                                        {isSettingsOpen && <SignatureSettingsDropdown onEdit={handleEdit} onDelete={handleDelete} />}
                                    </div>
                                </>
                            ) : (
                                <button onClick={() => setIsModalOpen(true)} className="text-center text-gray-500 hover:text-brand-red">
                                    <p className="text-2xl">+</p>
                                    <p>Create your signature</p>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Digital Signatures Card */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Digital Signatures</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
                            Certificate-based signatures are necessary to legally validate the signature's authenticity. You can acquire certified signatures by subscribing to I Love PDFLY Premium or purchasing a prepaid package.
                        </p>
                        <div className="mt-4">
                            <button onClick={() => navigate('/pricing')} className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md transition-colors">
                                Upgrade to Premium
                            </button>
                        </div>
                    </div>
                </div>

                {/* Last Activity Card */}
                <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Last activity</h2>
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-6">
                                <button onClick={() => setActiveTab('sent')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'sent' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-red'}`}>Sent</button>
                                <button onClick={() => setActiveTab('inbox')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'inbox' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-red'}`}>Inbox</button>
                                <button onClick={() => setActiveTab('signed')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'signed' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-red'}`}>Signed</button>
                            </nav>
                        </div>
                    </div>
                    <div className="p-2">
                        {activeTab === 'sent' && <div className="p-6 text-center text-gray-500">You haven't sent any signature requests yet.</div>}
                        {activeTab === 'inbox' && <div className="p-6 text-center text-gray-500">You don't have any pending signature requests.</div>}
                        {activeTab === 'signed' && (
                            <div className="p-4 text-center text-gray-500">
                                This section will show your signed documents.
                                <div className="mt-4 border rounded-lg p-4 flex items-center justify-between text-left animate-pulse">
                                  <div className="flex items-center gap-3">
                                    <FileIcon className="h-8 w-8 text-blue-500"/>
                                    <div>
                                      <p className="font-semibold text-gray-700 dark:text-gray-200">example_contract_signed.pdf</p>
                                      <p className="text-xs">Signed 2 minutes ago</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">COMPLETED</span>
                                </div>
                            </div>
                        )}
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

export default SignaturesOverviewPage;
