import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as QRCode from 'qrcode';
import { CopyIcon, CheckIcon } from './icons.tsx';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      const fullUrl = window.location.href;
      setCurrentUrl(fullUrl);

      QRCode.toDataURL(fullUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'H'
      })
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error('Failed to generate QR code', err);
        });
    }
  }, [isOpen, location]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in-down"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-code-modal-title"
    >
      <div
        className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="qr-code-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Share Page</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors text-2xl" aria-label="Close modal">
            &times;
          </button>
        </header>
        <main className="p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Scan the QR code to open this page on your mobile device.</p>
          <div className="p-4 bg-white inline-block rounded-lg border dark:border-gray-700">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code for current page" width="256" height="256" />
            ) : (
              <div className="w-64 h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Generating...</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <label htmlFor="page-url" className="sr-only">Page URL</label>
            <div className="relative">
              <input
                id="page-url"
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 pr-10 text-sm text-gray-700 dark:text-gray-300"
              />
              <button
                onClick={handleCopy}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-brand-red"
                title="Copy URL"
              >
                {isCopied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <CopyIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QrCodeModal;