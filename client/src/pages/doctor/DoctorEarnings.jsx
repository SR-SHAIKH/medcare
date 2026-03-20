import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorEarnings = () => {
    const { authFetch } = useAuth();
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/earnings`);
            const data = await res.json();
            if (data.success) setEarnings(data.data);
        } catch (err) {
            console.error('Error fetching earnings:', err);
        }
        setLoading(false);
    };

    if (loading) return <div className="text-center py-16 text-gray-400">Loading earnings...</div>;

    const statCards = [
        { label: 'Total Earnings', value: `₹${earnings?.totalEarnings || 0}`, icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-50' },
        { label: "Today's Earnings", value: `₹${earnings?.todayEarnings || 0}`, icon: <TrendingUp className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50' },
        { label: 'Monthly Earnings', value: `₹${earnings?.monthlyEarnings || 0}`, icon: <Calendar className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-50' },
        { label: 'Consultation Fee', value: `₹${earnings?.consultationFee || 0}`, icon: <CreditCard className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
                <p className="text-gray-500 text-sm mt-1">Track your revenue from appointments</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} mb-4`}>
                            {stat.icon}
                        </div>
                        <h4 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h4>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-gray-500 text-sm font-medium mb-1">Completed Appointments</h4>
                    <p className="text-3xl font-bold text-gray-900">{earnings?.totalCompleted || 0}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-gray-500 text-sm font-medium mb-1">Pending Appointments</h4>
                    <p className="text-3xl font-bold text-gray-900">{earnings?.pendingAppointments || 0}</p>
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                </div>
                {(!earnings?.paymentHistory || earnings.paymentHistory.length === 0) ? (
                    <div className="p-12 text-center text-gray-400">
                        <CreditCard className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                        <p>No payment history yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {earnings.paymentHistory.map(p => (
                                    <tr key={p._id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{p.appointmentType}</td>
                                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">₹{p.amount}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${p.status === 'successful' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorEarnings;
