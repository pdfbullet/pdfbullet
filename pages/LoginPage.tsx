
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

// Add type definition for Google Identity Services library
declare global {
    interface Window {
        google: any;
    }
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginOrSignupWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const fromPricing = location.state?.from === 'pricing';
  const fromInvoice = location.state?.from === '/invoice-generator';
  const selectedPlan = location.state?.plan;

  useEffect(() => {
    document.title = "Login | I Love PDFLY";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Sign in to your I Love PDFLY account to access all your tools and premium features. Manage your documents easily and securely.");
    }
  }, []);

  const handleSuccessfulLogin = () => {
    const pendingData = localStorage.getItem('pendingInvoiceData');
    if (fromInvoice && pendingData) {
        localStorage.removeItem('pendingInvoiceData');
        navigate('/invoice-generator', { state: { restoredData: JSON.parse(pendingData) }, replace: true });
    } else if (fromPricing) {
        navigate('/payment', { state: { plan: selectedPlan } });
    } else {
        navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      handleSuccessfulLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleCredentialResponse = async (response: any) => {
      setError('');
      setIsLoading(true);
      try {
        const jwt = response.credential;
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        
        await loginOrSignupWithGoogle({
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        });

        handleSuccessfulLogin();
      } catch (err: any) {
          setError(err.message || 'Failed to sign in with Google.');
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (window.google) {
        window.google.accounts.id.initialize({
            client_id: '974035582208-leq5h6cbrjr4n6q78pagt7br7piuvoep.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', width: '300' }
        );
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {fromPricing || fromInvoice ? 'Sign in to Continue' : 'Sign in to your account'}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/signup" state={{ from: location.state?.from, plan: selectedPlan }} className="font-medium text-brand-red hover:text-brand-red-dark">
              create a new account
            </Link>
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-lg animated-border">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
              <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                  <label htmlFor="username" className="sr-only">Username</label>
                  <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-black focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red sm:text-sm"
                      placeholder="Username"
                  />
                  </div>
                  <div>
                  <label htmlFor="password"className="sr-only">Password</label>
                  <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-black focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red sm:text-sm"
                      placeholder="Password"
                  />
                  </div>
              </div>
              <div>
                  <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-red py-2 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:bg-red-300 dark:disabled:bg-red-800 transition-colors"
                  >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
              </div>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">OR</span>
                </div>
            </div>

            <div id="google-signin-button" className="flex justify-center">
                {/* Google's button will be rendered here */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;