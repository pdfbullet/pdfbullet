import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshIcon, CheckIcon } from './icons.tsx';

const PULL_THRESHOLD = 70; // pixels to pull before refresh triggers
const PULL_RESISTANCE = 0.55; // dampening factor

const PullToRefresh: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'refreshing' | 'success'>('idle');

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);

  // Disable pull-to-refresh on pages other than the homepage to protect user form/processing states
  const isHomepage = location.pathname === '/';

  if (!isIOS || !isStandalone || !isHomepage) {
    return <>{children}</>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && status === 'idle') {
      setPullStart(e.touches[0].clientY);
      setStatus('pulling');
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStart === null || status === 'refreshing' || status === 'success') return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - pullStart;

    if (distance > 0) {
      if (window.scrollY === 0) {
        // Prevent default native scroll bounce
        if (e.cancelable) e.preventDefault();
      }
      setPullDistance(distance * PULL_RESISTANCE);
    } else {
      setPullStart(null);
      setPullDistance(0);
      setStatus('idle');
    }
  };

  const handleTouchEnd = () => {
    if (pullStart === null || status === 'refreshing' || status === 'success') return;

    if (pullDistance > PULL_THRESHOLD) {
      setStatus('refreshing');
      setPullDistance(PULL_THRESHOLD);
      
      // Perform simulated reload cycle with success indicator
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }, 1000);
    } else {
      // Release spring animation
      setPullStart(null);
      setPullDistance(0);
      setStatus('idle');
    }
  };

  useEffect(() => {
    return () => {
      setPullStart(null);
      setPullDistance(0);
      setStatus('idle');
    };
  }, []);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const indicatorOpacity = progress;
  const indicatorRotation = progress * 360;

  // Header and wrapper remain completely static (no translateY on children)
  // Only the spinner itself floats down over the page!
  const spinnerStyle: React.CSSProperties = {
    transform: `translateY(${pullDistance}px)`,
    opacity: status === 'idle' ? 0 : indicatorOpacity,
    transition: pullStart === null && status !== 'refreshing' ? 'transform 0.3s ease, opacity 0.3s ease' : 'none',
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-screen"
    >
      {/* Absolute floating pull refresh indicator card */}
      <div 
        className="fixed left-1/2 -translate-x-1/2 z-[999] pointer-events-none top-4"
        style={spinnerStyle}
        aria-hidden="true"
      >
        {status === 'success' ? (
          <div className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2 rounded-full shadow-xl transition-all duration-300 transform scale-100">
            <CheckIcon className="h-5 w-5 animate-bounce" />
            <span className="text-xs uppercase tracking-wider font-extrabold">Refresh Success</span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
            <div 
              style={{ transform: status === 'refreshing' ? 'none' : `rotate(${indicatorRotation}deg)` }}
              className="flex items-center justify-center"
            >
              <RefreshIcon className={`h-5 w-5 text-brand-red ${status === 'refreshing' ? 'animate-spin' : ''}`} />
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;