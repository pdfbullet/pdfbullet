import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, EmailIcon, KeyIcon } from '../components/icons.tsx';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginOrSignupWithGoogle, signUpWithEmail } = useAuth();
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
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);
      // onAuthStateChanged will handle navigation after successful signup
    } catch (err: any) {
      setError(err.message || 'Failed to create an account. The email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
      setError('');
      setIsLoading(true);
      try {
        const redirectInfo = {
          from: location.state?.from,
          plan: location.state?.plan,
        };
        sessionStorage.setItem('postLoginRedirect', JSON.stringify(redirectInfo));

        const pendingData = localStorage.getItem('pendingInvoiceData');
        if (pendingData) {
            sessionStorage.setItem('pendingInvoiceDataRedirect', pendingData);
            localStorage.removeItem('pendingInvoiceData');
        }

        await loginOrSignupWithGoogle();
      } catch (err: any) {
          setError(err.message || 'Failed to start sign up with Google.');
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {location.state?.from === 'pricing' || location.state?.from === '/invoice-generator' ? 'Create an Account to Continue' : 'Create a new account'}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" state={{ from: location.state?.from, plan: location.state?.plan }} className="font-medium text-brand-red hover:text-brand-red-dark">
              sign in
            </Link>
          </p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-lg animated-border">
            {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-6">{error}</p>}
            
            <form className="space-y-6" onSubmit={handleEmailSignUp}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 px-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                  placeholder="Email address" />
              </div>
              <div>
                <label htmlFor="password"className="sr-only">Password</label>
                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 px-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                  placeholder="Password (6+ characters)" />
              </div>
              <div>
                <label htmlFor="confirm-password"className="sr-only">Confirm Password</label>
                <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 px-3 text-sm placeholder-gray-500 focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red"
                  placeholder="Confirm Password" />
              </div>
              <div>
                <button type="submit" disabled={isLoading} className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-red py-2 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors">
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
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
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
                <GoogleIcon className="h-5 w-5" />
                {isLoading ? 'Redirecting...' : 'Sign Up with Google'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;