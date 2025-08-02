

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyIcon } from '../components/icons.tsx';

const DeveloperAccessPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password === 'bishal@@@') {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            navigate('/admin-dashboard');
        } else {
            setError('Incorrect password.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <KeyIcon className="h-12 w-12 mx-auto text-brand-red" />
                    <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Developer Access
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Enter the password to access the admin dashboard.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg animated-border">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password"className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        {error && <p className="text-center text-sm text-red-500">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-red py-2 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 transition-colors"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeveloperAccessPage;