import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '../components/icons.tsx';

const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "404 Page Not Found | PDFBullet";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-6 py-12 bg-white dark:bg-black overflow-hidden">
      <div className="relative w-full max-w-lg">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-red-200 dark:bg-red-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-yellow-200 dark:bg-yellow-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-24 w-40 h-40 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10">
          <h1 className="text-9xl font-extrabold text-brand-red tracking-wider">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-800 dark:text-gray-100">Page Not Found</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-red hover:bg-brand-red-dark transition-colors shadow-lg"
            >
              <HomeIcon className="h-5 w-5" />
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;