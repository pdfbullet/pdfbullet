
import React from 'react';
import { useI18n } from '../contexts/I18nContext.tsx';
import { Tool } from '../types.ts';

interface ToolPageLayoutProps {
  tool: Tool;
  children: React.ReactNode;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ tool, children }) => {
  const { t } = useI18n();

  return (
    <div className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center p-4 rounded-full ${tool.color} mb-4`}>
            <tool.Icon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{t(tool.title)}</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t(tool.description)}</p>
        </div>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToolPageLayout;
