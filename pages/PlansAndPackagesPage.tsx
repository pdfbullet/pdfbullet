import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage.tsx';
import { Link } from 'react-router-dom';

const PlansAndPackagesPage: React.FC = () => {
    return (
        <PlaceholderPage title="Plans & Packages">
            <p className="text-xl text-gray-600 dark:text-gray-400">View and manage your subscriptions.</p>
            <p className="mt-2 text-gray-500">You can see all available plans on our pricing page.</p>
            <Link to="/pricing" className="inline-block mt-4 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
                View Pricing
            </Link>
        </PlaceholderPage>
    );
};

export default PlansAndPackagesPage;
