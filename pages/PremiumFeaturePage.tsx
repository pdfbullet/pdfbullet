
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LockIcon } from '../components/icons.tsx';
import { TOOLS } from '../constants.ts';

const PremiumFeaturePage: React.FC = () => {
  const location = useLocation();
  const toolId = location.state?.toolId;
  const tool = TOOLS.find(t => t.id === toolId);
  const toolName = tool ? `"${tool.title}"` : 'this premium';

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-lg space-y-8 text-center bg-white dark:bg-gray-900 border border-yellow-400/50 dark:border-yellow-600/50 p-8 md:p-12 rounded-lg shadow-2xl animated-border">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
          <LockIcon className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            This is a Premium Feature
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Upgrade your account to use the {toolName} tool and unlock all other premium features.
          </p>
        </div>
        <div>
          <Link
            to="/pricing"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-red py-3 px-4 text-lg font-medium text-white hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red-dark focus:ring-offset-2 transition-colors"
          >
            Upgrade to Premium
          </Link>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have Premium?{' '}
            <Link to="/login" className="font-medium text-brand-red hover:text-brand-red-dark">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeaturePage;