import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, blogPosts } from '../constants.ts';
import { Tool } from '../types.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

const SitemapPage: React.FC = () => {
    const { t } = useI18n();
    
    useEffect(() => {
      document.title = "Sitemap | I Love PDFLY";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
          metaDesc.setAttribute("content", "Explore the sitemap for I Love PDFLY. Find links to all our PDF tools, blog articles, and main pages to easily navigate our website.");
      }
    }, []);

    const toolCategories: { [key: string]: { title: string; tools: Tool[] } } = {
        organize: { title: 'Organize PDF', tools: [] },
        optimize: { title: 'Optimize PDF', tools: [] },
        'convert-to': { title: 'Convert to PDF', tools: [] },
        'convert-from': { title: 'Convert from PDF', tools: [] },
        edit: { title: 'Edit PDF', tools: [] },
        security: { title: 'PDF Security', tools: [] },
        business: { title: 'Business & AI Tools', tools: [] },
        image: { title: 'Image Tools', tools: [] },
    };
    
    const imageToolIds = new Set(['resize-image', 'remove-background', 'crop-image', 'convert-to-jpg', 'convert-from-jpg', 'compress-image', 'watermark-image']);

    TOOLS.forEach(tool => {
        if (imageToolIds.has(tool.id)) {
            toolCategories.image.tools.push(tool);
        } else if (tool.category) {
            if (!toolCategories[tool.category]) {
                toolCategories[tool.category] = { title: tool.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), tools: [] };
            }
            toolCategories[tool.category].tools.push(tool);
        }
    });
    
    const categoryOrder = ['organize', 'optimize', 'convert-to', 'convert-from', 'edit', 'security', 'business', 'image'];
    
    const mainPages = [
      { path: "/", name: "Home" },
      { path: "/about", name: "About Us" },
      { path: "/ceo", name: "Message from CEO" },
      { path: "/blog", name: "Blog" },
      { path: "/contact", name: "Contact" },
      { path: "/faq", name: "FAQ" },
      { path: "/pricing", name: "Pricing" },
      { path: "/press", name: "Press" },
      { path: "/features", name: "Features" },
    ];
    
    const legalPages = [
      { path: "/legal", name: "Legal Hub" },
      { path: "/privacy-policy", name: "Privacy Policy" },
      { path: "/terms-of-service", name: "Terms of Service" },
      { path: "/cookies-policy", name: "Cookies Policy" },
      { path: "/user-data-deletion", name: "Data Deletion" },
      { path: "/security-policy", name: "Security Policy" },
    ];
    
     const solutionPages = [
      { path: "/education", name: "For Education" },
      { path: "/business", name: "For Business" },
      { path: "/how-to-use", name: "How-to Guides" },
    ];
    
    const developerPages = [
        { path: "/developer", name: "Developer Hub" },
        { path: "/api-pdf", name: "PDF API" },
        { path: "/api-image", name: "Image API" },
        { path: "/api-signature", name: "Signature API" },
        { path: "/api-reference", name: "API Reference" },
        { path: "/api-pricing", name: "API Pricing" },
    ];

  return (
    <div className="bg-gray-50 dark:bg-black py-16 md:py-24">
      <div className="px-6">
        <div>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Sitemap</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              An overview of all pages and resources available on I Love PDFLY.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Column 1: Main Pages & Others */}
            <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-brand-red border-b-2 border-brand-red/30 pb-2 mb-4">Main Pages</h2>
                  <ul className="space-y-2">
                    {mainPages.map(page => <li key={page.path}><Link to={page.path} className="text-gray-700 dark:text-gray-300 hover:text-brand-red transition-colors">{page.name}</Link></li>)}
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-red border-b-2 border-brand-red/30 pb-2 mb-4">Solutions</h2>
                  <ul className="space-y-2">
                     {solutionPages.map(page => <li key={page.path}><Link to={page.path} className="text-gray-700 dark:text-gray-300 hover:text-brand-red transition-colors">{page.name}</Link></li>)}
                  </ul>
                </div>
                 <div>
                  <h2 className="text-2xl font-bold text-brand-red border-b-2 border-brand-red/30 pb-2 mb-4">Developer</h2>
                   <ul className="space-y-2">
                     {developerPages.map(page => <li key={page.path}><Link to={page.path} className="text-gray-700 dark:text-gray-300 hover:text-brand-red transition-colors">{page.name}</Link></li>)}
                  </ul>
                </div>
                 <div>
                  <h2 className="text-2xl font-bold text-brand-red border-b-2 border-brand-red/30 pb-2 mb-4">Legal</h2>
                   <ul className="space-y-2">
                     {legalPages.map(page => <li key={page.path}><Link to={page.path} className="text-gray-700 dark:text-gray-300 hover:text-brand-red transition-colors">{page.name}</Link></li>)}
                  </ul>
                </div>
            </div>

            {/* Column 2 & 3: Tools */}
            <div className="lg:col-span-2 space-y-8">
                {categoryOrder.map(key => {
                    const category = toolCategories[key as keyof typeof toolCategories];
                    if (!category || category.tools.length === 0) return null;
                    return (
                        <div key={category.title}>
                            <h2 className="text-2xl font-bold text-brand-red border-b-2 border-brand-red/30 pb-2 mb-4">{category.title}</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                {category.tools.map(tool => (
                                    <li key={tool.id}>
                                        <Link to={`/${tool.id}`} className="text-gray-700 dark:text-gray-300 hover:text-brand-red transition-colors">{t(tool.title)}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Column 4: Blog */}
            <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-brand-red border-b-2 border-brand-red/30 pb-2 mb-4">Blog Articles</h2>
                  <ul className="space-y-2">
                    {blogPosts.map(post => (
                      <li key={post.slug}>
                        <Link to={`/blog/${post.slug}`} className="text-gray-700 dark:text-gray-300 hover:text-brand-red transition-colors">{post.title}</Link>
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