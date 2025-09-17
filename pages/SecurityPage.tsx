import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useWebAuthn, StoredCredential } from '../hooks/useWebAuthn.ts';
import ChangePasswordModal from '../components/ChangePasswordModal.tsx';
import TwoFactorAuthModal from '../components/TwoFactorAuthModal.tsx';
import { SSOIcon, TrashIcon, PlusIcon } from '../components/icons.tsx';

const API_BASE_URL = 'https://ilovepdfly-backend.onrender.com';

const SecurityPage: React.FC = () => {
    const { user, auth, updateTwoFactorStatus } = useAuth();
    const { isWebAuthnSupported, register } = useWebAuthn();

    const [credentials, setCredentials] = useState<StoredCredential[]>([]);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
    const [isDisabling2FA, setIsDisabling2FA] = useState(false);
    const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);

    const hasPasswordProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password');

    const fetchCredentials = async () => {
        if (!user) return;
        setIsLoadingCredentials(true);
        try {
            // In a real app, you would fetch this from your backend
            // For now, this will fail gracefully, showing an empty list.
            const response = await fetch(`${API_BASE_URL}/api/passkey/credentials`);
            if (!response.ok) {
                 console.warn('Could not fetch credentials. Backend endpoint may not be implemented.');
                 setCredentials([]);
                 return;
            }
            const data = await response.json();
            setCredentials(data);
        } catch (err) {
            console.error('Failed to fetch credentials:', err);
        } finally {
            setIsLoadingCredentials(false);
        }
    };
    
    useEffect(() => {
        fetchCredentials();
    }, [user]);

    const handleDisable2FA = async () => {
        if (window.confirm("Are you sure you want to disable Two-Factor Authentication? This will reduce your account's security.")) {
            setIsDisabling2FA(true);
            setError('');
            try {
                await updateTwoFactorStatus(false);
            } catch (err: any) {
                setError(err.message || 'Failed to disable 2FA.');
            } finally {
                setIsDisabling2FA(false);
            }
        }
    };
    
    const handleRegisterPasskey = async () => {
        if (!user || !user.email) {
            setError("An email address is required to register a passkey.");
            return;
        }
        setIsRegisteringPasskey(true);
        setError('');
        setSuccess('');
        try {
            await register(user.email);
            setSuccess('New passkey added successfully!');
            await fetchCredentials(); // Re-fetch credentials after adding a new one
        } catch(err: any) {
            setError(err.message || 'Failed to register passkey.');
        } finally {
            setIsRegisteringPasskey(false);
        }
    };
    
    const removeCredential = async (id: string) => {
        if (window.confirm("Are you sure you want to remove this passkey? You will no longer be able to sign in with it.")) {
            setError('');
            try {
                const response = await fetch(`${API_BASE_URL}/api/passkey/credentials/${id}`, { method: 'DELETE' });
                 if (!response.ok) {
                    throw new Error('Failed to remove passkey from server.');
                }
                setCredentials(prev => prev.filter(c => c.id !== id));
            } catch (err: any) {
                setError(err.message || 'Could not remove passkey.');
            }
        }
    };

    return (
        <>
            <div className="w-full space-y-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Security</h1>
                
                {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                {success && <p className="mb-4 text-center text-sm text-green-600 bg-green-100 dark:bg-green-900/30 p-3 rounded-md">{success}</p>}
                
                 {/* Passkeys Card */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Passkeys</h2>
                     {!isWebAuthnSupported ? (
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">Your browser or device does not support passkeys (WebAuthn).</p>
                     ) : (
                        <div>
                             <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Manage the passkeys (Face ID, fingerprint, security keys) used for passwordless sign-in.</p>
                             <ul className="space-y-3 mb-4">
                                {isLoadingCredentials ? <p className="text-sm text-gray-500">Loading passkeys...</p> : credentials.map(cred => (
                                    <li key={cred.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <SSOIcon className="h-6 w-6 text-gray-500" />
                                            <div>
                                                <p className="font-semibold text-sm">{cred.name}</p>
                                                <p className="text-xs text-gray-500">Added: {new Date(cred.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeCredential(cred.id)} className="p-2 text-gray-400 hover:text-red-500" title="Remove Passkey">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </li>
                                ))}
                             </ul>
                             <button onClick={handleRegisterPasskey} disabled={isRegisteringPasskey} className="flex items-center gap-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-md transition-colors disabled:opacity-50">
                                <PlusIcon className="h-4 w-4"/> {isRegisteringPasskey ? 'Follow prompts...' : 'Add a new passkey'}
                            </button>
                        </div>
                     )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Password Card */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Password</h2>
                        <div className="flex-grow mt-2 text-gray-600 dark:text-gray-400">
                            {hasPasswordProvider ? (
                                <p>Change the password for your account.</p>
                            ) : (
                                <p>Your account was created using a social provider. You can create a password to enable email & password sign-in.</p>
                            )}
                        </div>
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
                        <div className="flex-grow mt-2 text-gray-600 dark:text-gray-400">
                             <p className="text-sm">Improve your account security by requiring a second verification step at sign-in.</p>
                             <p className="mt-2 text-sm">
                                Status: 
                                <span className={`font-bold ml-2 ${user?.twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                    {user?.twoFactorEnabled ? 'enabled' : 'disabled'}
                                </span>
                             </p>
                        </div>
                        <div className="mt-4 text-right">
                            {user?.twoFactorEnabled ? (
                                <button onClick={handleDisable2FA} disabled={isDisabling2FA} className="text-sm font-semibold text-brand-red hover:underline disabled:opacity-50">
                                    {isDisabling2FA ? 'Disabling...' : 'Disable'}
                                </button>
                            ) : (
                                <button onClick={() => setIsTwoFactorModalOpen(true)} className="text-sm font-semibold text-brand-red hover:underline">
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
                onClose={() => setIsTwoFactorModalOpen(false)} 
            />
        </>
    );
};

export default SecurityPage;