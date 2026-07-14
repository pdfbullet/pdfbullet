
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, blogPosts } from '../constants.ts';
import { useI18n } from '../contexts/I18nContext.tsx';
import { Tool } from '../types.ts';

const SitemapPage: React.FC = () => {
    const { t } = useI18n();
    
    useEffect(() => {
      document.title = "Sitemap | PDFBullet";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
          metaDesc.setAttribute("content", "Explore the sitemap for PDFBullet. Find links to all our PDF tools, pages, and resources in one place.");
      }
    }, []);

    const mainPages = [
        { path: '/', name: 'Home' },
        { path: '/about', name: 'About Us' },
        { path: '/pricing', name: 'Pricing' },
        { path: '/contact', name: 'Contact' },
        { path: '/blog', name: 'Blog' },
        { path: '/faq', name: 'FAQ' },
        { path: '/how-to-use', name: 'How To Guides' },
        { path: '/features', name: 'Features' },
    ];

    const legalPages = [
        { path: '/legal', name: 'Legal Hub' },
        { path: '/privacy-policy', name: 'Privacy Policy' },
        { path: '/terms-of-service', name: 'Terms of Service' },
        { path: '/cookies-policy', name: 'Cookie Policy' },
        { path: '/user-data-deletion', name: 'Data Deletion' },
        { path: '/security-policy', name: 'Security Policy' },
    ];

    const companyPages = [
        { path: '/ceo', name: 'Message from the CEO' },
        { path: '/press', name: 'Press Kit' },
    ];
    
    const audiencePages = [
        { path: '/education', name: 'For Education' },
        { path: '/business', name: 'For Business' },
    ];
    
    const flipbookPages = [
        { path: '/flipbooks', name: 'Flipbooks' },
        { path: '/flipbooks/public', name: 'Public Gallery' },
    ];
    
    const apiPages = [
        { path: '/developer', name: 'Developer Home' },
        { path: '/api-pricing', name: 'API Pricing' },
        { path: '/api-reference', name: 'API Reference' },
        { path: '/api-pdf', name: 'PDF API' },
        { path: '/api-image', name: 'Image API' },
        { path: '/api-signature', name: 'Signature API' },
    ];

    const toolCategories: {key: Tool['category'], title: string}[] = [
        { key: 'organize', title: 'Organize PDF' },
        { key: 'optimize', title: 'Optimize PDF' },
        { key: 'convert-to', title: 'Convert to PDF' },
        { key: 'convert-from', title: 'Convert from PDF' },
        { key: 'edit', title: 'Edit PDF' },
        { key: 'security', title: 'PDF Security' },
        { key: 'business', title: 'Business & AI Tools' },
    ];

    const imageToolIds = new Set(TOOLS.filter(t => t.api?.category === 'image' || ['jpg-to-pdf', 'psd-to-pdf', 'pdf-to-jpg', 'pdf-to-png'].includes(t.id)).map(t => t.id));
    const imageTools = TOOLS.filter(tool => imageToolIds.has(tool.id));

    const groupedTools = toolCategories.map(cat => ({
        ...cat,
        tools: TOOLS.filter(tool => tool.category === cat.key && !imageToolIds.has(tool.id))
    }));

    return (
        <div className="py-16 md:py-24 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-12 text-center">Sitemap</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    
                    <div>
                        <h2 className="text-xl font-bold mb-4">Main Pages</h2>
                        <ul className="space-y-2">
                            {mainPages.map(page => (
                                <li key={page.path}>
                                    <Link to={page.path} className="text-brand-red hover:underline">{page.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                     <div>
                        <h2 className="text-xl font-bold mb-4">Company & Solutions</h2>
                        <ul className="space-y-2">
                            {companyPages.map(page => <li key={page.path}><Link to={page.path} className="text-brand-red hover:underline">{page.name}</Link></li>)}
                            {audiencePages.map(page => <li key={page.path}><Link to={page.path} className="text-brand-red hover:underline">{page.name}</Link></li>)}
                        </ul>
                        
                        <h2 className="text-xl font-bold mb-4 mt-8">Flipbooks</h2>
                        <ul className="space-y-2">
                            {flipbookPages.map(page => <li key={page.path}><Link to={page.path} className="text-brand-red hover:underline">{page.name}</Link></li>)}
                        </ul>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-bold mb-4">Developer & API</h2>
                        <ul className="space-y-2">
                            {apiPages.map(page => (
                                <li key={page.path}>
                                    <Link to={page.path} className="text-brand-red hover:underline">{page.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4">Legal</h2>
                        <ul className="space-y-2">
                            {legalPages.map(page => (
                                <li key={page.path}>
                                    <Link to={page.path} className="text-brand-red hover:underline">{page.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold mb-4">Blog Posts</h2>
                        <ul className="space-y-2 max-h-60 overflow-y-auto columns-2 md:columns-3">
                            {blogPosts.map(post => (
                                <li key={post.slug} className="break-inside-avoid">
                                    <Link to={`/blog/${post.slug}`} className="text-brand-red hover:underline text-sm">{post.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <h2 className="text-2xl font-bold mb-6 text-center">All Tools</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {groupedTools.map(group => (
                                group.tools.length > 0 && (
                                    <div key={group.key}>
                                        <h3 className="font-semibold text-lg mb-2">{group.title}</h3>
                                        <ul className="space-y-1">
                                            {group.tools.map(tool => (
                                                <li key={tool.id}>
                                                    <Link to={`/${tool.id}`} className="text-brand-red hover:underline text-sm">{t(tool.title)}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            ))}
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Image Tools</h3>
                                <ul className="space-y-1">
                                    {imageTools.map(tool => (
                                        <li key={tool.id}>
                                            <Link to={`/${tool.id}`} className="text-brand-red hover:underline text-sm">{t(tool.title)}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitemapPage;
