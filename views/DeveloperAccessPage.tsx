import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyIcon, LockIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';

const DeveloperAccessPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        // Simulate a slight delay for UX
        setTimeout(() => {
            if (password === 'bishal@@@') {
                console.log("DeveloperAccessPage: Password correct, setting session items...");
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                sessionStorage.setItem('adminAuthTimestamp', String(Date.now()));
                console.log("DeveloperAccessPage: Session set, navigating to dashboard...");
                navigate('/admin-dashboard');
            } else {
                console.warn("DeveloperAccessPage: Incorrect password entered.");
                setError('Incorrect password. Please try again.');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-sm">
                    <Logo className="h-10 w-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard Access
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        This area is restricted. Please enter the password to continue.
                    </p>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black py-3 pl-10 pr-3 placeholder-gray-500 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                                placeholder="Password"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 rounded-md border border-transparent bg-brand-red py-3 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                <LockIcon className="h-5 w-5" />
                                {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex flex-1 bg-gray-50 dark:bg-black items-center justify-center p-12 border-l border-gray-200 dark:border-gray-800">
                <div className="max-w-md text-center">
                    <img src="https://ik.imagekit.io/fonepay/imgi_25_home.png?updatedAt=1753968278321" alt="Admin illustration" className="w-full h-auto" />
                    <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">Centralized Management</h2>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Monitor user activity, manage reports, and control site-wide settings from one powerful interface.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DeveloperAccessPage;