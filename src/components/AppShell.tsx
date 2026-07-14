'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { usePWAInstall } from '../../contexts/PWAInstallContext';
import PullToRefresh from '../../components/PullToRefresh';
import PwaHeader from '../../components/PwaHeader';
import PwaBottomNav from '../../components/PwaBottomNav';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import ProfileImageModal from '../../components/ProfileImageModal';
import SearchModal from '../../components/SearchModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import QrCodeModal from '../../components/QrCodeModal';
import MobileAuthGate from '../../components/MobileAuthGate';
import CalendarModal from '../../components/CalendarModal';
import PwaBackground from '../../components/PwaBackground';
import CookieConsentBanner from '../../components/CookieConsentBanner';
import { ChatbotWidget } from './ChatbotWidget';
import { LayoutContext } from '../../App.tsx';
import { TOOLS } from '../../constants';

const MainBackground: React.FC = () => (
    <div className="main-background-svg-container">
        <svg className="main-background-svg" width="1389" height="1479" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
                <mask id="a" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="1389" height="1479">
                    <path fill="#D9D9D9" d="M0 0h1389v1479H0z" />
                </mask>
                <g mask="url(#a)">
                    <ellipse opacity=".5" cy="1007.5" rx="160" ry="160.5" fill="url(#b)" />
                    <circle opacity=".5" cx="857.242" cy="375.085" r="91.111" fill="url(#c)" />
                    <rect opacity=".5" x="-.664" y="273.555" width="386.866" height="386.866" rx="24" transform="rotate(-45 -.664 273.555)" fill="url(#d)" />
                    <rect opacity=".5" x="288.662" y="1179.43" width="718.993" height="424.487" rx="32" transform="rotate(-45 288.662 1179.43)" fill="url(#e)" />
                    <circle opacity=".5" cx="1389.13" cy="530.129" r="220.13" fill="url(#f)" />
                    <circle opacity=".5" cx="1205.72" cy="1387.95" r="91.111" fill="url(#g)" />
                </g>
            </g>
            <defs>
                <linearGradient id="b" x1="-61.873" y1="861.062" x2=".372" y2="1167.92" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E5322d" />
                    <stop offset=".993" stopColor="#F5F5FA" />
                </linearGradient>
                <linearGradient id="c" x1="766.131" y1="250.722" x2="857.242" y2="466.196" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E5322d" />
                    <stop offset="1" stopColor="#F5F5FA" />
                </linearGradient>
                <linearGradient id="d" x1="117.967" y1="290.503" x2="192.769" y2="660.421" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E5322d" />
                    <stop offset=".993" stopColor="#F5F5FA" />
                </linearGradient>
                <linearGradient id="e" x1="616.714" y1="1247.46" x2="920.97" y2="1639.19" gradientUnits="userSpaceOnUse">
                    <stop offset=".091" stopColor="#F5F5FA" />
                    <stop offset=".948" stopColor="#E5322d" />
                </linearGradient>
                <linearGradient id="f" x1="1456.96" y1="604.614" x2="1389.13" y2="750.259" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E5322d" />
                    <stop offset=".993" stopColor="#F5F5FA" />
                </linearGradient>
                <linearGradient id="g" x1="1242.3" y1="1427.85" x2="1140.55" y2="1333.41" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E5322d" />
                    <stop offset="1" stopColor="#F5F5FA" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const location = useLocation();
    const { user, loading } = useAuth();
    const { isPwa } = usePWAInstall();

    const [isMobile, setIsMobile] = useState(false);
    const [showFooter, setShowFooter] = useState(true);
    
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
    const [isChatbotOpen, setChatbotOpen] = useState(false);
    const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth < 768);
            const handleResize = () => setIsMobile(window.innerWidth < 768);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const layoutContextValue = useMemo(() => ({
        setShowFooter
    }), []);

    useEffect(() => {
        const isTool = TOOLS.some(tool => location.pathname === `/${tool.id}` || location.pathname === `/tools/${tool.id}`);
        setShowFooter(!isTool);
    }, [location.pathname]);

    const viewMode = typeof window !== 'undefined' ? localStorage.getItem('viewMode') : null;
    const shouldShowPwaLayout = isPwa || (isMobile && viewMode !== 'browser');

    useEffect(() => {
        if (shouldShowPwaLayout) {
            document.documentElement.classList.add('no-scrollbar');
        } else {
            document.documentElement.classList.remove('no-scrollbar');
        }
        return () => {
            document.documentElement.classList.remove('no-scrollbar');
        };
    }, [shouldShowPwaLayout]);

    const isFlipbookViewerPage = location.pathname.startsWith('/flip/');
    const isAdminDashboard = location.pathname.startsWith('/admin-dashboard');

    if (shouldShowPwaLayout) {
        return (
            <LayoutContext.Provider value={layoutContextValue}>
                <div className="safe-top fixed top-0 left-0 right-0 z-[1001] h-[env(safe-area-inset-top)]" />
                <div className="native-app min-h-screen flex flex-col pt-[env(safe-area-inset-top)]">
                    <PwaBackground />
                    <MobileAuthGate onOpenForgotPasswordModal={() => {}}>
                        <PullToRefresh>
                            <PwaHeader
                                onOpenSearchModal={() => setSearchModalOpen(true)}
                                unreadCount={0}
                                justReceivedNotification={false}
                                onNotificationAnimationEnd={() => {}}
                                onOpenProfileImageModal={() => setProfileImageModalOpen(true)}
                                onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
                                onAdminAccessRequest={() => {}}
                            />
                            <main className={`text-gray-800 dark:text-gray-200 pt-[60px] ${isFlipbookViewerPage ? 'pb-0' : 'pb-[72px]'}`}>
                                {children}
                            </main>
                        </PullToRefresh>
                        {!isFlipbookViewerPage && !isAdminDashboard && <PwaBottomNav />}
                    </MobileAuthGate>

                    {!isMobile && !isAdminDashboard && <ChatbotWidget isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} onOpen={() => setChatbotOpen(true)} showFab={true} isPwa={isPwa} />}
                    <SearchModal isOpen={isSearchModalOpen} onClose={() => setSearchModalOpen(false)} />
                    <ProfileImageModal isOpen={isProfileImageModalOpen} onClose={() => setProfileImageModalOpen(false)} />
                    <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
                </div>
            </LayoutContext.Provider>
        );
    }

    return (
        <LayoutContext.Provider value={layoutContextValue}>
            <MainBackground />
            <div className="flex flex-col min-h-screen text-gray-800 dark:text-gray-200">
                {!isAdminDashboard && <Header
                    isPwa={isPwa}
                    onOpenProfileImageModal={() => setProfileImageModalOpen(true)}
                    onOpenSearchModal={() => setSearchModalOpen(true)}
                    onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
                    onOpenQrCodeModal={() => setQrCodeModalOpen(true)}
                    unreadCount={0}
                    justReceivedNotification={false}
                    onNotificationAnimationEnd={() => {}}
                />}
                <main className="flex-grow">
                    {children}
                </main>
                {showFooter && !isAdminDashboard && <Footer
                    onOpenCalendarModal={() => setCalendarModalOpen(true)}
                />}
            </div>

            <ProfileImageModal isOpen={isProfileImageModalOpen} onClose={() => setProfileImageModalOpen(false)} />
            <SearchModal isOpen={isSearchModalOpen} onClose={() => setSearchModalOpen(false)} />
            <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
            <QrCodeModal isOpen={isQrCodeModalOpen} onClose={() => setQrCodeModalOpen(false)} />
            <ScrollToTopButton />
            <CookieConsentBanner />
            {!isMobile && !isAdminDashboard && <ChatbotWidget isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} onOpen={() => setChatbotOpen(true)} showFab={true} isPwa={isPwa} />}
        </LayoutContext.Provider>
    );
}

export default AppShell;
