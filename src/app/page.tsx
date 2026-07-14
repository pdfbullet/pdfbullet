'use client';

import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../../contexts/PWAInstallContext';
import HomePage from '../../views/HomePage';
import PwaHomePage from '../../views/PwaHomePage';

export default function HomeRoute() {
  const { isPwa } = usePWAInstall();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const viewMode = typeof window !== 'undefined' ? localStorage.getItem('viewMode') : null;
  const shouldShowPwaLayout = isPwa || (isMobile && viewMode !== 'browser');

  if (shouldShowPwaLayout) {
    return <PwaHomePage />;
  }

  return <HomePage />;
}
