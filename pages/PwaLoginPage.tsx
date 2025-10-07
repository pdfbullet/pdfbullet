import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, KeyIcon, GitHubIcon, SSOIcon, UserIcon, EmailIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';
import { useWebAuthn } from '../hooks/useWebAuthn.ts';
import FaceLoginModal from '../components/FaceLoginModal.tsx';

interface PwaLoginPageProps {
  onOpenForgotPasswordModal: () => void;
}

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

const PwaLoginPage: React.FC<PwaLoginPageProps> = ({ onOpenForgotPasswordModal }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceLoginModalOpen, setIsFaceLoginModalOpen] = useState(false);
  const { loginOrSignupWithGoogle, signInWithEmail, loginOrSignupWithGithub, signInWithCustomToken } = useAuth();
  const { login: passkeyLogin, isWebAuthnSupported } = useWebAuthn();
  const location = useLocation();

  const handlePasskeyLogin = async () => {
    if (!usernameOrEmail) {
        setError("Please enter your email to find your passkeys.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await passkeyLogin(usernameOrEmail);
      if (result.token) {
          await signInWithCustomToken(result.token);
      } else {
        throw new Error('Passkey verification failed.');
      }
    } catch(err: any) {
       setError(err.message || 'Passkey login failed.');
    } finally {
       setIsLoading(false);
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmail(usernameOrEmail, password);
    } catch (err: any) {
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential', 'auth/invalid-email'].includes(err.code)) {
        setError('Invalid email or password.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
      setError('');
      setIsLoading(true);
      try {
        const redirectInfo = { from: location.state?.from, plan: location.state?.plan };
        sessionStorage.setItem('postLoginRedirect', JSON.stringify(redirectInfo));
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

  const passkeyText = getPasskeyButtonText(true);

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-800 p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <Logo className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Log in to your account to continue</p>
          </div>
          
          <div className="space-y-3">
              <button onClick={() => handleSocialSignIn('google')} className="social-btn"><GoogleIcon className="h-5 w-5" /> Continue with Google</button>
              <button onClick={() => handleSocialSignIn('github')} className="social-btn bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"><GitHubIcon className="h-5 w-5" /> Continue with GitHub</button>
          </div>

          <div className="separator">OR</div>

          {error && <p className="text-center text-sm text-red-500 font-semibold bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
          <form className="space-y-4" onSubmit={handleEmailSignIn}>
            <div className="relative">
              <EmailIcon className="input-icon" />
              <input type="text" autoComplete="username" required value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} className="input-field" placeholder="Username or Email" />
            </div>
            <div className="relative">
              <KeyIcon className="input-icon" />
              <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Password" />
            </div>
            <div className="text-right text-sm">
              <button type="button" onClick={onOpenForgotPasswordModal} className="font-medium text-brand-red hover:underline">Forgot password?</button>
            </div>
            <button type="submit" disabled={isLoading} className="primary-btn">{isLoading ? 'Signing In...' : 'Log In'}</button>
          </form>

          <div className="space-y-3 pt-2">
            <button onClick={() => setIsFaceLoginModalOpen(true)} className="secondary-btn"><UserIcon className="h-5 w-5" /> Continue with Face ID</button>
            {isWebAuthnSupported && <button onClick={handlePasskeyLogin} disabled={isLoading} className="secondary-btn"><SSOIcon className="h-5 w-5" /> {passkeyText}</button>}
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-red hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
      <FaceLoginModal mode="login" isOpen={isFaceLoginModalOpen} onClose={() => setIsFaceLoginModalOpen(false)} />
      <style>{`
        .social-btn { display: flex; justify-content: center; align-items: center; gap: 0.75rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: white; padding: 0.75rem 1rem; font-semibold; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
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
        .primary-btn { width: 100%; background-color: #B90B06; color: white; font-weight: 700; padding: 0.75rem; border-radius: 0.5rem; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        .primary-btn:hover { background-color: #991B1B; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .secondary-btn { width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.75rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; background-color: white; padding: 0.75rem 1rem; font-semibold; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        .dark .secondary-btn { border-color: #4B5563; background-color: #1F2937; color: #E5E7EB; }
        .secondary-btn:hover { background-color: #F9FAFB; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        .dark .secondary-btn:hover { background-color: #374151; }
        .secondary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  );
};

export default PwaLoginPage;
