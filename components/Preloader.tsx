import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div id="preloader" className="fixed inset-0 z-[100] flex items-center justify-center bg-creamy dark:bg-soft-dark">
        <div className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">
            <span className="animate-pulse">PDF</span><span className="text-brand-red animate-pulse" style={{animationDelay: '0.2s'}}>Bullet</span>
        </div>
    </div>
  );
};

export default Preloader;