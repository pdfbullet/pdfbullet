'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { OutletContext } from 'react-router-dom';

// Import protectors and layouts
import AdminProtectedRoute from '../../../components/AdminProtectedRoute';
import UserProtectedRoute from '../../../components/UserProtectedRoute';
import UserDashboardLayout from '../../../components/UserDashboardLayout';

// Import views
import AdminDashboardPage from '../../../views/AdminDashboardPage';
import ManageFlipbooksPage from '../../../views/ManageFlipbooksPage';
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
import NotFoundPage from '../../../views/NotFoundPage';

// Import flipbook sub-views
import ExploreView from '../../../views/manage-flipbooks/ExploreView';
import FlipbookUploadPage from '../../../flipbooks/FlipbookUploadPage';

export default function CatchAllRoute() {
  const params = useParams();
  const slug = params?.slug;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  // 1. Admin Dashboard Route
  if (path === 'admin-dashboard') {
    const adminPage = <AdminDashboardPage />;
    return (
      <OutletContext.Provider value={adminPage}>
        <AdminProtectedRoute />
      </OutletContext.Provider>
    );
  }

  // 2. User Dashboard Child Routes
  const dashboardPages = [
    'account-settings', 'workflows', 'security', 'team',
    'last-tasks', 'signatures-overview', 'sent', 'inbox',
    'signed', 'templates', 'contacts', 'signature-settings',
    'plans-packages', 'business-details', 'invoices'
  ];

  if (dashboardPages.includes(path)) {
    let childComponent;
    switch (path) {
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
      default: childComponent = <NotFoundPage />;
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

  // 3. User Dashboard Parent Routes (not in nested layout)
  if (path === 'dashboard/my-flipbooks') {
    const flipbookDashboard = <ManageFlipbooksPage />;
    return (
      <OutletContext.Provider value={flipbookDashboard}>
        <UserProtectedRoute />
      </OutletContext.Provider>
    );
  }

  // 4. Flipbook Public Gallery
  if (path === 'flipbooks/public') {
    return <ExploreView />;
  }

  // 5. Flipbook Upload
  if (path === 'flipbooks/upload') {
    const uploadForm = <FlipbookUploadPage />;
    return (
      <OutletContext.Provider value={uploadForm}>
        <UserProtectedRoute />
      </OutletContext.Provider>
    );
  }

  // 6. Default Not Found
  return <NotFoundPage />;
}
