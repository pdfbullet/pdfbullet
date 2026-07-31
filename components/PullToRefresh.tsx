import React, { useState, useEffect, useRef, ReactNode } from 'react';

const PULL_THRESHOLD = 72;   // px to pull before refresh triggers
const MAX_PULL = 100;        // max pull distance
const RESISTANCE = 0.45;    // dampening factor

const PullToRefresh: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
  const touchStartY = useRef<number | null>(null);
  const isPulling = useRef(false);

  // Only activate in standalone / TWA mode (installed app), not regular browser
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);

  useEffect(() => {
    if (!isStandalone) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY !== 0) return;
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      if (status === 'refreshing') return;

      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy <= 0) {
        touchStartY.current = null;
        setPullDistance(0);
        setStatus('idle');
        isPulling.current = false;
        return;
      }

      if (window.scrollY !== 0) return;

      // Prevent native scroll bounce on iOS
      if (e.cancelable) e.preventDefault();

      isPulling.current = true;
      const dampened = Math.min(dy * RESISTANCE, MAX_PULL);
      setPullDistance(dampened);
      setStatus(dampened >= PULL_THRESHOLD ? 'ready' : 'pulling');
    };

    const onTouchEnd = () => {
      if (!isPulling.current || status === 'refreshing') {
        touchStartY.current = null;
        setPullDistance(0);
        setStatus('idle');
        isPulling.current = false;
        return;
      }

      if (pullDistance >= PULL_THRESHOLD) {
        setStatus('refreshing');
        setPullDistance(PULL_THRESHOLD);
        // Reload only the current page after a short delay for visual feedback
        setTimeout(() => {
          window.location.reload();
        }, 700);
      } else {
        setPullDistance(0);
        setStatus('idle');
      }

      touchStartY.current = null;
      isPulling.current = false;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isStandalone, status, pullDistance]);

  if (!isStandalone) return <>{children}</>;

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const spinnerSize = 36 + progress * 4; // grows slightly as you pull
  const isVisible = status !== 'idle' && pullDistance > 2;

  // Spinner offset: starts at -48px above, floats down as user pulls
  const spinnerY = status === 'idle' ? -48 : Math.min(pullDistance - 8, PULL_THRESHOLD - 8);

  return (
    <div className="relative w-full" style={{ overscrollBehaviorY: 'none' }}>
      {/* Pull Indicator — only the spinner floats; page content stays still */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 z-[9999]"
        style={{
          transform: `translateX(-50%) translateY(${spinnerY}px)`,
          top: '56px', // below the PWA header
          transition: (status === 'idle' || status === 'refreshing')
            ? 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease'
            : 'none',
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full shadow-xl"
          style={{
            width: spinnerSize,
            height: spinnerSize,
            background: status === 'ready' || status === 'refreshing'
              ? '#B90B06'
              : 'white',
            border: '1.5px solid rgba(0,0,0,0.08)',
            transition: 'background 0.2s ease, width 0.1s ease, height 0.1s ease',
          }}
        >
          {status === 'refreshing' ? (
            /* Spinning loader */
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-spin"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" />
            </svg>
          ) : (
            /* Pull arrow — rotates as progress increases */
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none"
              stroke={status === 'ready' ? 'white' : '#B90B06'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: `rotate(${progress * 180}deg)`,
                transition: 'transform 0.1s ease, stroke 0.2s ease',
              }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};

export default PullToRefresh;