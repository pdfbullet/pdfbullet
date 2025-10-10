import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Tool } from '../types.ts';
import { StarIcon, StarOutlineIcon } from './icons.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
  filesToPass?: File[];
  disabled?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, isFavorite, onToggleFavorite, filesToPass, disabled }) => {
  const { id, title, description, Icon, isNew, isPremium, textColor } = tool;
  const { t } = useI18n();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onToggleFavorite(id);
  };
  
  const cardContent = (
      <>
        <button 
          onClick={handleFavoriteClick} 
          className="absolute top-2 right-2 text-gray-300 dark:text-gray-600 hover:text-yellow-400 transition-colors z-10 p-1 opacity-50 group-hover:opacity-100"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          disabled={disabled}
        >
            {isFavorite ? (
                <StarIcon className="h-5 w-5 text-yellow-400" />
            ) : (
                <StarOutlineIcon className="h-5 w-5" />
            )}
        </button>

        <div className="flex-shrink-0">
            <Icon className={`h-10 w-10 sm:h-12 sm:w-12 ${textColor}`} />
        </div>

      <div className="flex flex-col flex-grow mt-2 sm:mt-3 overflow-hidden">
        <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100">{t(title)}</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
            {t(description)}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        {isPremium && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-600">
                Premium
            </span>
        )}
        {isNew && !isPremium && (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-400 dark:bg-red-900/50 dark:text-red-400 dark:border-red-600">
                New!
            </span>
        )}
      </div>
    </>
  );

  const baseClassName = "relative flex flex-col items-start p-3 sm:p-4 bg-white dark:bg-surface-dark border border-gray-400 dark:border-gray-800 rounded-xl shadow-sm h-40 sm:h-48 transition-all duration-300 group";

  if (disabled) {
    return (
        <div className={`${baseClassName} opacity-50 cursor-not-allowed`} title={`${t(title)} (incompatible with selected files)`}>
            {cardContent}
        </div>
    );
  }

  return (
    <Link 
      to={`/${id}`} 
      state={filesToPass ? { files: filesToPass } : undefined}
      title={`Open the ${t(title)} tool`}
      className={`${baseClassName} hover:shadow-lg hover:-translate-y-1 hover:border-gray-900/30 dark:hover:border-gray-300/30`}
    >
      {cardContent}
    </Link>
  );
};

export default memo(ToolCard);