import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-red"></div>
    </div>
  );
};

export default Preloader;
