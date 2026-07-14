import React from 'react';
import { FacebookIcon, XIcon, LinkedInIcon, WhatsAppIcon } from './icons.tsx';

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
  };

  const socialPlatforms = [
    { name: 'Facebook', href: shareLinks.facebook, icon: FacebookIcon, className: 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50' },
    { name: 'Twitter', href: shareLinks.twitter, icon: XIcon, className: 'text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800' },
    { name: 'LinkedIn', href: shareLinks.linkedin, icon: LinkedInIcon, className: 'text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50' },
    { name: 'WhatsApp', href: shareLinks.whatsapp, icon: WhatsAppIcon, className: 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50' }
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Share:</span>
      {socialPlatforms.map(platform => (
        <a 
          key={platform.name}
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${platform.name}`}
          className={`p-2 rounded-full transition-colors ${platform.className}`}
        >
          <platform.icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
};

export default SocialShareButtons;