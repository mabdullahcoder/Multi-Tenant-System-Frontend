import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && Array.isArray(role) && user?.role && !role.includes(user.role)) {
        const redirectPath = user.role === 'admin' || user.role === 'super-admin'
            ? '/admin/dashboard'
            : '/user/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
}

export default ProtectedRoute;
