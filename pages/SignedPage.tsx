import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useSignedDocuments, SignedDocument } from '../hooks/useSignedDocuments.ts';
import { SearchIcon, ChevronDownIcon, TrashIcon } from '../components/icons.tsx';

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
    
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const docDate = new Date(doc.createdAt);

            const matchesSearch = searchTerm === '' || 
                doc.signedFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.originator.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStartDate = !filters.startDate || docDate >= new Date(filters.startDate);
            const matchesEndDate = !filters.endDate || docDate <= new Date(filters.endDate + 'T23:59:59');

            // This is simple for now as we only have 'Signed' status
            const matchesStatus = filters.statuses.signed && doc.status === 'Signed';

            return matchesSearch && matchesStartDate && matchesEndDate && matchesStatus;
        });
    }, [documents, searchTerm, filters]);

    const clearFilters = () => {
        setFilters(initialFilters);
    };
    
    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            statuses: { ...prev.statuses, [name]: checked }
        }));
    };

    return (
        <>
            <div className="w-full bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <SignatureHeaderIcon />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            I<span className="text-brand-red">♥</span>PDF Signature
                        </h1>
                    </div>
                    <button 
                        onClick={handleNewSignature}
                        className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        New signature
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Processed documents</h2>
                    
                     {/* Filters and Search */}
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
                                <ChevronDownIcon className="h-4 w-4" /> Filters
                            </button>
                            <div className="relative w-full sm:max-w-xs">
                                <input type="text" placeholder="Search here..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-brand-red focus:border-brand-red" />
                                <button className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600">
                                    <SearchIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        {isFilterOpen && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 animate-fade-in-down">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Creation Date</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({...f, startDate: e.target.value}))} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm" />
                                            <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({...f, endDate: e.target.value}))} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                            {Object.keys(filters.statuses).map(status => (
                                                <label key={status} className="flex items-center gap-2 text-sm">
                                                    <input type="checkbox" name={status} checked={filters.statuses[status as keyof typeof filters.statuses]} onChange={handleStatusChange} className="h-4 w-4 rounded text-brand-red focus:ring-brand-red" />
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button onClick={clearFilters} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:underline">Clear filters</button>
                                    <button onClick={() => setIsFilterOpen(false)} className="px-6 py-2 bg-brand-red text-white font-bold rounded-md hover:bg-brand-red-dark">Apply</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documents Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Request originator</th>
                                    <th scope="col" className="px-6 py-3">File</th>
                                    <th scope="col" className="px-6 py-3">Creation Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan={5} className="text-center p-8 text-gray-500">Loading signed documents...</td></tr>
                                )}
                                {!loading && filteredDocuments.length === 0 && (
                                     <tr><td colSpan={5} className="text-center p-8 text-gray-500">No signed documents found.</td></tr>
                                )}
                                {!loading && filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100">{doc.originator}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{doc.signedFileName}</p>
                                            <p className="text-xs text-blue-500 font-semibold">{doc.signers.length} signer(s)</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-700 dark:text-gray-200">{new Date(doc.createdAt).toLocaleString()}</p>
                                            <p className="text-xs text-green-600 dark:text-green-400">Signed on {new Date(doc.signers[0].signedAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full">
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div ref={dropdownOpen === doc.id ? dropdownRef : null} className="relative inline-block">
                                                    <button onClick={() => setDropdownOpen(dropdownOpen === doc.id ? null : doc.id)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                                        Download <ChevronDownIcon className={`h-4 w-4 transition-transform ${dropdownOpen === doc.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {dropdownOpen === doc.id && (
                                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10 text-left">
                                                            <button onClick={() => { setSelectedDoc(doc); setDropdownOpen(null); }} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">View details</button>
                                                            <button onClick={() => downloadBlob(doc.signedFile, doc.signedFileName)} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Download signed documents</button>
                                                            <button onClick={() => generateAuditPdf(doc)} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Download Audit</button>
                                                            <button onClick={() => downloadBlob(doc.originalFile, doc.originalFileName)} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Download Original</button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => deleteSignedDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full" title="Delete Record">
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        1-{filteredDocuments.length} of {filteredDocuments.length}
                    </div>
                </div>
            </div>
            
            <SignedDocDetailsModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        </>
    );
};

export default SignedPage;