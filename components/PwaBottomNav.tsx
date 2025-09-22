import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, GridIcon, SettingsIcon, NewspaperIcon, ScanToPdfIcon } from './icons.tsx';

const NavItem: React.FC<{ to: string; icon: React.FC<any>; label: string }> = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to === '/articles' && location.pathname.startsWith('/blog'));
    
    return (
        <Link 
            to={to} 
            className={`flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-colors duration-200 ${
                isActive ? 'text-brand-red' : 'text-gray-500 dark:text-gray-400 hover:text-brand-red'
            }`}
        >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </Link>
    );
};

const PwaBottomNav: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-[72px] z-50 pointer-events-none">
            {/* The main nav bar */}
            <nav className="absolute bottom-0 left-0 right-0 h-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 flex items-center justify-around z-0 pointer-events-auto">
                <div className="w-1/5 flex justify-center"><NavItem to="/" icon={HomeIcon} label="Home" /></div>
                <div className="w-1/5 flex justify-center"><NavItem to="/tools" icon={GridIcon} label="Tools" /></div>
                
                {/* Spacer for the central button */}
                <div className="w-1/5"></div>
                
                <div className="w-1/5 flex justify-center"><NavItem to="/articles" icon={NewspaperIcon} label="Articles" /></div>
                <div className="w-1/5 flex justify-center"><NavItem to="/settings" icon={SettingsIcon} label="More" /></div>
            </nav>
            
            {/* Central Floating Action Button */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 text-center pointer-events-auto">
                 <Link 
                    to="/scan-to-pdf" 
                    className="inline-flex items-center justify-center w-16 h-16 bg-brand-red rounded-full shadow-lg text-white transform hover:scale-110 transition-transform"
                    aria-label="Scan Document"
                >
                    <ScanToPdfIcon className="h-8 w-8" />
                </Link>
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mt-1">Scan</span>
            </div>
        </div>
    );
};

export default PwaBottomNav;