
import React, { useState, useRef, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDownIcon, GridIcon, SunIcon, MoonIcon, UserCircleIcon, 
  CameraIcon, KeyIcon, LogoutIcon, UserIcon, HomeIcon, BookOpenIcon, GamepadIcon, StarIcon, EmailIcon, BriefcaseIcon, GavelIcon, HeartbeatIcon, StudentIcon, CheckIcon, DollarIcon, SearchIcon, ApiIcon, CodeIcon
} from './icons.tsx';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface CategoryGroup {
  title: string;
  order: number;
  tools: Tool[];
  key: string;
}

interface HeaderProps {
  onOpenProfileImageModal: () => void;
  onOpenChangePasswordModal: () => void;
  onOpenSearchModal: () => void;
}

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
   <svg className={className} stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onOpenProfileImageModal, onOpenChangePasswordModal, onOpenSearchModal }) => {
  const [isGridMenuOpen, setGridMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConvertMenuOpen, setConvertMenuOpen] = useState(false);
  const [isAllToolsMenuOpen, setAllToolsMenuOpen] = useState(false);
  const [isApiMenuOpen, setIsApiMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const gridMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const convertMenuTimeoutRef = useRef<number | null>(null);
  const allToolsMenuTimeoutRef = useRef<number | null>(null);
  const apiMenuTimeoutRef = useRef<number | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    setIsApiMenuOpen(false);
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

  const categoryConfig: Record<string, Omit<CategoryGroup, 'tools' | 'key'>> = {
    organize: { title: 'Organize', order: 1 },
    optimize: { title: 'Optimize', order: 2 },
    'convert-to': { title: 'Convert to PDF', order: 3 },
    'convert-from': { title: 'Convert from PDF', order: 4 },
    edit: { title: 'Edit', order: 5 },
    security: { title: 'Security', order: 6 },
    business: { title: 'Business Tools', order: 7 },
  };

  const groupedTools = TOOLS.reduce((acc: Record<string, Omit<CategoryGroup, 'key'>>, tool) => {
      const categoryKey = tool.category || 'organize';
      if (!acc[categoryKey]) {
        acc[categoryKey] = { ...categoryConfig[categoryKey], tools: [] };
      }
      acc[categoryKey].tools.push(tool);
      return acc;
  }, {});
  
  const sortedCategories = Object.entries(groupedTools)
    .map(([key, value]) => ({ ...value, key }))
    .sort((a,b) => a.order - b.order);

  const convertTools = TOOLS.filter(
    tool => tool.category === 'convert-to' || tool.category === 'convert-from'
  );

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
  });
  
  const mainNavLinks = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/about', label: 'About', icon: UserIcon },
    { to: '/blog', label: 'Blog', icon: BookOpenIcon },
    { to: '/play-game', label: 'Play Game', icon: GamepadIcon },
    { to: '/api-reference', label: 'API Reference', icon: CodeIcon },
  ];
  
  const desktopNavLinks = [
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/compress-pdf', label: 'Compress PDF' },
    { to: '/merge-pdf', label: 'Merge PDF' },
    { to: '/jpg-to-pdf', label: 'JPG to PDF' },
  ];
  
  const gridMenuLinks = [
      { to: '/pricing', label: 'Pricing', icon: DollarIcon },
      { to: '/education', label: 'Education', icon: StudentIcon },
      { to: '/business', label: 'Business', icon: BriefcaseIcon },
      { to: '/how-to-use', label: 'How to Use', icon: CheckIcon },
      { to: '/privacy-policy', label: 'Privacy Policy', icon: GavelIcon },
      { to: '/terms-of-service', label: 'Terms of Service', icon: HeartbeatIcon },
  ];

  return (
    <>
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors" aria-label="Open main menu" title="Open main menu">
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
            <Link to="/" className="flex items-center space-x-1" title="I Love PDFLY Home">
              <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">I</span>
              <span className="text-xl text-brand-red">❤</span>
              <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">PDFLY</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-1">
              {desktopNavLinks.map(link => (
                  <Link key={link.to} to={link.to} onClick={closeAllMenus} title={link.label} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors rounded-md text-sm font-semibold whitespace-nowrap">
                      {link.label}
                  </Link>
              ))}
              {/* API Dropdown */}
              <div className="relative" onMouseEnter={() => handleMenuEnter(setIsApiMenuOpen, apiMenuTimeoutRef)} onMouseLeave={() => handleMenuLeave(setIsApiMenuOpen, apiMenuTimeoutRef)}>
                <button title="API Tools" className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors rounded-md text-sm font-semibold whitespace-nowrap">
                  <span>API</span>
                  <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${isApiMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                 <div className={`absolute top-full left-0 mt-2 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-20 transition-all duration-200 ease-out origin-top-left ${isApiMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <Link to="/developer" onClick={closeAllMenus} title="Developer Hub" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                      <ApiIcon className="h-5 w-5 text-purple-500" /><span>Developer Hub</span>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <Link to="/api-pdf" onClick={closeAllMenus} title="PDF Tools API" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                      <CodeIcon className="h-5 w-5 text-red-500" /><span>PDF Tools API</span>
                    </Link>
                    <Link to="/api-image" onClick={closeAllMenus} title="Image Tools API" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                      <CodeIcon className="h-5 w-5 text-blue-500" /><span>Image Tools API</span>
                    </Link>
                    <Link to="/api-signature" onClick={closeAllMenus} title="Signature API" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                      <CodeIcon className="h-5 w-5 text-green-500" /><span>Signature API</span>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <Link to="/api-reference" onClick={closeAllMenus} title="API Reference" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                      <BookOpenIcon className="h-5 w-5" /><span>API Reference</span>
                    </Link>
                 </div>
              </div>
              {/* Convert PDF Dropdown */}
              <div className="relative" onMouseEnter={() => handleMenuEnter(setConvertMenuOpen, convertMenuTimeoutRef)} onMouseLeave={() => handleMenuLeave(setConvertMenuOpen, convertMenuTimeoutRef)}>
                <button title="Convert PDF Tools" className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors rounded-md text-sm font-semibold whitespace-nowrap">
                  <span>Convert PDF</span>
                  <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${isConvertMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full left-0 mt-2 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-20 transition-all duration-200 ease-out origin-top-left ${isConvertMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="grid grid-cols-1">
                      {convertTools.map(tool => (
                        <Link key={tool.id} to={`/${tool.id}`} onClick={closeAllMenus} title={tool.title} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                          <tool.Icon className={`h-5 w-5 ${tool.textColor}`} />
                          <span>{tool.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
              </div>
              {/* All PDF Tools Dropdown */}
              <div className="relative" onMouseEnter={() => handleMenuEnter(setAllToolsMenuOpen, allToolsMenuTimeoutRef)} onMouseLeave={() => handleMenuLeave(setAllToolsMenuOpen, allToolsMenuTimeoutRef)}>
                 <button title="All PDF Tools" className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors rounded-md text-sm font-semibold whitespace-nowrap">
                  <span>All PDF Tools</span>
                  <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${isAllToolsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full right-0 mt-2 w-max bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6 z-20 transition-all duration-200 ease-out origin-top-right ${isAllToolsMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4 max-w-4xl">
                      {sortedCategories.map(cat => (
                        <div key={cat.title}>
                          <h4 className="px-2 pb-2 text-sm font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">{cat.title}</h4>
                          <div className="mt-2 space-y-1">
                            {cat.tools.map(tool => (
                              <Link key={tool.id} to={`/${tool.id}`} onClick={closeAllMenus} title={tool.title} className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                  <tool.Icon className={`h-5 w-5 flex-shrink-0 ${tool.textColor}`} />
                                  <span className="font-semibold text-sm whitespace-nowrap">{tool.title}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </nav>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-xs sm:text-sm font-mono text-gray-500 dark:text-gray-400" aria-live="polite" aria-atomic="true">{formattedTime}</div>
            <button onClick={onOpenSearchModal} className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors" aria-label="Search" title="Search">
              <SearchIcon className="h-6 w-6" />
            </button>
            {user ? (
               <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="block h-10 w-10 rounded-full overflow-hidden border-2 border-transparent hover:border-brand-red transition" aria-label="Open user profile menu" title="Open user profile menu">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-full w-full text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Signed in as</p>
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
                      <button onClick={() => { onOpenProfileImageModal(); closeAllMenus(); }} title="Change profile photo" className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <CameraIcon className="h-5 w-5" />
                        <span>Change Photo</span>
                      </button>
                      <button onClick={() => { onOpenChangePasswordModal(); closeAllMenus(); }} title="Change password" className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <KeyIcon className="h-5 w-5" />
                        <span>Change Password</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                      <button onClick={() => { logout(); closeAllMenus(); }} title="Logout" className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <LogoutIcon className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 md:space-x-4">
                <Link to="/login" title="Login" className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors font-semibold px-2">Login</Link>
                <Link to="/signup" title="Sign Up" className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-md transition-colors">Sign up</Link>
              </div>
            )}
            <div className="relative block" ref={gridMenuRef}>
              <button onClick={() => setGridMenuOpen(!isGridMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors" aria-label="Open all tools and options" title="Open all tools and options">
                <GridIcon className="h-6 w-6" />
              </button>
              {isGridMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2">
                   {mainNavLinks.map(link => (
                    <Link key={link.to} to={link.to} onClick={closeAllMenus} title={link.label} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <link.icon className="h-5 w-5"/>
                        <span>{link.label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  {gridMenuLinks.map(link => (
                    <Link key={link.to} to={link.to} onClick={closeAllMenus} title={link.label} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <link.icon className="h-5 w-5"/>
                        <span>{link.label}</span>
                    </Link>
                  ))}
                   <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                   <Link to="/contact" onClick={closeAllMenus} title="Contact" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red transition-colors">
                        <EmailIcon className="h-5 w-5"/>
                        <span>Contact</span>
                    </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <Link to="/developer-access" onClick={closeAllMenus} title="Admin Access" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red">Admin Access</Link>
                  {isAdmin && (
                    <Link to="/admin-dashboard" onClick={closeAllMenus} title="Admin Dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red">Admin Dashboard</Link>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button onClick={toggleTheme} title="Toggle Theme" className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-red">
                    <span>Toggle Theme</span>
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                  </button>
                </div>
              )}
            </div>
            {!user && (
              <div className="sm:hidden">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-brand-red" aria-label="Login or sign up" title="Login or sign up">
                  <UserIcon className="h-7 w-7" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    {/* Mobile Menu */}
    <div className={`fixed inset-0 z-[60] bg-black/50 transition-opacity md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)}></div>
    <div className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white dark:bg-black z-[70] transition-transform duration-300 ease-in-out md:hidden transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-lg text-gray-800 dark:text-gray-100">All Tools</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300" aria-label="Close menu" title="Close menu">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto p-2">
                <div className="space-y-4">
                    {sortedCategories.map(cat => (
                        <div key={cat.title}>
                            <h4 className="px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{cat.title}</h4>
                            <div className="mt-1 space-y-1">
                                {cat.tools.map(tool => (
                                    <Link
                                        key={tool.id}
                                        to={`/${tool.id}`}
                                        onClick={closeAllMenus}
                                        title={tool.title}
                                        className="flex items-center space-x-4 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <tool.Icon className={`h-6 w-6 flex-shrink-0 ${tool.textColor}`} />
                                        <span className="font-semibold text-sm">{tool.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div>
                        <h4 className="px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Developer API</h4>
                        <div className="mt-1 space-y-1">
                            <Link to="/api-pdf" onClick={closeAllMenus} title="PDF REST API" className="flex items-center space-x-4 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><CodeIcon className="h-6 w-6 text-red-500"/><span>PDF REST API</span></Link>
                            <Link to="/api-image" onClick={closeAllMenus} title="Image REST API" className="flex items-center space-x-4 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><CodeIcon className="h-6 w-6 text-blue-500"/><span>Image REST API</span></Link>
                            <Link to="/api-signature" onClick={closeAllMenus} title="Signature REST API" className="flex items-center space-x-4 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><CodeIcon className="h-6 w-6 text-green-500"/><span>Signature REST API</span></Link>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {!user && (
                    <div className="flex items-center space-x-2">
                        <Link to="/login" onClick={closeAllMenus} title="Login" className="flex-1 text-center font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors py-2 px-4 rounded-md border border-gray-300 dark:border-gray-700">Login</Link>
                        <Link to="/signup" onClick={closeAllMenus} title="Sign Up" className="flex-1 text-center bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-md transition-colors">Sign up</Link>
                    </div>
                )}
            </div>
        </div>
    </div>
    </>
  );
};

export default memo(Header);
