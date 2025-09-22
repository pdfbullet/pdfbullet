import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useI18n } from '../contexts/I18nContext.tsx';
import { RefreshIcon } from '../components/icons.tsx';

const PwaHomePage: React.FC = () => {
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { t } = useI18n();

    const quickActionTools = useMemo(() => {
        const toolIds = ['merge-pdf', 'compress-pdf', 'jpg-to-pdf', 'sign-pdf'];
        return TOOLS.filter(tool => toolIds.includes(tool.id));
    }, []);

    return (
        <div className="p-4 sm:p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                    Welcome{user ? `, ${user.username}` : ''}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">What would you like to do today?</p>
            </div>

            <section>
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    {quickActionTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Recent Activity</h2>
                    <Link to="/last-tasks" className="text-sm font-semibold text-brand-red hover:underline">View All</Link>
                </div>
                <div className="bg-white dark:bg-black p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
                    <RefreshIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>Your recently processed files will appear here.</p>
                </div>
            </section>
            
            <section>
                <h2 className="text-xl font-bold mb-4">Explore</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/tools" className="block p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200">All Tools</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Browse the complete suite of over 40 PDF and image tools.</p>
                    </Link>
                     <Link to="/blog" className="block p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h3 className="font-bold text-green-800 dark:text-green-200">Tips & Tricks</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">Read our blog for guides and updates to boost your productivity.</p>
                    </Link>
                 </div>
            </section>
        </div>
    );
};

export default PwaHomePage;
