import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext.tsx';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';
import { FacebookIcon, WhatsAppIcon, YoutubeIcon, AppStoreIconSimple, AndroidIcon } from '../components/icons.tsx';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">{title}</h2>
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
            {children}
        </div>
    </div>
);

const SettingLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link to={to} className="block text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold p-4 transition-colors">
        {children}
    </Link>
);

const PwaSettingsPage: React.FC = () => {
    const { t } = useI18n();
    const { promptInstall } = usePWAInstall();

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

    return (
        <div className="p-4 sm:p-6 space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Settings & Information</h1>
            
            <Section title={t('footer.solutions')}>
                {solutions.map(l => <SettingLink key={l.path} to={l.path}>{t(l.nameKey)}</SettingLink>)}
            </Section>

            <Section title={t('footer.company')}>
                 {company.map(l => <SettingLink key={l.path} to={l.path}>{t(l.nameKey)}</SettingLink>)}
            </Section>

            <Section title={t('footer.legal')}>
                 {legal.map(l => <SettingLink key={l.path} to={l.path}>{t(l.nameKey)}</SettingLink>)}
            </Section>

            <Section title="Follow Us & Get the App">
                <div className="p-4">
                    <div className="flex space-x-6">
                        <a href="https://www.facebook.com/share/16sdjGNVGr/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600"><FacebookIcon className="h-7 w-7" /></a>
                        <a href="https://wa.me/message/JYA22CVSYSZ4N1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500"><WhatsAppIcon className="h-7 w-7" /></a>
                        <a href="https://www.youtube.com/@btmobilecare" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600"><YoutubeIcon className="h-7 w-7" /></a>
                    </div>
                     <div className="mt-6 flex flex-wrap gap-4">
                        <a href="https://github.com/pdfbullet/pdfbullet/releases/download/v1.0/app-release-signed.apk" download className="flex items-center gap-2 text-left bg-gray-800 p-2 rounded-lg hover:bg-gray-700 text-white transition-transform hover:scale-105">
                            <AndroidIcon className="h-8 w-8" />
                            <div>
                                <p className="text-xs leading-tight">DOWNLOAD APK</p>
                                <p className="font-semibold text-lg leading-tight">Android</p>
                            </div>
                        </a>
                        <button onClick={promptInstall} className="flex items-center gap-2 text-left bg-gray-800 p-2 rounded-lg hover:bg-gray-700 text-white transition-transform hover:scale-105">
                            <AppStoreIconSimple className="h-8 w-8" />
                            <div>
                                <p className="text-xs leading-tight">Download on the</p>
                                <p className="font-semibold text-lg leading-tight">App Store</p>
                            </div>
                        </button>
                   </div>
                </div>
            </Section>

        </div>
    );
};

export default PwaSettingsPage;