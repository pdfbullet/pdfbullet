import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, blogPosts } from '../constants.ts';
import { SearchIcon, BookOpenIcon, UserIcon, BriefcaseIcon, StudentIcon, GavelIcon, NewspaperIcon, CodeIcon, StarIcon } from './icons.tsx';
import { Tool } from '../types.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainPages = [
  { path: "/about", title: "About Us", description: "Learn about our mission, values, and the story behind PDFBullet.", Icon: UserIcon, color: 'bg-blue-500' },
  { path: "/contact", title: "Contact", description: "Get in touch with our team for support or inquiries.", Icon: UserIcon, color: 'bg-green-500' },
  { path: "/faq", title: "FAQ", description: "Find answers to frequently asked questions about our tools and services.", Icon: UserIcon, color: 'bg-yellow-500' },
  { path: "/pricing", title: "Pricing", description: "View our flexible pricing plans for users.", Icon: StarIcon, color: 'bg-purple-500' },
  { path: "/developer", title: "Developer Hub", description: "Integrate our powerful tools into your applications with our REST API.", Icon: CodeIcon, color: 'bg-teal-500' },
  { path: "/sitemap", title: "Sitemap", description: "A complete overview of all pages and tools available on our site.", Icon: UserIcon, color: 'bg-gray-500' },
  { path: "/ceo", title: "Message from the CEO", description: "Read a letter from our founder, Bishal Mishra.", Icon: UserIcon, color: 'bg-indigo-500' },
  { path: "/legal", title: "Legal & Privacy Hub", description: "Find our Terms of Service, Privacy Policy, and Cookie Policy.", Icon: GavelIcon, color: 'bg-slate-500' },
  { path: "/education", title: "For Education", description: "Solutions and tools tailored for students and educators.", Icon: StudentIcon, color: 'bg-pink-500' },
  { path: "/business", title: "For Business", description: "Streamline document workflows for your company.", Icon: BriefcaseIcon, color: 'bg-cyan-500' },
  { path: "/press", title: "Press Kit", description: "Media kits, logos, and information for the press.", Icon: NewspaperIcon, color: 'bg-rose-500' },
  { path: "/features", title: "Features", description: "Explore all the powerful features of our platform.", Icon: UserIcon, color: 'bg-fuchsia-500' },
  { path: "/api-pricing", title: "API Pricing", description: "View pricing plans for our developer API.", Icon: StarIcon, color: 'bg-purple-500' },
  { path: "/api-reference", title: "API Reference", description: "Detailed documentation for all API endpoints and libraries.", Icon: BookOpenIcon, color: 'bg-gray-500' },
];

type SearchableItem = {
    type: 'tool' | 'blog' | 'page';
    path: string;
    title: string;
    description: string;
    Icon: React.FC<{ className?: string }>;
    color?: string;
};

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const searchableItems: SearchableItem[] = useMemo(() => {
    const toolItems: SearchableItem[] = TOOLS.map(tool => ({
        type: 'tool',
        path: `/${tool.id}`,
        title: t(tool.title),
        description: t(tool.description),
        Icon: tool.Icon,
        color: tool.color
    }));

    const blogItems: SearchableItem[] = blogPosts.map(post => ({
        type: 'blog',
        path: `/blog/${post.slug}`,
        title: post.title,
        description: post.excerpt,
        Icon: BookOpenIcon,
        color: 'bg-orange-500'
    }));

    const pageItems: SearchableItem[] = mainPages.map(page => ({
        type: 'page',
        ...page
    }));

    return [...toolItems, ...blogItems, ...pageItems];
  }, [t]);


  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return searchableItems.filter(item =>
      item.title.toLowerCase().includes(lowercasedTerm) ||
      item.description.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, searchableItems]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-start justify-center p-4 pt-[10vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        className="bg-white dark:bg-black w-full max-w-2xl rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <h2 id="search-modal-title" className="sr-only">Search Site</h2>
          <SearchIcon className="h-5 w-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for tools, articles, and pages..."
            className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredResults.length > 0 ? (
            <ul>
              {filteredResults.map(item => (
                <li key={`${item.type}-${item.path}`}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${item.color || 'bg-gray-500'}`}>
                      <item.Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : searchTerm.trim() ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Start typing to search for anything on the site.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;