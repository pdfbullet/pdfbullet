

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserIcon, StarIcon, TrashIcon, ApiIcon, RefreshIcon } from '../components/icons.tsx';

interface UserData {
    uid: string;
    username: string;
    isPremium?: boolean;
    creationDate?: string;
    apiPlan?: 'free' | 'developer' | 'business';
}

const AdminDashboardPage: React.FC = () => {
    const { getAllUsers, updateUserPremiumStatus, updateUserApiPlan, logout, deleteUser } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersArray = await getAllUsers();
            setUsers(usersArray);
        } catch (e) {
            setError('Failed to load user data.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);

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

    const stats = useMemo(() => ({
        totalUsers: users.length,
        premiumUsers: users.filter(u => u.isPremium).length,
        apiUsers: users.filter(u => u.apiPlan && u.apiPlan !== 'free').length,
    }), [users]);

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden animated-border">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                             <input 
                                type="text"
                                placeholder="Search by username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-auto flex-grow px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"
                             />
                             <button onClick={fetchUsers} disabled={loading} className="flex items-center gap-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                 <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/> Refresh
                             </button>
                        </div>
                        <div className="overflow-x-auto">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;