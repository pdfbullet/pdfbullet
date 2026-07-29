'use client';

import React from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { I18nProvider } from '../../contexts/I18nContext';
import { PWAInstallProvider } from '../../contexts/PWAInstallContext';
import { PwaLayoutProvider } from '../../contexts/PwaLayoutContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <PWAInstallProvider>
            <PwaLayoutProvider>
              {/* Suspense boundary required by Next.js App Router for hooks like
                  usePathname() used inside routerCompat.tsx (react-router-dom compat layer).
                  Without this, PWA standalone mode crashes with a client-side exception
                  because usePathname() suspends during hydration with no fallback. */}
              <React.Suspense fallback={null}>
                {children}
              </React.Suspense>
            </PwaLayoutProvider>
          </PWAInstallProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
