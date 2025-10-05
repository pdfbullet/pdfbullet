
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, TaskLog } from '../contexts/AuthContext.tsx';
import { ProblemReport } from '../contexts/AuthContext.tsx';
import { UserIcon, StarIcon, TrashIcon, ApiIcon, RefreshIcon, WarningIcon, DownloadIcon, PaperAirplaneIcon } from '../components/icons.tsx';
import { db, storage, firebase } from '../firebase/config.ts';

interface UserData {
    uid: string;
    username: string;
    isPremium?: boolean;
    creationDate?: string;
    apiPlan?: 'free' | 'developer' | 'business';
}

const formatBytes = (bytes: number, decimals = 2): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
        setStatus('Sending...');
        try {
            let attachmentUrl = '';
            if (file) {
                setStatus('Uploading file...');
                const storageRef = storage.ref(`notifications/${Date.now()}_${file.name}`);
                const snapshot = await storageRef.put(file);
                attachmentUrl = await snapshot.ref.getDownloadURL();
            }

            setStatus('Sending notification data...');
            await db.collection('pwa_notifications').add({
                title: title.trim(),
                message: message.trim(),
                url: targetUrl.trim(),
                attachmentUrl: attachmentUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            setStatus('Notification sent successfully!');
            setTitle('');
            setMessage('');
            setTargetUrl('');
            setFile(null);
            // Also reset the file input visually
            const fileInput = document.getElementById('notif-file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (e) {
            setStatus('Failed to send notification. Check console for details.');
            console.error(e);
        } finally {
            setIsSending(false);
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-4">Send PWA Push Notification</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This will be sent to all PWA users. An active backend (like a Firebase Function) is needed to listen for this Firestore write and trigger a push service like OneSignal.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="notif-title" className="block text-sm font-semibold mb-1">Title*</label>
                    <input id="notif-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md" placeholder="New Feature Alert!"/>
                </div>
                <div>
                    <label htmlFor="notif-message" className="block text-sm font-semibold mb-1">Message*</label>
                    <textarea id="notif-message" rows={3} value={message} onChange={e => setMessage(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Check out our new AI-powered image generator..."/>
                </div>
                <div>
                    <label htmlFor="notif-url" className="block text-sm font-semibold mb-1">Target URL (Optional)</label>
                    <input id="notif-url" type="text" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} className="w-full p-2 border rounded-md" placeholder="/image-generator"/>
                </div>
                 <div>
                    <label htmlFor="notif-file" className="block text-sm font-semibold mb-1">File Attachment (Optional)</label>
                    <input id="notif-file" type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20"/>
                </div>
                <button onClick={handleSend} disabled={isSending} className="flex items-center gap-2 bg-brand-red text-white font-bold py-2 px-6 rounded-md hover:bg-brand-red-dark disabled:bg-red-300">
                    <PaperAirplaneIcon className="h-5 w-5" />
                    {isSending ? 'Sending...' : 'Send Notification'}
                </button>
                {status && <p className={`text-sm mt-2 ${status.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{status}</p>}
            </div>
        </div>
    );
};


const AdminDashboardPage: React.FC = () => {
    const { getAllUsers, updateUserPremiumStatus, updateUserApiPlan, logout, deleteUser, getProblemReports, updateReportStatus, deleteProblemReport, getTaskHistory, deleteTaskRecord } = useAuth();
    
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const [reports, setReports] = useState<ProblemReport[]>([]);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState('');
    
    const [tasks, setTasks] = useState<TaskLog[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState('');
    
    const [activeTab, setActiveTab] = useState('users');

    const fetchAllData = async () => {
        setLoading(true);
        setReportsLoading(true);
        setTasksLoading(true);
        try {
            const [usersData, reportsData, tasksData] = await Promise.all([
                getAllUsers(),
                getProblemReports(),
                getTaskHistory()
            ]);
            setUsers(usersData);
            setReports(reportsData);
            setTasks(tasksData);
        } catch (e) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
            setReportsLoading(false);
            setTasksLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleRefresh = () => {
        if (activeTab === 'users') {
            setLoading(true);
            getAllUsers().then(setUsers).catch(() => setError('Failed to load users.')).finally(() => setLoading(false));
        } else if (activeTab === 'reports') {
            setReportsLoading(true);
            getProblemReports().then(setReports).catch(() => setReportsError('Failed to load reports.')).finally(() => setReportsLoading(false));
        } else if (activeTab === 'tasks') {
            setTasksLoading(true);
            getTaskHistory().then(setTasks).catch(() => setTasksError('Failed to load tasks.')).finally(() => setTasksLoading(false));
        }
    };
    
    const handleTogglePremium = async (uid: string, currentStatus: boolean | undefined) => {
        setIsUpdating(uid);
        try {
            await updateUserPremiumStatus(uid, !currentStatus);
            setUsers(users.map(u => u.uid === uid ? { ...u, isPremium: !currentStatus } : u));
        } catch (e) {
            alert(`Failed to update status for user ${uid}.`);
        } finally {
            setIsUpdating(null);
        }
    };
    
    const handleApiPlanChange = async (uid: string, plan: 'free' | 'developer' | 'business') => {
        setIsUpdating(uid);
        try {
            await updateUserApiPlan(uid, plan);
            setUsers(users.map(u => u.uid === uid ? { ...u, apiPlan: plan } : u));
        } catch (e) {
             alert(`Failed to update API plan for user ${uid}.`);
        } finally {
            setIsUpdating(null);
        }
    };
    
    const handleReportStatusChange = async (reportId: string, status: ProblemReport['status']) => {
        setIsUpdating(reportId);
        try {
            await updateReportStatus(reportId, status);
            setReports(prev => prev.map(r => r.id === reportId ? {...r, status} : r));
        } catch (e) {
            alert('Failed to update report status.');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteReport = async (reportId: string, description: string) => {
        if (window.confirm(`Are you sure you want to delete the report: "${description.substring(0, 50)}..."? This action cannot be undone.`)) {
            setIsUpdating(reportId);
            try {
                await deleteProblemReport(reportId);
                setReports(prev => prev.filter(r => r.id !== reportId));
            } catch (e) {
                alert('Failed to delete report.');
            } finally {
                setIsUpdating(null);
            }
        }
    };

    const handleDeleteUser = async (uid: string, username: string) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"? This will only remove their data record.`)) {
            setIsUpdating(uid);
            try {
                await deleteUser(uid);
                setUsers(prev => prev.filter(u => u.uid !== uid));
            } catch (e: any) {
                alert(`Error deleting user: ${e.message}`);
            } finally {
                setIsUpdating(null);
            }
        }
    };

    const handleDeleteTask = async (taskId: string, filename: string) => {
        if (window.confirm(`Are you sure you want to delete the task record for: "${filename}"? This action cannot be undone.`)) {
            setIsUpdating(taskId);
            try {
                await deleteTaskRecord(taskId);
                setTasks(prev => prev.filter(t => t.id !== taskId));
            } catch (e) {
                alert('Failed to delete task record.');
            } finally {
                setIsUpdating(null);
            }
        }
    };

    const filteredUsers = useMemo(() => 
        users.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);
        
    const filteredReports = useMemo(() => 
        reports.filter(report => 
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [reports, searchTerm]);

    const filteredTasks = useMemo(() => 
        tasks.filter(task => 
            task.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.toolTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.outputFilename.toLowerCase().includes(searchTerm.toLowerCase())
        ), [tasks, searchTerm]);
    
    const stats = useMemo(() => {
        const now = new Date();
        const twentyFourHoursAgo = now.getTime() - (24 * 60 * 60 * 1000);
        return {
            totalUsers: users.length,
            premiumUsers: users.filter(u => u.isPremium).length,
            tasksToday: tasks.filter(t => t.timestamp && t.timestamp.toDate().getTime() > twentyFourHoursAgo).length,
            newReports: reports.filter(r => r.status === 'New').length,
        };
    }, [users, reports, tasks]);

    const isLoadingData = loading || reportsLoading || tasksLoading;

    return (
        <div className="py-16 md:py-24">
            <div className="px-6">
                <div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Manage users and monitor site activity.</p>
                        </div>
                        <button onClick={logout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors self-start sm:self-center">
                            Logout
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-blue-500">
                            <UserIcon className="h-10 w-10 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalUsers}</p>
                            </div>
                        </div>
                         <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-yellow-500">
                            <StarIcon className="h-10 w-10 text-yellow-500" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Premium Users</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.premiumUsers}</p>
                            </div>
                        </div>
                         <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-purple-500">
                            <ApiIcon className="h-10 w-10 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Today</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.tasksToday}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-orange-500">
                            <WarningIcon className="h-10 w-10 text-orange-500" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">New Reports</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.newReports}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            <button onClick={() => { setActiveTab('users'); setSearchTerm(''); }} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'users' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>User Management</button>
                            <button onClick={() => { setActiveTab('reports'); setSearchTerm(''); }} className={`relative py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'reports' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Problem Reports
                                {stats.newReports > 0 && <span className="absolute -top-1 -right-4 bg-brand-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{stats.newReports}</span>}
                            </button>
                            <button onClick={() => { setActiveTab('tasks'); setSearchTerm(''); }} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'tasks' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Task History</button>
                            <button onClick={() => { setActiveTab('notifications'); setSearchTerm(''); }} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'notifications' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Notifications</button>
                        </nav>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden animated-border">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                             <input 
                                type="text"
                                placeholder={`Search by ${activeTab === 'users' ? 'username' : activeTab === 'reports' ? 'email or description' : activeTab === 'tasks' ? 'user, tool, or filename' : '...'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-auto flex-grow px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"
                                disabled={activeTab === 'notifications'}
                             />
                             <button onClick={handleRefresh} disabled={isLoadingData} className="flex items-center gap-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                 <RefreshIcon className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`}/> Refresh
                             </button>
                        </div>
                        <div className="overflow-x-auto">
                            {activeTab === 'users' && (
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Username</th>
                                            <th scope="col" className="px-6 py-3">Premium Status</th>
                                            <th scope="col" className="px-6 py-3">API Plan</th>
                                            <th scope="col" className="px-6 py-3">Joined Date</th>
                                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={5} className="text-center p-6">Loading users...</td></tr>
                                        ) : error ? (
                                            <tr><td colSpan={5} className="text-center p-6 text-red-500">{error}</td></tr>
                                        ) : filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <tr key={user.uid} className={`border-b dark:border-gray-700 transition-colors ${user.isPremium ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-white dark:bg-gray-900'} hover:bg-gray-50 dark:hover:bg-gray-800/50`}>
                                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {isUpdating === user.uid && <svg className="animate-spin h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                                        {user.username}
                                                    </th>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => handleTogglePremium(user.uid, user.isPremium)}
                                                            disabled={isUpdating === user.uid}
                                                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${user.isPremium ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300'}`}
                                                        >
                                                        {user.isPremium ? 'Active' : 'Activate'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select 
                                                        value={user.apiPlan || 'free'} 
                                                        disabled={isUpdating === user.uid}
                                                        onChange={(e) => handleApiPlanChange(user.uid, e.target.value as 'free' | 'developer' | 'business')}
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        >
                                                        <option value="free">Free</option>
                                                        <option value="developer">Developer</option>
                                                        <option value="business">Business</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.creationDate ? new Date(user.creationDate).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => handleDeleteUser(user.uid, user.username)} disabled={isUpdating === user.uid} title="Delete User" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                        <tr><td colSpan={5} className="text-center p-6">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                            {activeTab === 'reports' && (
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">User</th>
                                            <th scope="col" className="px-6 py-3">Description</th>
                                            <th scope="col" className="px-6 py-3">Type</th>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportsLoading ? (
                                            <tr><td colSpan={6} className="text-center p-6">Loading reports...</td></tr>
                                        ) : reportsError ? (
                                            <tr><td colSpan={6} className="text-center p-6 text-red-500">{reportsError}</td></tr>
                                        ) : filteredReports.length > 0 ? (
                                            filteredReports.map(report => (
                                                <tr key={report.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{report.userName || report.email}</td>
                                                    <td className="px-6 py-4 text-xs max-w-sm"><p className="truncate" title={report.description}>{report.description}</p><a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Page</a></td>
                                                    <td className="px-6 py-4 font-semibold">{report.problemType}</td>
                                                    <td className="px-6 py-4">{report.timestamp ? new Date(report.timestamp.toDate()).toLocaleString() : 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <select value={report.status} disabled={isUpdating === report.id} onChange={e => handleReportStatusChange(report.id, e.target.value as ProblemReport['status'])} className={`text-xs rounded-lg p-1.5 border ${report.status === 'New' ? 'bg-orange-100 border-orange-300 text-orange-800' : report.status === 'In Progress' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-green-100 border-green-300 text-green-800'}`}>
                                                            <option value="New">New</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Resolved">Resolved</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => handleDeleteReport(report.id, report.description)} disabled={isUpdating === report.id} title="Delete Report" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={6} className="text-center p-6">No reports found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                            {activeTab === 'tasks' && (
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">User</th>
                                            <th scope="col" className="px-6 py-3">Tool</th>
                                            <th scope="col" className="px-6 py-3">File</th>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                         {tasksLoading ? (
                                            <tr><td colSpan={5} className="text-center p-6">Loading task history...</td></tr>
                                        ) : tasksError ? (
                                            <tr><td colSpan={5} className="text-center p-6 text-red-500">{tasksError}</td></tr>
                                        ) : filteredTasks.length > 0 ? (
                                            filteredTasks.map(task => (
                                                <tr key={task.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{task.username}</td>
                                                    <td className="px-6 py-4 font-semibold">{task.toolTitle}</td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <p className="font-semibold truncate" title={task.outputFilename}>{task.outputFilename}</p>
                                                        <p className="text-gray-400">{formatBytes(task.fileSize)}</p>
                                                    </td>
                                                    <td className="px-6 py-4">{task.timestamp ? task.timestamp.toDate().toLocaleString() : 'N/A'}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => handleDeleteTask(task.id, task.outputFilename)} disabled={isUpdating === task.id} title="Delete Task Record" className="p-2 text-gray-400 hover:text-red-500 rounded-full disabled:opacity-50">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={5} className="text-center p-6">No tasks found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                            {activeTab === 'notifications' && (
                                <div className="p-4">
                                    <NotificationSender />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
