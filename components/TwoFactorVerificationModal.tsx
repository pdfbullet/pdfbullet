import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TwoFactorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorVerificationModal: React.FC<TwoFactorVerificationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const codeInputRef = useRef<HTMLInputElement>(null);
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would involve a TOTP library and the user's secret.
    // For this demo, we'll just check for a 6-digit code.
    if (/^\d{6}$/.test(code)) {
      onSuccess();
    } else {
      setError('Please enter a valid 6-digit code.');
    }
  };

  if (!isOpen || !modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Two-Step Verification</h2>
            <p className="text-sm text-gray-500 mb-4">Enter the code from your authenticator app.</p>
            {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
            <input
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              maxLength={6}
              placeholder="123456"
              className="w-48 p-2 text-2xl tracking-[0.5em] text-center border-2 rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-brand-red focus:border-brand-red"
            />
          </div>
          <footer className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-md">Verify</button>
          </footer>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default TwoFactorVerificationModal;