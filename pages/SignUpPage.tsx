import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, EmailIcon, KeyIcon, GitHubIcon, SSOIcon, UserIcon } from '../components/icons.tsx';
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
    } else {
        if (isIOS) return "Sign up with Face ID / Touch ID";
        if (isAndroid) return "Sign up with Fingerprint";
        return "Sign up with Passkey";
    }
};

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceLoginModalOpen, setIsFaceLoginModalOpen] = useState(false);
  const { loginOrSignupWithGoogle, loginOrSignupWithGithub, signUpWithEmail } = useAuth();
  const { register: registerPasskey, isWebAuthnSupported } = useWebAuthn();
  const location = useLocation();

  useEffect(() => {
    document.title = "Sign Up | Create Your Free PDFBullet Account";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Create a free account with PDFBullet to unlock more features. Sign up to manage your documents more effectively.");
    }
  }, []);
  
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);
      // onAuthStateChanged in AuthContext will handle navigation
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak. Please use a stronger password.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
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
        setSuccess(`Passkey registered! You can now log in.`);
    } catch(err: any) {
        setError(err.message || "Failed to register passkey. Your device might not have a screen lock (PIN, fingerprint, face) set up, or you may have cancelled the request.");
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
          setError(err.message || `Failed to sign up with ${provider}. Please try again.`);
        }
      } finally {
        setIsLoading(false);
      }
  };

  const passkeyText = getPasskeyButtonText(false);

  return (
    <>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            <Logo className="h-10 w-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {location.state?.from === 'pricing' || location.state?.from === '/invoice-generator' ? 'Create an Account to Continue' : 'Create new account'}
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
            
            {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/20 p-2 rounded-md mb-4">{error}</p>}
            {success && <p className="text-center text-sm text-green-600 bg-green-100 dark:bg-green-900/20 p-2 rounded-md mb-4">{success}</p>}

            <form className="space-y-4" onSubmit={handleEmailSignUp}>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><EmailIcon className="h-5 w-5 text-gray-400" /></div>
                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black py-2.5 pl-10 pr-3 placeholder-gray-500 focus:border-brand-red focus:outline-none focus:ring-brand-red" placeholder="Email address" />
                </div>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><KeyIcon className="h-5 w-5 text-gray-400" /></div>
                    <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black py-2.5 pl-10 pr-3 placeholder-gray-500 focus:border-brand-red focus:outline-none focus:ring-brand-red" placeholder="Password" />
                </div>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><KeyIcon className="h-5 w-5 text-gray-400" /></div>
                    <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black py-2.5 pl-10 pr-3 placeholder-gray-500 focus:border-brand-red focus:outline-none focus:ring-brand-red" placeholder="Confirm Password" />
                </div>
                <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center rounded-md border border-transparent bg-brand-red py-2.5 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:opacity-50 transition-colors">
                        {isLoading ? 'Creating Account...' : 'Sign up'}
                    </button>
                </div>
            </form>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300 dark:border-gray-700" /></div>
            </div>

            <div className="space-y-4">
                <button
                  onClick={() => setIsFaceLoginModalOpen(true)}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                  <UserIcon className="h-5 w-5" />
                  <span>Continue with Face ID</span>
                </button>
                <button
                  onClick={handlePasskeyRegister}
                  disabled={isLoading || !isWebAuthnSupported}
                  className="w-full flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black py-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                  <SSOIcon className="h-5 w-5" />
                  <span>{passkeyText}</span>
                </button>
                {!isWebAuthnSupported && <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">Your device does not support Passkeys.</p>}
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              By creating an account, you agree to PDFBullet's{' '}
              <Link to="/terms-of-service" className="text-brand-red hover:underline">Terms of Service</Link> and{' '}
              <Link to="/privacy-policy" className="text-brand-red hover:underline">Privacy Policy</Link>.
            </p>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already a member?{' '}
              <Link to="/login" state={{ from: location.state?.from, plan: location.state?.plan }} className="font-medium text-brand-red hover:text-brand-red-dark">
                Log in
              </Link>
            </p>
          </div>
        </div>
        <div className="hidden lg:flex flex-1 bg-gray-50 dark:bg-black items-center justify-center p-12 border-l border-gray-200 dark:border-gray-800">
          <div className="max-w-md text-center">
              <img src="https://ik.imagekit.io/fonepay/imgi_25_home.png?updatedAt=1753968278321" alt="PDF tools illustration" className="w-full h-auto" />
              <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">PDF tools for productive people</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                  PDFBullet helps you convert, edit, e-sign, and protect PDF files quickly and easily. Enjoy a full suite of tools to effectively manage documents —no matter where you're working.
              </p>
          </div>
        </div>
      </div>
      <FaceLoginModal
        mode="signup_redirect"
        isOpen={isFaceLoginModalOpen}
        onClose={() => setIsFaceLoginModalOpen(false)}
      />
    </>
  );
};

export default SignUpPage;
