import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className, variant }) => {
  const { theme } = useTheme();
  
  const effectiveTheme = variant || theme;
  const darkBlueColor = effectiveTheme === 'dark' ? '#FFFFFF' : '#0C2D5A';
  const lightBlueColor = '#36A9E1';

  // Hardcoded colors for the icon part, as it shouldn't change with theme
  const iconDarkBlue = '#0C2D5A';
  const iconLightBlue = '#36A9E1';
  
  // A slightly lighter dark blue for gradient
  const iconDarkBlueGradientEnd = '#004a80';
  // A slightly darker light blue for gradient
  const iconLightBlueGradientEnd = '#008ac5';

  return (
    <svg
      viewBox="0 0 580 130"
      className={className}
      aria-label="PDFBullet Logo"
      fontFamily="'Nunito', sans-serif"
    >
      <defs>
        <linearGradient id="dark-arrow-gradient-jsx" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: iconDarkBlue }} />
          <stop offset="100%" style={{ stopColor: iconDarkBlueGradientEnd }} />
        </linearGradient>
        <linearGradient id="light-arrow-gradient-jsx" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: iconLightBlue }} />
          <stop offset="100%" style={{ stopColor: iconLightBlueGradientEnd }} />
        </linearGradient>
        <linearGradient id="doc-body-gradient-jsx" x1="0" y1="0" x2="1" y2="0">
            <stop offset="10%" stopColor="#F3F4F6" />
            <stop offset="90%" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id="curl-shadow-gradient-jsx" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <filter id="shadow-jsx" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>

      <g transform="translate(-10, -5) scale(1.1)" filter="url(#shadow-jsx)">
        <path d="M 84.75,22.5 C 57,22.5 35.25,42 35.25,67.5 C 35.25,93 48,112.5 72.75,112.5 C 93,112.5 111.75,99.75 111.75,82.5" stroke="url(#dark-arrow-gradient-jsx)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M104.75,90.5 L111.75,82.5 L118.75,90.5 Z" fill="url(#dark-arrow-gradient-jsx)" />
        
        <path d="M 50.25,102 C 78,102 99.75,83.25 99.75,57.75 C 99.75,32.25 87,12.75 62.25,12.75 C 42,12.75 23.25,25.5 23.25,42.75" stroke="url(#light-arrow-gradient-jsx)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M30.25,34.75 L23.25,42.5 L16.25,34.75 Z" fill="url(#light-arrow-gradient-jsx)" />
        
        <g transform="translate(40, 28)">
            <path d="M50,20 L70,20 L50,0 Z" fill="url(#curl-shadow-gradient-jsx)" transform="translate(1,1)" />
            <path d="M0,0 L50,0 L50,80 L0,80 Z" fill="url(#doc-body-gradient-jsx)" stroke={iconLightBlue} strokeWidth="3" strokeLinejoin="round"/>
            <path d="M50,0 L70,20 L50,20 Z" fill="#D1D5DB" />
            <path d="M50,0 L70,20" fill="none" stroke={iconLightBlue} strokeWidth="3" strokeLinejoin="round" />
            <path d="M0,0 L50,0 L70,20 L70,80 L0,80 Z" fill="none" stroke={iconLightBlue} strokeWidth="3" strokeLinejoin="round" />
            <text x="35" y="55" fontSize="24" fontWeight="900" textAnchor="middle" fill={iconDarkBlue}>PDF</text>
        </g>
      </g>

      <text x="160" y="90" fontSize="80" fontWeight="800">
        <tspan fill={darkBlueColor}>PDF</tspan>
        <tspan fill={lightBlueColor}>Bullet</tspan>
      </text>
      
      <text x="555" y="50" fontSize="25" fill={darkBlueColor}>®</text>
    </svg>
  );
};