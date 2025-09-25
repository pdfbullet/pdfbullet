import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useSignedDocuments, SignedDocument } from '../hooks/useSignedDocuments.ts';
import { SearchIcon, ChevronDownIcon, TrashIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';

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
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
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


// Icon for the "I ❤️ PDF Signature" header
const SignatureHeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-2 bg-blue-600 rounded-md inline-block ${className}`}>
    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  </div>
);

const SignedPage: React.FC = () => {
    const navigate = useNavigate();
    const { documents, loading, deleteSignedDocument } = useSignedDocuments();
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedDoc, setSelectedDoc] = useState<SignedDocument | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFilters = {
        startDate: '',
        endDate: '',
        statuses: { signed: true, voided: false, declined: false, expired: false, deleted: false }
    };
    const [filters, setFilters] = useState(initialFilters);


    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNewSignature = () => {
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

        // --- PDF Content ---
        // Header
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INVOICE', 14, 22);

        pdf.setFontSize(10);
        pdf.text('PDFBullet', 14, 30);
        pdf.text('Kathmandu, Nepal', 14, 35);
        pdf.text('Support@pdfbullet.com', 14, 40);

        // Invoice Details
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Invoice #: ${doc.id}`, 148, 22);
        pdf.text(`Invoice Date: ${new Date(doc.createdAt).toLocaleDateString()}`, 148, 28);
        pdf.text(`Due Date: ${new Date(doc.createdAt).toLocaleDateString()}`, 148, 34);

        // Bill To
        pdf.setFont('helvetica', 'bold');
        pdf.text('Bill To:', 14, 55);
        pdf.setFont('helvetica', 'normal');
        pdf.text(doc.originator, 14, 61);
        
        // Audit Trail section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Audit Trail:', 14, 80);
        pdf.setFontSize(10);
        let auditTrailText = 'No audit trail available.';
        try {
            auditTrailText = JSON.stringify(JSON.parse(doc.auditTrail), null, 2);
        } catch (e) {
            console.error("Error parsing audit trail:", e);
        }
        const lines = pdf.splitTextToSize(auditTrailText, 180);
        pdf.text(lines, 14, 86);
        
        pdf.save(`audit_trail_${doc.id}.pdf`);
    };
    
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const docDate = new Date(doc.createdAt);

            const matchesSearch = searchTerm === '' || 
                doc.signedFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.originator.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStartDate = !filters.startDate || docDate >= new Date(filters.startDate);
            const matchesEndDate = !filters.endDate || docDate <= new Date(filters.endDate);
            // In a real app, you would also filter by status
            // const matchesStatus = filters.statuses[doc.status.toLowerCase()];

            return matchesSearch && matchesStartDate && matchesEndDate;
        });
    }, [documents, searchTerm, filters]);

    return (
        <>
            <div className="w-full bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
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
                        onClick={handleNewSignature}
                        className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        New signature
                    </button>
                </div>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Signed documents</h2>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative w-full sm:max-w-xs">
                            <input type="text" placeholder="Search document" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-4 pr-10 py-2 border rounded-md" />
                            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 py-2 px-4 border rounded-md text-sm font-semibold">
                            Filter <ChevronDownIcon className="h-4 w-4" />
                        </button>
                    </div>
                    
                    {isFilterOpen && (
                         <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold">From</label>
                                <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({...f, startDate: e.target.value}))} className="w-full mt-1 p-2 border rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold">To</label>
                                <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({...f, endDate: e.target.value}))} className="w-full mt-1 p-2 border rounded-md text-sm" />
                            </div>
                         </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                             <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3">File name</th>
                                    <th className="px-4 py-3">Last modification</th>
                                    <th className="px-4 py-3">Signers</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8">Loading documents...</td></tr>
                                ) : filteredDocuments.length > 0 ? (
                                    filteredDocuments.map(doc => (
                                        <tr key={doc.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">{doc.signedFileName}</td>
                                            <td className="px-4 py-3">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">{doc.signers.map(s => s.name).join(', ')}</td>
                                            <td className="px-4 py-3"><span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">{doc.status.toUpperCase()}</span></td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="relative inline-block" ref={dropdownRef}>
                                                    <button onClick={() => setDropdownOpen(dropdownOpen === doc.id ? null : doc.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200">...</button>
                                                    {dropdownOpen === doc.id && (
                                                        <div className="absolute top-full right-0 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10 text-left">
                                                            <button onClick={() => { downloadBlob(doc.signedFile, doc.signedFileName); setDropdownOpen(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Download signed file</button>
                                                            <button onClick={() => { generateAuditPdf(doc); setDropdownOpen(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Download audit trail</button>
                                                            <button onClick={() => { setSelectedDoc(doc); setDropdownOpen(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Details</button>
                                                            <div className="border-t my-1"></div>
                                                            <button onClick={() => { if(confirm('Delete permanently?')) deleteSignedDocument(doc.id); setDropdownOpen(null); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="h-4 w-4"/> Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="text-center py-8">No signed documents found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <SignedDocDetailsModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        </>
    );
};

// FIX: Added a default export to the SignedPage component. This resolves a module loading issue with React.lazy in App.tsx and fixes related cascading type errors within this component.
export default SignedPage;
