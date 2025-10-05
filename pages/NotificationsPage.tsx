import React, { useEffect } from 'react';
import { BellIcon, TrashIcon } from '../components/icons.tsx';

interface Notification {
    id: number;
    message: string;
    timestamp: number;
    read: boolean;
}

interface NotificationsPageProps {
    notifications: Notification[];
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, markAllAsRead, clearAll }) => {
    useEffect(() => {
        document.title = "Notifications | PDFBullet";
        markAllAsRead();
    }, [markAllAsRead]);

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)} years ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)} months ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} days ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)} hours ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} minutes ago`;
        return `${Math.floor(seconds)} seconds ago`;
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Notifications</h1>
                {notifications.length > 0 && (
                    <button onClick={clearAll} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <TrashIcon className="h-4 w-4" /> Clear All
                    </button>
                )}
            </div>
            {notifications.length > 0 ? (
                <ul className="space-y-4">
                    {notifications.map(n => (
                        <li key={n.id} className={`p-4 rounded-lg shadow-sm border bg-white dark:bg-black border-gray-200 dark:border-gray-800`}>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <BellIcon className={`h-5 w-5 text-gray-400`} />
                                </div>
                                <div>
                                    <p className="text-gray-800 dark:text-gray-100">{n.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{timeAgo(n.timestamp)}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <BellIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>You have no notifications yet.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
