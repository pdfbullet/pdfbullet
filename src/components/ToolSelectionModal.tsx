import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import { useI18n } from '../contexts/I18nContext.tsx';
import { CloseIcon } from './icons.tsx';

interface ToolSelectionModalProps {
  files: File[];
  isOpen: boolean;
  onClose: () => void;
}

const getCompatibleTools = (files: File[]): Tool[] => {
    if (!files || files.length === 0) return [];

    const firstFile = files[0];
    const mimeType = firstFile.type;
    const isPdf = mimeType === 'application/pdf';

    return TOOLS.filter(tool => {
        // Exclude tools that don't process files or are purely informational/generators
        if (!tool.api || !tool.category || ['business'].includes(tool.category)) {
            return false;
        }

        // For multiple files, only allow tools that can handle multiple files
        if (files.length > 1 && !['merge-pdf', 'jpg-to-pdf', 'zip-maker'].includes(tool.id)) {
            return false;
        }

        if (!tool.accept) {
            // If no `accept` is defined, assume it's a PDF tool
            return isPdf;
        }

        // An empty accept object means it can accept any file (like zip-maker)
        if (Object.keys(tool.accept).length === 0) {
            return true;
        }

        const acceptedTypes = Object.keys(tool.accept);
        return acceptedTypes.some(acceptedType => {
            if (acceptedType === mimeType) return true;
            if (acceptedType.endsWith('/*')) { // Wildcard like 'image/*'
                return mimeType.startsWith(acceptedType.slice(0, -1));
            }
            return false;
        });
    });
};

const ToolSelectionModal: React.FC<ToolSelectionModalProps> = ({ files, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { t } = useI18n();
    const compatibleTools = useMemo(() => getCompatibleTools(files), [files]);

    const handleToolSelect = (tool: Tool) => {
        navigate(`/${tool.id}`, { state: { files } });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-black w-full max-w-lg rounded-lg shadow-xl" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Choose a tool to continue</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <CloseIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </header>
                <main className="p-4 max-h-[60vh] overflow-y-auto">
                    {compatibleTools.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {compatibleTools.map(tool => (
                                <button 
                                    key={tool.id} 
                                    onClick={() => handleToolSelect(tool)}
                                    className="flex items-center gap-4 p-4 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    <div className={`p-2 rounded-md ${tool.color}`}>
                                        <tool.Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{t(tool.title)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t(tool.description)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-gray-500">
                            <p>No compatible tools found for the selected file type.</p>
                            <p className="text-sm mt-2">{`File type: ${files[0]?.type || 'Unknown'}`}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ToolSelectionModal;
