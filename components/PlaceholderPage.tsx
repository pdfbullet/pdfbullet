import React from 'react';
import { Link } from 'react-router-dom';

const PlaceholderPage: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => {
    return (
        <div className="w-full">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">{title}</h1>
            <div className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 text-center">
                {children || (
                    <>
                        <p className="text-xl text-gray-600 dark:text-gray-400">This feature is coming soon!</p>
                        <p className="mt-2 text-gray-500">We're working hard to bring you this functionality. Stay tuned for updates.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlaceholderPage;
