import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div id="preloader" className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black">
      <img 
        src="https://ik.imagekit.io/fonepay/fev.png?updatedAt=1758995231883" 
        alt="PDFBullet Loading..." 
        className="w-48 h-auto animate-pulse"
      />
    </div>
  );
};

export default Preloader;
