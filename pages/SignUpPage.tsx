import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

// Define a type for the confirmation result to keep state type-safe
type ConfirmationResult = Awaited<ReturnType<ReturnType<typeof useAuth>['sendLoginOtp']>>;

declare global {
    interface Window {
        google: any;
    }
}

const SignUpPage: React.FC = () => {
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [otpStep, setOtpStep] = useState<'enter-phone' | 'enter-otp'>('enter-phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [toast, setToast] = useState<{ message: string, visible: boolean } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const { signup, loginOrSignupWithGoogle, sendLoginOtp, verifyLoginOtp, displayedOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fromPricing = location.state?.from === 'pricing';
  const fromInvoice = location.state?.from === '/invoice-generator';
  const selectedPlan = location.state?.plan;

  useEffect(() => {
    document.title = "Sign Up | Create Your Free I Love PDFLY Account";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Create a free account with I Love PDFLY to unlock more features. Sign up to manage your documents more effectively.");
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
        interval = setInterval(() => {
            setResendTimer(prev => prev - 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const showToast = (message: string) => {
      setToast({ message, visible: true });
      setTimeout(() => {
          setToast(t => t ? { ...t, visible: false } : null);
          setTimeout(() => setToast(null), 500);
      }, 4500);
  };

  const handleSuccessfulSignup = () => {
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

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signup(identifier, password);
      handleSuccessfulSignup();
    } catch (err: any) {
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsSendingOtp(true);
    setError('');
    try {
      const result = await sendLoginOtp(phoneNumber);
      setConfirmationResult(result);
      showToast(`A new OTP has been sent to ${phoneNumber}.`);
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpStep === 'enter-phone') {
        setIsSendingOtp(true);
        try {
            const result = await sendLoginOtp(phoneNumber);
            setConfirmationResult(result);
            showToast(`An OTP has been sent to ${phoneNumber}.`);
            setOtpStep('enter-otp');
            setResendTimer(30);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSendingOtp(false);
        }
    } else {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }
        if (!confirmationResult) {
            setError("Something went wrong. Please try sending the OTP again.");
            return;
        }
        setIsLoading(true);
        try {
            await verifyLoginOtp(confirmationResult, otpString);
            handleSuccessfulSignup();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleGoogleCredentialResponse = async () => {
      setError('');
      setIsLoading(true);
      try {
        await loginOrSignupWithGoogle();
        handleSuccessfulSignup();
      } catch (err: any) {
          setError(err.message || 'Failed to sign up with Google.');
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
            document.getElementById('google-signup-button'),
            { theme: 'outline', size: 'large', type: 'standard', text: 'signup_with', width: '300' }
        );
    }
  }, []);
  
  const switchSignupMethod = (method: 'email' | 'phone') => {
    setSignupMethod(method);
    setError('');
    setIdentifier('');
    setPassword('');
    setPhoneNumber('');
    setOtp(new Array(6).fill(''));
    setOtpStep('enter-phone');
  };
  
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(paste)) {
      const newOtp = paste.split('');
      setOtp(newOtp);
      otpInputRefs.current[5]?.focus();
    }
  };


  return (
    <>
      {toast && (
          <div className={`fixed top-5 right-5 z-[200] p-4 rounded-lg shadow-lg text-white transition-all duration-500 ${toast.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} bg-green-500`}>
              <p className="font-bold">OTP Sent!</p>
              <p className="text-sm">{toast.message}</p>
          </div>
      )}
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {fromPricing || fromInvoice ? 'Create an Account to Continue' : 'Create a new account'}
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" state={{ from: location.state?.from, plan: selectedPlan }} className="font-medium text-brand-red hover:text-brand-red-dark">
                sign in
              </Link>
            </p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 rounded-lg shadow-lg animated-border">
              {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}
              <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
                <button type="button" onClick={() => switchSignupMethod('email')} className={`flex-1 py-2 font-semibold transition-colors ${signupMethod === 'email' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-500 dark:text-gray-400'}`}>Email / Username</button>
                <button type="button" onClick={() => switchSignupMethod('phone')} className={`flex-1 py-2 font-semibold transition-colors ${signupMethod === 'phone' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-500 dark:text-gray-400'}`}>Phone Number</button>
              </div>
              
              {signupMethod === 'email' && (
                <form className="space-y-6" onSubmit={handleIdentifierSubmit}>
                  <div className="rounded-md shadow-sm -space-y-px">
                      <div>
                        <label htmlFor="identifier" className="sr-only">Email</label>
                        <input
                            id="identifier"
                            name="identifier"
                            type="email"
                            autoComplete="email"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-black focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red sm:text-sm"
                            placeholder="Email address"
                        />
                      </div>
                      <div>
                      <label htmlFor="password"className="sr-only">Password</label>
                      <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
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
                      {isLoading ? 'Creating account...' : 'Create Account'}
                      </button>
                  </div>
                </form>
              )}

              {signupMethod === 'phone' && (
                <form className="space-y-6" onSubmit={handlePhoneSubmit}>
                  {otpStep === 'enter-phone' && (
                      <div>
                          <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                          <input id="phone-number" name="phone-number" type="tel" autoComplete="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-black focus:z-10 focus:border-brand-red focus:outline-none focus:ring-brand-red sm:text-sm" placeholder="Enter phone (e.g., +16505551234)"/>
                      </div>
                  )}
                   {otpStep === 'enter-otp' && (
                      <div className="space-y-4">
                           <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                              Enter the 6-digit code sent to {phoneNumber}.
                              <button type="button" onClick={() => { setOtpStep('enter-phone'); setError(''); setOtp(new Array(6).fill('')); }} className="font-medium text-brand-red hover:underline ml-1">Change</button>
                          </p>
                          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={data}
                                    onChange={e => handleOtpChange(e, index)}
                                    onKeyDown={e => handleOtpKeyDown(e, index)}
                                    ref={el => { otpInputRefs.current[index] = el; }}
                                    className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-md focus:border-brand-red focus:ring-1 focus:ring-brand-red bg-white dark:bg-black"
                                />
                            ))}
                          </div>
                           {displayedOtp && (
                            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300 rounded-md text-sm">
                                <p><strong>🔒:</strong> Your verification code is <strong className="font-mono">{displayedOtp}</strong></p>
                            </div>
                          )}
                           <div className="text-center text-sm">
                            {resendTimer > 0 ? (
                                <p className="text-gray-500">Resend OTP in {resendTimer}s</p>
                            ) : (
                                <button type="button" onClick={handleResendOtp} disabled={isSendingOtp} className="font-medium text-brand-red hover:underline disabled:text-gray-500">
                                    {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                                </button>
                            )}
                          </div>
                      </div>
                  )}
                  <div>
                      <button type="submit" disabled={isLoading || isSendingOtp} className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-red py-2 px-4 text-sm font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 disabled:bg-red-300 dark:disabled:bg-red-800 transition-colors">
                          {isSendingOtp ? 'Sending OTP...' : isLoading ? 'Verifying...' : (otpStep === 'enter-phone' ? 'Send OTP' : 'Verify & Sign Up')}
                      </button>
                  </div>
                </form>
              )}

              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                      <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">OR</span>
                  </div>
              </div>

               <div id="google-signup-button" className="flex justify-center"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;