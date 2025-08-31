
import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, WhatsAppIcon, YoutubeIcon, CodeIcon } from './icons.tsx';
import { Logo } from './Logo.tsx';

interface FooterProps {
  onOpenCalendarModal: () => void;
  onOpenProblemReportModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenCalendarModal, onOpenProblemReportModal }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
        setNewsletterMessage(`Thank you for subscribing, ${newsletterEmail}!`);
        setNewsletterEmail('');
        setTimeout(() => setNewsletterMessage(''), 5000);
    } else {
        setNewsletterMessage('Please enter a valid email address.');
        setTimeout(() => setNewsletterMessage(''), 3000);
    }
  };

  const handleDownloadLogo = () => {
    const link = document.createElement('a');
    link.href = '/logo.svg';
    link.download = 'ilovepdfly-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topTools = [
      { path: '/merge-pdf', name: 'Merge PDF' },
      { path: '/compress-pdf', name: 'Compress PDF' },
      { path: '/jpg-to-pdf', name: 'JPG to PDF' },
      { path: '/edit-pdf', name: 'Edit PDF' },
      { path: '/pdf-to-word', name: 'PDF to Word' },
  ];
  
  const solutions = [
      { path: '/education', name: 'For Education' },
      { path: '/business', name: 'For Business' },
      { path: '/how-to-use', name: 'How-to Guides' },
  ];

  const company = [
      { path: '/about', name: 'About' },
      { path: '/blog', name: 'Blog' },
      { path: '/press', name: 'Press' },
      { path: '/contact', name: 'Contact' },
      { path: '/ceo', name: 'Message from CEO' },
  ];
  
  const legal = [
      { path: '/legal', name: 'Legal Hub' },
      { path: '/privacy-policy', name: 'Privacy Policy' },
      { path: '/terms-of-service', name: 'Terms & Conditions' },
      { path: '/cookies-policy', name: 'Cookies Policy' },
      { path: '/user-data-deletion', name: 'Data Deletion' },
  ];
  
  const socialAndAppLinks = (
      <>
        <div className="flex space-x-4 mt-5">
            <a href="https://www.facebook.com/share/16sdjGNVGr/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook" title="Facebook"><FacebookIcon className="h-6 w-6" /></a>
            <a href="https://wa.me/message/JYA22CVSYSZ4N1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="WhatsApp" title="WhatsApp"><WhatsAppIcon className="h-6 w-6" /></a>
            <a href="https://www.youtube.com/@btmobilecare" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube" title="YouTube"><YoutubeIcon className="h-6 w-6" /></a>
        </div>
        <div className="mt-6">
            <p className="text-gray-400 text-sm font-semibold">App Coming Soon</p>
        </div>
      </>
  );

  return (
    <footer className="bg-black text-white w-full">
      <div className="px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          
          {/* Logo & Socials */}
          <div className="col-span-2 lg:col-span-2">
            <a href="/" title="I Love PDFLY Home">
              <Logo className="h-10 w-auto mb-3" variant="dark" />
            </a>
            <p className="text-gray-400 text-sm max-w-xs">
              Your go-to suite of online tools for PDF and image management.
            </p>
            {socialAndAppLinks}
          </div>
          
          {/* Links */}
          <div><h3 className="font-bold text-lg mb-4">Tools</h3><ul className="space-y-2 text-gray-400 text-sm">{topTools.map(l => <li key={l.path}><Link to={l.path} title={l.name} className="hover:text-white">{l.name}</Link></li>)}</ul></div>
          <div><h3 className="font-bold text-lg mb-4">Solutions</h3><ul className="space-y-2 text-gray-400 text-sm">{solutions.map(l => <li key={l.path}><Link to={l.path} title={l.name} className="hover:text-white">{l.name}</Link></li>)}</ul></div>
          <div><h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
                {company.map(l => <li key={l.path}><Link to={l.path} title={l.name} className="hover:text-white">{l.name}</Link></li>)}
                <li><button onClick={onOpenProblemReportModal} title="Report a Problem" className="hover:text-white text-left">Report a Problem</button></li>
            </ul>
          </div>
          <div><h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
                {legal.map(l => <li key={l.path}><Link to={l.path} title={l.name} className="hover:text-white">{l.name}</Link></li>)}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <h3 className="font-bold text-lg mb-2">Subscribe to our newsletter</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
            Get the latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required 
              aria-label="Email for newsletter"
              className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <button 
              type="submit" 
              className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors"
            >
              Subscribe
            </button>
          </form>
          {newsletterMessage && <p className={`text-sm mt-3 ${newsletterMessage.includes('Thank you') ? 'text-green-400' : 'text-red-400'}`}>{newsletterMessage}</p>}
        </div>

        <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
          <p className="order-2 sm:order-1 mt-4 sm:mt-0">&copy; {new Date().getFullYear()} I Love PDFLY. All Rights Reserved.</p>
           <div className="order-1 sm:order-2">
            <Link to="/sitemap" title="Sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
