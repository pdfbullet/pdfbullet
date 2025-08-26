import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import ChangePasswordModal from '../components/ChangePasswordModal.tsx';
import TwoFactorAuthModal from '../components/TwoFactorAuthModal.tsx';

const SecurityPage: React.FC = () => {
    const { user, auth, updateTwoFactorStatus } = useAuth();
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isTwoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);
    const [error, setError] = useState('');

    const hasPasswordProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password');

    const handleDisable2FA = async () => {
        if (window.confirm("Are you sure you want to disable Two-Factor Authentication? This will reduce your account's security.")) {
            setIsDisabling(true);
            setError('');
            try {
                await updateTwoFactorStatus(false);
            } catch (err: any) {
                setError(err.message || 'Failed to disable 2FA.');
            } finally {
                setIsDisabling(false);
            }
        }
    };

    return (
        <>
            <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Security</h1>
                    <Link
                        to="/pricing"
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors text-sm"
                    >
                        <span>Upgrade to Premium</span>
                    </Link>
                </div>
                
                {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Password Card */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Password</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 flex-grow">
                            {hasPasswordProvider ? 'Change the password for your account.' : 'Create a password to add another sign-in method.'}
                        </p>
                        <div className="mt-4 text-right">
                             <button 
                                onClick={() => setChangePasswordModalOpen(true)}
                                className="text-sm font-semibold text-brand-red hover:underline"
                            >
                                {hasPasswordProvider ? 'Change' : 'Create'}
                            </button>
                        </div>
                    </div>

                    {/* 2FA Card */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Two factor authentication</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Two Factor Authentication improves your account security.
                        </p>
                        <div className="flex-grow mt-4 text-gray-600 dark:text-gray-400">
                             <p>You can enable Two Factor Authentication with your current password and a QR given code.</p>
                             <p className="mt-2">
                                Status: 
                                <span className={`font-bold ml-2 ${user?.twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                    {user?.twoFactorEnabled ? 'enabled' : 'disabled'}
                                </span>
                             </p>
                        </div>
                        <div className="mt-4 text-right">
                            {user?.twoFactorEnabled ? (
                                <button onClick={handleDisable2FA} disabled={isDisabling} className="text-sm font-semibold text-brand-red hover:underline disabled:opacity-50">
                                    {isDisabling ? 'Disabling...' : 'Disable'}
                                </button>
                            ) : (
                                <button onClick={() => setTwoFactorModalOpen(true)} className="text-sm font-semibold text-brand-red hover:underline">
                                    Enable
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen} 
                onClose={() => setChangePasswordModalOpen(false)} 
            />
            <TwoFactorAuthModal 
                isOpen={isTwoFactorModalOpen} 
                onClose={() => setTwoFactorModalOpen(false)} 
            />
        </>
    );
};

export default SecurityPage;