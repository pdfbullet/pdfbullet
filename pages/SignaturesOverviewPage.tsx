import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useSignature } from '../hooks/useSignature.ts';
import SignatureModal from '../components/SignatureModal.tsx';
import { SettingsIcon, TrashIcon, EditIcon, FileIcon, ChevronDownIcon, CloseIcon } from '../components/icons.tsx';
import { useSignedDocuments, SignedDocument } from '../hooks/useSignedDocuments.ts';

const SignedDocDetailsModal: React.FC<{ doc: SignedDocument | null; onClose: () => void; }> = ({ doc, onClose }) => {
    if (!doc) return null;

    let auditTrail = [];
    try {
        auditTrail = JSON.parse(doc.auditTrail);
    } catch (e) {
        console.error("Could not parse audit trail", e);
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-2xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Document Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                    <div>
                        <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-100">File Information</h3>
                        <p className="text-sm"><strong>Original File:</strong> {doc.originalFileName}</p>
                        <p className="text-sm"><strong>Signed File:</strong> {doc.signedFileName}</p>
                        <p className="text-sm"><strong>Status:</strong> <span className="text-green-600 font-semibold">{doc.status}</span></p>
                        <p className="text-sm"><strong>Created At:</strong> {new Date(doc.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-100">Signers</h3>
                        {doc.signers.map((signer, i) => (
                            <div key={i} className="text-sm border-t pt-2 mt-2 first:border-t-0">
                                <p><strong>Name:</strong> {signer.name}</p>
                                <p><strong>Signed At:</strong> {new Date(signer.signedAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-100">Audit Trail</h3>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md whitespace-pre-wrap">
                            {JSON.stringify(auditTrail, null, 2)}
                        </pre>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg text-right">
                    <button onClick={onClose} className="px-4 py-2 font-semibold border rounded-md bg-white dark:bg-gray-700 hover:bg-gray-100">Close</button>
                </div>
            </div>
        </div>
    );
};

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
    const { documents, loading, deleteSignedDocument } = useSignedDocuments();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'sent' | 'inbox' | 'signed'>('signed');

    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<SignedDocument | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
    
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const generateAuditPdf = (doc: SignedDocument) => {
        const pdf = new jsPDF();
        pdf.setFontSize(18);
        pdf.text('Audit Trail Report', 14, 22);

        pdf.setFontSize(12);
        pdf.text(`Document: ${doc.signedFileName}`, 14, 35);
        pdf.text(`Created: ${new Date(doc.createdAt).toLocaleString()}`, 14, 42);
        pdf.text(`Status: ${doc.status}`, 14, 49);

        pdf.setFontSize(14);
        pdf.text('Events:', 14, 62);
        pdf.setFontSize(10);
        let auditTrailText = 'No audit trail available.';
        try {
            auditTrailText = JSON.stringify(JSON.parse(doc.auditTrail), null, 2);
        } catch (e) {
            console.error("Error parsing audit trail:", e);
        }
        const lines = pdf.splitTextToSize(auditTrailText, 180);
        pdf.text(lines, 14, 68);
        
        pdf.save(`audit_trail_${doc.id}.pdf`);
    };

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
                            <div className="p-4 space-y-2">
                                {loading ? (
                                    <div className="p-4 text-center text-gray-500">Loading...</div>
                                ) : documents.length > 0 ? (
                                    <>
                                        {documents.slice(0, 3).map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
                                                    <div className="overflow-hidden">
                                                        <p className="font-semibold text-gray-700 dark:text-gray-200 truncate">{doc.signedFileName}</p>
                                                        <p className="text-xs text-gray-500">Signed {timeAgo(doc.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="relative" ref={dropdownOpen === doc.id ? dropdownRef : null}>
                                                    <button onClick={() => setDropdownOpen(dropdownOpen === doc.id ? null : doc.id)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full">
                                                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${dropdownOpen === doc.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {dropdownOpen === doc.id && (
                                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10 text-left">
                                                            <button onClick={() => { setSelectedDoc(doc); setDropdownOpen(null); }} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">View details</button>
                                                            <button onClick={() => downloadBlob(doc.signedFile, doc.signedFileName)} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Download signed document</button>
                                                            <button onClick={() => generateAuditPdf(doc)} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Download Audit</button>
                                                            <button onClick={() => downloadBlob(doc.originalFile, doc.originalFileName)} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Download Original</button>
                                                            <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                                                            <button onClick={() => { if(window.confirm('Delete this record?')) deleteSignedDocument(doc.id); setDropdownOpen(null); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">Delete record</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {documents.length > 3 && (
                                            <div className="text-center pt-2">
                                                <Link to="/signed" className="text-brand-red font-semibold hover:underline">View all signed documents &rarr;</Link>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-6 text-center text-gray-500">You have no signed documents yet.</div>
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
            <SignedDocDetailsModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        </>
    );
};

export default SignaturesOverviewPage;