import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { CheckIcon, PaperAirplaneIcon } from './icons.tsx';

interface ProblemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProblemReportModal: React.FC<ProblemReportModalProps> = ({ isOpen, onClose }) => {
  const { user, auth, submitProblemReport } = useAuth();
  
  const [description, setDescription] = useState('');
  const [problemType, setProblemType] = useState('Tool Not Working');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
        await submitProblemReport({
            email: auth.currentUser?.email || 'Not logged in',
            url: window.location.href,
            description: description.trim(),
            problemType: problemType,
        });
        setSuccess(true);
        setTimeout(() => handleClose(), 3000);
    } catch (err: any) {
        setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      setDescription('');
      setProblemType('Tool Not Working');
      setError('');
      setSuccess(false);
      setIsLoading(false);
      onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in-down" style={{animationDuration: '300ms'}} onClick={handleClose}>
        <div className="bg-white dark:bg-black w-full max-w-lg rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <header className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Report a Problem</h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" aria-label="Close modal">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </header>
            {success ? (
                <div className="p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-6">
                        <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold">Report Submitted</h3>
                    <p className="text-gray-600 dark:text-gray-400">Thank you for your feedback! Our team will look into it.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} noValidate>
                    <main className="p-6 space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Found an issue? Please describe it below. The current page URL and your user info (if logged in) will be included automatically.</p>
                        <div>
                            <label htmlFor="problemType" className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Problem Type</label>
                            <select id="problemType" value={problemType} onChange={e => setProblemType(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                                <option>Tool Not Working</option>
                                <option>Visual Bug</option>
                                <option>Login Issue</option>
                                <option>Payment Problem</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Description*</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                        {error && <div className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{error}</div>}
                    </main>
                    <footer className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                        <button type="button" onClick={handleClose} className="px-6 py-2 text-sm font-semibold border rounded-md bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-brand-red text-white font-bold py-2 px-6 rounded-md disabled:bg-red-300 hover:bg-brand-red-dark">
                            <PaperAirplaneIcon className="h-5 w-5"/>
                            {isLoading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </footer>
                </form>
            )}
        </div>
    </div>
  );
};

export default ProblemReportModal;