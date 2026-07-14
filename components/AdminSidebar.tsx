import React from 'react';
import {
    UsersIcon,
    WarningIcon,
    RefreshIcon,
    BellIcon,
    ChartBarIcon,
    ChatbotIcon,
    SettingsIcon,
    LogoutIcon,
    ChevronDownIcon,
    LeftArrowIcon
} from './icons.tsx';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
    const menuItems = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
        { id: 'users', name: 'User Management', icon: UsersIcon },
        { id: 'reports', name: 'Problem Reports', icon: WarningIcon },
        { id: 'tasks', name: 'Task History', icon: RefreshIcon },
        { id: 'feedback', name: 'User Feedback', icon: ChatbotIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'settings', name: 'Site Settings', icon: SettingsIcon },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`fixed top-16 left-0 bottom-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <span className="font-extrabold text-lg tracking-tight">Admin<span className="text-brand-red">Panel</span></span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                        >
                            <LeftArrowIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-brand-red'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 transition-colors ${activeTab === item.id ? 'text-white' : 'group-hover:text-brand-red'
                                    }`} />
                                <span className="font-semibold text-sm">{item.name}</span>
                                {activeTab === item.id && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-semibold text-sm"
                        >
                            <LogoutIcon className="h-5 w-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
