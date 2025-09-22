import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, GridIcon, ScanToPdfIcon, NewspaperIcon, SettingsIcon } from './icons.tsx';

const PwaBottomNav: React.FC = () => {
    const [isPwa, setIsPwa] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // This check determines if the app is running in standalone mode (as a PWA).
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        setIsPwa(isStandalone);

        // If it's a PWA, add padding to the body to prevent the fixed nav bar from overlapping content.
        if (isStandalone) {
            document.body.style.paddingBottom = '72px';
        }
        
        // Cleanup function to remove the padding when the component unmounts.
        return () => {
             if (isStandalone) {
                document.body.style.paddingBottom = '0px';
             }
        };
    }, []);

    if (!isPwa) {
        return null;
    }

    const navItems = [
        { to: '/', label: 'Home', icon: HomeIcon },
        { to: '/#all-tools', label: 'Tools', icon: GridIcon },
        { to: '/scan-to-pdf', label: 'Scan', icon: ScanToPdfIcon },
        { to: '/blog', label: 'Articles', icon: NewspaperIcon },
        { to: '/account-settings', label: 'Settings', icon: SettingsIcon },
    ];
    
    // A list of all paths that should be considered part of the "Settings" section for highlighting.
    const settingsPaths = [
        '/account-settings', '/workflows', '/security', '/team', '/last-tasks', 
        '/signatures-overview', '/sent', '/inbox', '/signed', '/templates', 
        '/contacts', '/signature-settings', '/plans-packages', '/business-details', '/invoices'
    ];

    const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
        let isActive = false;
        if (item.to === '/') {
            isActive = location.pathname === '/' && location.hash === '';
        } else if (item.to === '/#all-tools') {
            isActive = location.pathname === '/' && location.hash === '#all-tools';
        } else if (item.to === '/account-settings') {
            isActive = settingsPaths.some(p => location.pathname.startsWith(p));
        } else {
            isActive = location.pathname.startsWith(item.to);
        }
        
        return (
            <Link 
                to={item.to} 
                className={`flex flex-col items-center justify-center flex-1 transition-colors h-full ${isActive ? 'text-brand-red' : 'text-gray-500 dark:text-gray-400 hover:text-brand-red'}`}
            >
                <item.icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
            </Link>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-40 flex items-center justify-around px-2">
            <NavLink item={navItems[0]} />
            <NavLink item={navItems[1]} />
            
            <Link to={navItems[2].to} className="relative w-16 h-16 -top-5" aria-label="Document Scanner">
                <div className="absolute inset-0 rounded-full bg-brand-red shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform">
                    <ScanToPdfIcon className="h-8 w-8" />
                </div>
            </Link>

            <NavLink item={navItems[3]} />
            <NavLink item={navItems[4]} />
        </nav>
    );
};

export default PwaBottomNav;
