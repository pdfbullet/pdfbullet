import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignature } from '../hooks/useSignature.ts';
import SignatureModal from '../components/SignatureModal.tsx';
import { SettingsIcon, TrashIcon, EditIcon, FileIcon } from '../components/icons.tsx';
import { useSignedDocuments } from '../hooks/useSignedDocuments.ts';

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
    const { documents, loading } = useSignedDocuments();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'sent' | 'inbox' | 'signed'>('signed');

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

    const latestSignedDoc = documents.length > 0 ? documents[0] : null;
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    return (
        <>
            <div className="w-full space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                        Signatures Overview
                    </h1>
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
                                {loading ? (
                                    <div className="mt-4 p-4 animate-pulse">Loading...</div>
                                ) : latestSignedDoc ? (
                                    <div className="mt-4 border rounded-lg p-4 flex items-center justify-between text-left">
                                      <div className="flex items-center gap-3">
                                        <FileIcon className="h-8 w-8 text-blue-500"/>
                                        <div>
                                          <p className="font-semibold text-gray-700 dark:text-gray-200">{latestSignedDoc.signedFileName}</p>
                                          <p className="text-xs">Signed {timeAgo(latestSignedDoc.createdAt)}</p>
                                        </div>
                                      </div>
                                      <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">{latestSignedDoc.status.toUpperCase()}</span>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-4">You have no signed documents yet.</div>
                                )}
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