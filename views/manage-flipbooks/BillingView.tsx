import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { StarIcon, DollarIcon, InvoiceIcon } from '../../components/icons.tsx';
import { useUserPackages } from '../../hooks/useUserPackages.ts';

const BillingView: React.FC = () => {
    const { user } = useAuth();
    const { packages } = useUserPackages();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Billing</h1>
            <div className="space-y-6">
                {/* Subscription Card */}
                <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white dark:text-gray-100">Your Current Plan</h2>
                            <p className="mt-2 text-3xl font-extrabold text-white dark:text-white">
                                {(user?.isToolsPremium || user?.isFlipbookPremium) ? (
                                    <span className="text-yellow-400">Premium</span>
                                ) : (
                                    'Free'
                                )}
                            </p>
                            <p className="text-gray-200 dark:text-gray-300">
                                {(user?.isToolsPremium || user?.isFlipbookPremium) ? 'You have access to all features.' : 'Upgrade for unlimited access and more features.'}
                            </p>
                        </div>
                        <div>
                            <Link
                                to="/pricing"
                                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-6 rounded-md transition-colors"
                            >
                                <StarIcon className="h-5 w-5" />
                                <span>{(user?.isToolsPremium || user?.isFlipbookPremium) ? 'Manage Subscription' : 'Upgrade Plan'}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Packages & Invoices */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-8 rounded-lg shadow-xl">
                        <h2 className="text-xl font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
                            <DollarIcon className="h-6 w-6"/>
                            Packages
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-200 dark:text-gray-300">Signatures:</p>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-white dark:text-gray-100">{packages.signatures} available</span>
                                    <button onClick={() => alert('Coming soon!')} className="text-brand-red font-semibold hover:underline">
                                        Add more
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-200 dark:text-gray-300">SMS Verifications:</p>
                                 <div className="flex items-center gap-4">
                                    <span className="font-bold text-white dark:text-gray-100">{packages.sms} available</span>
                                    <button onClick={() => alert('Coming soon!')} className="text-brand-red font-semibold hover:underline">
                                        Add more
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Link to="/plans-packages" className="block text-center mt-4 bg-black/10 dark:bg-white/10 font-semibold py-2 px-4 rounded-md hover:bg-black/20 dark:hover:bg-white/20 text-white dark:text-gray-100">
                            Manage Packages
                        </Link>
                    </div>
                    <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-8 rounded-lg shadow-xl">
                        <h2 className="text-xl font-bold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
                            <InvoiceIcon className="h-6 w-6"/>
                            Invoice History
                        </h2>
                        <p className="text-gray-200 dark:text-gray-300 mb-4">
                            View and download your past invoices for your records.
                        </p>
                        <Link to="/invoices" className="block text-center mt-4 bg-black/10 dark:bg-white/10 font-semibold py-2 px-4 rounded-md hover:bg-black/20 dark:hover:bg-white/20 text-white dark:text-gray-100">
                            View Invoices
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BillingView;