import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, GridIcon, SettingsIcon, StorageIcon } from './icons.tsx';

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
            <nav className="absolute bottom-0 left-0 right-0 h-[72px] bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex items-center justify-around pointer-events-auto">
                <div className="w-1/5 flex justify-center"><NavItem to="/" icon={HomeIcon} label="Home" /></div>
                <div className="w-1/5 flex justify-center"><NavItem to="/tools" icon={GridIcon} label="Tools" /></div>
                
                {/* Spacer for the central button */}
                <div className="w-1/5"></div>
                
                <div className="w-1/5 flex justify-center"><NavItem to="/storage" icon={StorageIcon} label="Storage" /></div>
                <div className="w-1/5 flex justify-center"><NavItem to="/settings" icon={SettingsIcon} label="More" /></div>
            </nav>
            
            {/* Central Floating Action Button */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 text-center pointer-events-auto">
                <Link
                    to="/remove-background"
                    className="inline-block w-16 h-16 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 bg-brand-red"
                    aria-label="Remove Background"
                >
                    <img src="https://ik.imagekit.io/fonepay/bg%20remove%20icon.png?updatedAt=1760067581051" alt="BG Remover" className="w-full h-full object-cover rounded-full" />
                </Link>
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mt-1 pointer-events-none">
                    BG Remover
                </span>
            </div>
        </div>
    );
};

export default PwaBottomNav;