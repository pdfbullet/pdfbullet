import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { KeyIcon } from './icons.tsx';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'bishal@@@') {
      onSuccess();
    } else {
      setError('Incorrect password.');
    }
  };

  if (!isOpen || !modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-center mb-4">Admin Access</h2>
            {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={passwordInputRef}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
                className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-brand-red focus:border-brand-red"
              />
            </div>
          </div>
          <footer className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-md">Continue</button>
          </footer>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default AdminPasswordModal;