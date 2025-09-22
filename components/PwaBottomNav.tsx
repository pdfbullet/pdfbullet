import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, GridIcon, SettingsIcon, NewspaperIcon } from './icons.tsx';

const NavItem: React.FC<{ to: string; icon: React.FC<any>; label: string }> = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to === '/articles' && location.pathname.startsWith('/blog'));
    
    return (
        <Link 
            to={to} 
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
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
        <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 flex items-center justify-around z-50">
            <NavItem to="/" icon={HomeIcon} label="Home" />
            <NavItem to="/tools" icon={GridIcon} label="Tools" />
            <NavItem to="/articles" icon={NewspaperIcon} label="Articles" />
            <NavItem to="/settings" icon={SettingsIcon} label="More" />
        </nav>
    );
};

export default PwaBottomNav;