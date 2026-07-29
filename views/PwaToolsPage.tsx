import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { Tool } from '../types.ts';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useI18n } from '../contexts/I18nContext.tsx';
import { ChevronDownIcon, GridIcon, OrganizeIcon, CompressIcon, RefreshIcon, EditIcon, LockIcon, ImageIcon, BriefcaseIcon, ChevronUpIcon } from '../components/icons.tsx';
import { usePwaLayout } from '../contexts/PwaLayoutContext.tsx';

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { isFavorite, toggleFavorite, favorites } = useFavorites();
    const { t } = useI18n();
    const { setTitle } = usePwaLayout();

    useEffect(() => {
        setTitle('All Tools');
    }, [setTitle]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const favoriteTools = useMemo(() => TOOLS.filter(tool => isFavorite(tool.id)), [favorites]);
    const otherTools = useMemo(() => TOOLS.filter(tool => !isFavorite(tool.id)), [isFavorite]);

    const imageToolIds = useMemo(() => new Set(TOOLS.filter(t => t.api?.category === 'image' || ['jpg-to-pdf', 'psd-to-pdf', 'pdf-to-jpg', 'pdf-to-png', 'scan-to-pdf'].includes(t.id)).map(t => t.id)), []);

    const filterCategories = [
        { labelKey: 'homepage.filter_all', category: 'All', icon: GridIcon },
        { labelKey: 'homepage.filter_organize', category: 'organize', icon: OrganizeIcon },
        { labelKey: 'homepage.filter_optimize', category: 'optimize', icon: CompressIcon },
        { labelKey: 'homepage.filter_convert', category: 'convert', icon: RefreshIcon },
        { labelKey: 'homepage.filter_edit', category: 'edit', icon: EditIcon },
        { labelKey: 'homepage.filter_security', category: 'security', icon: LockIcon },
        { labelKey: 'Image Tools', category: 'image', icon: ImageIcon },
        { labelKey: 'Business & AI', category: 'business', icon: BriefcaseIcon },
    ];

    const handleCategoryClick = (category: string) => {
      setActiveCategory(category);
      setIsDropdownOpen(false);
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

        return tools;
    }, [activeCategory, favoriteTools, otherTools, imageToolIds]);
    
    const handleClearFiles = () => {
        navigate(location.pathname, { replace: true, state: {} });
    };

    const currentCategory = filterCategories.find(c => c.category === activeCategory);
    const currentCategoryLabel = currentCategory ? (currentCategory.labelKey === 'Business & AI' || currentCategory.labelKey === 'Image Tools' ? currentCategory.labelKey : t(currentCategory.labelKey)) : 'All Tools';
    const CurrentCategoryIcon = currentCategory?.icon || GridIcon;

    return (
        <div className="p-4 sm:p-6 overscroll-none">
            
            {files && (
                <div className="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200">{files.length} File(s) Selected</h3>
                        <button onClick={handleClearFiles} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-sm">Clear</button>
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside max-h-24 overflow-y-auto">
                        {files.map((file, index) => <li key={index} className="truncate">{file.name}</li>)}
                    </ul>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 font-semibold">Select a tool to continue.</p>
                </div>
            )}

            <div className="pt-4 pb-4 sticky top-[60px] bg-creamy/90 dark:bg-soft-dark/90 backdrop-blur-md z-20 -mx-4 px-4 shadow-sm border-b border-gray-200/50 dark:border-gray-800/50">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">All Tools</h1>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="w-full flex justify-between items-center px-4 py-3 text-base font-bold rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-red shadow-sm"
                        aria-haspopup="listbox"
                        aria-expanded={isDropdownOpen}
                    >
                        <span className="flex items-center gap-3">
                            <CurrentCategoryIcon className={`h-6 w-6 ${currentCategory?.category === activeCategory ? 'text-red-500' : 'text-gray-500'}`} />
                            {currentCategoryLabel}
                        </span>
                        {isDropdownOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
                    </button>

                    <div
                        className={`absolute top-full left-0 right-0 mt-2 z-20 transition-all duration-200 ease-out origin-top ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                    >
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 grid grid-cols-2 gap-1">
                            {filterCategories.map(({ labelKey, category, icon: Icon }) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`flex items-center gap-3 p-3 rounded-md text-sm font-semibold text-left transition-colors ${
                                        activeCategory === category
                                            ? 'bg-red-50 dark:bg-red-900/30 text-brand-red'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{labelKey === 'Business & AI' || labelKey === 'Image Tools' ? labelKey : t(labelKey)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
                {filteredTools.length > 0 ? filteredTools.map((tool) => {
                    const isIncompatible = files ? !areFilesCompatible(tool, files) : false;
                    return (
                        <div key={tool.id}>
                            <ToolCard tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} disabled={isIncompatible} />
                        </div>
                    );
                }) : (
                    <p className="col-span-full text-center text-gray-500 py-10">No tools found for this category.</p>
                )}
            </div>
        </div>
    );
};

export default PwaToolsPage;