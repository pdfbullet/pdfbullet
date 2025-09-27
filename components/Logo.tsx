import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className, variant }) => {
  const { theme } = useTheme();
  
  const effectiveTheme = variant || theme;

  return (
    <img 
      src="https://ik.imagekit.io/fonepay/logo%20(2).png?updatedAt=1758997939639" 
      alt="PDFBullet Logo"
      className={`${className} ${effectiveTheme === 'dark' ? 'logo-img-dark' : ''}`}
    />
  );
};
