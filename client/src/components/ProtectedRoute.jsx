import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Enforces authentication and role-based access control.
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string[]} allowedRoles - Array of roles permitted to access this route
 * 
 * Security flow:
 * 1. If session is loading → show spinner (prevents flash of unauthorized page)
 * 2. If no user/token → redirect to /login
 * 3. If user role not in allowedRoles → redirect to /unauthorized
 * 4. Otherwise → render the protected component
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, token, loading } = useAuth();

    // 1. Still verifying session — show loading spinner
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    // 2. Not authenticated — redirect to login
    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Role mismatch — redirect to unauthorized page
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 4. Authorized — render the protected component
    return children;
};

export default ProtectedRoute;
