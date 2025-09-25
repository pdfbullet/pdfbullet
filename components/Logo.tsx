import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className, variant }) => {
  const { theme } = useTheme();
  
  const effectiveTheme = variant || theme;
  const textColor = effectiveTheme === 'dark' ? '#FFFFFF' : '#111827';
  const accentColor = '#B90B06';

  return (
    <svg
      viewBox="0 0 200 40"
      className={className}
      aria-label="PDFBullet Logo"
    >
      <text
        x="0"
        y="30"
        fontFamily="'Nunito', sans-serif"
        fontSize="32"
        fontWeight="800"
        fill={textColor}
      >
        PDF
        <tspan fill={accentColor}>Bullet</tspan>
      </text>
    </svg>
  );
};
