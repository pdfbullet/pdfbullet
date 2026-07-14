import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, GitHubIcon, SSOIcon, UserIcon, EmailIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';
import { useWebAuthn } from '../hooks/useWebAuthn.ts';
import FaceLoginModal from '../components/FaceLoginModal.tsx';

const getPasskeyButtonText = (isLogin: boolean): string => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isLogin) {
        if (isIOS) return "Sign in with Face ID / Touch ID";
        if (isAndroid) return "Sign in with Fingerprint";
        return "Sign in with Passkey";
    }
    return "Sign up with Passkey";
};

const PwaSignUpPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFaceLoginModalOpen, setIsFaceLoginModalOpen] = useState(false);
    const { loginOrSignupWithGoogle, loginOrSignupWithGithub } = useAuth();
    const { register: registerPasskey, isWebAuthnSupported } = useWebAuthn();
    const location = useLocation();

    const handleSocialAuth = async (provider: 'google' | 'github') => {
        setError('');
        setIsLoading(true);
        try {
            const redirectInfo = { from: location.state?.from, plan: location.state?.plan };
            sessionStorage.setItem('postLoginRedirect', JSON.stringify(redirectInfo));
            if (provider === 'google') await loginOrSignupWithGoogle();
            if (provider === 'github') await loginOrSignupWithGithub();
        } catch (err: any) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message || `Failed to sign up with ${provider}.`);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasskeyRegister = async () => {
        if (!email) {
            setError("Please enter your email address to register a passkey.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await registerPasskey(email);
            setSuccess(`Passkey registered! You can now log in using your email and passkey.`);
        } catch(err: any) {
            setError(err.message || "Failed to register passkey. Your device might not have a screen lock (PIN, fingerprint, face) set up, or you may have cancelled the request.");
        } finally {
            setIsLoading(false);
        }
    };

    const passkeyText = getPasskeyButtonText(false);
  
    return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-800 p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <Logo className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create an Account</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Join us to streamline your document workflow.</p>
          </div>

          <div className="space-y-3">
            <button onClick={() => handleSocialAuth('google')} className="social-btn"><GoogleIcon className="h-5 w-5" /> Continue with Google</button>
            <button onClick={() => handleSocialAuth('github')} className="social-btn bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"><GitHubIcon className="h-5 w-5" /> Continue with GitHub</button>
          </div>

          <div className="separator">OR</div>
          
          {error && <p className="text-center text-sm text-red-500 font-semibold bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
          {success && <p className="text-center text-sm text-green-600 font-semibold bg-green-100 dark:bg-green-900/20 p-3 rounded-md">{success}</p>}

          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">Sign up password-free with a Passkey or Face ID. Enter your email to begin.</p>
            <div className="relative">
                <EmailIcon className="input-icon" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" className="input-field" />
            </div>
            {isWebAuthnSupported && <button onClick={handlePasskeyRegister} disabled={isLoading} className="secondary-btn"><SSOIcon className="h-5 w-5" /> {passkeyText}</button>}
            <button onClick={() => setIsFaceLoginModalOpen(true)} className="secondary-btn"><UserIcon className="h-5 w-5" /> Set up Face Login</button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-red hover:underline">Log in</Link>
          </p>
        </div>
      </div>
      <FaceLoginModal mode="register" isOpen={isFaceLoginModalOpen} onClose={() => setIsFaceLoginModalOpen(false)} />
       <style>{`
        .social-btn { display: flex; justify-content: center; align-items: center; gap: 0.75rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: white; padding: 0.75rem 1rem; font-semibold; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); width: 100%; }
        .dark .social-btn { border-color: #4B5563; background-color: #1F2937; color: #E5E7EB; }
        .social-btn:hover { background-color: #F9FAFB; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        .dark .social-btn:hover { background-color: #374151; }
        .separator { position: relative; text-align: center; color: #6B7280; font-size: 0.875rem; margin: 1.5rem 0; }
        .separator::before, .separator::after { content: ''; position: absolute; top: 50%; width: calc(50% - 20px); border-top: 1px solid #E5E7EB; }
        .dark .separator::before, .dark .separator::after { border-color: #374151; }
        .separator::before { left: 0; }
        .separator::after { right: 0; }
        .input-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9CA3AF; }
        .input-field { width: 100%; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: white; padding: 0.75rem 0.75rem 0.75rem 2.5rem; transition: border-color 0.2s, box-shadow 0.2s; }
        .dark .input-field { border-color: #4B5563; background-color: #1F2937; }
        .input-field:focus { outline: none; border-color: #B90B06; box-shadow: 0 0 0 1px #B90B06; }
        .secondary-btn { width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.75rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: white; padding: 0.75rem 1rem; font-semibold; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        .dark .secondary-btn { border-color: #4B5563; background-color: #1F2937; color: #E5E7EB; }
        .secondary-btn:hover { background-color: #F9FAFB; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        .dark .secondary-btn:hover { background-color: #374151; }
        .secondary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  );
};

export default PwaSignUpPage;
