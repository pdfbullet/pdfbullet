

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignature } from '../hooks/useSignature.ts';
import SignatureModal from '../components/SignatureModal.tsx';
import { SearchIcon, TrashIcon, PlusIcon, DownloadIcon, UploadIcon } from '../components/icons.tsx';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Logo } from '../components/Logo.tsx';

// Recreate the missing icons and components from context
const SignatureHeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-2 bg-blue-600 rounded-md inline-block ${className}`}>
    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  </div>
);

// Define Contact type
interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

const CONTACTS_KEY = 'ilovepdfly_contacts_v1';

// Mock hook logic for contacts since there's no useContacts hook provided
const useContacts = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CONTACTS_KEY);
            if (stored) {
                setContacts(JSON.parse(stored));
            } else {
                // Add some initial mock data
                const initialContacts = [
                    { id: 1, name: 'Bishal Mishra', email: 'bishal@example.com', phone: '123-456-7890' },
                    { id: 2, name: 'Anam Mishra', email: 'anam@example.com', phone: '987-654-3210' },
                ];
                localStorage.setItem(CONTACTS_KEY, JSON.stringify(initialContacts));
                setContacts(initialContacts);
            }
        } catch (error) {
            console.error("Failed to load contacts from localStorage", error);
        }
    }, []);

    const saveContacts = (newContacts: Contact[]) => {
        try {
            localStorage.setItem(CONTACTS_KEY, JSON.stringify(newContacts));
            setContacts(newContacts);
        } catch (error) {
            console.error("Failed to save contacts to localStorage", error);
        }
    };

    const addContact = (contact: Omit<Contact, 'id'>) => {
        const newContact = { ...contact, id: Date.now() };
        saveContacts([...contacts, newContact]);
    };

    const deleteContacts = (ids: number[]) => {
        const newContacts = contacts.filter(c => !ids.includes(c.id));
        saveContacts(newContacts);
    };

    return { contacts, addContact, deleteContacts, setContacts };
};

const ContactsPage: React.FC = () => {
    const navigate = useNavigate();
    const { saveSignature } = useSignature();
    const { contacts, addContact, deleteContacts, setContacts } = useContacts();
    
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedContacts(filteredContacts.map(c => c.id));
        } else {
            setSelectedContacts([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedContacts(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedContacts.length} selected contact(s)?`)) {
            deleteContacts(selectedContacts);
            setSelectedContacts([]);
        }
    };
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            const newContacts: Contact[] = json.map((row, index) => ({
                id: Date.now() + index,
                name: row.Name || row.name || '',
                email: row.Email || row.email || '',
                phone: String(row.Phone || row.phone || ''),
            })).filter(c => c.name && c.email);
            
            setContacts(prev => [...prev, ...newContacts]);
        };
        reader.readAsArrayBuffer(file);
    }, [setContacts]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] }});

    const handleExport = () => {
        const contactsToExport = selectedContacts.length > 0
            ? contacts.filter(c => selectedContacts.includes(c.id))
            : contacts;
        
        const worksheet = XLSX.utils.json_to_sheet(contactsToExport.map(({id, ...rest}) => rest));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
        XLSX.writeFile(workbook, "ilovepdfly_contacts.xlsx");
    };

    const handleSaveSignature = (signatureDataUrl: string, initialsDataUrl: string) => {
        saveSignature(signatureDataUrl, initialsDataUrl);
        setIsSignatureModalOpen(false);
        navigate('/sign-pdf');
    };

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
                        onClick={() => setIsSignatureModalOpen(true)}
                        className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        New signature
                    </button>
                </div>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Contacts list</h2>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative w-full sm:max-w-xs">
                            <input type="text" placeholder="Search contact" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-4 pr-10 py-2 border rounded-md" />
                            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => alert("Add contact functionality is coming soon!")} className="flex items-center gap-2 py-2 px-4 border rounded-md text-sm font-semibold"><PlusIcon className="h-4 w-4"/> Add contact</button>
                            <div {...getRootProps()} className="inline-block">
                                <input {...getInputProps()} />
                                <button type="button" className="flex items-center gap-2 py-2 px-4 border rounded-md text-sm font-semibold"><UploadIcon className="h-4 w-4"/> Import contacts</button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0} /></th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map(contact => (
                                    <tr key={contact.id} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-3"><input type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={() => handleSelectOne(contact.id)} /></td>
                                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">{contact.name}</td>
                                        <td className="px-4 py-3">{contact.email}</td>
                                        <td className="px-4 py-3">{contact.phone || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredContacts.length === 0 && <p className="text-center py-8 text-gray-500">No contacts found.</p>}

                    {selectedContacts.length > 0 && (
                        <div className="mt-4 flex items-center gap-4">
                            <button onClick={handleDeleteSelected} className="flex items-center gap-2 text-sm font-semibold text-red-600"><TrashIcon className="h-4 w-4"/> Delete ({selectedContacts.length})</button>
                            <button onClick={handleExport} className="flex items-center gap-2 text-sm font-semibold text-blue-600"><DownloadIcon className="h-4 w-4"/> Export ({selectedContacts.length})</button>
                        </div>
                    )}
                </div>
            </div>

            <SignatureModal 
                isOpen={isSignatureModalOpen} 
                onClose={() => setIsSignatureModalOpen(false)}
                onSave={handleSaveSignature}
            />
        </>
    );
};

export default ContactsPage;