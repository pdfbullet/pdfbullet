import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, changePassword } = useAuth();
  const oldPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    if (!user) {
        setError('You must be logged in to change your password.');
        return;
    }
    
    setIsLoading(true);
    try {
        await changePassword(user.username, oldPassword, newPassword);
        setSuccess('Password changed successfully! You can now close this window.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (err: any) {
        setError(err.message || 'Failed to change password.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => oldPasswordRef.current?.focus(), 100);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-lg flex flex-col rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="change-password-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Change Password</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-8 space-y-4">
            {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
            {success && <p className="text-center text-sm text-green-600 bg-green-100 dark:bg-green-900/30 p-3 rounded-md">{success}</p>}

            <div>
                <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Password</label>
                <input ref={oldPasswordRef} type="password" id="old-password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200" />
            </div>
             <div>
                <label htmlFor="new-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input type="password" id="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200" />
            </div>
             <div>
                <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200" />
            </div>
          </main>
          <footer className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading || !!success} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-md hover:bg-brand-red-dark transition-colors disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed">
                {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;