import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, WhatsAppIcon, YoutubeIcon, CodeIcon, GooglePlayIconSimple, AppStoreIconSimple } from './icons.tsx';
import { Logo } from './Logo.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';

interface FooterProps {
  onOpenCalendarModal: () => void;
  onOpenProblemReportModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenCalendarModal, onOpenProblemReportModal }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const { t } = useI18n();
  const { promptInstall } = usePWAInstall();

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
      { path: '/merge-pdf', nameKey: 'footer.top_tools.merge_pdf' },
      { path: '/compress-pdf', nameKey: 'footer.top_tools.compress_pdf' },
      { path: '/jpg-to-pdf', nameKey: 'footer.top_tools.jpg_to_pdf' },
      { path: '/edit-pdf', nameKey: 'footer.top_tools.edit_pdf' },
      { path: '/pdf-to-word', nameKey: 'footer.top_tools.pdf_to_word' },
  ];
  
  const solutions = [
      { path: '/education', nameKey: 'footer.solution_links.education' },
      { path: '/business', nameKey: 'footer.solution_links.business' },
      { path: '/how-to-use', nameKey: 'footer.solution_links.how_to' },
  ];

  const company = [
      { path: '/about', nameKey: 'footer.company_links.about' },
      { path: '/blog', nameKey: 'footer.company_links.blog' },
      { path: '/press', nameKey: 'footer.company_links.press' },
      { path: '/contact', nameKey: 'footer.company_links.contact' },
      { path: '/ceo', nameKey: 'footer.company_links.ceo_message' },
  ];
  
  const legal = [
      { path: '/legal', nameKey: 'footer.legal_links.legal_hub' },
      { path: '/privacy-policy', nameKey: 'footer.legal_links.privacy' },
      { path: '/terms-of-service', nameKey: 'footer.legal_links.terms' },
      { path: '/cookies-policy', nameKey: 'footer.legal_links.cookies' },
      { path: '/user-data-deletion', nameKey: 'footer.legal_links.data_deletion' },
  ];
  
  const socialAndAppLinks = (
      <>
        <div className="flex space-x-4 mt-5">
            <a href="https://www.facebook.com/share/16sdjGNVGr/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook" title="Facebook"><FacebookIcon className="h-6 w-6" /></a>
            <a href="https://wa.me/message/JYA22CVSYSZ4N1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="WhatsApp" title="WhatsApp"><WhatsAppIcon className="h-6 w-6" /></a>
            <a href="https://www.youtube.com/@btmobilecare" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube" title="YouTube"><YoutubeIcon className="h-6 w-6" /></a>
        </div>
        <div className="mt-6 space-y-2">
            <p className="text-gray-400 text-sm font-semibold">Get the app</p>
            <button onClick={promptInstall} className="flex items-center gap-2 w-full max-w-[160px] text-left bg-black border border-gray-600 p-2 rounded-lg hover:bg-gray-800 text-white transition-transform hover:scale-105">
                <GooglePlayIconSimple className="h-7 w-7" />
                <div>
                    <p className="text-xs leading-tight">GET IT ON</p>
                    <p className="font-semibold text-lg leading-tight">Google Play</p>
                </div>
            </button>
            <button onClick={promptInstall} className="flex items-center gap-2 w-full max-w-[160px] text-left bg-black border border-gray-600 p-2 rounded-lg hover:bg-gray-800 text-white transition-transform hover:scale-105">
                <AppStoreIconSimple className="h-7 w-7" />
                <div>
                    <p className="text-xs leading-tight">Download on the</p>
                    <p className="font-semibold text-lg leading-tight">App Store</p>
                </div>
            </button>
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
              {t('footer.slogan')}
            </p>
            {socialAndAppLinks}
          </div>
          
          {/* Links */}
          <div><h3 className="font-bold text-lg mb-4">{t('footer.tools')}</h3><ul className="space-y-2 text-gray-400 text-sm">{topTools.map(l => <li key={l.path}><Link to={l.path} title={t(l.nameKey)} className="hover:text-white">{t(l.nameKey)}</Link></li>)}</ul></div>
          <div><h3 className="font-bold text-lg mb-4">{t('footer.solutions')}</h3><ul className="space-y-2 text-gray-400 text-sm">{solutions.map(l => <li key={l.path}><Link to={l.path} title={t(l.nameKey)} className="hover:text-white">{t(l.nameKey)}</Link></li>)}</ul></div>
          <div><h3 className="font-bold text-lg mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
                {company.map(l => <li key={l.path}><Link to={l.path} title={t(l.nameKey)} className="hover:text-white">{t(l.nameKey)}</Link></li>)}
                <li><button onClick={onOpenProblemReportModal} title={t('footer.company_links.report_problem')} className="hover:text-white text-left">{t('footer.company_links.report_problem')}</button></li>
            </ul>
          </div>
          <div><h3 className="font-bold text-lg mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
                {legal.map(l => <li key={l.path}><Link to={l.path} title={t(l.nameKey)} className="hover:text-white">{t(l.nameKey)}</Link></li>)}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <h3 className="font-bold text-lg mb-2">{t('footer.subscribe_title')}</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
            {t('footer.subscribe_text')}
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
              {t('footer.subscribe_button')}
            </button>
          </form>
          {newsletterMessage && <p className={`text-sm mt-3 ${newsletterMessage.includes('Thank you') ? 'text-green-400' : 'text-red-400'}`}>{newsletterMessage}</p>}
        </div>

        <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
          <p className="order-2 sm:order-1 mt-4 sm:mt-0">{t('footer.copyright', { year: new Date().getFullYear() })} {process.env.APP_VERSION && `- v${process.env.APP_VERSION}`}</p>
           <div className="order-1 sm:order-2">
            <Link to="/sitemap" title="Sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);