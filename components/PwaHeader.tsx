import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePwaLayout } from '../contexts/PwaLayoutContext.tsx';
import { SearchIcon, BellIcon } from './icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Logo } from './Logo.tsx';

interface PwaHeaderProps {
  onOpenSearchModal: () => void;
  unreadCount: number;
  justReceivedNotification: boolean;
  onNotificationAnimationEnd: () => void;
}

const PwaHeader: React.FC<PwaHeaderProps> = ({ onOpenSearchModal, unreadCount, justReceivedNotification, onNotificationAnimationEnd }) => {
  const { title } = usePwaLayout();
  const { user } = useAuth();
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (justReceivedNotification) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        onNotificationAnimationEnd();
      }, 820); // match animation duration

      return () => clearTimeout(timer);
    }
  }, [justReceivedNotification, onNotificationAnimationEnd]);

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link to="/settings" className="flex-shrink-0">
          {user?.profileImage ? (
             <img src={user.profileImage} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
          ) : (
             <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Logo className="h-6 w-auto" />
             </div>
          )}
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSearchModal}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          aria-label="Search"
          title="Search"
        >
          <SearchIcon className="h-6 w-6" />
        </button>
        <Link 
            to="/notifications" 
            className={`relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full ${isShaking ? 'animate-shake' : ''}`} 
            aria-label="Notifications" 
            title="Notifications"
        >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-brand-red ring-2 ring-white dark:ring-black">
                </span>
            )}
        </Link>
      </div>
    </header>
  );
};

export default PwaHeader;
