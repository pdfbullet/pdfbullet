import React, { useState, useEffect } from 'react';
import { StarIcon, PaperAirplaneIcon, CheckIcon } from './icons.tsx';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { rating: number; message: string }) => Promise<void>;
}

const ratingLabels: { [key: number]: string } = {
    0: 'How would you rate us?',
    1: 'Poor',
    2: 'Not good',
    3: 'Average',
    4: 'Good',
    5: 'Excellent!',
};

const StarRating: React.FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({ rating, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-2 star-button transition-transform duration-200"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <StarIcon className={`h-10 w-10 transition-colors duration-200 ${
                            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`} />
                    </button>
                ))}
            </div>
            <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mt-3 h-5">
                {ratingLabels[hoverRating || rating]}
            </p>
        </div>
    );
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await onSubmit({ rating, message });
            setSubmitted(true);
        } catch (e) {
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (submitted) {
            const timer = setTimeout(() => {
                onClose();
                // Reset for next time after modal closes
                setTimeout(() => {
                    setSubmitted(false);
                    setRating(0);
                    setMessage('');
                }, 300);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [submitted, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in-down">
            <div className="feedback-modal-bg w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {submitted ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-80">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                               <svg className="success-checkmark h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Thank you for your feedback!</h2>
                    </div>
                ) : (
                    <>
                        <div className="p-8 space-y-6">
                             <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">How was your experience?</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your feedback helps us improve PDFBullet.</p>
                            </div>
                            <StarRating rating={rating} onRatingChange={setRating} />
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                placeholder="Tell us more about what you liked or what could be improved..."
                                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand-red focus:border-transparent transition-shadow"
                            />
                            {error && <p className="text-sm text-red-500 text-center -mt-4">{error}</p>}
                        </div>
                        <div className="p-4 bg-gray-100/50 dark:bg-gray-900/50 flex justify-end gap-4">
                            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                Skip
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 w-32 px-6 py-2 text-sm font-bold bg-brand-red text-white rounded-md hover:bg-brand-red-dark disabled:bg-red-300 transition-colors"
                            >
                                {isSubmitting ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                    <PaperAirplaneIcon className="h-5 w-5"/>
                                    Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;