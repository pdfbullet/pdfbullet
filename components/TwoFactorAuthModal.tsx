import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import * as QRCode from 'https://esm.sh/qrcode@1.5.3';
import { CheckIcon } from './icons.tsx';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple Base32 encoder for TOTP secret generation
const toBase32 = (buffer: Uint8Array): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
};

const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({ isOpen, onClose }) => {
    const { user, updateTwoFactorStatus } = useAuth();
    const [step, setStep] = useState(1);
    const [secret, setSecret] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateSecretAndQR = () => {
        if (user?.username) {
            // Generate a random 20-byte secret for TOTP
            const buffer = new Uint8Array(20);
            window.crypto.getRandomValues(buffer);
            const base32Secret = toBase32(buffer);
            setSecret(base32Secret);

            const otpAuthUrl = `otpauth://totp/PDFBullet:${user.username}?secret=${base32Secret}&issuer=PDFBullet`;
            QRCode.toDataURL(otpAuthUrl, (err, url) => {
                if (err) {
                    console.error(err);
                    setError("Could not generate QR code. Please try again.");
                } else {
                    setQrCodeDataUrl(url);
                }
            });
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStep(1);
            setError('');
            setVerificationCode('');
            generateSecretAndQR();
        }
    }, [isOpen, user]);

    const handleVerify = async () => {
        if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
            setError("Please enter a valid 6-digit code.");
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        // In a real application, you would send the `verificationCode` and `secret`
        // to your backend for verification against a TOTP library.
        // For this client-side simulation, we will assume it's correct to show the flow.
        try {
            await updateTwoFactorStatus(true);
            setStep(3); // Move to success step
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-black w-full max-w-lg rounded-lg shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-center mb-4">Set up Two-Factor Authentication</h2>

                    {step === 1 && (
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">1. Scan this QR code with your authenticator app (like Google Authenticator).</p>
                            {qrCodeDataUrl ? (
                                <img src={qrCodeDataUrl} alt="2FA QR Code" className="mx-auto border-4 border-white dark:border-black rounded-lg" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-200 animate-pulse mx-auto"></div>
                            )}
                            <p className="text-xs text-gray-500 mt-4">Can't scan? Enter this code manually:</p>
                            <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono">{secret}</code>
                            <button onClick={() => setStep(2)} className="mt-6 w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-md">
                                Next Step
                            </button>
                        </div>
                    )}
                    
                    {step === 2 && (
                         <div className="text-center">
                             <p className="text-gray-600 dark:text-gray-400 mb-4">2. Enter the 6-digit code from your authenticator app to verify.</p>
                             <input 
                                type="text"
                                value={verificationCode}
                                onChange={e => setVerificationCode(e.target.value)}
                                maxLength={6}
                                placeholder="123456"
                                className="w-48 p-2 text-2xl tracking-[0.5em] text-center border-2 border-gray-300 rounded-md"
                             />
                             {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                             <div className="mt-6 flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded-md">Back</button>
                                <button onClick={handleVerify} disabled={isLoading} className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-md disabled:bg-red-300">
                                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                                </button>
                             </div>
                         </div>
                    )}
                    
                    {step === 3 && (
                        <div className="text-center p-8">
                             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-6">
                                <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold">Success!</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Two-Factor Authentication has been enabled on your account.</p>
                            <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">
                                Done
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuthModal;