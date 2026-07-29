import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext.tsx';
import { usePWAInstall } from '../contexts/PWAInstallContext.tsx';
import { 
    FacebookIcon, WhatsAppIcon, YoutubeIcon, DesktopIcon, SunIcon, StudentIcon, 
    BriefcaseIcon, BookOpenIcon, UserIcon, NewspaperIcon, EmailIcon, GavelIcon, 
    LockIcon, CookieIcon, StarIcon, ShareIcon, CodeIcon
} from '../components/icons.tsx';
import { usePwaLayout } from '../contexts/PwaLayoutContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => (
    <button
        type="button"
        className={`${checked ? 'bg-brand-red' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
        onClick={onChange}
        role="switch"
        aria-checked={checked}
    >
        <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);

const SettingsCard: React.FC<{ to?: string; href?: string; onClick?: () => void; icon: React.FC<any>; title: string; children?: React.ReactNode; }> = ({ to, href, onClick, icon: Icon, title, children }) => {
    const content = (
        <div className="pwa-setting-card">
            <div className="flex items-center gap-4">
                <Icon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</span>
            </div>
            {children ? <div className="ml-auto">{children}</div> : <span className="text-gray-400">&rarr;</span>}
        </div>
    );
    
    if (to) return <Link to={to}>{content}</Link>;
    if (href) return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
};

const PwaSettingsPage: React.FC = () => {
    const { t } = useI18n();
    const { isPwa, promptInstall } = usePWAInstall();
    const { setTitle } = usePwaLayout();
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        setTitle('More');
    }, [setTitle]);
    
    const [isAppMode, setIsAppMode] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const viewMode = localStorage.getItem('viewMode');
            setIsAppMode(viewMode !== 'browser');
        }
    }, []);

    const handleViewModeToggle = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('viewMode', isAppMode ? 'browser' : 'app');
            window.location.reload();
        }
    };
    
    const handleShareApp = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Pdf Bullet',
                    text: 'Check out Pdf Bullet - the ultimate free online PDF & Image toolkit!',
                    url: 'https://play.google.com/store/apps/details?id=com.pdfbullet.app&pcampaignid=web_share',
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    const solutions = [
      { path: '/education', nameKey: 'footer.solution_links.education', icon: StudentIcon },
      { path: '/business', nameKey: 'footer.solution_links.business', icon: BriefcaseIcon },
      { path: '/developer', nameKey: 'header.developer', icon: CodeIcon },
      { path: '/docs', nameKey: 'API Documentation', icon: BookOpenIcon },
      { path: '/how-to-use', nameKey: 'footer.solution_links.how_to', icon: BookOpenIcon },
    ];

    const company = [
      { path: '/about', nameKey: 'footer.company_links.about', icon: UserIcon },
      { path: '/blog', nameKey: 'footer.company_links.blog', icon: NewspaperIcon },
      { path: '/docs', nameKey: 'API Reference & Specs', icon: CodeIcon },
    ];
    
    const legal = [
      { path: '/legal', nameKey: 'footer.legal_links.legal_hub', icon: GavelIcon },
      { path: '/privacy-policy', nameKey: 'footer.legal_links.privacy', icon: LockIcon },
      { path: '/terms-of-service', nameKey: 'footer.legal_links.terms', icon: GavelIcon },
      { path: '/cookies-policy', nameKey: 'footer.legal_links.cookies', icon: CookieIcon },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 px-2">More</h1>
            
            {/* Profile Card */}
            <div className="pwa-settings-profile-card">
                <div className="w-12 h-12 rounded-full bg-white/20 flex-shrink-0 border-2 border-white/50">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <UserIcon className="w-full h-full p-2 text-white" />
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-base truncate">{user?.username || 'Guest User'}</p>
                    <p className="text-sm opacity-80 truncate">{user?.email || 'Log in for more features'}</p>
                </div>
                <Link to="/account-settings" className="bg-white/20 hover:bg-white/40 text-white font-semibold py-1.5 px-3 rounded-lg text-sm flex-shrink-0">
                    Manage
                </Link>
            </div>

            <div>
                <h2 className="pwa-settings-section-title mb-4">General Settings</h2>
                <div className="pwa-settings-grid">
                    <div className="pwa-setting-card">
                         <div className="flex items-center gap-4">
                            <SunIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Dark Mode</span>
                        </div>
                        <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
                    </div>
                     {!isPwa && (
                        <div className="pwa-setting-card">
                            <div className="flex items-center gap-4">
                                <DesktopIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">App Mode</span>
                            </div>
                            <ToggleSwitch checked={isAppMode} onChange={handleViewModeToggle} />
                        </div>
                     )}
                </div>
            </div>
            
            <div>
                <h2 className="pwa-settings-section-title mb-4">Support & Feedback</h2>
                <div className="pwa-settings-grid">
                    <SettingsCard icon={StarIcon} title="Rate Us" href="https://www.trustpilot.com/review/pdfbullet.com" />
                    <SettingsCard icon={EmailIcon} title="Report a Problem" to="/submit-ticket" />
                </div>
            </div>
            
            <div>
                <h2 className="pwa-settings-section-title mb-4">About PDFBullet</h2>
                 <div className="pwa-settings-grid">
                    {solutions.map(l => <SettingsCard key={l.path} to={l.path} icon={l.icon} title={t(l.nameKey)} />)}
                    {company.map(l => <SettingsCard key={l.path} to={l.path} icon={l.icon} title={t(l.nameKey)} />)}
                </div>
            </div>
            
            <div>
                <h2 className="pwa-settings-section-title mb-4">Legal</h2>
                 <div className="pwa-settings-grid">
                    {legal.map(l => <SettingsCard key={l.path} to={l.path} icon={l.icon} title={t(l.nameKey)} />)}
                </div>
            </div>
            
            <div>
                 <h2 className="pwa-settings-section-title mb-4">Follow Us</h2>
                 <div className="pwa-settings-socials">
                    <a href="https://www.facebook.com/share/1CPqWEXDHR/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:opacity-80 transition-opacity p-2"><FacebookIcon className="h-8 w-8" /></a>
                    <a href="https://wa.me/message/JYA22CVSYSZ4N1" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:opacity-80 transition-opacity p-2"><WhatsAppIcon className="h-8 w-8" /></a>
                    <a href="https://www.youtube.com/@PdfBullet" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:opacity-80 transition-opacity p-2"><YoutubeIcon className="h-8 w-8" /></a>
                    {typeof navigator.share !== 'undefined' && (
                        <button onClick={handleShareApp} className="text-gray-500 dark:text-gray-300 hover:text-brand-red p-2 transition-colors">
                            <ShareIcon className="h-8 w-8" />
                        </button>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default PwaSettingsPage;