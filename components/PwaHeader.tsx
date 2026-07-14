import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePwaLayout } from '../contexts/PwaLayoutContext.tsx';
import { SearchIcon, BellIcon, UserCircleIcon, CameraIcon, LogoutIcon, StarIcon } from './icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';

interface PwaHeaderProps {
  onOpenSearchModal: () => void;
  unreadCount: number;
  justReceivedNotification: boolean;
  onNotificationAnimationEnd: () => void;
  onOpenProfileImageModal: () => void;
  onOpenChangePasswordModal: () => void;
  onAdminAccessRequest: () => void;
}

const PwaHeader: React.FC<PwaHeaderProps> = ({ onOpenSearchModal, unreadCount, justReceivedNotification, onNotificationAnimationEnd, onOpenProfileImageModal, onAdminAccessRequest }) => {
  const { title } = usePwaLayout();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const [isShaking, setIsShaking] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);

  const isPremium = user?.isToolsPremium || user?.isFlipbookPremium;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const closeMenu = () => setProfileMenuOpen(false);

  const handleHeaderTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) { // 300ms threshold for a double tap
      onAdminAccessRequest();
    }
    lastTap.current = now;
  };

  return (
    <header className="fixed top-[env(safe-area-inset-top)] left-0 right-0 h-[60px] bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4" onClick={handleHeaderTap}>
      <div className="flex items-center gap-3">
        <div className="relative" ref={profileMenuRef}>
          <button onClick={() => setProfileMenuOpen(p => !p)} className={`flex-shrink-0 block h-9 w-9 rounded-full overflow-hidden transition ${isPremium ? 'pwa-header-avatar-premium' : 'border-2 border-transparent hover:border-brand-red'}`}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserCircleIcon className="h-full w-full text-gray-500 dark:text-gray-400" />
            )}
          </button>
          {isProfileMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {user ? t('header.signed_in_as') : 'Browsing as Guest'}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user ? user.username : 'Guest'}
                </p>
              </div>
              {user ? (
                <>
                  <div className="py-1">
                    <button onClick={() => { onOpenProfileImageModal(); closeMenu(); }} title={t('header.change_photo')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                      <CameraIcon className="h-5 w-5" />
                      <span>{t('header.change_photo')}</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                    <button onClick={() => { logout(); closeMenu(); }} title={t('header.logout')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                      <LogoutIcon className="h-5 w-5" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-1">
                  <button onClick={() => { localStorage.removeItem('guest_mode'); window.location.reload(); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                    <UserCircleIcon className="h-5 w-5" />
                    <span>Log In / Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{title}</h1>
          {user && (
            <p className={`text-xs font-semibold flex items-center gap-1 ${isPremium
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400'
              }`}>
              {isPremium && <StarIcon className="h-3 w-3 text-yellow-400" />}
              Welcome, {user.username}!
            </p>
          )}
        </div>
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