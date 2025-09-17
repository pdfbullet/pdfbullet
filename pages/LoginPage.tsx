import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, KeyIcon, GitHubIcon, SSOIcon, UserIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';
import { useWebAuthn } from '../hooks/useWebAuthn.ts';

interface LoginPageProps {
  onOpenForgotPasswordModal: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onOpenForgotPasswordModal }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginOrSignupWithGoogle, signInWithEmail, loginOrSignupWithGithub, signInWithCustomToken } = useAuth();
  const { login: passkeyLogin, isWebAuthnSupported } = useWebAuthn();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | I Love PDFLY";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Sign in to your I Love PDFLY account to access all your tools and premium features. Manage your documents easily and securely.");
    }
  }, []);
  
  const handlePasskeyLogin = async () => {
    if (!usernameOrEmail) {
        setError("Please enter your email address to find your passkeys.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await passkeyLogin(usernameOrEmail);
      if (result.token) {
          await signInWithCustomToken(result.token);
          // onAuthStateChanged will handle navigation
      } else {
        throw new Error('Passkey verification failed or token not provided.');
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
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') {
        setError('Invalid username/email or password. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
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
        
        const pendingData = localStorage.getItem('pendingInvoiceData');
        if (pendingData) {
            sessionStorage.setItem('pendingInvoiceDataRedirect', pendingData);
            localStorage.removeItem('pendingInvoiceData');
        }
        
        if (provider === 'google') await loginOrSignupWithGoogle();
        if (provider === 'github') await loginOrSignupWithGithub();
      } catch (err: any) {
          if (err.code !== 'auth/popup-closed-by-user') {
            setError(err.message || `Failed to sign in with ${provider}. Please try again.`);
          }
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <Logo className="h-10 w-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Log in to your Account
          </h1>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
                onClick={() => handleSocialSignIn('google')}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-opacity"
            >
                <GoogleIcon className="h-5 w-5" />
                <span>Google</span>
            </button>
            <button
                onClick={() => handleSocialSignIn('github')}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-md border border-transparent bg-gray-800 dark:bg-gray-700 py-2.5 px-4 text-sm font-semibold text-white hover:bg-gray-900 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-opacity"
            >
                <GitHubIcon className="h-5 w-5" />
                <span>GitHub</span>
            </button>
          </div>

          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300 dark:border-gray-700" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-gray-100 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">OR</span></div>
          </div>

          {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
          <form className="space-y-4" onSubmit={handleEmailSignIn}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></div>
              <input id="username-email" name="username-email" type="text" autoComplete="username" required value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black py-2.5 pl-10 pr-3 placeholder-gray-500 focus:border-brand-red focus:outline-none focus:ring-brand-red" placeholder="Username or Email" />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><KeyIcon className="h-5 w-5 text-gray-400" /></div>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black py-2.5 pl-10 pr-3 placeholder-gray-500 focus:border-brand-red focus:outline-none focus:ring-brand-red" placeholder="Password" />
            </div>
            <div className="flex items-center justify-end text-sm">
              <button type="button" onClick={onOpenForgotPasswordModal} className="font-medium text-brand-red hover:text-brand-red-dark">
                Forgot password?
              </button>
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center rounded-md border border-transparent bg-brand-red py-2.5 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors">
                {isLoading ? 'Signing In...' : 'Log in'}
              </button>
            </div>
          </form>

           <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300 dark:border-gray-700" /></div>
          </div>

          <div>
              <button
                onClick={handlePasskeyLogin}
                disabled={isLoading || !isWebAuthnSupported}
                className="w-full flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                <SSOIcon className="h-5 w-5" />
                <span>Login with Passkey</span>
              </button>
              {!isWebAuthnSupported && <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">Your device does not support Passkeys.</p>}
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-red hover:text-brand-red-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gray-50 dark:bg-black items-center justify-center p-12 border-l border-gray-200 dark:border-gray-800">
        <div className="max-w-md text-center">
            <img src="https://ik.imagekit.io/fonepay/imgi_25_home.png?updatedAt=1753968278321" alt="PDF tools illustration" className="w-full h-auto" />
            <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">PDF tools for productive people</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                iLovePDFLY helps you convert, edit, e-sign, and protect PDF files quickly and easily. Enjoy a full suite of tools to effectively manage documents —no matter where you're working.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;