import React from 'react';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';
import { CloseIcon, DownloadIcon } from './icons.tsx';

const PWAInstallInstructionsModal: React.FC = () => {
  const { showInstallInstructions, closeInstallInstructions } = usePWAInstall();

  if (!showInstallInstructions) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={closeInstallInstructions}>
      <div className="bg-white dark:bg-black w-full max-w-md rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <DownloadIcon className="h-6 w-6" />
            How to Install App
          </h2>
          <button onClick={closeInstallInstructions} aria-label="Close modal" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>
        <main className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This app can be installed directly from your browser for a faster, offline experience.
          </p>
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Installation steps:</strong></p>
            <ol>
              <li>Open your browser's menu (usually three dots or lines in the corner).</li>
              <li>Look for an option like "Install App", "Add to Home Screen", or "Install PDFBullet".</li>
              <li>Follow the on-screen prompts to complete the installation.</li>
            </ol>
            <p className="mt-4 text-xs">Note: This feature is supported on most modern browsers like Chrome, Edge, and Safari on mobile devices.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PWAInstallInstructionsModal;