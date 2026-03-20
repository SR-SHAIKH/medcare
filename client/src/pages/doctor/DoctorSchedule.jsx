import { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, Clock, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorSchedule = () => {
    const { authFetch } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/appointments`);
            const data = await res.json();
            if (data.success) setAppointments(data.data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
        setLoading(false);
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    if (loading) return <div className="text-center py-16 text-gray-400">Loading schedule...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
                    <p className="text-gray-500 text-sm mt-1">View and manage your appointments</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <Calendar className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                        <p className="text-gray-500">Appointments will appear here once patients book with you.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map(apt => (
                            <div key={apt._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 text-center border-r border-gray-200 pr-5">
                                        <p className="text-lg font-bold text-gray-900">{apt.slot?.time || '--'}</p>
                                        <p className="text-xs text-gray-500 font-semibold">{apt.slot?.date || ''}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{apt.user?.name || 'Patient'}</h4>
                                        <span className="text-sm text-gray-500">{apt.user?.email}</span>
                                        <div className="mt-2 text-sm font-medium">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${apt.appointmentType === 'Online Consultation' ? 'bg-secondary-50 text-secondary-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {apt.appointmentType === 'Online Consultation' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                {apt.appointmentType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                    apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {apt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorSchedule;
