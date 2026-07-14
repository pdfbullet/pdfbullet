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
              {children}
            </PwaLayoutProvider>
          </PWAInstallProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
