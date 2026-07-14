import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    cancel: () => void;
                    renderButton: (element: HTMLElement, options: any) => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = '491932898021-ec8scff76vrptram8378lj1l3pmblk1apps.googleusercontent.com';

// Pages where we should NOT show the auto-prompt
const EXCLUDED_PATHS = ['/login', '/signup', '/admin', '/forgot-password'];

const GoogleOneTap: React.FC = () => {
    const { user, auth, loading } = useAuth();
    const location = useLocation();
    const initialized = useRef(false);

    useEffect(() => {
        // Don't show if user is already logged in or still loading
        if (loading || user) return;

        // Don't show on auth pages
        if (EXCLUDED_PATHS.some(p => location.pathname.startsWith(p))) return;

        // Don't show on localhost (redirect doesn't work there anyway)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) return;

        if (initialized.current) return;
        initialized.current = true;

        const initOneTap = () => {
            if (!window.google?.accounts?.id) return;

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: { credential: string }) => {
                    try {
                        const { firebase } = await import('../firebase/config.ts');
                        const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
                        await auth.signInWithCredential(credential);
                    } catch (err) {
                        console.error('One Tap sign-in error:', err);
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
                context: 'signin',
            });

            // Show prompt after 2 seconds
            setTimeout(() => {
                window.google?.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        console.log('One Tap not displayed:', notification.getNotDisplayedReason?.() || notification.getSkippedReason?.());
                    }
                });
            }, 2000);
        };

        // Load GIS script if not already loaded
        if (window.google?.accounts?.id) {
            initOneTap();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initOneTap;
            document.head.appendChild(script);
        }

        return () => {
            window.google?.accounts?.id?.cancel();
        };
    }, [user, loading, location.pathname]);

    return null; // This component renders nothing — it just triggers the One Tap UI
};

export default GoogleOneTap;
