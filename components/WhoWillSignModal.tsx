import React from 'react';

interface WhoWillSignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOnlyMe: () => void;
    onSeveralPeople: () => void;
}

const WhoWillSignModal: React.FC<WhoWillSignModalProps> = ({ isOpen, onClose, onOnlyMe, onSeveralPeople }) => {
    if (!isOpen) return null;

    const Card: React.FC<{ title: string; description: string; imgSrc: string; onClick: () => void; }> = ({ title, description, imgSrc, onClick }) => (
        <button
            onClick={onClick}
            className="flex flex-col items-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full sm:w-64 text-center"
        >
            <img src={imgSrc} alt={title} className="h-24 w-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </button>
    );

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="who-will-sign-title"
        >
            <div 
                className="bg-white dark:bg-black w-full max-w-2xl rounded-lg shadow-xl p-8" 
                onClick={e => e.stopPropagation()}
            >
                <h2 id="who-will-sign-title" className="text-2xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-8">
                    Who will sign this document?
                </h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                    <Card
                        title="Only me"
                        description="Sign this document"
                        imgSrc="https://www.ilovepdf.com/img/sign/single.svg"
                        onClick={onOnlyMe}
                    />
                    <Card
                        title="Several people"
                        description="Invite others to sign"
                        imgSrc="https://www.ilovepdf.com/img/sign/multiple.svg"
                        onClick={onSeveralPeople}
                    />
                </div>
            </div>
        </div>
    );
};

export default WhoWillSignModal;
