import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '../components/icons.tsx';
import { useUserPackages } from '../hooks/useUserPackages.ts';

const PlansAndPackagesPage: React.FC = () => {
    const { packages } = useUserPackages();

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Plans and packages</h1>
                <Link
                    to="/pricing"
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                >
                    <StarIcon className="h-5 w-5" />
                    <span>Upgrade to Premium</span>
                </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Subscription Details Card */}
                <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Subscription details</h2>
                    <div className="flex-grow text-gray-600 dark:text-gray-400">
                        <p>
                            Get full access to all iLovePDFLY features. Enjoy simple and fast PDF tools to convert, edit and e-sign your documents.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Link to="/pricing" className="text-brand-red font-semibold hover:underline">
                            Upgrade to Premium
                        </Link>
                    </div>
                </div>

                {/* Packages Card */}
                <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Packages</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-600 dark:text-gray-400">Signatures: <span className="font-bold text-gray-800 dark:text-gray-100">{packages.signatures}</span></p>
                            <Link to="/pricing" className="text-brand-red font-semibold hover:underline">
                                Add more
                            </Link>
                        </div>
                        <div className="flex justify-between items-center">
                             <p className="text-gray-600 dark:text-gray-400">SMS: <span className="font-bold text-gray-800 dark:text-gray-100">{packages.sms}</span></p>
                            <Link to="/pricing" className="text-brand-red font-semibold hover:underline">
                                Add more
                            </Link>
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        Packages do not expire.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlansAndPackagesPage;
