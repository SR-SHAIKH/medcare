import { useState, useEffect } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Calendar, Video, Clock, Users, Settings, LogOut, Activity, MapPin, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
    const { user, authFetch, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/profile`);
            const data = await res.json();
            if (data.success) {
                setDoctorProfile(data.data);
            }
        } catch (err) {
            console.error('Error fetching doctor profile:', err);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Check approval status
    if (!loading && doctorProfile && doctorProfile.status === 'pending') {
        return (
            <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center mt-10">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <div className="glass-card p-10 py-16">
                        <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Pending Approval</h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                            Your professional profile is currently under review by our administration team.
                            We verify all medical credentials before permitting doctors to consult on MEDCARE.
                        </p>
                        <p className="text-sm text-gray-500 mb-8">
                            We will notify you via email once your account has been activated.
                        </p>
                        <button onClick={handleLogout} className="btn-secondary py-2 px-6 text-sm">
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading dashboard...</div>;
    }

    const doctorName = doctorProfile?.name || user?.name || 'Doctor';
    const specializations = doctorProfile?.specializations?.join(', ') || 'General';

    const navItems = [
        { path: '/doctor-panel', label: 'My Schedule', icon: <Calendar className="w-5 h-5" />, end: true },
        { path: '/doctor-panel/patients', label: 'Patients', icon: <Users className="w-5 h-5" /> },
        { path: '/doctor-panel/earnings', label: 'Earnings', icon: <Activity className="w-5 h-5" /> },
        { path: '/doctor-panel/slots', label: 'Manage Slots', icon: <Sliders className="w-5 h-5" /> },
        { path: '/doctor-panel/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-8 mt-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="glass-card p-6 sticky top-28 border border-primary-100">
                            <div className="flex items-center gap-4 border-b border-primary-100 pb-6 mb-6">
                                <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold uppercase border-2 border-primary-500 overflow-hidden">
                                    {doctorProfile?.profileImage ? (
                                        <img src={doctorProfile.profileImage} alt={doctorName} className="w-full h-full object-cover" />
                                    ) : (
                                        doctorName.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-lg">Dr. {doctorName}</h2>
                                    <p className="text-sm text-primary-600 font-medium">{specializations}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {navItems.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-600 text-white font-semibold shadow-md shadow-primary-500/20' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`
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
                    <div className="w-full lg:w-3/4 space-y-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-heading">Provider Dashboard</h1>
                            <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Online & Available
                            </div>
                        </div>

                        {/* Render sub-route content */}
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
