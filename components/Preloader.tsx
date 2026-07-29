import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';

const Preloader: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div id="preloader" className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black">
      <img 
        src="/logo.svg" 
        alt="Pdf Bullet Loading..." 
        className={`w-48 h-auto animate-pulse ${theme === 'dark' ? 'logo-img-dark' : ''}`}
      />
    </div>
  );
};

export default Preloader;
