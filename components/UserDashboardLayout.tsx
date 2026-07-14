
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserIcon, LockIcon, UsersIcon, PuzzleIcon, RefreshIcon, SignIcon, PaperAirplaneIcon, EmailIcon, CheckIcon, FileIcon, SettingsIcon, DollarIcon, BriefcaseIcon, InvoiceIcon } from './icons.tsx';

const NavItem: React.FC<{ name: string; path: string; icon: React.FC<{ className?: string }>; disabled?: boolean }> = ({ name, path, icon: Icon, disabled }) => {
    const location = useLocation();
    const isActive = (path !== '/' && location.pathname.startsWith(path));
    
    const classes = `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${
        isActive
            ? 'bg-red-100 text-brand-red dark:bg-red-900/30'
            : disabled
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
    
    const content = <><Icon className="h-5 w-5" /><span>{name}</span></>;
    
    if (disabled) {
        return <div className={classes}>{content}</div>;
    }
    
    return <Link to={path} className={classes}>{content}</Link>;
};


const UserDashboardLayout: React.FC = () => {
    const { user } = useAuth();
    
    const sidebarNav = [
        { group: 'Profile', items: [
            { name: 'My account', path: '/account-settings', icon: UserIcon },
            { name: 'Security', path: '/security', icon: LockIcon },
            { name: 'Team', path: '/team', icon: UsersIcon },
        ]},
        { group: 'Settings', items: [
            { name: 'Workflows', path: '/workflows', icon: PuzzleIcon },
            { name: 'Last tasks', path: '/last-tasks', icon: RefreshIcon },
        ]},
        { group: 'Signatures', items: [
            { name: 'Overview', path: '/signatures-overview', icon: SignIcon },
            { name: 'Sent', path: '/sent', icon: PaperAirplaneIcon },
            { name: 'Inbox', path: '/inbox', icon: EmailIcon },
            { name: 'Signed', path: '/signed', icon: CheckIcon },
            { name: 'Templates', path: '/templates', icon: FileIcon },
            { name: 'Contacts', path: '/contacts', icon: UsersIcon },
            { name: 'Settings', path: '/signature-settings', icon: SettingsIcon },
        ]},
        { group: 'Billing', items: [
            { name: 'Plans & Packages', path: '/plans-packages', icon: DollarIcon },
            { name: 'Business details', path: '/business-details', icon: BriefcaseIcon },
            { name: 'Invoices', path: '/invoices', icon: InvoiceIcon },
        ]}
    ];

    return (
        <div className="bg-gray-50 dark:bg-soft-dark">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="md:w-64 lg:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full">
                             <div className="p-4">
                                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 border-2 border-brand-red/50">
                                        {user?.profileImage ? <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" /> : <UserIcon className="h-full w-full text-gray-500 p-2" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{user?.username}</p>
                                        <p className="text-sm text-red-500 font-semibold">Registered</p>
                                    </div>
                                </div>
                                <nav className="space-y-4">
                                    {sidebarNav.map(group => (
                                        <div key={group.group}>
                                            <h3 className="px-2 text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">{group.group}</h3>
                                            <div className="space-y-1">
                                                {group.items.map(item => (
                                                    <NavItem key={item.name} {...item} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </nav>
                             </div>
                        </div>
                    </aside>
                    <main className="flex-grow w-full md:w-auto overflow-hidden">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardLayout;
