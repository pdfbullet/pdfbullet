import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, EmailIcon, KeyIcon } from '../components/icons.tsx';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginOrSignupWithGoogle, signInWithEmail } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = "Login | I Love PDFLY";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Sign in to your I Love PDFLY account to access all your tools and premium features. Manage your documents easily and securely.");
    }
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      // onAuthStateChanged will handle navigation after successful login
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
      setError('');
      setIsLoading(true);
      try {
        // Store where the user should be redirected after login
        const redirectInfo = {
          from: location.state?.from,
          plan: location.state?.plan,
        };
        sessionStorage.setItem('postLoginRedirect', JSON.stringify(redirectInfo));
        
        // Also persist any invoice data through the redirect
        const pendingData = localStorage.getItem('pendingInvoiceData');
        if (pendingData) {
            sessionStorage.setItem('pendingInvoiceDataRedirect', pendingData);
            localStorage.removeItem('pendingInvoiceData');
        }
        
        await loginOrSignupWithGoogle();
        // The page will now redirect to Google for sign-in
      } catch (err: any) {
          setError(err.message || 'Failed to start sign in with Google.');
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/signup" state={{ from: location.state?.from, plan: location.state?.plan }} className="font-medium text-brand-red hover:text-brand-red-dark">
              create a new account
            </Link>
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-lg animated-border">
            {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-6">{error}</p>}
            
            <form className="space-y-6" onSubmit={handleEmailSignIn}>
              <div>
                <label htmlFor="email" className="sr-only">Username</label>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 px-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                  placeholder="Username" />
              </div>

              <div>
                <label htmlFor="password"className="sr-only">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 px-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                    placeholder="Password" />
              </div>

              <div>
                <button type="submit" disabled={isLoading} className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-red py-2 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">OR</span>
                </div>
            </div>
            
            <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
                <GoogleIcon className="h-5 w-5" />
                {isLoading ? 'Redirecting...' : 'Sign In with Google'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;