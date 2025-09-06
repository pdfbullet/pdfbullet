import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ProblemReport } from '../contexts/AuthContext.tsx';
import { UserIcon, StarIcon, TrashIcon, ApiIcon, RefreshIcon, WarningIcon } from '../components/icons.tsx';

interface UserData {
    uid: string;
    username: string;
    isPremium?: boolean;
    creationDate?: string;
    apiPlan?: 'free' | 'developer' | 'business';
}

const AdminDashboardPage: React.FC = () => {
    const { getAllUsers, updateUserPremiumStatus, updateUserApiPlan, logout, deleteUser, getProblemReports, updateReportStatus, deleteProblemReport } = useAuth();
    
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const [reports, setReports] = useState<ProblemReport[]>([]);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState('');
    
    const [activeTab, setActiveTab] = useState('users');

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const usersArray = await getAllUsers();
            setUsers(usersArray);
        } catch (e) {
            setError('Failed to load user data.');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchReports = async () => {
        setReportsLoading(true);
        setReportsError('');
        try {
            const reportsData = await getProblemReports();
            setReports(reportsData);
        } catch (e) {
            setReportsError('Failed to load problem reports.');
        } finally {
            setReportsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'reports') {
            fetchReports();
        }
    }, [activeTab]);

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
                await fetchUsers();
            } catch (e: any) {
                alert(`Error deleting user: ${e.message}`);
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

    const stats = useMemo(() => ({
        totalUsers: users.length,
        premiumUsers: users.filter(u => u.isPremium).length,
        apiUsers: users.filter(u => u.apiPlan && u.apiPlan !== 'free').length,
        newReports: reports.filter(r => r.status === 'New').length,
    }), [users, reports]);

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
                                <p className="text-sm text-gray-500 dark:text-gray-400">Active API Users</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.apiUsers}</p>
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
                        <nav className="flex space-x-8">
                            <button onClick={() => { setActiveTab('users'); setSearchTerm(''); }} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>User Management</button>
                            <button onClick={() => { setActiveTab('reports'); setSearchTerm(''); }} className={`relative py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                Problem Reports
                                {stats.newReports > 0 && <span className="absolute -top-1 -right-4 bg-brand-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{stats.newReports}</span>}
                            </button>
                        </nav>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden animated-border">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                             <input 
                                type="text"
                                placeholder={`Search by ${activeTab === 'users' ? 'username' : 'email or description'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-auto flex-grow px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"
                             />
                             <button onClick={activeTab === 'users' ? fetchUsers : fetchReports} disabled={loading || reportsLoading} className="flex items-center gap-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                 <RefreshIcon className={`h-4 w-4 ${(loading || reportsLoading) ? 'animate-spin' : ''}`}/> Refresh
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
