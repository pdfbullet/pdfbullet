import React, { useState, useEffect } from 'react';
import { CloseIcon, PaperAirplaneIcon, CheckIcon } from './icons.tsx';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setRole('member');
            setIsSending(false);
            setSent(false);
            setError('');
        }
    }, [isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSending(true);
        // Simulate sending an invitation
        setTimeout(() => {
            setIsSending(false);
            setSent(true);
            setTimeout(() => {
                onClose();
            }, 3000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-md rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                 <div className="relative p-6">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                    
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Invite New Member</h2>
                    
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-6">
                                <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold">Invitation Sent!</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                An invitation has been successfully sent to <strong className="text-gray-800 dark:text-gray-200">{email}</strong>.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                                <input
                                    type="email"
                                    id="invite-email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                <select
                                    id="invite-role"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">{error}</p>}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full flex justify-center items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-red-300"
                                >
                                    {isSending ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <PaperAirplaneIcon className="h-5 w-5" />
                                            Send Invitation
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default InviteMembersModal;
