import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Settings, LogOut, Search, Filter, TrendingUp, Calendar, CreditCard, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        todayAppointments: 0
    });
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL);
        setSocket(newSocket);

        fetchAllData();

        newSocket.on('newDoctor', (doctor) => {
            setPendingDoctors(prev => [doctor, ...prev]);
            setStats(prev => ({ ...prev, pendingDoctors: (prev.pendingDoctors || 0) + 1 }));
        });

        newSocket.on('doctorStatusUpdate', ({ doctorId, status }) => {
            if (status !== 'pending') {
                setPendingDoctors(prev => prev.filter(d => d._id !== doctorId));
            }
        });

        return () => newSocket.close();
    }, []);

    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [statsRes, pendingRes, appointmentsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/doctors/pending`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/appointments`, { headers })
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (pendingRes.data.success) setPendingDoctors(pendingRes.data.data);
            if (appointmentsRes.data.success) setRecentAppointments(appointmentsRes.data.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/doctors/${id}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPendingDoctors(prev => prev.filter(d => d._id !== id));
        } catch (err) {
            console.error('Error approving doctor:', err);
            alert('Failed to approve doctor');
        }
    };

    const handleReject = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/doctors/${id}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPendingDoctors(prev => prev.filter(d => d._id !== id));
        } catch (err) {
            console.error('Error rejecting doctor:', err);
            alert('Failed to reject doctor');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const statCards = [
        { label: 'Total Patients', value: String(stats.totalPatients), icon: <Users className="w-5 h-5 text-primary-600" />, bg: 'bg-primary-50' },
        { label: 'Approved Doctors', value: String(stats.totalDoctors), icon: <Activity className="w-5 h-5 text-secondary-600" />, bg: 'bg-secondary-50' },
        { label: 'Total Appointments', value: String(stats.totalAppointments), icon: <CreditCard className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
        { label: 'Appointments Today', value: String(stats.todayAppointments), icon: <Calendar className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' }
    ];

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* Admin Sidebar */}
            <aside className="fixed inset-y-0 left-0 bg-white w-64 shadow-lg border-r border-gray-100 hidden lg:block z-30">
                <div className="flex items-center gap-2 px-6 h-20 border-b border-gray-100 mb-6">
                    <div className="bg-primary-600 text-white p-2 rounded-xl">
                        <Activity className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-600">
                        MedCare
                    </span>
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-widest text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">Admin</span>
                </div>

                <nav className="px-4 space-y-2 relative h-[calc(100vh-8rem)] flex flex-col">
                    {[
                        { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-5 h-5" /> },
                        { id: 'approvals', label: 'Approvals', icon: <UserCheck className="w-5 h-5" />, badge: pendingDoctors.length },
                        { id: 'doctors', label: 'Doctors', icon: <Activity className="w-5 h-5" /> },
                        { id: 'patients', label: 'Patients', icon: <Users className="w-5 h-5" /> },
                        { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
                        { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                {item.label}
                            </div>
                            {item.badge > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === item.id ? 'bg-white text-primary-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="mt-auto pb-6">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium border border-transparent hover:border-red-100">
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-heading capitalize">{activeTab} Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'}.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input type="text" placeholder="Global search..." className="input-field pl-10 py-2 w-64 bg-white shadow-sm" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold border border-gray-200 shadow-sm">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map((stat, idx) => (
                                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <h4 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h4>
                                    <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Appointments Table */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Recent Appointments</h2>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                        <Filter className="w-4 h-4" /> Filter
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentAppointments.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-gray-400">
                                                    No appointments yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentAppointments.slice(0, 10).map((apt) => (
                                                <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                                                                {getInitials(apt.user?.name)}
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900">{apt.user?.name || 'Unknown'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">Dr. {apt.doctor?.name || 'Unknown'}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">
                                                        {apt.slot?.date || 'N/A'}<br />
                                                        <span className="text-xs text-gray-400">{apt.slot?.time || ''}</span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {apt.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">{apt.appointmentType}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'approvals' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8 animate-in fade-in duration-500">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-yellow-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Pending Doctor Approvals</h2>
                                <p className="text-sm text-gray-500 mt-1">Review credentials before allowing doctors on the platform.</p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">
                                {pendingDoctors.length} Pending
                            </span>
                        </div>

                        {pendingDoctors.length === 0 ? (
                            <div className="p-16 text-center text-gray-500">
                                <UserCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                                <p>There are no pending doctor approvals.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {pendingDoctors.map(doctor => (
                                    <div key={doctor._id} className="p-6 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-5">
                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
                                                <UserCheck className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                                    {doctor.name || doctor.user?.name}
                                                    <span className="text-[10px] uppercase tracking-wider bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">New Application</span>
                                                </h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-2">
                                                    <p><b>Email:</b> {doctor.user?.email || doctor.email}</p>
                                                    <p><b>Location:</b> {doctor.clinicLocation || 'Not Specified'}</p>
                                                    <p><b>Experience:</b> {doctor.experience} Yrs</p>
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    {doctor.specializations?.map((s, idx) => (
                                                        <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md font-semibold border border-primary-100">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 xl:w-1/3 xl:justify-end w-full">
                                            <button className="flex-1 sm:flex-none btn-secondary py-2.5 px-4 text-sm flex items-center justify-center gap-2">
                                                <span>📄</span> View Documents
                                            </button>
                                            <div className="flex gap-2 flex-1 sm:flex-none">
                                                <button onClick={() => handleApprove(doctor._id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-1 shadow-sm">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button onClick={() => handleReject(doctor._id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-1 border border-red-200">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminDashboard;
