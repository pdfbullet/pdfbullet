import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-red"></div>
        <div className="absolute flex items-center justify-center inset-0 text-brand-red font-bold text-lg">
          ❤
        </div>
      </div>
    </div>
  );
};

export default Preloader;
