import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
    const { user, getDashboardPath } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">

                    {/* Icon */}
                    <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShieldX className="w-12 h-12" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        You do not have permission to view this page.
                        <br />
                        <span className="text-sm text-gray-400">
                            Your role <span className="font-semibold text-gray-600">({user?.role || 'unknown'})</span> does not have access to this resource.
                        </span>
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <Link
                                to={getDashboardPath()}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:bg-primary-700 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go to My Dashboard
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:bg-primary-700 transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                Log In
                            </Link>
                        )}
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>

                {/* Security note */}
                <p className="mt-8 text-xs text-gray-400">
                    If you believe this is an error, please contact your system administrator.
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;
