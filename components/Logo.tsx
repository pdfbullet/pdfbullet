import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className, variant }) => {
  const { theme } = useTheme();
  
  const effectiveTheme = variant || theme;

  const isDark = effectiveTheme === 'dark';
  const textColor = isDark ? '#ffffff' : '#2c3e50';

  return (
    <svg 
      className={className || "h-10 w-auto"} 
      viewBox="0 0 300 80" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(10, 10) scale(0.3)">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF416C', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FF4B2B', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {/* Red Circle */}
        <circle cx="100" cy="100" r="90" fill="url(#logoGrad)" />
        {/* White Document - Always 100% White in both themes */}
        <path d="M 70 50 L 110 50 L 140 80 L 140 150 L 70 150 Z" fill="#ffffff" />
        <path d="M 110 50 L 110 80 L 140 80 Z" fill="#f0f0f0" />
        {/* Bullet cutouts */}
        <path d="M 40 110 L 90 110 L 100 100 L 90 90 L 40 90 Z" fill="url(#logoGrad)" />
        {/* PDF text on document */}
        <text x="105" y="135" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#FF4B2B" textAnchor="middle">PDF</text>
      </g>
      {/* Brand Text: PDF (adapts to theme) + Bullet (Brand Red) */}
      <text x="85" y="50" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontWeight="900" fontSize="32" fill={textColor}>
        PDF<tspan fill="#FF4B2B">Bullet</tspan>
      </text>
    </svg>
  );
};