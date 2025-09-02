import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronDownIcon, GridIcon, SunIcon, MoonIcon, UserCircleIcon, 
  CameraIcon, KeyIcon, LogoutIcon, UserIcon, BookOpenIcon, 
  StarIcon, EmailIcon, BriefcaseIcon, GavelIcon, 
  HeartbeatIcon, StudentIcon, CheckIcon, DollarIcon, SearchIcon, 
  ApiIcon, CodeIcon, SettingsIcon, NewspaperIcon, ChartBarIcon,
  DesktopIcon, PhoneIcon, LockIcon, LinkIcon, LeftArrowIcon, RightArrowIcon, ChevronUpIcon,
  MergeIcon, SplitIcon, CloseIcon, UploadIcon, OrganizeIcon, ScanToPdfIcon,
  CompressIcon, RepairIcon, OcrPdfIcon, JpgToPdfIcon, WordIcon, PowerPointIcon, ExcelIcon,
  GlobeIcon, QuestionMarkIcon
} from './icons.tsx';
import { Logo } from './Logo.tsx';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n, supportedLanguages } from '../contexts/I18nContext.tsx';

interface HeaderProps {
  onOpenProfileImageModal: () => void;
  onOpenSearchModal: () => void;
  onOpenChangePasswordModal: () => void;
}

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onOpenProfileImageModal, onOpenSearchModal, onOpenChangePasswordModal }) => {
  const [isGridMenuOpen, setGridMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConvertMenuOpen, setConvertMenuOpen] = useState(false);
  const [isAllToolsMenuOpen, setAllToolsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [gridMenuView, setGridMenuView] = useState<'main' | 'help' | 'language'>('main');

  const gridMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const convertMenuTimeoutRef = useRef<number | null>(null);
  const allToolsMenuTimeoutRef = useRef<number | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { user, logout, auth } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const navigate = useNavigate();

  const hasPasswordProvider = auth.currentUser?.providerData.some(
    (provider) => provider.providerId === 'password'
  );

  const toggleAccordion = (accordionName: string) => {
    setOpenAccordion(openAccordion === accordionName ? null : accordionName);
  };

  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = sessionStorage.getItem('isAdminAuthenticated') === 'true';
      setIsAdmin(adminStatus);
    };
    
    checkAdminStatus();
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gridMenuRef.current && !gridMenuRef.current.contains(event.target as Node)) setGridMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
  const closeAllMenus = () => {
    setGridMenuOpen(false);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    setConvertMenuOpen(false);
    setAllToolsMenuOpen(false);
    setGridMenuView('main');
    setOpenAccordion(null);
  }

  const handleMenuEnter = (setter: React.Dispatch<React.SetStateAction<boolean>>, timeoutRef: React.MutableRefObject<number | null>) => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }
    setter(true);
  };

  const handleMenuLeave = (setter: React.Dispatch<React.SetStateAction<boolean>>, timeoutRef: React.MutableRefObject<number | null>) => {
      timeoutRef.current = window.setTimeout(() => {
          setter(false);
      }, 200); // 200ms delay
  };

  const convertToTools = TOOLS.filter(tool => tool.category === 'convert-to');
  const convertFromTools = TOOLS.filter(tool => tool.category === 'convert-from');
  
  const desktopNavLinks = [
    { to: '/merge-pdf', labelKey: 'header.merge_pdf' },
    { to: '/split-pdf', labelKey: 'header.split_pdf' },
    { to: '/compress-pdf', labelKey: 'header.compress_pdf' },
  ];
  
  const toolsById = useMemo(() => new Map(TOOLS.map(tool => [tool.id, tool])), []);

  const allToolsMenuStructure = useMemo(() => [
    {
      title: 'ORGANIZE PDF',
      tools: ['merge-pdf', 'split-pdf', 'organize-pdf', 'scan-to-pdf']
    },
    {
      title: 'OPTIMIZE PDF',
      tools: ['compress-pdf', 'repair-pdf', 'ocr-pdf']
    },
    {
      title: 'CONVERT TO PDF',
      tools: ['jpg-to-pdf', 'word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf', 'html-to-pdf']
    },
    {
      title: 'CONVERT FROM PDF',
      tools: ['pdf-to-jpg', 'pdf-to-word', 'pdf-to-powerpoint', 'pdf-to-excel', 'pdf-to-pdfa']
    },
    {
      title: 'EDIT PDF',
      tools: ['rotate-pdf', 'page-numbers', 'watermark-pdf', 'edit-pdf']
    },
    {
      title: 'PDF SECURITY',
      tools: ['unlock-pdf', 'protect-pdf', 'sign-pdf', 'redact-pdf', 'compare-pdf']
    }
  ], []);

  const desktopGridMenuData = {
    products: [
      { title: 'iLoveIMG', description: 'Effortless image editing', href: 'https://iloveimg.com', icon: HeartbeatIcon, iconColor: 'bg-blue-500' },
      { title: 'iLoveSign', description: 'e-Signing made simple', href: '/#/', icon: HeartbeatIcon, iconColor: 'bg-blue-600' },
      { title: 'iLoveAPI', description: 'Document automation for developers', to: '/developer', icon: HeartbeatIcon, iconColor: 'bg-teal-500' },
    ],
    integrations: { title: 'Integrations', description: 'Zapier, Make, Wordpress...', href: '/#/', icon: LinkIcon, bordered: true },
    solutions: [
      { title: 'Business', description: 'Streamlined PDF editing and workflows for business teams', to: '/business', icon: ChartBarIcon, iconColor: 'bg-red-500' }
    ],
    applications: [
      { title: 'Desktop App', description: 'Available for Mac and Windows', href: '/#/', icon: DesktopIcon, iconColor: 'bg-red-600' },
      { title: 'Mobile App', description: 'Available for iOS and Android', href: '/#/', icon: PhoneIcon, iconColor: 'bg-red-700' },
    ],
    links: [
      { title: 'Pricing', to: '/pricing', icon: NewspaperIcon },
      { title: 'Developer', to: '/developer', icon: ApiIcon },
      { title: 'Security', to: '/security-policy', icon: LockIcon },
      { title: 'Features', to: '/#all-tools', icon: GridIcon },
      { title: 'About us', to: '/about', icon: HeartbeatIcon },
    ],
    bottomLinks: [
      { title: 'Help', onClick: () => setGridMenuView('help'), icon: LeftArrowIcon },
      { title: 'Admin Access', to: '/developer-access', icon: CodeIcon },
    ]
  };

  const helpSubMenuData = [
    { title: 'FAQ', to: '/faq', icon: QuestionMarkIcon },
    { title: 'Tools', to: '/how-to-use', icon: BookOpenIcon },
    { title: 'Legal & Privacy', to: '/legal', icon: GavelIcon },
    { title: 'Contact', to: '/contact', icon: EmailIcon }
  ];

  const imageToolIds = new Set(['resize-image', 'remove-background', 'crop-image', 'convert-to-jpg', 'convert-from-jpg', 'compress-image', 'watermark-image']);

  const mobileMenuCategories = [
      { key: 'organize' as const, title: 'Organize PDF' },
      { key: 'optimize' as const, title: 'Optimize PDF' },
      { key: 'convert-to' as const, title: 'Convert to PDF' },
      { key: 'convert-from' as const, title: 'Convert from PDF' },
      { key: 'edit' as const, title: 'Edit PDF' },
      { key: 'security' as const, title: 'PDF Security' },
      { key: 'business' as const, title: 'Business & AI Tools' },
  ];

  const mobileMenuStructure = useMemo(() => [
      ...mobileMenuCategories.map(cat => ({
          title: cat.title,
          tools: TOOLS.filter(tool => tool.category === cat.key && !imageToolIds.has(tool.id))
      })),
      {
          title: 'Image Tools',
          tools: TOOLS.filter(tool => imageToolIds.has(tool.id))
      }
  ].filter(category => category.tools.length > 0), []);

  const DesktopGridMenuItem: React.FC<{ item: any }> = ({ item }) => {
    const content = (
      <div className={`flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group ${item.bordered ? 'border border-gray-200 dark:border-gray-700' : ''}`}>
        <div className={`${item.iconColor ? `${item.iconColor} p-1.5 rounded-md` : ''}`}>
          <item.icon className={`h-5 w-5 ${item.iconColor ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
        </div>
      </div>
    );
  
    if (item.to) {
      return <Link to={item.to} onClick={closeAllMenus}>{content}</Link>;
    }
    return <a href={item.href} onClick={closeAllMenus} target={item.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">{content}</a>;
  };

  const DesktopGridLinkItem: React.FC<{ item: any; isSubItem?: boolean }> = ({ item, isSubItem }) => {
    const content = (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
        <item.icon className={`h-5 w-5 ${isSubItem ? '' : 'text-gray-500 dark:text-gray-400'}`} />
        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.title}</p>
      </div>
    );

    if (item.onClick) {
      return <button onClick={item.onClick} className="w-full text-left">{content}</button>;
    }
    if (item.to) {
      return <Link to={item.to} onClick={closeAllMenus}>{content}</Link>;
    }
    return <a href={item.href} onClick={closeAllMenus} target={item.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">{content}</a>;
  };

  const languages = supportedLanguages;
  const langCol1 = languages.slice(0, Math.ceil(languages.length / 3));
  const langCol2 = languages.slice(Math.ceil(languages.length / 3), 2 * Math.ceil(languages.length / 3));
  const langCol3 = languages.slice(2 * Math.ceil(languages.length / 3));


  return (
    <>
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="lg:hidden">
              <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors" aria-label="Open main menu" title="Open main menu">
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
            <a href="/" className="flex items-center text-gray-800 dark:text-gray-100" title="I Love PDFLY Home">
              <Logo className="h-8 md:h-10 w-auto" />
            </a>
            <nav className="hidden lg:flex items-center space-x-1">
              {desktopNavLinks.map(link => (
                  <Link key={link.to} to={link.to} onClick={closeAllMenus} title={t(link.labelKey)} className="px-2 2xl:px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors rounded-md text-xs 2xl:text-sm font-semibold text-center">
                      {t(link.labelKey)}
                  </Link>
              ))}
              <Link to="/developer" onClick={closeAllMenus} title="Developer API" className="px-2 2xl:px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors rounded-md text-xs 2xl:text-sm font-semibold text-center">
                  {t('header.developer')}
              </Link>
              {/* Convert PDF Dropdown */}
              <div className="relative" onMouseEnter={() => handleMenuEnter(setConvertMenuOpen, convertMenuTimeoutRef)} onMouseLeave={() => handleMenuLeave(setConvertMenuOpen, convertMenuTimeoutRef)}>
                <button title="Convert PDF Tools" className="flex items-center px-2 2xl:px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors rounded-md text-xs 2xl:text-sm font-semibold">
                  <span>{t('header.convert_pdf')}</span>
                  <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${isConvertMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6 z-20 transition-all duration-200 ease-out origin-top ${isConvertMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="grid grid-cols-2 gap-x-8">
                      <div>
                        <h4 className="px-2 pb-2 text-sm font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 uppercase">Convert to PDF</h4>
                        <div className="mt-2 space-y-1">
                          {convertToTools.map(tool => (
                            <Link key={tool.id} to={`/${tool.id}`} onClick={closeAllMenus} title={t(tool.title)} className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <tool.Icon className={`h-5 w-5 flex-shrink-0 ${tool.textColor}`} />
                              <span className="font-semibold text-sm whitespace-nowrap">{t(tool.title)}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="px-2 pb-2 text-sm font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 uppercase">Convert from PDF</h4>
                        <div className="mt-2 space-y-1">
                          {convertFromTools.map(tool => (
                            <Link key={tool.id} to={`/${tool.id}`} onClick={closeAllMenus} title={t(tool.title)} className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <tool.Icon className={`h-5 w-5 flex-shrink-0 ${tool.textColor}`} />
                              <span className="font-semibold text-sm whitespace-nowrap">{t(tool.title)}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
              {/* All PDF Tools Dropdown */}
              <div onMouseEnter={() => handleMenuEnter(setAllToolsMenuOpen, allToolsMenuTimeoutRef)} onMouseLeave={() => handleMenuLeave(setAllToolsMenuOpen, allToolsMenuTimeoutRef)}>
                 <button title="All PDF Tools" className="flex items-center px-2 2xl:px-3 py-2 text-red-600 dark:text-red-400 transition-colors rounded-md text-xs 2xl:text-sm font-semibold">
                  <span>{t('header.all_pdf_tools')}</span>
                  <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${isAllToolsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[calc(100vw-2rem)] bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 transition-all duration-200 ease-out origin-top ${isAllToolsMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} overflow-x-auto no-scrollbar`}>
                    <div className="p-6 grid grid-cols-6 gap-x-4">
                      {allToolsMenuStructure.map((category) => (
                        <div key={category.title} className="pr-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          <h4 className="pb-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{category.title}</h4>
                          <div className="mt-2 space-y-1">
                            {category.tools.map(toolId => {
                              const tool = toolsById.get(toolId);
                              if (!tool) return null;
                              return (
                                <Link key={tool.id} to={`/${tool.id}`} onClick={closeAllMenus} title={t(tool.title)} className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <tool.Icon className={`h-5 w-5 flex-shrink-0 ${tool.textColor}`} />
                                    <span className="font-semibold text-sm">{t(tool.title)}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </nav>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Icon */}
            <button onClick={onOpenSearchModal} className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors p-2 rounded-full" aria-label="Search" title="Search">
              <SearchIcon className="h-6 w-6" />
            </button>
            
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors p-2 rounded-full" aria-label="Toggle theme" title="Toggle theme">
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
            
            {/* Profile/Auth Icons & Links */}
            {user ? (
               <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="block h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden border-2 border-transparent hover:border-brand-red transition" aria-label="Open user profile menu" title="Open user profile menu">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-full w-full text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('header.signed_in_as')}</p>
                       <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.username}</p>
                          {user.isPremium && (
                              <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-600">
                                  <StarIcon className="h-3 w-3" />
                                  Premium
                              </span>
                          )}
                      </div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { onOpenProfileImageModal(); closeAllMenus(); }} title={t('header.change_photo')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <CameraIcon className="h-5 w-5" />
                        <span>{t('header.change_photo')}</span>
                      </button>
                      <button onClick={() => { navigate('/account-settings'); closeAllMenus(); }} title={t('header.account_settings')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <SettingsIcon className="h-5 w-5" />
                        <span>{t('header.account_settings')}</span>
                      </button>
                      {hasPasswordProvider && (
                        <button onClick={() => { onOpenChangePasswordModal(); closeAllMenus(); }} title={t('header.change_password')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                          <KeyIcon className="h-5 w-5" />
                          <span>{t('header.change_password')}</span>
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                      <button onClick={() => { logout(); closeAllMenus(); }} title={t('header.logout')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <LogoutIcon className="h-5 w-5" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="hidden sm:flex items-center space-x-2 md:space-x-4">
                  <Link to="/login" title={t('header.login')} className="text-gray-800 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors font-semibold px-2 text-sm">{t('header.login')}</Link>
                  <Link to="/signup" title={t('header.signup')} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-1.5 px-3 text-sm rounded-md transition-colors">{t('header.signup')}</Link>
                </div>
                <div className="sm:hidden">
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-brand-red" aria-label="Login or sign up" title="Login or sign up">
                    <UserIcon className="h-7 w-7" />
                  </Link>
                </div>
              </>
            )}
            
            {/* Grid Menu Icon */}
            <div 
                className="relative" 
                ref={gridMenuRef}
            >
              <button onClick={() => setGridMenuOpen(!isGridMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors p-2 rounded-full" aria-label="Open all tools and options" title="Open all tools and options">
                <GridIcon className="h-7 w-7 lg:h-8 lg:w-8" />
              </button>
               {isGridMenuOpen && (
                <div className="absolute top-full right-0 mt-2 z-20">
                  <div className="w-[calc(100vw-2rem)] max-w-sm md:max-w-2xl lg:max-w-[52rem] bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-2xl animate-fade-in-down overflow-y-auto max-h-[calc(100vh-100px)]">
                    {gridMenuView === 'main' && (
                       <div className="grid grid-cols-1 md:grid-cols-3">
                        {/* Column 1 */}
                        <div className="p-4 md:border-r border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-4">Other Products</h3>
                          <div className="space-y-1">
                            {desktopGridMenuData.products.map(item => <DesktopGridMenuItem key={item.title} item={item} />)}
                            <div className="pt-2"><DesktopGridMenuItem item={desktopGridMenuData.integrations} /></div>
                          </div>
                        </div>
                        {/* Column 2 */}
                        <div className="p-4 md:border-r border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-4">Solutions</h3>
                          <div className="space-y-1">
                            {desktopGridMenuData.solutions.map(item => <DesktopGridMenuItem key={item.title} item={item} />)}
                          </div>
                          <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mt-6 mb-2">Applications</h3>
                          <div className="space-y-1">
                            {desktopGridMenuData.applications.map(item => <DesktopGridMenuItem key={item.title} item={item} />)}
                          </div>
                        </div>
                        {/* Column 3 */}
                        <div className="p-4">
                          <div className="space-y-1">
                            {desktopGridMenuData.links.map(item => <DesktopGridLinkItem key={item.title} item={item} />)}
                          </div>
                          <hr className="my-4 border-gray-200 dark:border-gray-700" />
                          <div className="space-y-1">
                             {desktopGridMenuData.bottomLinks.map(item => <DesktopGridLinkItem key={item.title} item={item} />)}
                          </div>
                          <div className="mt-4">
                              <button onClick={() => setGridMenuView('language')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group" aria-label="Select language" title="Select language">
                                  <LeftArrowIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Select Language</p>
                              </button>
                          </div>
                          {/* Login/Signup for mobile */}
                          <div className="md:hidden">
                              {!user && (
                                  <>
                                      <hr className="my-4 border-gray-200 dark:border-gray-700" />
                                      <div className="space-y-2">
                                          <Link to="/login" onClick={closeAllMenus} className="block w-full text-center font-bold py-2 px-4 rounded-md border border-brand-red text-brand-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">{t('header.login')}</Link>
                                          <Link to="/signup" onClick={closeAllMenus} className="block w-full text-center bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-md transition-colors">{t('header.signup')}</Link>
                                      </div>
                                  </>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                    {gridMenuView === 'help' && (
                       <div className="p-4">
                        <button onClick={() => setGridMenuView('main')} className="w-full flex items-center gap-3 p-2 mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                          <LeftArrowIcon className="h-5 w-5" />
                          Help
                        </button>
                        <div className="space-y-1">
                          {helpSubMenuData.map(item => <DesktopGridLinkItem key={item.title} item={item} isSubItem={true} />)}
                        </div>
                      </div>
                    )}
                    {gridMenuView === 'language' && (
                        <div className="p-4">
                          <button onClick={() => setGridMenuView('main')} className="w-full flex items-center gap-3 p-2 mb-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                              <LeftArrowIcon className="h-5 w-5" />
                              Language
                          </button>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                                <div>
                                    {langCol1.map(lang => (
                                    <button key={lang.code} onClick={() => { setLocale(lang.code); closeAllMenus(); }} className="w-full text-left flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm whitespace-nowrap">
                                        {locale === lang.code ? <CheckIcon className="h-4 w-4 text-brand-red" /> : <div className="w-4 h-4" />}
                                        <span className={locale === lang.code ? 'font-bold' : ''}>{t(`languages.${lang.code}`)}</span>
                                    </button>
                                    ))}
                                </div>
                                <div>
                                    {langCol2.map(lang => (
                                    <button key={lang.code} onClick={() => { setLocale(lang.code); closeAllMenus(); }} className="w-full text-left flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm whitespace-nowrap">
                                        {locale === lang.code ? <CheckIcon className="h-4 w-4 text-brand-red" /> : <div className="w-4 h-4" />}
                                        <span className={locale === lang.code ? 'font-bold' : ''}>{t(`languages.${lang.code}`)}</span>
                                    </button>
                                    ))}
                                </div>
                                <div>
                                    {langCol3.map(lang => (
                                    <button key={lang.code} onClick={() => { setLocale(lang.code); closeAllMenus(); }} className="w-full text-left flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm whitespace-nowrap">
                                        {locale === lang.code ? <CheckIcon className="h-4 w-4 text-brand-red" /> : <div className="w-4 h-4" />}
                                        <span className={locale === lang.code ? 'font-bold' : ''}>{t(`languages.${lang.code}`)}</span>
                                    </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
    {/* Mobile Menu */}
    <div className={`fixed inset-0 z-[60] bg-white dark:bg-black transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300" aria-label="Close menu" title="Close menu">
                    <CloseIcon className="h-8 w-8" />
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto px-4 py-2">
                {mobileMenuStructure.map(category => (
                    <div key={category.title}>
                        <h3 className="px-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-6 first:mt-0">{t(category.title)}</h3>
                        <div className="space-y-1">
                            {category.tools.map(tool => (
                                <Link key={tool.id} to={`/${tool.id}`} onClick={closeAllMenus} className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <tool.Icon className={`h-6 w-6 flex-shrink-0 ${tool.textColor}`} /> 
                                    <span className="font-semibold text-sm">{t(tool.title)}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    </div>
    </>
  );
};

export default memo(Header);