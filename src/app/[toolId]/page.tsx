'use client';
import { useParams } from 'next/navigation';
import { OutletContext } from 'react-router-dom';

// Import protectors and layouts
import UserProtectedRoute from '../../../components/UserProtectedRoute';
import UserDashboardLayout from '../../../components/UserDashboardLayout';
import AdminProtectedRoute from '../../../components/AdminProtectedRoute';

// Import views
import ToolPage from '../../../views/ToolPage';
import AIQuestionGeneratorPage from '../../../views/AIQuestionGeneratorPage';
import AIImageGeneratorPage from '../../../views/AIImageGeneratorPage';
import InvoiceGeneratorPage from '../../../views/InvoiceGeneratorPage';
import CVGeneratorPage from '../../../views/CVGeneratorPage';
import LessonPlanCreatorPage from '../../../views/LessonPlanCreatorPage';
import PremiumFeaturePage from '../../../views/PremiumFeaturePage';

// Import public static views
import FeaturesPage from '../../../views/FeaturesPage';
import HowToUsePage from '../../../views/HowToUsePage';
import BusinessPage from '../../../views/BusinessPage';
import EducationPage from '../../../views/EducationPage';
import PressPage from '../../../views/PressPage';
import CeoPage from '../../../views/CeoPage';
import LegalPage from '../../../views/LegalPage';
import PrivacyPolicyPage from '../../../views/PrivacyPolicyPage';
import TermsOfServicePage from '../../../views/TermsOfServicePage';
import CookiesPolicyPage from '../../../views/CookiesPolicyPage';
import SecurityPolicyPage from '../../../views/SecurityPolicyPage';
import SubmitTicketPage from '../../../views/SubmitTicketPage';

// Import admin views
import AdminDashboardPage from '../../../views/AdminDashboardPage';

// Import dashboard views
import AccountSettingsPage from '../../../views/AccountSettingsPage';
import WorkflowsPage from '../../../views/WorkflowsPage';
import SecurityPage from '../../../views/SecurityPage';
import TeamPage from '../../../views/TeamPage';
import LastTasksPage from '../../../views/LastTasksPage';
import SignaturesOverviewPage from '../../../views/SignaturesOverviewPage';
import SentPage from '../../../views/SentPage';
import InboxPage from '../../../views/InboxPage';
import SignedPage from '../../../views/SignedPage';
import TemplatesPage from '../../../views/TemplatesPage';
import ContactsPage from '../../../views/ContactsPage';
import SignatureSettingsPage from '../../../views/SignatureSettingsPage';
import PlansAndPackagesPage from '../../../views/PlansAndPackagesPage';
import BusinessDetailsPage from '../../../views/BusinessDetailsPage';
import InvoicesPage from '../../../views/InvoicesPage';

export default function ToolRoute() {
  const params = useParams();
  const toolId = params?.toolId as string;

  // 1. Admin Dashboard Route
  if (toolId === 'admin-dashboard') {
    const adminPage = <AdminDashboardPage />;
    return (
      <OutletContext.Provider value={adminPage}>
        <AdminProtectedRoute />
      </OutletContext.Provider>
    );
  }

  // 2. Premium Redirect Route
  if (toolId === 'premium-feature') {
    return <PremiumFeaturePage />;
  }

  // 3. Custom AI/Generator Tools
  if (toolId === 'ai-image-generator') {
    return <AIImageGeneratorPage />;
  }
  if (toolId === 'ai-question-generator') {
    return <AIQuestionGeneratorPage />;
  }
  if (toolId === 'invoice-generator') {
    return <InvoiceGeneratorPage />;
  }
  if (toolId === 'cv-generator') {
    return <CVGeneratorPage />;
  }
  if (toolId === 'lesson-plan-creator') {
    return <LessonPlanCreatorPage />;
  }

  // 4. Public Static Info Pages
  if (toolId === 'features') return <FeaturesPage />;
  if (toolId === 'how-to-use') return <HowToUsePage />;
  if (toolId === 'business') return <BusinessPage />;
  if (toolId === 'education') return <EducationPage />;
  if (toolId === 'press') return <PressPage />;
  if (toolId === 'ceo') return <CeoPage />;
  if (toolId === 'legal') return <LegalPage />;
  if (toolId === 'privacy-policy') return <PrivacyPolicyPage />;
  if (toolId === 'terms-of-service') return <TermsOfServicePage />;
  if (toolId === 'cookies-policy') return <CookiesPolicyPage />;
  if (toolId === 'security-policy') return <SecurityPolicyPage />;
  if (toolId === 'submit-ticket') return <SubmitTicketPage />;

  // 5. User Dashboard Child Routes (Single-segment)
  const dashboardPages = [
    'account-settings', 'workflows', 'security', 'team',
    'last-tasks', 'signatures-overview', 'sent', 'inbox',
    'signed', 'templates', 'contacts', 'signature-settings',
    'plans-packages', 'business-details', 'invoices'
  ];

  if (dashboardPages.includes(toolId)) {
    let childComponent;
    switch (toolId) {
      case 'account-settings': childComponent = <AccountSettingsPage />; break;
      case 'workflows': childComponent = <WorkflowsPage />; break;
      case 'security': childComponent = <SecurityPage />; break;
      case 'team': childComponent = <TeamPage />; break;
      case 'last-tasks': childComponent = <LastTasksPage />; break;
      case 'signatures-overview': childComponent = <SignaturesOverviewPage />; break;
      case 'sent': childComponent = <SentPage />; break;
      case 'inbox': childComponent = <InboxPage />; break;
      case 'signed': childComponent = <SignedPage />; break;
      case 'templates': childComponent = <TemplatesPage />; break;
      case 'contacts': childComponent = <ContactsPage />; break;
      case 'signature-settings': childComponent = <SignatureSettingsPage />; break;
      case 'plans-packages': childComponent = <PlansAndPackagesPage />; break;
      case 'business-details': childComponent = <BusinessDetailsPage />; break;
      case 'invoices': childComponent = <InvoicesPage />; break;
      default: childComponent = null;
    }

    const layoutWrapper = (
      <OutletContext.Provider value={childComponent}>
        <UserDashboardLayout />
      </OutletContext.Provider>
    );

    return (
      <OutletContext.Provider value={layoutWrapper}>
        <UserProtectedRoute />
      </OutletContext.Provider>
    );
  }

  // 6. Default to standard PDF tools page
  return <ToolPage />;
}
