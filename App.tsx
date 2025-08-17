import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { HomeIcon } from './components/icons.tsx';

// Components
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTopButton from './components/ScrollToTopButton.tsx';
import ProfileImageModal from './components/ProfileImageModal.tsx';
import SearchModal from './components/SearchModal.tsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.tsx';
import CalendarModal from './components/CalendarModal.tsx';
import CookieConsentBanner from './components/CookieConsentBanner.tsx';
import Preloader from './components/Preloader.tsx';
import ChangePasswordModal from './components/ChangePasswordModal.tsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.tsx';

// Pages
import HomePage from './pages/HomePage.tsx';
import ToolPage from './pages/ToolPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogPostPage from './pages/BlogPostPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import DeveloperPage from './pages/DeveloperPage.tsx';
import FaqPage from './pages/FaqPage.tsx';
import SitemapPage from './pages/SitemapPage.tsx';
import GamesPage from './pages/PlayGamePage.tsx';
import InvoiceGeneratorPage from './pages/InvoiceGeneratorPage.tsx';
import CVGeneratorPage from './pages/CVGeneratorPage.tsx';
import LessonPlanCreatorPage from './pages/LessonPlanCreatorPage.tsx';
import AIQuestionGeneratorPage from './pages/AIQuestionGeneratorPage.tsx';
import ImageGeneratorPage from './pages/ImageGeneratorPage.tsx';
import PricingPage from './pages/PricingPage.tsx';
import PremiumFeaturePage from './pages/PremiumFeaturePage.tsx';
import PaymentPage from './pages/PaymentPage.tsx';
import DeveloperAccessPage from './pages/DeveloperAccessPage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import HowToUsePage from './pages/HowToUsePage.tsx';
import EducationPage from './pages/EducationPage.tsx';
import BusinessPage from './pages/BusinessPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsOfServicePage from './pages/TermsOfServicePage.tsx';
import CookiesPolicyPage from './pages/CookiesPolicyPage.tsx';
import CeoPage from './pages/CeoPage.tsx';
import ApiPricingPage from './pages/ApiPricingPage.tsx';
import ApiReferencePage from './pages/ApiReferencePage.tsx';
import ApiPdfPage from './pages/ApiPdfPage.tsx';
import ApiImagePage from './pages/ApiImagePage.tsx';
import ApiSignaturePage from './pages/ApiSignaturePage.tsx';

// Games
import MemoryMatchGame from './pages/games/MemoryMatchGame.tsx';
import WordFinderGame from './pages/games/WordFinderGame.tsx';
import QuizGame from './pages/games/QuizGame.tsx';
import BubbleShooterGame from './pages/games/BubbleShooterGame.tsx';
import SnakeGame from './pages/games/SnakeGame.tsx';
import CarRacingGame from './pages/games/CarRacingGame.tsx';
import PdfInvadersGame from './pages/games/PdfInvadersGame.tsx';
import ColorFloodGame from './pages/games/ColorFloodGame.tsx';
import PaperTossGame from './pages/games/PaperTossGame.tsx';

const FloatingBackButton: React.FC = () => (
  <Link
    to="/"
    className="fixed top-4 left-4 z-[100] flex items-center gap-2 bg-white/80 dark:bg-black/70 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-black transition-colors"
    aria-label="Back to Home"
    title="Back to Home"
  >
    <HomeIcon className="h-6 w-6 text-brand-red" />
    <span className="font-semibold text-gray-700 dark:text-gray-200 hidden sm:inline">Home</span>
  </Link>
);

function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const hideHeaderFooter =
    location.pathname.startsWith('/play-game/') ||
    location.pathname === '/cv-generator' ||
    location.pathname === '/invoice-generator';

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
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
        } else if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/');
        }
      } else if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200">
      {hideHeaderFooter && <FloatingBackButton />}
      {!hideHeaderFooter && (
        <Header
          onOpenProfileImageModal={() => setProfileImageModalOpen(true)}
          onOpenSearchModal={() => setSearchModalOpen(true)}
          onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
        />
      )}
      <main className="flex-grow">
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
          <Route path="/play-game" element={<GamesPage />} />
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
          <Route path="/api-reference" element={<ApiReferencePage />} />
          <Route path="/api-pdf" element={<ApiPdfPage />} />
          <Route path="/api-image" element={<ApiImagePage />} />
          <Route path="/api-signature" element={<ApiSignaturePage />} />
          <Route path="/play-game/memory-match" element={<MemoryMatchGame />} />
          <Route path="/play-game/word-finder" element={<WordFinderGame />} />
          <Route path="/play-game/quiz-game" element={<QuizGame />} />
          <Route path="/play-game/bubble-shooter" element={<BubbleShooterGame />} />
          <Route path="/play-game/snake-game" element={<SnakeGame />} />
          <Route path="/play-game/car-racing" element={<CarRacingGame />} />
          <Route path="/play-game/pdf-invaders" element={<PdfInvadersGame />} />
          <Route path="/play-game/color-flood" element={<ColorFloodGame />} />
          <Route path="/play-game/paper-toss" element={<PaperTossGame />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          </Route>
          <Route path="/:toolId" element={<ToolPage />} />
        </Routes>
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
        <Router>
          <MainApp />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
