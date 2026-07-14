import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { GoogleIcon, EmailIcon, KeyIcon, YahooIcon, PasskeyIcon, UserIcon, EyeIcon, EyeOffIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';
import { useWebAuthn } from '../hooks/useWebAuthn.ts';

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const BoltIconSm = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loginOrSignupWithGoogle, loginOrSignupWithYahoo, signUpWithEmail } = useAuth();
  const { register: registerPasskey, isWebAuthnSupported } = useWebAuthn();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign Up | Create Your Free PDFBullet Account';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Create a free account with PDFBullet to unlock more features and manage your documents more effectively.');
    }
  }, []);

  // Handle redirect after successful login (including returning from Google)
  useEffect(() => {
    if (user) {
      setIsLoading(false);
      const postLoginRedirect = sessionStorage.getItem('postLoginRedirect');
      if (postLoginRedirect) {
        try {
          const info = JSON.parse(postLoginRedirect);
          sessionStorage.removeItem('postLoginRedirect');
          navigate(info.from?.pathname || '/', { replace: true });
        } catch (e) {
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    setIsLoading(true);
    try { await signUpWithEmail(email, password); }
    catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists.');
      else setError(err.message || 'Failed to create account.');
    } finally { setIsLoading(false); }
  };

  const handleSocialSignIn = async (provider: 'google' | 'yahoo') => {
    setError(''); 
    setIsLoading(true);
    // Safety timeout: Reset loading after 60 seconds if nothing happens
    const timeout = setTimeout(() => setIsLoading(false), 60000);
    
    try {
      const redirectInfo = { from: location.state?.from, plan: location.state?.plan };
      sessionStorage.setItem('postLoginRedirect', JSON.stringify(redirectInfo));
      if (provider === 'google') await loginOrSignupWithGoogle();
      if (provider === 'yahoo') await loginOrSignupWithYahoo();
      clearTimeout(timeout);
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.code !== 'auth/popup-closed-by-user') setError(err.message || `Failed to sign up with ${provider}.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#070D0E]">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1E3B3D] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0F2627] opacity-30 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Powerful SVG Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-signup" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-signup)" />
        </svg>
      </div>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-20 py-12 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10 animate-fade-in-down">
            <Logo className="h-10 w-auto brightness-0 invert" />
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up">
            Join the <br />
            <span className="text-[#2A5C5E] bg-clip-text text-transparent bg-gradient-to-r from-[#2A5C5E] to-[#4A8C8E]">Next Generation</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-12 animate-fade-in-up">
            Start processing your PDFs with professional tools. It's free, permanent, and incredibly fast.
          </p>

          <div className="grid grid-cols-2 gap-8 animate-fade-in-up">
            <div className="flex flex-col gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-[#1E3B3D]/30 flex items-center justify-center text-[#4A8C8E] group-hover:scale-110 transition-transform">
                <LockIcon />
              </div>
              <div>
                <span className="font-bold text-white text-base">Privacy</span>
                <p className="text-gray-500 text-xs mt-1">Your files are your own. Period.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-[#1E3B3D]/30 flex items-center justify-center text-[#4A8C8E] group-hover:scale-110 transition-transform">
                <BoltIconSm />
              </div>
              <div>
                <span className="font-bold text-white text-base">Efficiency</span>
                <p className="text-gray-500 text-xs mt-1">Optimized for high-volume tasks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-[440px] bg-[#0A1617]/80 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 lg:p-10 border border-[#1E3B3D]/30 relative animate-fade-in-up">

          <div className="text-center mb-8">
            <div className="flex lg:hidden justify-center mb-6">
              <Logo className="h-10 w-auto brightness-0 invert" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Create account</h2>
            <p className="text-gray-500 text-sm">Join PDFBullet ecosystem today</p>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-2xl text-sm transition-all active:scale-95"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSocialSignIn('yahoo')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 bg-[#6001d2] hover:bg-[#5001b2] text-white font-bold py-3 px-4 rounded-2xl text-sm transition-all border border-white/10 active:scale-95 disabled:opacity-50"
            >
              <YahooIcon className="h-5 w-5" />
              <span>Yahoo</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#1E3B3D]" />
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Email Setup</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#1E3B3D]" />
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400 text-center animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-sm text-green-400 text-center">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A8C8E] transition-colors" />
              </div>
              <input
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose Username"
                className="w-full h-14 bg-[#1E3B3D]/10 border border-[#1E3B3D]/30 rounded-2xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#4A8C8E] focus:bg-[#1E3B3D]/20 transition-all text-sm"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <EmailIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A8C8E] transition-colors" />
              </div>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full h-14 bg-[#1E3B3D]/10 border border-[#1E3B3D]/30 rounded-2xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#4A8C8E] focus:bg-[#1E3B3D]/20 transition-all text-sm"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A8C8E] transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password"
                className="w-full h-14 bg-[#1E3B3D]/10 border border-[#1E3B3D]/30 rounded-2xl pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#4A8C8E] focus:bg-[#1E3B3D]/20 transition-all text-sm"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A8C8E] transition-colors" />
              </div>
              <input
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full h-14 bg-[#1E3B3D]/10 border border-[#1E3B3D]/30 rounded-2xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#4A8C8E] focus:bg-[#1E3B3D]/20 transition-all text-sm"
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#1E3B3D] to-[#2A5C5E] hover:from-[#2A5C5E] hover:to-[#4A8C8E] text-white font-extrabold rounded-2xl text-base transition-all shadow-xl shadow-[#1E3B3D]/40 mt-4 active:scale-95"
            >
              {isLoading ? 'Creating...' : 'Register Now'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-gray-500">
              Already a member?{' '}
              <Link to="/login" className="font-extrabold text-[#4A8C8E] hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-[10px] text-gray-600 leading-relaxed px-8">
              By joining, you agree to our <Link to="/terms-of-service" className="underline font-bold">Terms</Link> & <Link to="/privacy-policy" className="underline font-bold">Privacy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
