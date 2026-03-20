import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Calendar, FileText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <Calendar className="w-5 h-5" />, end: true },
        { path: '/dashboard/appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
        { path: '/dashboard/medical-history', label: 'Medical History', icon: <FileText className="w-5 h-5" /> },
        { path: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="glass-card p-6 sticky top-28">
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold uppercase shrink-0">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h2 className="font-bold text-gray-900 text-lg truncate">{user?.name || 'Patient'}</h2>
                                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {navItems.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.end}
                                        className={({ isActive }) => 
                                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        {item.icon}
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium">
                                    <LogOut className="w-5 h-5" />
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;

