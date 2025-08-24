

import React, { lazy, Suspense, useState } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { HomeIcon } from './components/icons.tsx';

// Components that are part of the main layout
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTopButton from './components/ScrollToTopButton.tsx';
import ProfileImageModal from './components/ProfileImageModal.tsx';
import SearchModal from './components/SearchModal.tsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.tsx';
import UserProtectedRoute from './components/UserProtectedRoute.tsx';
import CalendarModal from './components/CalendarModal.tsx';
import CookieConsentBanner from './components/CookieConsentBanner.tsx';
import Preloader from './components/Preloader.tsx';
import ChangePasswordModal from './components/ChangePasswordModal.tsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.tsx';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const ToolPage = lazy(() => import('./pages/ToolPage.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.tsx'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.tsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const SignUpPage = lazy(() => import('./pages/SignUpPage.tsx'));
const DeveloperPage = lazy(() => import('./pages/DeveloperPage.tsx'));
const FaqPage = lazy(() => import('./pages/FaqPage.tsx'));
const SitemapPage = lazy(() => import('./pages/SitemapPage.tsx'));
const InvoiceGeneratorPage = lazy(() => import('./pages/InvoiceGeneratorPage.tsx'));
const CVGeneratorPage = lazy(() => import('./pages/CVGeneratorPage.tsx'));
const LessonPlanCreatorPage = lazy(() => import('./pages/LessonPlanCreatorPage.tsx'));
const AIQuestionGeneratorPage = lazy(() => import('./pages/AIQuestionGeneratorPage.tsx'));
const ImageGeneratorPage = lazy(() => import('./pages/ImageGeneratorPage.tsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.tsx'));
const PremiumFeaturePage = lazy(() => import('./pages/PremiumFeaturePage.tsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.tsx'));
const DeveloperAccessPage = lazy(() => import('./pages/DeveloperAccessPage.tsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.tsx'));
const HowToUsePage = lazy(() => import('./pages/HowToUsePage.tsx'));
const EducationPage = lazy(() => import('./pages/EducationPage.tsx'));
const BusinessPage = lazy(() => import('./pages/BusinessPage.tsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.tsx'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage.tsx'));
const CookiesPolicyPage = lazy(() => import('./pages/CookiesPolicyPage.tsx'));
const CeoPage = lazy(() => import('./pages/CeoPage.tsx'));
const ApiPricingPage = lazy(() => import('./pages/ApiPricingPage.tsx'));
const ApiReferencePage = lazy(() => import('./pages/ApiReferencePage.tsx'));
const ApiPdfPage = lazy(() => import('./pages/ApiPdfPage.tsx'));
const ApiImagePage = lazy(() => import('./pages/ApiImagePage.tsx'));
const ApiSignaturePage = lazy(() => import('./pages/ApiSignaturePage.tsx'));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage.tsx'));
const PressPage = lazy(() => import('./pages/PressPage.tsx'));
const UserDataDeletionPage = lazy(() => import('./pages/UserDataDeletionPage.tsx'));

const FloatingBackButton: React.FC = () => {
  return (
    <Link
      to="/"
      className="fixed top-4 left-4 z-[100] flex items-center gap-2 bg-white/80 dark:bg-soft-dark/70 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-surface-dark transition-colors"
      aria-label="Back to Home"
      title="Back to Home"
    >
      <HomeIcon className="h-6 w-6 text-brand-red" />
      <span className="font-semibold text-gray-700 dark:text-gray-200 hidden sm:inline">Home</span>
    </Link>
  );
};

function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const hideHeaderFooter = location.pathname === '/cv-generator' || location.pathname === '/invoice-generator';
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!loading && user) {
      const redirectInfoStr = sessionStorage.getItem('postLoginRedirect');
      if (redirectInfoStr) {
        sessionStorage.removeItem('postLoginRedirect');
        const redirectInfo = JSON.parse(redirectInfoStr);

        const pendingDataStr = sessionStorage.getItem('pendingInvoiceDataRedirect');
        if (pendingDataStr) {
          sessionStorage.removeItem('pendingInvoiceDataRedirect');
          navigate('/invoice-generator', { state: { restoredData: JSON.parse(pendingDataStr) }, replace: true });
        } else if (redirectInfo.from === 'pricing') {
          navigate('/payment', { state: { plan: redirectInfo.plan } });
        } else if (redirectInfo.from === '/developer') {
          navigate('/developer');
        } else if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/');
        }
      } else if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-creamy dark:bg-soft-dark text-gray-800 dark:text-gray-200">
      {hideHeaderFooter && <FloatingBackButton />}
      {!hideHeaderFooter && (
        <Header
          onOpenProfileImageModal={() => setProfileImageModalOpen(true)}
          onOpenSearchModal={() => setSearchModalOpen(true)}
          onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
        />
      )}
      <main className="flex-grow">
        <Suspense fallback={<Preloader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/developer" element={<DeveloperPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/invoice-generator" element={<InvoiceGeneratorPage />} />
            <Route path="/cv-generator" element={<CVGeneratorPage />} />
            <Route path="/lesson-plan-creator" element={<LessonPlanCreatorPage />} />
            <Route path="/ai-question-generator" element={<AIQuestionGeneratorPage />} />
            <Route path="/ai-image-generator" element={<ImageGeneratorPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/api-pricing" element={<ApiPricingPage />} />
            <Route path="/premium-feature" element={<PremiumFeaturePage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/developer-access" element={<DeveloperAccessPage />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
            <Route path="/ceo" element={<CeoPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/user-data-deletion" element={<UserDataDeletionPage />} />

            {/* API Routes */}
            <Route path="/api-reference" element={<ApiReferencePage />} />
            <Route path="/api-pdf" element={<ApiPdfPage />} />
            <Route path="/api-image" element={<ApiImagePage />} />
            <Route path="/api-signature" element={<ApiSignaturePage />} />

            {/* Admin Routes */}
            <Route element={<AdminProtectedRoute />}>
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            </Route>

            {/* User Protected Routes */}
            <Route element={<UserProtectedRoute />}>
                <Route path="/account-settings" element={<AccountSettingsPage />} />
            </Route>
            
            {/* ToolPage should be last to catch dynamic tool IDs */}
            <Route path="/:toolId" element={<ToolPage />} />
          </Routes>
        </Suspense>
      </main>
      {!hideHeaderFooter && <Footer onOpenCalendarModal={() => setCalendarModalOpen(true)} />}
      
      <ProfileImageModal isOpen={isProfileImageModalOpen} onClose={() => setProfileImageModalOpen(false)} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setSearchModalOpen(false)} />
      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
      <ScrollToTopButton />
      <CookieConsentBanner />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <MainApp />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;