
import React, { useState, useMemo } from 'react';
import { TOOLS } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

const PwaToolsPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const { isFavorite, toggleFavorite } = useFavorites();
    const { t } = useI18n();

    const favoriteTools = useMemo(() => TOOLS.filter(tool => isFavorite(tool.id)), [isFavorite]);
    const otherTools = useMemo(() => TOOLS.filter(tool => !isFavorite(tool.id)), [isFavorite]);

    const imageToolIds = useMemo(() => new Set(TOOLS.filter(t => t.api?.category === 'image' || ['jpg-to-pdf', 'psd-to-pdf', 'pdf-to-jpg', 'pdf-to-png', 'scan-to-pdf'].includes(t.id)).map(t => t.id)), []);

    const filterCategories = [
        { labelKey: 'homepage.filter_all', category: 'All' },
        { labelKey: 'homepage.filter_organize', category: 'organize' },
        { labelKey: 'homepage.filter_optimize', category: 'optimize' },
        { labelKey: 'homepage.filter_convert', category: 'convert' },
        { labelKey: 'homepage.filter_edit', category: 'edit' },
        { labelKey: 'homepage.filter_security', category: 'security' },
        { labelKey: 'image Tools', category: 'image' },
    ];

    const handleCategoryClick = (category: string) => {
      setActiveCategory(category);
    };

    const filteredTools = useMemo(() => {
        const allTools = [...favoriteTools, ...otherTools];
        if (activeCategory === 'All') return allTools;
        if (activeCategory === 'image') return allTools.filter(tool => imageToolIds.has(tool.id));
        if (activeCategory === 'convert') return allTools.filter(tool => (tool.category === 'convert-to' || tool.category === 'convert-from'));
        return allTools.filter(tool => tool.category === activeCategory);
    }, [activeCategory, favoriteTools, otherTools, imageToolIds]);

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">All Tools</h1>
            
            <div className="pb-4 sticky top-[60px] bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 -mx-4 px-4">
                <div className="overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-start gap-3 w-max">
                        {filterCategories.map(({ labelKey, category }) => (
                            <button
                                key={labelKey}
                                onClick={() => handleCategoryClick(category)}
                                title={`Filter by ${t(labelKey)}`}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                                    activeCategory === category
                                        ? 'bg-gray-900 dark:bg-gray-200 text-white dark:text-black shadow-md'
                                        : 'bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700'
                                }`}
                            >
                                {t(labelKey)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredTools.length > 0 ? filteredTools.map((tool) => (
                    <div key={tool.id}>
                        <ToolCard tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                    </div>
                )) : (
                    <p className="col-span-full text-center text-gray-500 py-10">No tools found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default PwaToolsPage;
