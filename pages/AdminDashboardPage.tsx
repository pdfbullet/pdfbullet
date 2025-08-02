import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserIcon, StarIcon, TrashIcon, ApiIcon } from '../components/icons.tsx';

interface UserData {
    username: string;
    isPremium: boolean;
    creationDate?: string;
    apiPlan?: 'free' | 'developer' | 'business';
}

const AdminDashboardPage: React.FC = () => {
    const { getAllUsers, updateUserPremiumStatus, updateUserApiPlan, logout, deleteUser } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = () => {
        setLoading(true);
        try {
            const allUsersData = getAllUsers();
            const usersArray = Object.keys(allUsersData).map(username => ({
                username,
                isPremium: allUsersData[username].isPremium || false,
                creationDate: allUsersData[username].creationDate,
                apiPlan: allUsersData[username].apiPlan || 'free',
            }));
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

    const handleTogglePremium = async (username: string, currentStatus: boolean) => {
        try {
            await updateUserPremiumStatus(username, !currentStatus);
            fetchUsers();
        } catch (e) {
            alert(`Failed to update status for ${username}.`);
        }
    };
    
    const handleApiPlanChange = async (username: string, plan: 'free' | 'developer' | 'business') => {
        try {
            await updateUserApiPlan(username, plan);
            fetchUsers();
        } catch (e) {
             alert(`Failed to update API plan for ${username}.`);
        }
    };

    const handleDeleteUser = async (username: string) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
            try {
                await deleteUser(username);
                fetchUsers();
            } catch (e: any) {
                alert(`Error deleting user: ${e.message}`);
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
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
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
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                             <input 
                                type="text"
                                placeholder="Search by username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"
                             />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Username</th>
                                        <th scope="col" className="px-6 py-3">Premium</th>
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
                                            <tr key={user.username} className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {user.username}
                                                </th>
                                                <td className="px-6 py-4">
                                                    <label htmlFor={`toggle-${user.username}`} className="relative inline-flex items-center cursor-pointer" title="Toggle Premium">
                                                        <input 
                                                            type="checkbox" 
                                                            id={`toggle-${user.username}`} 
                                                            className="sr-only peer" 
                                                            checked={user.isPremium}
                                                            onChange={() => handleTogglePremium(user.username, user.isPremium)}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                                                    </label>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                      value={user.apiPlan} 
                                                      onChange={(e) => handleApiPlanChange(user.username, e.target.value as 'free' | 'developer' | 'business')}
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
                                                    <button onClick={() => handleDeleteUser(user.username)} title="Delete User" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
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