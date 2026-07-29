import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, GridIcon, SettingsIcon, StorageIcon } from './icons.tsx';

const NavItem: React.FC<{ to: string; icon: React.FC<any>; label: string }> = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to === '/articles' && location.pathname.startsWith('/blog'));
    
    return (
        <Link 
            to={to} 
            className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-100 active:scale-95 origin-center group rounded-lg ${
                isActive 
                    ? 'text-brand-red' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-brand-red'
            }`}
        >
            {isActive && <div className="absolute top-1.5 h-1.5 w-1.5 rounded-full bg-brand-red" style={{ animation: 'pop-in 0.3s ease-out' }}></div>}
            <Icon className="h-6 w-6 mb-1 transition-transform group-active:scale-90" />
            <span className={`text-xs transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </Link>
    );
};

const PwaBottomNav: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full transform-gpu translate-z-0 select-none pb-[env(safe-area-inset-bottom)] bg-white/80 dark:bg-black/75 backdrop-blur-xl border-t border-gray-150 dark:border-gray-800 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)]">
            <nav className="h-[64px] flex items-center justify-around w-full px-2">
                <div className="w-1/5 flex justify-center"><NavItem to="/" icon={HomeIcon} label="Home" /></div>
                <div className="w-1/5 flex justify-center"><NavItem to="/tools" icon={GridIcon} label="Tools" /></div>
                
                {/* Spacer for the central button */}
                <div className="w-1/5"></div>
                
                <div className="w-1/5 flex justify-center"><NavItem to="/storage" icon={StorageIcon} label="Storage" /></div>
                <div className="w-1/5 flex justify-center"><NavItem to="/settings" icon={SettingsIcon} label="More" /></div>
            </nav>
            
            {/* Central Floating Action Button */}
            <div className="absolute left-1/2 -top-4 -translate-x-1/2 text-center z-50">
                <Link
                    to="/remove-background"
                    aria-label="Remove Background"
                    className="w-14 h-14 bg-brand-red text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 border-2 border-white dark:border-gray-900"
                >
                    <img
                        src="/apple-touch-icon.png"
                        alt="BG Remover"
                        className="w-9 h-9 rounded-full object-cover"
                    />
                </Link>
                <span className="block text-[10px] font-bold text-gray-700 dark:text-gray-200 mt-1">
                    BG Remover
                </span>
            </div>
        </div>
    );
};

export default PwaBottomNav;