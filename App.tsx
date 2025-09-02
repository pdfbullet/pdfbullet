
import React, { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { I18nProvider } from './contexts/I18nContext.tsx';
import { EmailIcon, CheckIcon } from './components/icons.tsx';

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
import ChangePasswordModal from './components/ChangePasswordModal.tsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.tsx';
import ProblemReportModal from './components/ProblemReportModal.tsx';

// Inlined component to fix import issue
const DataDeletionPage: React.FC = () => {
    React.useEffect(() => {
        document.title = "User Data Deletion | I Love PDFLY";
    }, []);

    return (
        <div className="py-16 md:py-24">
            <div className="px-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-black p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">User Data Deletion Request</h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <p>We are committed to protecting your privacy and giving you control over your personal data. If you wish to delete your account and all associated data from our systems, please follow the instructions below.</p>
                        
                        <h3>How to Delete Your Data</h3>
                        <p>You can permanently delete your account and all associated data directly from your account settings. This is the fastest and most secure way to delete your data.</p>
                        <ol>
                            <li>Log in to your I Love PDFLY account.</li>
                            <li>Navigate to the <Link to="/account-settings" className="text-brand-red hover:underline">Account Settings</Link> page.</li>
                            <li>Scroll down to the "Danger Zone" section.</li>
                            <li>Click on "Delete My Account" and follow the on-screen instructions to confirm the deletion.</li>
                        </ol>

                        <h3 className="mt-6">Alternative Method</h3>
                        <p>If you are unable to access your account, you can request data deletion by sending an email to our support team with the subject line "Data Deletion Request".</p>
                        <p>
                            <strong>Email:</strong> <a href="mailto:Support@ilovepdfly.com" className="text-brand-red hover:underline">Support@ilovepdfly.com</a>
                        </p>
                        <p>Please include the username and email address associated with your account in your message.</p>

                        <h3>What Happens Next?</h3>
                        <p>
                            <strong>For self-service deletion:</strong> Your account and data will be permanently deleted immediately upon confirmation.
                        </p>
                        <p>
                            <strong>For email requests:</strong> Once we receive your request, our team will verify your identity and process the deletion. We will confirm with you via email once the process is complete, which typically takes up to 30 days.
                        </p>
                        
                        <h3>What Data is Deleted?</h3>
                        <p>The deletion process will remove:</p>
                        <ul>
                            <li>Your user account and profile information (username, email, profile picture, etc.).</li>
                            <li>Any content you have created or saved within your account.</li>
                            <li>Your API key and associated usage data.</li>
                        </ul>
                        <p>Please note that some anonymous, aggregated usage data that is not linked to your personal identity may be retained for analytical purposes.</p>

                        <p>If you have any questions about this process, please do not hesitate to contact us.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ForgotPasswordModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { auth } = useAuth();
    const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setError('');
            setSuccess('');
            setIsLoading(false);
            setTimeout(() => emailInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await auth.sendPasswordResetEmail(email);
            setSuccess(`Password reset link sent to ${email}. Please check your inbox (and spam folder).`);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else {
                setError(err.message || 'Failed to send reset email. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-md rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Reset Password</h2>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">&times;</button>
                </header>
                {success ? (
                  <div className="p-8 text-center">
                     <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                     <p className="text-green-700 dark:text-green-300">{success}</p>
                     <button onClick={onClose} className="mt-6 w-full bg-brand-red text-white font-bold py-2 px-4 rounded-md">Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter your account's email address and we will send you a password reset link.</p>
                      <div>
                        <label htmlFor="reset-email" className="sr-only">Email address</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <EmailIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input ref={emailInputRef} type="email" id="reset-email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-brand-red focus:border-brand-red" />
                        </div>
                      </div>
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </main>
                    <footer className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                      <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold border rounded-md bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">Cancel</button>
                      <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-md disabled:bg-red-300 hover:bg-brand-red-dark">
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </footer>
                  </form>
                )}
            </div>
        </div>
    );
};


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
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage.tsx'));
const CreateWorkflowPage = lazy(() => import('./pages/CreateWorkflowPage.tsx'));
const UserDashboardLayout = lazy(() => import('./components/UserDashboardLayout.tsx'));
const LegalPage = lazy(() => import('./pages/LegalPage.tsx'));
const SecurityPolicyPage = lazy(() => import('./pages/SecurityPolicyPage.tsx'));

// New Dashboard Pages
const SecurityPage = lazy(() => import('./pages/SecurityPage.tsx'));
const TeamPage = lazy(() => import('./pages/TeamPage.tsx'));
const LastTasksPage = lazy(() => import('./pages/LastTasksPage.tsx'));
const SignaturesOverviewPage = lazy(() => import('./pages/SignaturesOverviewPage.tsx'));
const SentPage = lazy(() => import('./pages/SentPage.tsx'));
const InboxPage = lazy(() => import('./pages/InboxPage.tsx'));
const SignedPage = lazy(() => import('./pages/SignedPage.tsx'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage.tsx'));
const ContactsPage = lazy(() => import('./pages/ContactsPage.tsx'));
const SignatureSettingsPage = lazy(() => import('./pages/SignatureSettingsPage.tsx'));
const PlansAndPackagesPage = lazy(() => import('./pages/PlansAndPackagesPage.tsx'));
const BusinessDetailsPage = lazy(() => import('./pages/BusinessDetailsPage.tsx'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage.tsx'));


function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [isProblemReportModalOpen, setProblemReportModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

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
        } else if (redirectInfo.from === 'developer') {
          navigate('/developer');
        } else if (redirectInfo.from === 'workflows_create') {
          navigate('/workflows/create');
        } else if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/');
        }
      } else if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen text-gray-800 dark:text-gray-200">
      <Header
        onOpenProfileImageModal={() => setProfileImageModalOpen(true)}
        onOpenSearchModal={() => setSearchModalOpen(true)}
        onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
      />
      <main className="flex-grow">
        <Suspense fallback={<div className="w-full py-20" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage onOpenForgotPasswordModal={() => setForgotPasswordModalOpen(true)} />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/developer" element={<DeveloperPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/invoice-generator" element={<InvoiceGeneratorPage />} />
            <Route path="/cv-generator" element={<CVGeneratorPage />} />
            <Route path="/lesson-plan-creator" element={<LessonPlanCreatorPage />} />
            <Route path="/ai-question-generator" element={<AIQuestionGeneratorPage />} />
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
            <Route path="/user-data-deletion" element={<DataDeletionPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/security-policy" element={<SecurityPolicyPage />} />
            
            {/* API Routes */}
            <Route path="/api-reference" element={<ApiReferencePage />} />
            <Route path="/api-pdf" element={<ApiPdfPage />} />
            <Route path="/api-image" element={<ApiImagePage />} />
            <Route path="/api-signature" element={<ApiSignaturePage />} />

            {/* Admin Routes */}
            <Route element={<AdminProtectedRoute />}>
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            </Route>

            {/* User Protected Routes with Dashboard Layout */}
            <Route element={<UserProtectedRoute />}>
                <Route element={<UserDashboardLayout />}>
                    <Route path="/account-settings" element={<AccountSettingsPage />} />
                    <Route path="/workflows" element={<WorkflowsPage />} />
                    <Route path="/workflows/create" element={<CreateWorkflowPage />} />
                    <Route path="/security" element={<SecurityPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/last-tasks" element={<LastTasksPage />} />
                    <Route path="/signatures-overview" element={<SignaturesOverviewPage />} />
                    <Route path="/sent" element={<SentPage />} />
                    <Route path="/inbox" element={<InboxPage />} />
                    <Route path="/signed" element={<SignedPage />} />
                    <Route path="/templates" element={<TemplatesPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/signature-settings" element={<SignatureSettingsPage />} />
                    <Route path="/plans-packages" element={<PlansAndPackagesPage />} />
                    <Route path="/business-details" element={<BusinessDetailsPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                </Route>
            </Route>
            
            {/* ToolPage should be last to catch dynamic tool IDs */}
            <Route path="/:toolId" element={<ToolPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer 
        onOpenCalendarModal={() => setCalendarModalOpen(true)}
        onOpenProblemReportModal={() => setProblemReportModalOpen(true)}
      />
      
      <ProfileImageModal isOpen={isProfileImageModalOpen} onClose={() => setProfileImageModalOpen(false)} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setSearchModalOpen(false)} />
      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
      <ProblemReportModal isOpen={isProblemReportModalOpen} onClose={() => setProblemReportModalOpen(false)} />
      <ForgotPasswordModal isOpen={isForgotPasswordModalOpen} onClose={() => setForgotPasswordModalOpen(false)} />
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
                <I18nProvider>
                    <MainApp />
                </I18nProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
