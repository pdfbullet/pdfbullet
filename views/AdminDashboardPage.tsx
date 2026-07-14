import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useAuth, TaskLog, User, Feedback } from '../contexts/AuthContext.tsx';
import { ProblemReport } from '../contexts/AuthContext.tsx';
import {
    UserIcon, StarIcon, TrashIcon, ApiIcon, RefreshIcon,
    WarningIcon, DownloadIcon, PaperAirplaneIcon, MenuIcon,
    ChatbotIcon, SettingsIcon, ChartBarIcon, BellIcon,
    SearchIcon, CheckCircleIcon, CloseIcon
} from '../components/icons.tsx';
import { db, storage, firebase } from '../firebase/config.ts';
import { LayoutContext } from '../App.tsx';
import AdminSidebar from '../components/AdminSidebar.tsx';

interface UserData extends User { }

const safeToDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp.seconds !== undefined) return new Date(timestamp.seconds * 1000);
    if (typeof timestamp === 'number') return new Date(timestamp);
    if (typeof timestamp === 'string') return new Date(timestamp);
    return null;
};

const formatBytes = (bytes: number, decimals = 2): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const compressImage = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Aggressive compression for Spark plan (Firestore document size limit)
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (e) => reject(new Error('Image load failed'));
        };
        reader.onerror = (e) => reject(new Error('File read failed'));
    });
};

const NotificationSender: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        } else {
            setFile(null);
        }
    };

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            setStatus('Title and message are required.');
            setTimeout(() => setStatus(''), 3000);
            return;
        }
        setIsSending(true);
        setStatus('Preparing instant broadcast...');
        try {
            let imageBase64 = '';

            if (file) {
                setStatus('Auto-compressing (Spark Optimized)...');
                imageBase64 = await compressImage(file, 600, 600, 0.4);
            }

            setStatus('Broadcasting worldwide via Firestore...');
            await db.collection('pwa_notifications').add({
                title: title.trim(),
                message: message.trim(),
                url: targetUrl.trim(),
                imageBase64: imageBase64, // Instant Base64 delivery, NO STORAGE NEEDED
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                reach: 'worldwide',
                isPriority: true,
                sparkPlan: true
            });
            setStatus('Broadcast sent successfully!');
            setTitle('');
            setMessage('');
            setTargetUrl('');
            setFile(null);
            const fileInput = document.getElementById('notif-file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (e) {
            setStatus('Broadcast failed. Check connection.');
            console.error(e);
        } finally {
            setIsSending(false);
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BellIcon className="h-6 w-6 text-brand-red" />
                Broadcast Push Notification
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This will reach all PWA users instantly.
            </p>
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all" placeholder="Announcement Title" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                    <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all" placeholder="Notification body content..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target URL</label>
                        <input type="text" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all" placeholder="/pricing" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image Attachment</label>
                        <input id="notif-file" type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20 outline-none" />
                    </div>
                </div>
                <button onClick={handleSend} disabled={isSending} className="w-full flex items-center justify-center gap-2 bg-brand-red text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-red-dark disabled:bg-red-300 transition-all shadow-lg shadow-brand-red/20 ring-offset-2 focus:ring-2 focus:ring-brand-red">
                    <PaperAirplaneIcon className="h-5 w-5" />
                    {isSending ? 'Sending Broadcast...' : 'Send to All Users'}
                </button>
                {status && (
                    <div className={`p-4 rounded-xl text-center text-sm font-semibold animate-fade-in-up ${status.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up backdrop-blur-md border ${type === 'success'
            ? 'bg-green-500/90 text-white border-green-400/50'
            : 'bg-brand-red/90 text-white border-red-400/50'
            }`}>
            <div className="bg-white/20 p-2 rounded-xl">
                {type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <WarningIcon className="h-5 w-5 text-white" />}
            </div>
            <div className="flex flex-col">
                <span className="font-black text-xs uppercase tracking-widest opacity-70">{type === 'success' ? 'Success' : 'Attention'}</span>
                <span className="font-bold text-sm tracking-tight">{message}</span>
            </div>
            <button onClick={onClose} className="ml-4 p-2 hover:bg-white/20 rounded-xl transition-all">
                <CloseIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
    const {
        getAllUsers, updateUserPlan, updateUserApiPlan, logout, deleteUser,
        getProblemReports, updateReportStatus, deleteProblemReport,
        getTaskHistory, deleteTaskRecord, getFeedbacks, deleteFeedback,
        getSiteSettings, updateSiteSettings, purgeTaskHistory, resetAllUserTrials
    } = useAuth();
    const { setShowFooter } = useContext(LayoutContext);

    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [users, setUsers] = useState<UserData[]>([]);
    const [reports, setReports] = useState<ProblemReport[]>([]);
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    // Site Settings State
    const [siteSettings, setSiteSettings] = useState({
        maintenanceMode: false,
        allowSignups: true,
        announcement: 'Welcome to the PDF Bullet Admin Dashboard!'
    });

    useEffect(() => {
        setShowFooter(false);
        return () => {
            setShowFooter(true);
        };
    }, [setShowFooter]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [usersData, reportsData, tasksData, feedbackData, settingsData] = await Promise.all([
                getAllUsers(),
                getProblemReports(),
                getTaskHistory(),
                getFeedbacks(),
                getSiteSettings()
            ]);
            setUsers(usersData);
            setReports(reportsData);
            setTasks(tasksData);
            setFeedbacks(feedbackData);
            setSiteSettings(settingsData);
        } catch (e) {
            console.error('Failed to load data:', e);
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchAllData();
        setLoading(false);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to sign out of the Admin Panel?')) {
            logout();
        }
    };

    const handlePlanChange = async (uid: string, plan: 'tools' | 'flipbook', newStatus: boolean) => {
        setIsUpdating(uid);
        try {
            await updateUserPlan(uid, plan, newStatus);
            setUsers(users.map(u => {
                if (u.uid === uid) {
                    if (plan === 'tools') return { ...u, isToolsPremium: newStatus };
                    if (plan === 'flipbook') return { ...u, isFlipbookPremium: newStatus };
                }
                return u;
            }));
            showToast('User plan updated.');
        } catch (e) {
            showToast('Failed to update plan.', 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleApiPlanChange = async (uid: string, plan: 'free' | 'developer' | 'business') => {
        setIsUpdating(uid);
        try {
            await updateUserApiPlan(uid, plan);
            setUsers(users.map(u => u.uid === uid ? { ...u, apiPlan: plan } : u));
            showToast('API plan updated.');
        } catch (e) {
            showToast('Failed to update API plan.', 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleReportStatusChange = async (reportId: string, status: ProblemReport['status']) => {
        setIsUpdating(reportId);
        try {
            await updateReportStatus(reportId, status);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
            showToast('Report status updated.');
        } catch (e) {
            showToast('Failed to update status.', 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleSaveSettings = async () => {
        setIsUpdating('settings');
        try {
            await updateSiteSettings(siteSettings);
            showToast('Site settings updated successfully!');
        } catch (e) {
            showToast('Failed to update settings.', 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    const handlePurgeLogs = async () => {
        if (!window.confirm('Are you sure you want to delete all task logs older than 30 days? This cannot be undone.')) return;
        setIsUpdating('purge');
        try {
            const count = await purgeTaskHistory(30);
            showToast(`Successfully purged ${count} task records.`);
            await fetchAllData();
        } catch (e) {
            showToast('Failed to purge records.', 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleResetTrials = async () => {
        const days = window.prompt('Reset trials for how many days from now?', '14');
        if (days === null) return;
        const daysNum = parseInt(days);
        if (isNaN(daysNum)) {
            showToast('Invalid number of days.', 'error');
            return;
        }

        setIsUpdating('reset-trials');
        try {
            const count = await resetAllUserTrials(daysNum);
            showToast(`Successfully reset trials for ${count} users.`);
            await fetchAllData();
        } catch (e) {
            showToast('Failed to reset trials.', 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        if (window.confirm('Delete this report?')) {
            setIsUpdating(reportId);
            try {
                await deleteReportStatus(reportId); // Note: Should probably be deleteProblemReport
                setReports(prev => prev.filter(r => r.id !== reportId));
                showToast('Report deleted.');
            } catch (e) {
                showToast('Failed to delete report.', 'error');
            } finally {
                setIsUpdating(null);
            }
        }
    };

    const deleteReportStatus = async (id: string) => {
        await deleteProblemReport(id);
    };

    const handleDeleteUser = async (uid: string, username: string) => {
        if (window.confirm(`Delete user "${username}"?`)) {
            setIsUpdating(uid);
            try {
                await deleteUser(uid);
                setUsers(prev => prev.filter(u => u.uid !== uid));
                showToast('User deleted.');
            } catch (e: any) {
                showToast(`Error: ${e.message}`, 'error');
            } finally {
                setIsUpdating(null);
            }
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm(`Delete task record?`)) {
            setIsUpdating(taskId);
            try {
                await deleteTaskRecord(taskId);
                setTasks(prev => prev.filter(t => t.id !== taskId));
                showToast('Task record deleted.');
            } catch (e) {
                showToast('Failed to delete task.', 'error');
            } finally {
                setIsUpdating(null);
            }
        }
    };

    const handleDeleteFeedback = async (id: string) => {
        if (window.confirm('Delete this feedback?')) {
            setIsUpdating(id);
            try {
                await deleteFeedback(id);
                setFeedbacks(prev => prev.filter(f => f.id !== id));
                showToast('Feedback deleted.');
            } catch (e) {
                showToast('Failed to delete feedback.', 'error');
            } finally {
                setIsUpdating(null);
            }
        }
    };

    const filteredUsers = useMemo(() => (users || []).filter(user => (user?.username || '').toLowerCase().includes(searchTerm.toLowerCase())), [users, searchTerm]);
    const filteredReports = useMemo(() => (reports || []).filter(report => (report?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (report?.email || '').toLowerCase().includes(searchTerm.toLowerCase())), [reports, searchTerm]);
    const filteredTasks = useMemo(() => (tasks || []).filter(task => (task?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || (task?.toolTitle || '').toLowerCase().includes(searchTerm.toLowerCase())), [tasks, searchTerm]);
    const filteredFeedback = useMemo(() => (feedbacks || []).filter(f => (f?.message || '').toLowerCase().includes(searchTerm.toLowerCase()) || (f?.username || '').toLowerCase().includes(searchTerm.toLowerCase())), [feedbacks, searchTerm]);

    const stats = useMemo(() => {
        const now = new Date();
        const past24h = now.getTime() - (24 * 60 * 60 * 1000);
        return {
            totalUsers: users.length,
            premiumUsers: users.filter(u => u.isToolsPremium || u.isFlipbookPremium).length,
            tasksToday: tasks.filter(t => {
                const d = safeToDate(t.timestamp);
                return d && d.getTime() > past24h;
            }).length,
            newReports: reports.filter(r => r.status === 'New').length,
            averageRating: feedbacks.length > 0 ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) : 'N/A'
        };
    }, [users, reports, tasks, feedbacks]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0b] text-gray-800 dark:text-gray-200">
            {/* Sidebar component */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <main className={`lg:ml-64 min-h-screen transition-all duration-300 pt-16 ${isSidebarOpen ? 'ml-64 blur-sm lg:blur-none' : 'ml-0'}`}>
                <div className="p-4 lg:p-8">
                    {/* Header Mobile Toggle */}
                    <div className="flex items-center justify-between mb-8 lg:hidden">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <span className="font-bold text-lg">Admin Panel</span>
                        <div className="w-10"></div>
                    </div>

                    {/* Dashboard Top Navigation */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {activeTab === 'overview' ? 'Real-time performance metrics and trends' :
                                    activeTab === 'users' ? 'User management and subscription control' :
                                        activeTab === 'reports' ? 'Incident tracking and bug resolution' :
                                            activeTab === 'tasks' ? 'System activity and file processing logs' :
                                                activeTab === 'feedback' ? 'User satisfaction and comments' :
                                                    activeTab === 'notifications' ? 'Global push notification system' :
                                                        'System wide configuration and security'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {activeTab !== 'notifications' && activeTab !== 'settings' && activeTab !== 'overview' && (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-brand-red transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-all w-full md:w-64 shadow-sm"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-red">
                                            <CloseIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className={`p-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm ${loading ? 'animate-spin text-brand-red' : ''}`}
                                title="Refresh Data"
                            >
                                <RefreshIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Main Tab Content */}
                    <div className="space-y-8 animate-fade-in-up">

                        {/* ====== OVERVIEW TAB ====== */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Accounts', value: stats.totalUsers, icon: UserIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12% this month' },
                                        { label: 'Premium Users', value: stats.premiumUsers, icon: StarIcon, color: 'text-yellow-500', bg: 'bg-yellow-500/10', trend: '8.4% conversion' },
                                        { label: 'Processing Tasks', value: stats.tasksToday, icon: RefreshIcon, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'System healthy' },
                                        { label: 'Incidents/Reports', value: stats.newReports, icon: WarningIcon, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: stats.newReports > 0 ? `${stats.newReports} pending` : 'All clear' },
                                    ].map((card, i) => (
                                        <div key={i} className="bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 ${card.bg} rounded-xl`}>
                                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{card.label}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-3xl font-bold">{card.value}</h3>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-medium">
                                                <span className={card.trend.includes('pending') ? 'text-brand-red' : 'text-green-500'}>{card.trend}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 bg-white dark:bg-black p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-bold text-lg">Acquisition & Activity</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 bg-brand-red rounded-full"></span>
                                                <span className="text-xs font-semibold text-gray-500">Live Traffic</span>
                                            </div>
                                        </div>
                                        <div className="h-64 flex items-end justify-between gap-2">
                                            {[40, 60, 45, 90, 65, 80, 50, 70, 40, 95, 60, 75, 55, 85].map((h, i) => (
                                                <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-t-lg relative group transition-all hover:bg-brand-red/20">
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 bg-brand-red rounded-t-lg transition-all duration-1000"
                                                        style={{ height: loading ? '0%' : `${h}%` }}
                                                    ></div>
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {h}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-brand-red to-red-800 p-8 rounded-2xl text-white shadow-xl flex flex-col justify-between">
                                        <div>
                                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                                                <StarIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">User Satisfaction</h3>
                                            <p className="text-red-100 text-sm opacity-90 leading-relaxed mb-6">
                                                Based on recent system feedback. Encourage users to rate their experience.
                                            </p>
                                            <div className="text-5xl font-black mb-1">{stats.averageRating}</div>
                                            <div className="flex gap-1 text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(Number(stats.averageRating) || 0) ? 'fill-current' : 'opacity-30'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => setActiveTab('feedback')} className="w-full py-3 bg-white text-brand-red font-extrabold rounded-xl hover:bg-red-50 transition-all text-sm uppercase tracking-widest mt-8">
                                            See All Reviews
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ====== USERS TAB ====== */}
                        {activeTab === 'users' && (
                            <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                                                <th className="px-6 py-4">Identity</th>
                                                <th className="px-6 py-4">Tools Plan</th>
                                                <th className="px-6 py-4">Flipbook Plan</th>
                                                <th className="px-6 py-4">API Developer</th>
                                                <th className="px-6 py-4">Joined At</th>
                                                <th className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-900 font-medium">
                                            {loading ? (
                                                <tr><td colSpan={6} className="text-center py-20 text-gray-400 font-semibold animate-pulse">Loading secure database...</td></tr>
                                            ) : filteredUsers.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-20 text-gray-400 font-semibold italic">No matching records found.</td></tr>
                                            ) : filteredUsers.map(user => (
                                                <tr key={user.uid} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                                                                {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" alt="" /> : (user.username || 'U').charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold flex items-center gap-1">
                                                                    {user.username}
                                                                    {isUpdating === user.uid && <RefreshIcon className="h-3 w-3 animate-spin text-brand-red" />}
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 font-bold truncate max-w-[120px]">{user.uid}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={user.isToolsPremium ? 'premium' : 'free'}
                                                            onChange={(e) => handlePlanChange(user.uid, 'tools', e.target.value === 'premium')}
                                                            disabled={isUpdating === user.uid}
                                                            className={`text-xs font-bold rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer border-none ${user.isToolsPremium ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                                                        >
                                                            <option value="free">Standard</option>
                                                            <option value="premium">Premium</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={user.isFlipbookPremium ? 'premium' : 'free'}
                                                            onChange={(e) => handlePlanChange(user.uid, 'flipbook', e.target.value === 'premium')}
                                                            disabled={isUpdating === user.uid}
                                                            className={`text-xs font-bold rounded-lg px-2 py-1 border-none outline-none appearance-none cursor-pointer ${user.isFlipbookPremium ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                                                        >
                                                            <option value="free">Standard</option>
                                                            <option value="premium">Premium</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={user.apiPlan || 'free'}
                                                            onChange={(e) => handleApiPlanChange(user.uid, e.target.value as any)}
                                                            disabled={isUpdating === user.uid}
                                                            className={`text-xs font-bold rounded-lg px-2 py-1 border-none outline-none appearance-none cursor-pointer ${user.apiPlan === 'business' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : user.apiPlan === 'developer' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                                                        >
                                                            <option value="free">Free Tile</option>
                                                            <option value="developer">Developer</option>
                                                            <option value="business">Business</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                                        {safeToDate(user.creationDate)?.toLocaleDateString() || '--'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => handleDeleteUser(user.uid, user.username)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ====== REPORTS TAB ====== */}
                        {activeTab === 'reports' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loading ? (
                                    <div className="col-span-full py-20 text-center font-bold text-gray-400">Loading incident reports...</div>
                                ) : filteredReports.length === 0 ? (
                                    <div className="col-span-full py-20 text-center font-bold text-gray-400 italic bg-white dark:bg-black rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">Inbox is empty. Great job!</div>
                                ) : filteredReports.map(report => (
                                    <div key={report.id} className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${report.status === 'New' ? 'bg-orange-500' : report.status === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${report.status === 'New' ? 'bg-orange-100 text-orange-600' : report.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                {report.status}
                                            </div>
                                            <button onClick={() => handleDeleteReport(report.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">{report.problemType}</h4>
                                        <p className="text-xs text-gray-500 mb-4 line-clamp-3 leading-relaxed">{report.description}</p>
                                        <div className="flex items-center gap-2 mb-6 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-[10px] uppercase font-bold">{report.userName?.charAt(0) || '?'}</div>
                                            <div className="text-[10px] font-bold truncate flex-1">{report.email}</div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-tighter">{safeToDate(report.timestamp)?.toLocaleString()}</span>
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleReportStatusChange(report.id, e.target.value as any)}
                                                className="text-[10px] font-bold bg-transparent outline-none text-brand-red cursor-pointer"
                                            >
                                                <option value="New">MARK AS NEW</option>
                                                <option value="In Progress">MARK ENGAGED</option>
                                                <option value="Resolved">MARK RESOLVED</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ====== TASKS TAB ====== */}
                        {activeTab === 'tasks' && (
                            <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Operation</th>
                                                <th className="px-6 py-4">Resource</th>
                                                <th className="px-6 py-4">Timestamp</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                                            {loading ? (
                                                <tr><td colSpan={5} className="text-center py-20 font-bold text-gray-400 animate-pulse">Monitoring system logs...</td></tr>
                                            ) : filteredTasks.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center py-20 font-bold text-gray-400 italic">No historical activities found.</td></tr>
                                            ) : filteredTasks.map(task => (
                                                <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-bold">{task.username}</div>
                                                        <div className="text-[9px] text-gray-400 font-bold">{task.userId}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                            {task.toolTitle}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-bold truncate max-w-[200px]">{task.outputFilename}</div>
                                                        <div className="text-[9px] text-gray-400 font-bold">{formatBytes(task.fileSize)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">
                                                        {safeToDate(task.timestamp)?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-gray-300 hover:text-red-500 transition-all"><TrashIcon className="h-3.5 w-3.5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ====== FEEDBACK TAB ====== */}
                        {activeTab === 'feedback' && (
                            <div className="space-y-6">
                                {loading ? (
                                    <div className="py-20 text-center font-bold text-gray-400">Loading feedback matrix...</div>
                                ) : filteredFeedback.length === 0 ? (
                                    <div className="py-20 text-center font-bold text-gray-400 italic bg-white dark:bg-black rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">No user feedback yet. Stay tuned!</div>
                                ) : filteredFeedback.map(f => (
                                    <div key={f.id} className="bg-white dark:bg-black p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 relative group transition-all hover:scale-[1.01]">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 font-bold text-sm">
                                                    <span className="text-brand-red">@{f.username}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{safeToDate(f.timestamp)?.toDateString()}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon key={i} className={`h-4 w-4 ${i < f.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 dark:text-gray-800'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm italic leading-relaxed font-medium">"{f.message}"</p>
                                            <div className="mt-4 flex items-center gap-4">
                                                <div className="text-[10px] font-extrabold text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">Ref: {f.page.split('/').pop() || 'HOME'}</div>
                                                <div className="text-[10px] font-extrabold text-gray-400 uppercase">ID: {f.id}</div>
                                            </div>
                                        </div>
                                        <div className="md:border-l border-gray-100 dark:border-gray-800 md:pl-6 flex flex-row md:flex-col items-center justify-center gap-4">
                                            <button onClick={() => handleDeleteFeedback(f.id)} className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                            <button className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl hover:text-brand-red transition-all shadow-sm">
                                                <ChatbotIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ====== NOTIFICATIONS TAB ====== */}
                        {activeTab === 'notifications' && <NotificationSender />}

                        {/* ====== SETTINGS TAB ====== */}
                        {activeTab === 'settings' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <SettingsIcon className="h-5 w-5 text-gray-400" />
                                        General Controls
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <div>
                                                <div className="font-bold text-sm">System Maintenance</div>
                                                <div className="text-[10px] text-gray-500 font-semibold">Redirect all users to maintenance screen</div>
                                            </div>
                                            <button
                                                onClick={() => setSiteSettings({ ...siteSettings, maintenanceMode: !siteSettings.maintenanceMode })}
                                                className={`relative w-12 h-6 transition-colors rounded-full outline-none ring-offset-2 focus:ring-2 focus:ring-brand-red ${siteSettings.maintenanceMode ? 'bg-brand-red' : 'bg-gray-300 dark:bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <div>
                                                <div className="font-bold text-sm">User Registrations</div>
                                                <div className="text-[10px] text-gray-500 font-semibold">Enable or disable new account creation</div>
                                            </div>
                                            <button
                                                onClick={() => setSiteSettings({ ...siteSettings, allowSignups: !siteSettings.allowSignups })}
                                                className={`relative w-12 h-6 transition-colors rounded-full outline-none ring-offset-2 focus:ring-2 focus:ring-brand-red ${siteSettings.allowSignups ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.allowSignups ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Global Announcement Banner</label>
                                            <textarea
                                                value={siteSettings.announcement}
                                                onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-red/30 transition-all font-medium text-sm italic"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isUpdating === 'settings'}
                                            className="w-full py-3 bg-gray-800 dark:bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            {isUpdating === 'settings' ? <RefreshIcon className="h-4 w-4 animate-spin" /> : null}
                                            {isUpdating === 'settings' ? 'Saving...' : 'Commit Registry Changes'}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <WarningIcon className="h-5 w-5 text-gray-400" />
                                        Security & Compliance
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
                                            <h4 className="text-red-600 font-black text-xs uppercase tracking-tighter mb-2">Danger Zone</h4>
                                            <p className="text-[11px] text-red-500 font-bold leading-relaxed mb-4">
                                                Clearing system logs or pruning inactive users are irreversible operations. Ensure database backups are verified.
                                            </p>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={handlePurgeLogs}
                                                    disabled={isUpdating === 'purge'}
                                                    className="w-full py-2 bg-white dark:bg-black border border-red-200 dark:border-red-900/50 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs flex items-center justify-center gap-2"
                                                >
                                                    {isUpdating === 'purge' ? <RefreshIcon className="h-3 w-3 animate-spin" /> : 'Purge 30-Day Task Log'}
                                                </button>
                                                <button
                                                    onClick={handleResetTrials}
                                                    disabled={isUpdating === 'reset-trials'}
                                                    className="w-full py-2 bg-white dark:bg-black border border-red-200 dark:border-red-900/50 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs flex items-center justify-center gap-2"
                                                >
                                                    {isUpdating === 'reset-trials' ? <RefreshIcon className="h-3 w-3 animate-spin" /> : 'Reset All User Trials'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                                            <h4 className="text-blue-600 font-black text-xs uppercase tracking-tighter mb-2">Database Connection</h4>
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span className="text-blue-500">Firestore Instance</span>
                                                <span className="text-green-500 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    SECURE
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] font-bold mt-2">
                                                <span className="text-blue-500">Storage Cluster</span>
                                                <span className="text-green-500 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    ACTIVE
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminDashboardPage;