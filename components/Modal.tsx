
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-black w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </header>
        <main className="overflow-y-auto p-8 bg-white dark:bg-black rounded-b-lg">
          <div className="prose dark:prose-invert max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Modal;
