import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useWebAuthn } from '../hooks/useWebAuthn.ts';
import { GoogleIcon, GitHubIcon, EmailIcon, KeyIcon, SSOIcon } from './icons.tsx';
import { Logo } from './Logo.tsx';

interface MobileAuthScreenProps {
    onOpenForgotPasswordModal: () => void;
}

const MobileAuthScreen: React.FC<MobileAuthScreenProps> = ({ onOpenForgotPasswordModal }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { 
        loginOrSignupWithGoogle, 
        signInWithEmail, 
        signUpWithEmail, 
        loginOrSignupWithGithub 
    } = useAuth();
    const { register: registerPasskey, login: passkeyLogin, isWebAuthnSupported } = useWebAuthn();

    const handleSocialAuth = async (provider: 'google' | 'github') => {
        setError('');
        setIsLoading(true);
        try {
            if (provider === 'google') await loginOrSignupWithGoogle();
            if (provider === 'github') await loginOrSignupWithGithub();
        } catch (err: any) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message || `Failed to sign in with ${provider}.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!isLoginView && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!isLoginView && password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        try {
            if (isLoginView) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
        } catch (err: any) {
            let message = 'An error occurred. Please try again.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                message = 'Invalid email or password.';
            } else if (err.code === 'auth/email-already-in-use') {
                message = 'An account with this email already exists.';
            } else {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskey = async () => {
        if (!email) {
            setError("Please enter your email to use a passkey.");
            return;
        }
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            if (isLoginView) {
                await passkeyLogin(email);
            } else {
                await registerPasskey(email);
                setSuccess('Passkey registered! You can now log in.');
            }
        } catch (err: any) {
            setError(err.message || 'Passkey operation failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let passkeyText = isLoginView ? "Sign in with Passkey" : "Sign up with Passkey";
    if (isLoginView) {
        if (isIOS) passkeyText = "Sign in with Face ID / Touch ID";
        if (isAndroid) passkeyText = "Sign in with Fingerprint";
    }
    
    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-[200] flex flex-col items-center justify-center p-6 text-gray-900 dark:text-white">
            <div className="w-full max-w-sm">
                <Logo className="h-10 w-auto mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-center mb-2">Welcome to I Love PDFLY</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    {isLoginView ? 'Log in to continue' : 'Create an account to get started'}
                </p>
                
                <div className="space-y-4">
                    <button onClick={() => handleSocialAuth('google')} className="w-full flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2.5 px-4 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
                        <GoogleIcon className="h-5 w-5" /> Continue with Google
                    </button>
                    <button onClick={() => handleSocialAuth('github')} className="w-full flex justify-center items-center gap-2 rounded-md bg-gray-800 dark:bg-gray-700 py-2.5 px-4 font-semibold text-white hover:bg-gray-900 dark:hover:bg-gray-600">
                        <GitHubIcon className="h-5 w-5" /> Continue with GitHub
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700" /></div>
                    <div className="relative flex justify-center text-sm"><span className="bg-gray-100 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">OR</span></div>
                </div>

                {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
                {success && <p className="text-center text-sm text-green-600 mb-4">{success}</p>}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="relative">
                        <EmailIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" className="w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black" />
                    </div>
                    <div className="relative">
                        <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black" />
                    </div>
                    {!isLoginView && (
                        <div className="relative">
                            <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirm Password" className="w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black" />
                        </div>
                    )}
                    {isLoginView && (
                        <div className="text-right text-sm">
                            <button type="button" onClick={onOpenForgotPasswordModal} className="font-medium text-brand-red hover:text-brand-red-dark">
                                Forgot password?
                            </button>
                        </div>
                    )}
                    <button type="submit" disabled={isLoading} className="w-full bg-brand-red text-white font-bold py-2.5 rounded-md hover:bg-brand-red-dark disabled:opacity-50">
                        {isLoading ? 'Loading...' : (isLoginView ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                {isWebAuthnSupported && (
                    <div className="mt-4">
                        <button onClick={handlePasskey} disabled={isLoading} className="w-full flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2.5 px-4 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                            <SSOIcon className="h-5 w-5" /> {isLoginView ? passkeyText : "Register with Passkey"}
                        </button>
                    </div>
                )}
                
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setSuccess(''); }} className="font-medium text-brand-red hover:text-brand-red-dark">
                        {isLoginView ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default MobileAuthScreen;
