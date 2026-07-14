import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, GridIcon, SettingsIcon, StorageIcon } from './icons.tsx';

const NavItem: React.FC<{ to: string; icon: React.FC<any>; label: string }> = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to === '/articles' && location.pathname.startsWith('/blog'));
    
    return (
        <Link 
            to={to} 
            className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200 group rounded-lg ${
                isActive 
                    ? 'text-brand-red' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-brand-red'
            }`}
        >
            {isActive && <div className="absolute top-1.5 h-1.5 w-1.5 rounded-full bg-brand-red" style={{ animation: 'pop-in 0.3s ease-out' }}></div>}
            <Icon className="h-6 w-6 mb-1" />
            <span className={`text-xs transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </Link>
    );
};

const PwaBottomNav: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-[60px] z-50 pointer-events-none">
            <nav className="absolute bottom-0 left-0 right-0 h-[60px] bg-white/70 dark:bg-black/60 backdrop-blur-lg flex items-stretch justify-around pointer-events-auto shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.3)]">
                <div className="w-1/5 flex justify-center p-1.5"><NavItem to="/" icon={HomeIcon} label="Home" /></div>
                <div className="w-1/5 flex justify-center p-1.5"><NavItem to="/tools" icon={GridIcon} label="Tools" /></div>
                
                {/* Spacer for the central button */}
                <div className="w-1/5"></div>
                
                <div className="w-1/5 flex justify-center p-1.5"><NavItem to="/storage" icon={StorageIcon} label="Storage" /></div>
                <div className="w-1/5 flex justify-center p-1.5"><NavItem to="/settings" icon={SettingsIcon} label="More" /></div>
            </nav>
            
            {/* Central Floating Action Button */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto">
                <Link
                    to="/remove-background"
                    aria-label="Remove Background"
                    className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 border-2 border-black dark:border-white"
                >
                    <img
                        src="https://ik.imagekit.io/fixedmyspeaker/IMG_0865.gif?updatedAt=1762718107389"
                        alt="BG Remover"
                        className="w-10 h-10 rounded-full"
                    />
                </Link>
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mt-1 pointer-events-none">
                    BG Remover
                </span>
            </div>
        </div>
    );
};

export default PwaBottomNav;