import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { StarIcon, DollarIcon } from '../components/icons.tsx';
import { useUserPackages } from '../hooks/useUserPackages.ts';
import PurchaseSignaturesModal from '../components/PurchaseSignaturesModal.tsx';

const PlansAndPackagesPage: React.FC = () => {
    const { user } = useAuth();
    const { packages } = useUserPackages();
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    const handlePurchaseComplete = () => {
        // The hook will update the state, we just need to close the modal
        setIsPurchaseModalOpen(false);
    };

    return (
        <>
            <div className="w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Plans and packages</h1>
                </div>

                <div className="space-y-8">
                    {/* My Subscriptions Card */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">My Subscriptions</h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Tools Plan</p>
                                    <p className={`text-sm font-semibold ${user?.isToolsPremium ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {user?.isToolsPremium ? 'Premium Active' : 'Free Plan'}
                                    </p>
                                </div>
                                <Link to="/pricing" className="text-brand-red font-semibold hover:underline">Manage</Link>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Flipbook Plan</p>
                                    <p className={`text-sm font-semibold ${user?.isFlipbookPremium ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {user?.isFlipbookPremium ? 'Premium Active' : 'Free Plan'}
                                    </p>
                                </div>
                                <Link to="/pricing" className="text-brand-red font-semibold hover:underline">Manage</Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Packages Card */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <DollarIcon className="h-6 w-6"/>
                            Packages
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600 dark:text-gray-300">Signatures:</p>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{packages.signatures} available</span>
                                    <button onClick={() => setIsPurchaseModalOpen(true)} className="text-brand-red font-semibold hover:underline">
                                        Add more
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600 dark:text-gray-300">SMS Verifications:</p>
                                 <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{packages.sms} available</span>
                                    <button onClick={() => alert('Coming soon!')} className="text-brand-red font-semibold hover:underline">
                                        Add more
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                            Packages do not expire.
                        </p>
                    </div>
                </div>
            </div>
            <PurchaseSignaturesModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onPurchaseComplete={() => handlePurchaseComplete()}
            />
        </>
    );
};

export default PlansAndPackagesPage;