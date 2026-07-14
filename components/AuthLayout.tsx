import React, { ReactNode } from 'react';
import { Logo } from './Logo.tsx';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-white dark:bg-gray-950 flex items-center justify-center p-4">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-red/10 rounded-full blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

            <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left side: Information/Illustration */}
                <div className="hidden lg:flex flex-col justify-center space-y-8 animate-fade-in-down">
                    <div>
                        <Logo className="h-12 w-auto mb-8" />
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            Unlock the full potential of <span className="text-brand-red">PDFBullet</span>
                        </h2>
                        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-md">
                            The all-in-one platform to convert, edit, e-sign, and protect your PDF documents with ease and security.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 backdrop-blur-sm">
                            <div className="h-10 w-10 rounded-xl bg-brand-red/10 flex items-center justify-center mb-3">
                                <svg className="h-6 w-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Secure</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enterprise-grade security for your files.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 backdrop-blur-sm">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Fast</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Process complex PDFs in seconds.</p>
                        </div>
                    </div>
                </div>

                {/* Right side: Auth Card */}
                <div className="flex justify-center lg:justify-end animate-fade-in-up">
                    <div className="w-full max-w-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-gray-800 shadow-2xl p-8 md:p-10 relative overflow-hidden">
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo className="h-10 w-auto" />
                        </div>

                        <div className="text-center lg:text-left mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
                            {subtitle && <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>}
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
