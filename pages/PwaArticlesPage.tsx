import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../constants.ts';
import { Logo } from '../components/Logo.tsx';

const PwaArticlesPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">Articles</h1>
      <div className="space-y-6">
        {blogPosts.map((post) => (
          <Link
            to={`/blog/${post.slug}`}
            key={post.slug}
            className="block bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow"
          >
            <img src={post.image} alt={post.title} className="h-40 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-red transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{post.excerpt}</p>
              <div className="mt-3 flex items-center gap-3">
                {post.authorImage === '/logo.svg' ? (
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1 flex-shrink-0">
                    <Logo className="h-6 w-6" />
                  </div>
                ) : (
                  <img src={post.authorImage} alt={post.author} className="h-8 w-8 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-semibold text-xs text-gray-700 dark:text-gray-200">{post.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PwaArticlesPage;
