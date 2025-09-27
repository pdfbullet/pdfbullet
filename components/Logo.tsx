import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className, variant }) => {
  const { theme } = useTheme();
  
  const effectiveTheme = variant || theme;
  const textColor = effectiveTheme === 'dark' ? '#FFFFFF' : '#1F2937';

  return (
    <svg
      viewBox="0 0 580 130"
      className={className}
      aria-label="PDFBullet Logo"
      fontFamily="'Nunito', sans-serif"
    >
      <defs>
        <filter id="neon-glow-jsx" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ff0000" floodOpacity="0.75" />
        </filter>
      </defs>

      <g transform="translate(15, 15) scale(0.9)">
        <g filter="url(#neon-glow-jsx)">
            <path d="M35 15 H75 L95 35 V95 H35 Z" fill="#ff1a1a" />
            <path d="M75 15 L95 35 H75 Z" fill="#ff4d4d" />
            <text x="65" y="68" fontSize="24" fontWeight="bold" fill="rgba(255,255,255,0.8)" textAnchor="middle">PDF</text>
            <path d="M15 50 C -20 50, -20 105, 40 105" stroke="#ff1a1a" strokeWidth="12" fill="none" strokeLinecap="round"/>
            <path d="M40 105 L30 115 L45 115 Z" fill="#ff1a1a" />
            <path d="M115 60 C 150 60, 150 5, 90 5" stroke="#ff1a1a" strokeWidth="12" fill="none" strokeLinecap="round"/>
            <path d="M90 5 L100 -5 L85 -5 Z" fill="#ff1a1a" />
        </g>
      </g>
      
      <text x="150" y="90" fontSize="80" fontWeight="800">
        <tspan fill={textColor}>PDFBullet</tspan>
      </text>
      
      <text x="555" y="50" fontSize="25" fill={textColor}>®</text>
    </svg>
  );
};
