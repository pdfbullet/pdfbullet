import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, EmailIcon, KeyIcon, FacebookIcon, GitHubIcon } from '../components/icons.tsx';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const { loginOrSignupWithGoogle, signUpWithEmail, loginOrSignupWithGithub } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = "Sign Up | Create Your Free I Love PDFLY Account";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Create a free account with I Love PDFLY to unlock more features. Sign up to manage your documents more effectively.");
    }
  }, []);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setIsEmailLoading(true);
    try {
      await signUpWithEmail(email, password);
      // onAuthStateChanged will handle successful navigation
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign up is currently disabled. Please contact support or try another method.');
      } else {
        setError(err.message || 'Failed to create an account.');
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
      setError('');
      setIsGoogleLoading(true);
      try {
        const redirectInfo = { from: location.state?.from, plan: location.state?.plan };
        sessionStorage.setItem('postLoginRedirect', JSON.stringify(redirectInfo));

        const pendingData = localStorage.getItem('pendingInvoiceData');
        if (pendingData) {
            sessionStorage.setItem('pendingInvoiceDataRedirect', pendingData);
            localStorage.removeItem('pendingInvoiceData');
        }

        await loginOrSignupWithGoogle();
      } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
          setError(err.message || 'Failed to sign up with Google. Please try again.');
        }
      } finally {
        setIsGoogleLoading(false);
      }
  };
  
  const handleGithubSignUp = async () => {
    setError('');
    setIsGithubLoading(true);
    try {
      const redirectInfo = { from: location.state?.from, plan: location.state?.plan };
      sessionStorage.setItem('postLoginRedirect', JSON.stringify(redirectInfo));

      const pendingData = localStorage.getItem('pendingInvoiceData');
      if (pendingData) {
          sessionStorage.setItem('pendingInvoiceDataRedirect', pendingData);
          localStorage.removeItem('pendingInvoiceData');
      }

      await loginOrSignupWithGithub();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign up with GitHub. Please try again.');
      }
    } finally {
      setIsGithubLoading(false);
    }
  };

  const isLoading = isEmailLoading || isGoogleLoading || isGithubLoading;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {location.state?.from === 'pricing' || location.state?.from === '/invoice-generator' ? 'Create an Account to Continue' : 'Create a Free Account'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" state={{ from: location.state?.from, plan: location.state?.plan }} className="font-medium text-brand-red hover:text-brand-red-dark">
              Sign in
            </Link>
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-xl animated-border">
            {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-6">{error}</p>}
            
             <div className="space-y-4">
                <button
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                    {isGoogleLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <>
                            <GoogleIcon className="h-5 w-5" />
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleGithubSignUp}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-800 dark:bg-gray-900 py-3 px-4 text-sm font-semibold text-white hover:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                    {isGithubLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <>
                            <GitHubIcon className="h-5 w-5" />
                            <span>Continue with GitHub</span>
                        </>
                    )}
                </button>
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">Or with email</span>
                </div>
            </div>
            
            <form className="space-y-6" onSubmit={handleEmailSignUp}>
              <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <EmailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-3 pl-10 pr-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                  placeholder="Email address" />
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-3 pl-10 pr-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                  placeholder="Password (6+ characters)" />
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-3 pl-10 pr-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                  placeholder="Confirm Password" />
              </div>
              <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center rounded-md border border-transparent bg-brand-red py-3 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors">
                  {isEmailLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Creating Account...</span>
                      </>
                  ) : 'Create Account'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;