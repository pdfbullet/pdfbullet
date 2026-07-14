import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { auth, firebase } from '../firebase/config.ts';
import { useWebAuthn } from '../hooks/useWebAuthn.ts';
import { GoogleIcon, YahooIcon, EmailIcon, KeyIcon, UserIcon, FaceIdIcon, FingerprintIcon, PasskeyIcon, EyeIcon, EyeOffIcon } from './icons.tsx';
import { Logo } from './Logo.tsx';

interface MobileAuthScreenProps {
    onOpenForgotPasswordModal: () => void;
    onContinueAsGuest: () => void;
}

const getPasskeyButtonText = (isLogin: boolean): string => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isLogin) {
        if (isIOS) return "Sign in with Face ID / Touch ID";
        if (isAndroid) return "Sign in with Fingerprint";
        return "Sign in with Passkey";
    } else {
        if (isIOS) return "Sign up with Face ID / Touch ID";
        if (isAndroid) return "Sign up with Fingerprint";
        return "Sign up with Passkey";
    }
};

const MobileAuthScreen: React.FC<MobileAuthScreenProps> = ({ onOpenForgotPasswordModal, onContinueAsGuest }) => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const navigate = useNavigate();

    const [isLoginView, setIsLoginView] = useState(true);
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {
        loginOrSignupWithGoogle,
        loginOrSignupWithYahoo,
        signInWithEmail,
        signUpWithEmail,
        signInWithCustomToken,
        loginWithFace,
        logout
    } = useAuth();
    const { register: registerPasskey, login: passkeyLogin, isWebAuthnSupported } = useWebAuthn();

    const handleSocialAuth = async (provider: 'google' | 'yahoo') => {
        setError('');
        setIsLoading(true);
        try {
            if (provider === 'google') await loginOrSignupWithGoogle();
            if (provider === 'yahoo') await loginOrSignupWithYahoo();
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

        setIsLoading(true);
        try {
            if (isLoginView) {
                // Set persistence if rememberMe is checked
                if (!rememberMe) {
                    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
                } else {
                    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                }
                await signInWithEmail(usernameOrEmail, password);
            } else {
                await signUpWithEmail(usernameOrEmail, signupPassword);
                // Success: Show the passkey setup prompt instead of just logging in
                setShowPasskeyPrompt(true);
            }
        } catch (err: any) {
            let message = 'An error occurred. Please try again.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') {
                message = 'Invalid email or password.';
            } else if (err.code === 'auth/email-already-in-use') {
                message = 'This email is already registered.';
            } else if (err.code === 'auth/weak-password') {
                message = 'Password should be at least 6 characters.';
            } else {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskey = async () => {
        if (!usernameOrEmail) {
            setError("Please enter your email first.");
            return;
        }
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            if (isLoginView) {
                const result = await passkeyLogin(usernameOrEmail);
                if (result.token) {
                    await loginWithFace(usernameOrEmail);
                } else {
                    throw new Error('Passkey login failed.');
                }
            } else {
                await registerPasskey(usernameOrEmail);
                try {
                    const secureRandomPassword = Math.random().toString(36).slice(-8) + "A1!xZ" + Date.now();
                    await signUpWithEmail(usernameOrEmail, secureRandomPassword);
                } catch (firebaseErr: any) {
                    if (firebaseErr.code !== 'auth/email-already-in-use') {
                        console.error("Firebase background signup error:", firebaseErr);
                    }
                }
                setSuccess('Biometric login enabled!');
                setTimeout(() => setShowPasskeyPrompt(false), 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Passkey operation failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const passkeyText = getPasskeyButtonText(isLoginView);

    return (
        <div className="fixed inset-0 bg-[#070D0E] z-[500] flex flex-col font-sans overflow-hidden">
            {/* Powerful Backdrop Blur and Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#1E3B3D] opacity-30 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[30%] bg-[#0F2627] opacity-40 blur-[80px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#070D0E]/80 backdrop-blur-3xl" />

            {/* Powerful SVG Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid-mobile" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-mobile)" />
                </svg>
            </div>

            {/* Top Section */}
            <div className="relative w-full px-6 pt-5 pb-2 flex-shrink-0 text-white z-10 transition-all duration-500 animate-in fade-in slide-in-from-top-4">
                <button
                    onClick={() => {
                        if (showPasskeyPrompt) setShowPasskeyPrompt(false);
                        else if (!isLoginView) setIsLoginView(true);
                        else navigate('/'); // Go home if already on login
                    }}
                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3 border border-white/5 backdrop-blur-md hover:bg-white/20 transition-all active:scale-90"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <Logo className="h-8 w-auto drop-shadow-2xl" />
                </div>
                {!showPasskeyPrompt ? (
                    <>
                        <h1 className="text-2xl font-extrabold tracking-tight leading-tight mb-1 pr-4">
                            {isLoginView ? 'Welcome back to Pdf Bullet' : 'Sign up now'}
                        </h1>
                        <p className="text-white/50 text-[12px] font-medium leading-relaxed max-w-[90%]">
                            {isLoginView ? 'Log in to continue your workflow.' : 'Create your account instantly.'}
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-extrabold tracking-tight leading-tight mb-1 animate-in zoom-in-95 duration-500">Security Setup</h1>
                        <p className="text-white/50 text-[12px] font-medium max-w-[90%]">Enable biometrics for a faster, safer login experience.</p>
                    </>
                )}
            </div>

            {/* Bottom Sheet Area */}
            <div className={`relative w-full flex-1 ${showPasskeyPrompt ? 'bg-[#0F2627]' : 'bg-[#FDFDFD]'} dark:bg-gray-950 rounded-t-[2.5rem] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.15)] z-20 transition-all duration-500 overflow-hidden animate-in slide-in-from-bottom-6 duration-700`}>
                <div className="flex-1 px-6 pt-5 pb-4 sm:px-10">
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6 opacity-30 shadow-inner" />

                    {showPasskeyPrompt ? (
                        <div className="animate-in fade-in zoom-in-95 duration-700 h-full flex flex-col justify-center text-center pb-10 relative">
                            {/* Inner ambient glow for setup screen */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-[#1E3B3D] blur-[120px] opacity-20 pointer-events-none rounded-full" />

                            <div className="relative z-10 px-4">
                                <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/10 shadow-2xl -rotate-6 animate-pulse">
                                    {isIOS ? <FaceIdIcon className="h-12 w-12 text-white" /> : isAndroid ? <FingerprintIcon className="h-12 w-12 text-white" /> : <PasskeyIcon className="h-12 w-12 text-white" />}
                                </div>

                                <h2 className="text-2xl font-black text-white mb-4 tracking-tight">One-Touch Security</h2>
                                <p className="text-white/50 text-[15px] max-w-[260px] mx-auto mb-12 leading-relaxed font-medium">Use your biometric signature to unlock PDF Bullet instantly. Safer, faster, better.</p>

                                <div className="space-y-4">
                                    <button onClick={handlePasskey} disabled={isLoading} className="w-full bg-white text-[#0F2627] font-black py-4.5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-[0.97] transition-all flex items-center justify-center gap-3">
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-3 border-[#0F2627]/20 border-t-[#0F2627] rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isIOS ? <FaceIdIcon className="h-6 w-6" /> : isAndroid ? <FingerprintIcon className="h-6 w-6" /> : <PasskeyIcon className="h-6 w-6" />}
                                                Enable {isIOS ? 'Face ID' : isAndroid ? 'Fingerprint' : 'Passkey'}
                                            </>
                                        )}
                                    </button>
                                    <button onClick={() => setShowPasskeyPrompt(false)} className="w-full py-2 text-white/30 font-extrabold hover:text-white/60 active:scale-95 transition-all text-[14px]">
                                        Setup manually instead
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex bg-gray-100/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 mb-5 shadow-inner">
                                <button
                                    onClick={() => { setIsLoginView(true); setError(''); setSuccess(''); }}
                                    className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all duration-300 active:scale-[0.98] ${isLoginView ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => { setIsLoginView(false); setError(''); setSuccess(''); }}
                                    className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all duration-300 active:scale-[0.98] ${!isLoginView ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {error && <p className="text-center text-[13px] font-semibold text-red-500 mb-4 bg-red-50/80 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 py-2.5 px-4 rounded-xl animate-in fade-in zoom-in-95 duration-300">{error}</p>}
                            {success && <p className="text-center text-[13px] font-semibold text-green-600 mb-4 bg-green-50/80 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 py-2.5 px-4 rounded-xl animate-in fade-in zoom-in-95 duration-300">{success}</p>}

                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <form onSubmit={handleEmailAuth} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1E3B3D] transition-colors">
                                                {isLoginView ? <UserIcon className="h-4.5 w-4.5" /> : <EmailIcon className="h-4.5 w-4.5" />}
                                            </div>
                                            <input type="email" value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} required placeholder="user@example.com" className="w-full pl-11 pr-4 py-3 rounded-1.5xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#1E3B3D] focus:ring-4 focus:ring-[#1E3B3D]/5 transition-all outline-none text-[14px] font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1E3B3D] transition-colors">
                                                <KeyIcon className="h-4.5 w-4.5" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={isLoginView ? password : signupPassword}
                                                onChange={e => isLoginView ? setPassword(e.target.value) : setSignupPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-11 pr-11 py-3 rounded-1.5xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#1E3B3D] focus:ring-4 focus:ring-[#1E3B3D]/5 transition-all outline-none text-[14px] font-medium"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                                                {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {isLoginView && (
                                        <div className="flex justify-between items-center px-1">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded-md border-gray-200 text-[#1E3B3D] focus:ring-[#1E3B3D] transition-all cursor-pointer"
                                                />
                                                <span className="text-[12px] font-bold text-gray-500">Remember me</span>
                                            </label>
                                            <button type="button" onClick={onOpenForgotPasswordModal} className="text-[12px] font-bold text-[#1E3B3D] hover:underline active:scale-95">
                                                Forgot?
                                            </button>
                                        </div>
                                    )}

                                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#1E3B3D] to-[#0F2627] text-white font-black py-4 rounded-xl shadow-[0_10px_25px_rgba(30,59,61,0.25)] active:scale-[0.98] disabled:opacity-70 transition-all duration-300 mt-2 text-[15px]">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            isLoginView ? 'Login to Account' : 'Create Account'
                                        )}
                                    </button>
                                </form>

                                <div className="relative mt-8 mb-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800" /></div>
                                    <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-widest bg-[#FDFDFD] dark:bg-gray-950 px-4 text-gray-400">Quick Access</div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => handleSocialAuth('google')} className="flex-1 flex justify-center items-center gap-2.5 rounded-xl border border-gray-100 bg-white dark:bg-gray-900 py-3 px-3 font-bold text-gray-700 dark:text-gray-200 shadow-sm active:scale-[0.95] transition-all text-[14px]">
                                        <GoogleIcon className="h-5 w-5" /> Google
                                    </button>
                                    <button onClick={() => handleSocialAuth('yahoo')} className="flex-1 flex justify-center items-center gap-2.5 rounded-xl border border-gray-100 bg-white dark:bg-gray-900 py-3 px-3 font-bold text-gray-700 dark:text-gray-200 shadow-sm active:scale-[0.95] transition-all text-[14px]">
                                        <YahooIcon className="h-5 w-5 text-[#6001d2]" /> Yahoo
                                    </button>
                                </div>

                                <div className="mt-5 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={onContinueAsGuest}
                                        className="text-sm font-extrabold text-[#1E3B3D] dark:text-[#4A8C8E] hover:underline transition-all active:scale-95"
                                    >
                                        Continue as Guest
                                    </button>
                                </div>

                                {isWebAuthnSupported && isLoginView && (
                                    <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                                        <button onClick={handlePasskey} disabled={isLoading} className="w-full flex justify-center items-center gap-3.5 rounded-xl bg-[#1E3B3D]/5 border border-[#1E3B3D]/10 py-4 px-4 font-bold text-[#1E3B3D] dark:text-white active:scale-[0.98] transition-all text-[14px] shadow-sm hover:bg-[#1E3B3D]/10">
                                            <div className="flex-shrink-0 w-8 h-8 bg-[#1E3B3D] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#1E3B3D]/20">
                                                {isIOS ? <FaceIdIcon className="h-5 w-5" /> : isAndroid ? <FingerprintIcon className="h-5 w-5" /> : <KeyIcon className="h-5 w-5" />}
                                            </div>
                                            <span>{passkeyText}</span>
                                        </button>
                                    </div>
                                )}

                                <p className="mt-6 text-center text-gray-400 text-[11px] font-medium pb-1">
                                    By continuing, you agree to our <Link to="/terms-of-service" className="font-bold underline hover:text-[#1E3B3D]">Terms</Link> & <Link to="/privacy-policy" className="font-bold underline hover:text-[#1E3B3D]">Privacy</Link>.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


export default MobileAuthScreen;

