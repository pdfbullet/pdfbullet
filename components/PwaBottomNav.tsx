import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, GridIcon, SettingsIcon, StorageIcon, DocumentScannerIcon } from './icons.tsx';

const NavItem: React.FC<{ to: string; icon: React.FC<any>; label: string }> = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
    
    return (
        <Link 
            to={to} 
            className="flex-1 flex flex-col items-center justify-center p-1 h-full"
            aria-current={isActive ? 'page' : undefined}
        >
            <div className={`flex flex-col items-center justify-center w-full h-full py-1 rounded-2xl transition-all duration-300 ease-in-out ${isActive ? 'bg-white/50 dark:bg-black/20' : 'hover:bg-white/30 dark:hover:bg-black/10'}`}>
                <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-brand-red' : 'text-gray-800 dark:text-gray-300'}`} />
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-brand-red' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
            </div>
        </Link>
    );
};

const PwaBottomNav: React.FC = () => {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-2rem)] sm:max-w-sm z-50 pointer-events-auto">
            <nav className="h-20 bg-gray-200/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl flex items-center justify-around p-2">
                <NavItem to="/" icon={HomeIcon} label="Home" />
                <NavItem to="/storage" icon={StorageIcon} label="Files" />
                <NavItem to="/tools" icon={GridIcon} label="Tools" />
                <NavItem to="/document-scanner" icon={DocumentScannerIcon} label="Scanner" />
                <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
            </nav>
        </div>
    );
};

export default PwaBottomNav;