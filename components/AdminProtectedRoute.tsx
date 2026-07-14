import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ADMIN_SESSION_TIMEOUT = 3600 * 1000; // 1 hour in milliseconds

const AdminProtectedRoute: React.FC = () => {
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    const authTimestampStr = sessionStorage.getItem('adminAuthTimestamp');

    console.log("AdminProtectedRoute: session check", { isAuthenticated, authTimestampStr });

    if (!isAuthenticated || !authTimestampStr) {
        console.log("AdminProtectedRoute: not authenticated, redirecting to /developer-access");
        sessionStorage.removeItem('isAdminAuthenticated');
        sessionStorage.removeItem('adminAuthTimestamp');
        return <Navigate to="/developer-access" replace />;
    }

    const authTimestamp = parseInt(authTimestampStr, 10);
    const isSessionExpired = (Date.now() - authTimestamp) > ADMIN_SESSION_TIMEOUT;

    if (isSessionExpired) {
        console.log("AdminProtectedRoute: session expired, redirecting to /developer-access");
        sessionStorage.removeItem('isAdminAuthenticated');
        sessionStorage.removeItem('adminAuthTimestamp');
        // Redirecting to the initial access page is better than home for clarity
        return <Navigate to="/developer-access" replace />;
    }

    console.log("AdminProtectedRoute: session valid, permitting access");
    return <Outlet />;
};

export default AdminProtectedRoute;