import React, { useState, useEffect, ReactNode } from 'react';
import { RefreshIcon } from './icons.tsx';

const PULL_THRESHOLD = 80; // pixels to pull before refresh triggers
const PULL_RESISTANCE = 0.5; // makes pulling feel a bit heavier

const PullToRefresh: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

  // This feature is only for iOS standalone (PWA) mode.
  if (!isIOS || !isStandalone) {
    return <>{children}</>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      setPullStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStart === null || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    let distance = currentY - pullStart;

    if (distance > 0) {
      // Prevent native browser refresh behavior while pulling at the top
      if (window.scrollY === 0) {
        e.preventDefault();
      }
      setPullDistance(distance * PULL_RESISTANCE);
    } else {
      // If user starts scrolling up, cancel the pull
      setPullStart(null);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullStart === null || isRefreshing) return;

    if (pullDistance > PULL_THRESHOLD) {
      setIsRefreshing(true);
      // Wait for the spinner animation to be visible before reloading
      setTimeout(() => {
          window.location.reload();
      }, 500);
    } else {
      // Animate back to original position
      setPullStart(null);
      setPullDistance(0);
    }
  };
  
  // Clean up state if component unmounts
  useEffect(() => {
    return () => {
      setPullStart(null);
      setPullDistance(0);
      setIsRefreshing(false);
    };
  }, []);

  const wrapperStyle: React.CSSProperties = {
      transform: (pullDistance > 0 || isRefreshing) ? `translateY(${isRefreshing ? PULL_THRESHOLD : pullDistance}px)` : 'none',
      transition: pullStart === null && !isRefreshing ? 'transform 0.3s' : 'none',
  };
  
  const indicatorRotation = Math.min(pullDistance / PULL_THRESHOLD, 1) * 360;
  const indicatorOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
  
  const indicatorStyle: React.CSSProperties = {
      opacity: isRefreshing ? 1 : indicatorOpacity,
      transform: `rotate(${isRefreshing ? 0 : indicatorRotation}deg)`,
      transition: 'opacity 0.2s',
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={wrapperStyle}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-20 flex items-center justify-center -translate-y-full pointer-events-none"
        aria-hidden="true"
      >
        <div 
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center"
          style={indicatorStyle}
        >
          <RefreshIcon className={`h-6 w-6 text-brand-red ${isRefreshing ? 'animate-spin' : ''}`} />
        </div>
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;