
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../constants.ts';
import { Logo } from '../components/Logo.tsx';

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    document.title = "PDFBullet Blog | PDF Tips, Tricks, and Updates";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Explore the PDFBullet blog for tips, tricks, and updates. Learn how to make the most of our PDF tools and enhance your document productivity.");
    }
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    blogPosts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = selectedTag === null || post.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag]);
  
  const recentPosts = useMemo(() => {
    return blogPosts.slice(0, 5);
  }, []);

  return (
    <div className="py-16 md:py-24 overflow-x-hidden">
      <div className="px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">PDFBullet Blog</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Tips, tricks, and updates from our team to help you make the most of our PDF tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Blog Posts */}
          <div className="lg:col-span-2 space-y-8">
            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                    <div key={post.slug} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-md overflow-hidden group hover:shadow-xl dark:hover:shadow-gray-800/50 transition-all duration-300 flex flex-col md:flex-row border-glow-hover">
                        <Link to={`/blog/${post.slug}`} className="md:w-1/3 block">
                            <img src={post.image} alt={post.title} className="h-56 w-full object-cover md:h-full" loading="lazy" decoding="async" width="398" height="224" />
                        </Link>
                        <div className="p-6 flex flex-col flex-1 md:w-2/3">
                            <div className="flex items-center gap-2 mb-2">
                                {post.tags.map(tag => (
                                    <button 
                                        key={tag} 
                                        onClick={() => setSelectedTag(tag)}
                                        className="text-xs bg-brand-red/10 text-brand-red font-semibold px-2 py-1 rounded-full hover:bg-brand-red/20 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                <Link to={`/blog/${post.slug}`} className="hover:text-brand-red transition-colors duration-200">{post.title}</Link>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">{post.excerpt}</p>
                            <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {post.authorImage === '/logo.svg' ? (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 p-1 flex items-center justify-center flex-shrink-0">
                                        <Logo className="h-8 w-8" />
                                    </div>
                                ) : (
                                    <img src={post.authorImage} alt={`Photo of blog author ${post.author}`} className="h-10 w-10 rounded-full object-cover" width="40" height="40" loading="lazy" decoding="async"/>
                                )}
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{post.author}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-16 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">No Posts Found</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Try adjusting your search or tag selection.</p>
                     <button onClick={() => { setSearchTerm(''); setSelectedTag(null); }} className="mt-4 bg-brand-red text-white font-bold py-2 px-4 rounded-md hover:bg-brand-red-dark transition-colors">
                        Clear Filters
                    </button>
                </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Search</h3>
              <input 
                type="text" 
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"
              />
            </div>

            <div className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Posts</h3>
              <ul className="space-y-4">
                {recentPosts.map(post => (
                  <li key={post.slug}>
                    <Link to={`/blog/${post.slug}`} className="group flex items-center gap-4">
                      <img src={post.image} alt={post.title} className="h-16 w-16 object-cover rounded-md flex-shrink-0" width="64" height="64" loading="lazy" decoding="async"/>
                      <div>
                          <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-brand-red transition-colors">{post.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${selectedTag === null ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-brand-red/80 hover:text-white'}`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${selectedTag === tag ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-brand-red/80 hover:text-white'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
