import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignature } from '../hooks/useSignature.ts';
import SignatureModal from '../components/SignatureModal.tsx';
import { SearchIcon, TrashIcon, PlusIcon, CloseIcon, PhoneIcon, DownloadIcon } from '../components/icons.tsx';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Logo } from '../components/Logo.tsx';

const SignatureHeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-2 bg-blue-600 rounded-md inline-block ${className}`}>
    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  </div>
);

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const AddContactModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddContacts: (contacts: Omit<Contact, 'id'>[]) => void;
}> = ({ isOpen, onClose, onAddContacts }) => {
    const [newContacts, setNewContacts] = useState([{ name: '', email: '', phone: '' }]);

    const handleAddMore = () => {
        setNewContacts([...newContacts, { name: '', email: '', phone: '' }]);
    };

    const handleContactChange = (index: number, field: 'name' | 'email' | 'phone', value: string) => {
        const updatedContacts = [...newContacts];
        updatedContacts[index][field] = value;
        setNewContacts(updatedContacts);
    };
    
    const handleRemoveContact = (index: number) => {
        if (newContacts.length > 1) {
            const updatedContacts = newContacts.filter((_, i) => i !== index);
            setNewContacts(updatedContacts);
        }
    };

    const handleCreate = () => {
        onAddContacts(newContacts);
        handleClose();
    };

    const handleClose = () => {
        setNewContacts([{ name: '', email: '', phone: '' }]);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-black w-full max-w-xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">Add Contact</h2>
                    <button onClick={handleClose}><CloseIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {newContacts.map((contact, index) => (
                        <div key={index} className="grid sm:grid-cols-3 gap-4 items-center">
                            <input type="text" placeholder="Name" value={contact.name} onChange={e => handleContactChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
                            <input type="email" placeholder="Email" value={contact.email} onChange={e => handleContactChange(index, 'email', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
                            <div className="relative flex items-center gap-2">
                                <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input type="tel" placeholder="Phone" value={contact.phone} onChange={e => handleContactChange(index, 'phone', e.target.value)} className="w-full p-2 pl-10 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
                                {newContacts.length > 1 && <button onClick={() => handleRemoveContact(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>}
                            </div>
                        </div>
                    ))}
                     <button onClick={handleAddMore} className="text-sm font-semibold text-brand-red hover:underline">Add more</button>
                </div>
                <div className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <button onClick={handleClose} className="px-6 py-2 text-sm font-semibold border rounded-md bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">Close</button>
                    <button onClick={handleCreate} className="px-6 py-2 text-sm font-semibold text-white bg-brand-red rounded-md hover:bg-brand-red-dark">Create</button>
                </div>
            </div>
        </div>
    );
};

const ImportContactsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddContacts: (contacts: Omit<Contact, 'id'>[]) => void;
}> = ({ isOpen, onClose, onAddContacts }) => {
    const [error, setError] = useState('');

    const handleDownloadSample = () => {
        const sampleData = [['Name', 'Email', 'Phone'], ['John Doe', 'john.doe@example.com', '1234567890'], ['Jane Smith', 'jane.smith@example.com', '0987654321']];
        const ws = XLSX.utils.aoa_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
        XLSX.writeFile(wb, 'sample_contacts.xlsx');
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError('');
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = event.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: ['name', 'email', 'phone'], range: 1 }) as Omit<Contact, 'id'>[];
                    
                    const importedContacts = json.filter(c => c.name && c.email);
                    if(importedContacts.length === 0) {
                        throw new Error('No valid contacts found in the file.');
                    }
                    onAddContacts(importedContacts);
                    onClose();
                } catch (e) {
                    setError('Error parsing file. Please ensure it is a valid CSV or Excel file and matches the sample format.');
                }
            };
            reader.readAsBinaryString(file);
        }
    }, [onAddContacts, onClose]);

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/vcard': ['.vcf', '.vcard']
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div {...getRootProps()} className="bg-white dark:bg-black w-full max-w-md rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <input {...getInputProps()} />
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">Import contacts</h2>
                    <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-8 text-center space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">Import your contacts using CSV, Excel and VCard files</p>
                    <button onClick={handleDownloadSample} className="text-brand-red font-semibold hover:underline flex items-center justify-center gap-2 mx-auto">
                        <DownloadIcon className="h-4 w-4" /> Download Excel sample
                    </button>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <button onClick={open} className="w-full mt-4 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-md transition-colors">
                        Import users
                    </button>
                </div>
            </div>
        </div>
    );
};

const ContactsPage: React.FC = () => {
    const navigate = useNavigate();
    const { saveSignature } = useSignature();
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    
    // Initialize state from localStorage
    const [contacts, setContacts] = useState<Contact[]>(() => {
        try {
            const savedContacts = localStorage.getItem('ilovepdfly_contacts');
            return savedContacts ? JSON.parse(savedContacts) : [];
        } catch (error) {
            console.error('Could not load contacts from local storage', error);
            return [];
        }
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('ilovepdfly_contacts', JSON.stringify(contacts));
        } catch (error) {
            console.error('Could not save contacts to local storage', error);
        }
    }, [contacts]);

    // FIX: Updated to accept both signature and initials data URLs to match the `onSave` prop of SignatureModal.
    const handleSaveSignature = (signatureDataUrl: string, initialsDataUrl: string) => {
        saveSignature(signatureDataUrl, initialsDataUrl);
        setIsSignatureModalOpen(false);
        navigate('/sign-pdf');
    };

    const handleAddContacts = (newContacts: Omit<Contact, 'id'>[]) => {
        const contactsToAdd = newContacts
            .filter(c => c.name.trim() && c.email.trim())
            .map((c, index) => ({ ...c, id: Date.now() + index }));
        setContacts(prev => [...prev, ...contactsToAdd]);
    };

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedContactIds(e.target.checked ? filteredContacts.map(c => c.id) : []);
    };
    
    const handleSelectOne = (id: number) => {
        setSelectedContactIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (selectedContactIds.length > 0 && window.confirm(`Are you sure you want to delete ${selectedContactIds.length} contact(s)?`)) {
            setContacts(prev => prev.filter(c => !selectedContactIds.includes(c.id)));
            setSelectedContactIds([]);
        }
    };

    const handleDeleteOne = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete the contact "${name}"?`)) {
            setContacts(prev => prev.filter(contact => contact.id !== id));
            setSelectedContactIds(prev => prev.filter(selectedId => selectedId !== id));
        }
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
                    <button onClick={() => setIsSignatureModalOpen(true)} className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md">New signature</button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contacts</h2>
                        <div className="flex gap-4">
                           <button onClick={() => setIsAddModalOpen(true)} className="text-sm font-semibold text-brand-red hover:underline">Add contact</button>
                           <button onClick={() => setIsImportModalOpen(true)} className="text-sm font-semibold text-brand-red hover:underline">Import contacts</button>
                        </div>
                    </div>
                    <div className="relative mb-6 max-w-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" placeholder="Name/Email" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="p-4 w-12">
                                        <div className="flex items-center gap-4">
                                            <input type="checkbox" onChange={handleSelectAll} checked={contacts.length > 0 && selectedContactIds.length === filteredContacts.length} className="h-4 w-4 rounded" />
                                            {selectedContactIds.length > 0 && <button onClick={handleDeleteSelected} title="Delete selected contacts"><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Phone</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8">
                                            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 w-full text-brand-red font-semibold hover:opacity-80">
                                                <PlusIcon className="h-5 w-5"/> Add contact
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContacts.map(contact => (
                                        <tr key={contact.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="p-4"><input type="checkbox" checked={selectedContactIds.includes(contact.id)} onChange={() => handleSelectOne(contact.id)} className="h-4 w-4 rounded"/></td>
                                            <td className="px-6 py-4 font-semibold">{contact.name}</td>
                                            <td className="px-6 py-4">{contact.email}</td>
                                            <td className="px-6 py-4">{contact.phone}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteOne(contact.id, contact.name)} title={`Delete ${contact.name}`} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">1-{filteredContacts.length} of {filteredContacts.length}</div>
                </div>
            </div>
            
            <SignatureModal isOpen={isSignatureModalOpen} onClose={() => setIsSignatureModalOpen(false)} onSave={handleSaveSignature} />
            <AddContactModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddContacts={handleAddContacts} />
            <ImportContactsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onAddContacts={handleAddContacts} />
        </>
    );
};

export default ContactsPage;