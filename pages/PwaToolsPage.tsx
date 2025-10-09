
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { Tool } from '../types.ts';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

const areFilesCompatible = (tool: Tool, files: File[]): boolean => {
    if (!files || files.length === 0) return true;

    // Exclude tools that don't primarily operate on uploaded files.
    if (tool.id === 'document-scanner' || tool.category === 'business') return false;

    const toolAccepts = tool.accept;
    
    if (toolAccepts && Object.keys(toolAccepts).length === 0) return true;

    const effectiveAccept = toolAccepts || (tool.fileTypeDisplayName === 'PDF' ? { 'application/pdf': ['.pdf'] } : null);

    if (!effectiveAccept) return false;

    return files.every(file => {
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
        for (const mimeType in effectiveAccept) {
            const extensions = effectiveAccept[mimeType];
            
            if (mimeType.includes('*')) {
                const baseMime = mimeType.split('/')[0];
                if (file.type.startsWith(baseMime + '/')) {
                    return true;
                }
            }
            if (file.type && file.type === mimeType) {
                return true;
            }
            if (extensions.includes(fileExt)) {
                return true;
            }
        }
        return false;
    });
};

const PwaToolsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const files = (location.state?.files as File[]) || null;

    const [activeCategory, setActiveCategory] = useState<string>('All');
    const { isFavorite, toggleFavorite, favorites } = useFavorites();
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
        let tools = [...favoriteTools, ...otherTools];
        
        if (activeCategory !== 'All') {
            if (activeCategory === 'image') {
                tools = tools.filter(tool => imageToolIds.has(tool.id));
            } else if (activeCategory === 'convert') {
                tools = tools.filter(tool => (tool.category === 'convert-to' || tool.category === 'convert-from'));
            } else {
                tools = tools.filter(tool => tool.category === activeCategory);
            }
        }

        if (files) {
            tools = tools.filter(tool => areFilesCompatible(tool, files));
        }

        return tools;
    }, [activeCategory, favoriteTools, otherTools, imageToolIds, files]);
    
    const handleClearFiles = () => {
        navigate(location.pathname, { replace: true, state: {} });
    };

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">All Tools</h1>
            
            {files && (
                <div className="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200">{files.length} File(s) Selected</h3>
                        <button onClick={handleClearFiles} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-sm">Clear</button>
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside max-h-24 overflow-y-auto">
                        {files.map((file, index) => <li key={index} className="truncate">{file.name}</li>)}
                    </ul>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 font-semibold">Showing compatible tools below. Select a tool to continue.</p>
                </div>
            )}

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
                        <ToolCard tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} filesToPass={files || undefined} />
                    </div>
                )) : (
                    <p className="col-span-full text-center text-gray-500 py-10">No compatible tools found for the selected files.</p>
                )}
            </div>
        </div>
    );
};

export default PwaToolsPage;
