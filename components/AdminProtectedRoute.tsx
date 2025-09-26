
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute: React.FC = () => {
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    return isAuthenticated ? <Outlet /> : <Navigate to="/developer-access" />;
};

export default AdminProtectedRoute;
