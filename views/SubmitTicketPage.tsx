import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { CheckIcon, PaperAirplaneIcon, LinkIcon } from '../components/icons.tsx';
import { Link } from 'react-router-dom';

const SubmitTicketPage: React.FC = () => {
  const { auth, submitProblemReport } = useAuth();
  
  const [description, setDescription] = useState('');
  const [problemType, setProblemType] = useState('Tool Not Working');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Submit a Ticket | PDFBullet";
    if (auth.currentUser?.email) {
      setEmail(auth.currentUser.email);
    }
  }, [auth.currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
        setError('Please provide a description of the problem.');
        return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
        await submitProblemReport({
            email: email || 'anonymous',
            url: url || window.location.href,
            description: description.trim(),
            problemType: problemType,
        });
        setSuccess(true);
        setDescription('');
        setUrl('');
    } catch (err: any) {
        setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
      <div className="px-6">
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Submit a Ticket</h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Facing an issue or have a suggestion? We're here to help.
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 md:p-12 rounded-lg shadow-lg">
              {success ? (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-6">
                     <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Thank You!</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Your ticket has been submitted successfully. Our team will review it and get back to you if necessary.</p>
                  <Link to="/" className="mt-6 inline-block bg-brand-red text-white font-bold py-2 px-6 rounded-md">Back to Home</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-6">{error}</p>}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Email</label>
                      <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required={!auth.currentUser} disabled={!!auth.currentUser} className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800" />
                    </div>
                    <div>
                        <label htmlFor="problemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What is this about?</label>
                        <select id="problemType" value={problemType} onChange={e => setProblemType(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red">
                            <option>Tool Not Working</option>
                            <option>Visual Bug/Glitch</option>
                            <option>Login/Account Issue</option>
                            <option>Payment Problem</option>
                            <option>Feature Request</option>
                            <option>General Feedback</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page URL (optional)</label>
                       <div className="relative">
                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LinkIcon className="h-5 w-5 text-gray-400" /></div>
                           <input type="url" id="url" name="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://pdfbullet.com/merge-pdf" className="w-full pl-10 pr-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red" />
                       </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description*</label>
                      <textarea id="description" name="description" rows={5} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Please describe the issue in as much detail as possible..." className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red"></textarea>
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <button type="submit" disabled={isLoading} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-10 rounded-md transition-colors text-lg disabled:bg-red-300 dark:disabled:bg-red-800 flex items-center justify-center gap-2 w-full sm:w-auto mx-auto">
                        <PaperAirplaneIcon className="h-5 w-5" />
                        {isLoading ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                </form>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitTicketPage;