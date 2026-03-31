import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import PlaceOrderPage from './pages/user/PlaceOrderPage';
import MyOrdersPage from './pages/user/MyOrdersPage';
import OrderDetailsPage from './pages/user/OrderDetailsPage';
import ReportsPage from './pages/user/ReportsPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageOrdersPage from './pages/admin/ManageOrdersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import ManageMenuPage from './pages/admin/ManageMenuPage';

// Components
import ProtectedRoute from './components/routes/ProtectedRoute';
import Notification from './components/ui/Notification';

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();

    const getDefaultRoute = () => {
        if (!isAuthenticated) return '/login';
        if (user?.role === 'admin' || user?.role === 'super-admin') return '/admin/dashboard';
        return '/user/dashboard';
    };

    return (
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Notification />
            <Routes>
                <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />} />

                <Route path="/user/dashboard" element={<ProtectedRoute role={['user', 'admin', 'super-admin']}><UserDashboard /></ProtectedRoute>} />
                <Route path="/user/my-orders" element={<ProtectedRoute role={['user', 'admin', 'super-admin']}><MyOrdersPage /></ProtectedRoute>} />
                <Route path="/user/order/:orderId" element={<ProtectedRoute role={['user', 'admin', 'super-admin']}><OrderDetailsPage /></ProtectedRoute>} />
                <Route path="/user/place-order" element={<ProtectedRoute role={['user', 'admin', 'super-admin']}><PlaceOrderPage /></ProtectedRoute>} />
                <Route path="/user/reports" element={<ProtectedRoute role={['user', 'admin', 'super-admin']}><ReportsPage /></ProtectedRoute>} />
                <Route path="/user/profile" element={<ProtectedRoute role={['user', 'admin', 'super-admin']}><ProfilePage /></ProtectedRoute>} />

                <Route path="/admin/dashboard" element={<ProtectedRoute role={['admin', 'super-admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute role={['admin', 'super-admin']}><ManageUsersPage /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute role={['admin', 'super-admin']}><ManageOrdersPage /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute role={['admin', 'super-admin']}><AdminReportsPage /></ProtectedRoute>} />
                <Route path="/admin/activity-logs" element={<ProtectedRoute role={['admin', 'super-admin']}><ActivityLogsPage /></ProtectedRoute>} />
                <Route path="/admin/menu" element={<ProtectedRoute role={['admin', 'super-admin']}><ManageMenuPage /></ProtectedRoute>} />

                <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

function App() {
    return <AppRoutes />;
}

export default App;
