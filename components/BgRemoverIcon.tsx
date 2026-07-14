import React from 'react';

const BgRemoverIcon: React.FC = () => {
  return (
    <div className="relative inline-block w-14 h-14">
      {/* ✨ Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="sparkle top-[20%] left-[25%]" />
        <span className="sparkle top-[45%] left-[75%]" style={{ animationDelay: '0.3s' }} />
        <span className="sparkle top-[70%] left-[35%]" style={{ animationDelay: '0.6s' }} />
        <span className="sparkle top-[85%] left-[60%]" style={{ animationDelay: '0.9s' }} />
      </div>

      {/* 🧽 Eraser icon */}
      <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-sky-500">
        <img
          src="https://ik.imagekit.io/fixedmyspeaker/IMG_0865.gif?updatedAt=1762718107389"
          alt="BG Remover"
          className="w-8 h-8 animate-eraserSmooth"
        />
      </div>
    </div>
  );
};

export default BgRemoverIcon;
