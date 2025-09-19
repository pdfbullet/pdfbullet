import React from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

const ApiToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const { t } = useI18n();
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-md ${tool.color}`}>
          <tool.Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t(tool.title)}</h3>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm flex-grow">{t(tool.description)}</p>
      <div className="mt-4">
        <Link to={`/api-reference#${tool.id}`} className="text-sm font-semibold text-brand-red hover:underline">
          {t(tool.title)} Library Guide
        </Link>
      </div>
    </div>
  );
};

const ApiImagePage: React.FC = () => {
    const imageTools = TOOLS.filter(tool => tool.api?.category === 'image');
    
    return (
        <div className="py-16 md:py-24 min-h-[calc(100vh-130px)]">
            <div className="container mx-auto px-6">
                <section className="text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">
                        A full suite of tools to optimize image processing
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Convert, optimize and transform images with a few lines of code.
                    </p>
                </section>

                <section className="mt-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {imageTools.map(tool => (
                            <ApiToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ApiImagePage;