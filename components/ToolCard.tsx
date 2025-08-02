
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Tool } from '../types.ts';
import { StarIcon, StarOutlineIcon } from './icons.tsx';

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, isFavorite, onToggleFavorite }) => {
  const { id, title, description, Icon, color, isNew, isPremium } = tool;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(id);
  };

  return (
    <Link 
      to={`/${id}`} 
      title={`Open the ${title} tool`}
      className="relative flex flex-row items-center sm:flex-col sm:items-start p-4 sm:p-6 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:hover:-translate-y-1 transition-transform duration-300 group border-glow-hover"
    >
        <div className="flex-shrink-0 sm:w-full sm:flex sm:justify-between sm:items-start">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-7 w-7 text-white" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
                {isPremium && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-600">
                        Premium
                    </span>
                )}
                {isNew && !isPremium && (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-400 dark:bg-red-900/50 dark:text-red-400 dark:border-red-600">
                        New!
                    </span>
                )}
                <button 
                  onClick={handleFavoriteClick} 
                  className="text-gray-300 dark:text-gray-600 hover:text-yellow-400 transition-colors z-10"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFavorite ? (
                        <StarIcon className="h-6 w-6 text-yellow-400" />
                    ) : (
                        <StarOutlineIcon className="h-6 w-6" />
                    )}
                </button>
            </div>
        </div>
      <div className="ml-4 sm:ml-0 flex-grow">
        <h3 className="sm:mt-4 text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed sm:flex-grow">{description}</p>
      </div>
    </Link>
  );
};

export default memo(ToolCard);
