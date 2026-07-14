import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { CheckIcon, PaperAirplaneIcon } from '../../components/icons.tsx';

const SubmitTicketView: React.FC = () => {
    const { auth, submitProblemReport } = useAuth();
    
    const [description, setDescription] = useState('');
    const [problemType, setProblemType] = useState('Flipbook Issue');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
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
            setDescription('');
            setProblemType('Flipbook Issue');
        } catch (err: any) {
            setError(err.message || 'Failed to submit ticket. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Submit a Ticket</h1>
            <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-8 rounded-lg shadow-xl max-w-2xl">
                {success ? (
                    <div className="text-center py-8">
                        <CheckIcon className="h-16 w-16 mx-auto text-green-400 mb-4" />
                        <h3 className="text-xl font-bold text-white dark:text-gray-100">Ticket Submitted Successfully!</h3>
                        <p className="text-gray-200 dark:text-gray-300 mt-2">Our support team will get back to you as soon as possible.</p>
                        <button onClick={() => setSuccess(false)} className="mt-6 bg-brand-red text-white font-bold py-2 px-6 rounded-md">Submit Another Ticket</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="problemType" className="block text-sm font-bold mb-1 text-white dark:text-gray-200">What is this about?</label>
                            <select id="problemType" value={problemType} onChange={e => setProblemType(e.target.value)} className="w-full p-2 bg-white/50 dark:bg-black/50 border border-gray-400 dark:border-gray-500 rounded-md text-white dark:text-gray-100">
                                <option>Flipbook Issue</option>
                                <option>Billing Question</option>
                                <option>Account Problem</option>
                                <option>General Feedback</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold mb-1 text-white dark:text-gray-200">Please describe the issue in detail*</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} required className="w-full p-2 bg-white/50 dark:bg-black/50 border border-gray-400 dark:border-gray-500 rounded-md text-white dark:text-gray-100" />
                        </div>
                        {error && <div className="text-sm text-red-500 bg-red-900/20 p-3 rounded-md">{error}</div>}
                        <div className="flex justify-end">
                            <button type="submit" disabled={isLoading || !description.trim()} className="flex items-center gap-2 bg-brand-red text-white font-bold py-2 px-6 rounded-md disabled:bg-red-300 hover:bg-brand-red-dark">
                                <PaperAirplaneIcon className="h-5 w-5"/>
                                {isLoading ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SubmitTicketView;