import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../constants.ts';
import SocialShareButtons from '../components/SocialShareButtons.tsx';
import { Logo } from '../components/Logo.tsx';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.slug === slug);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - PDFBullet Blog`;
      window.scrollTo(0, 0);

      // Add JSON-LD structured data for SEO
      const scriptId = 'blog-post-structured-data';
      const existingScript = document.getElementById(scriptId);
      if(existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "name": post.title,
          "description": post.excerpt,
          "image": post.image,
          "author": {
              "@type": "Organization",
              "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "PDFBullet",
            "logo": {
              "@type": "ImageObject",
              "url": "https://pdfbullet.com/favicon.png"
            }
          },
          "datePublished": new Date(post.date).toISOString()
      });
      document.head.appendChild(script);

      return () => {
        // Cleanup on unmount
        const scriptToRemove = document.getElementById(scriptId);
        if(scriptToRemove) scriptToRemove.remove();
        document.title = 'PDFBullet - The PDF toolkit for your every need';
      };
    } else {
        // If post not found, navigate away
        navigate('/blog');
    }
  }, [post, navigate]);
  
  useEffect(() => {
      // Reset expanded state when slug changes
      setIsExpanded(false);
  }, [slug]);

  if (!post) {
    return null;
  }

  const postUrl = window.location.href;
  const CONTENT_THRESHOLD = 400;
  const isLongPost = post.content.length > CONTENT_THRESHOLD;

  const renderContent = (content: string) => {
    // This is a simplistic approach; a proper solution would use a library like react-markdown
    const processedContent = content.replace(/<a href="([^"]*)"/g, '<a target="_blank" rel="noopener noreferrer" href="$1"');
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div className="py-16 md:py-24">
      <div className="px-6">
        <div>
          <div className="mb-8">
            <Link to="/blog" className="text-brand-red hover:underline font-semibold">
              &larr; Back to Blog
            </Link>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
              {post.tags.map(tag => (
                  <span key={tag} className="text-xs bg-brand-red/10 text-brand-red font-semibold px-2.5 py-1 rounded-full">
                      {tag}
                  </span>
              ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {post.authorImage === '/logo.svg' ? (
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 p-1 flex items-center justify-center flex-shrink-0">
                  <Logo className="h-10 w-10" />
                </div>
              ) : (
                <img src={post.authorImage} alt={post.author} className="h-12 w-12 rounded-full object-cover" width="48" height="48" loading="lazy" decoding="async" />
              )}
              <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{post.author}</p>
                  <p className="text-gray-500 dark:text-gray-400">Posted on {post.date}</p>
              </div>
            </div>
            <SocialShareButtons url={postUrl} title={post.title} />
          </div>
          
          <img src={post.image} alt={post.title} className="w-full max-w-3xl mx-auto h-auto object-contain rounded-lg shadow-lg mb-12" width="1200" height="628" loading="eager" decoding="async" fetchPriority="high" />

          <div className="prose lg:prose-xl dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            {isLongPost && !isExpanded ? (
                <>
                    <p>{post.excerpt}</p>
                    <div className="text-center my-6">
                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Read More &darr;
                        </button>
                    </div>
                </>
            ) : (
                renderContent(post.content)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;