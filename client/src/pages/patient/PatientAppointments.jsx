import { useState, useEffect, useMemo } from 'react';
import { Calendar, Video, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientAppointments = () => {
    const { authFetch } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, upcoming, past

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/patient/appointments`);
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Could not load appointments. Please try again later.');
        }
        setLoading(false);
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            if (filter === 'upcoming') return ['pending', 'confirmed'].includes(apt.status);
            if (filter === 'past') return ['completed', 'cancelled'].includes(apt.status);
            return true;
        });
    }, [appointments, filter]);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Appointments</h2>
                    <p className="text-gray-500 text-sm">Manage your scheduled consultations</p>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl w-full sm:w-auto">
                    {['all', 'upcoming', 'past'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                                filter === t ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">Loading your schedule...</div>
            ) : error ? (
                <div className="py-20 text-center text-red-500 bg-red-50 rounded-3xl">{error}</div>
            ) : filteredAppointments.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <Calendar className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-500">You don't have any appointments in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAppointments.map(apt => (
                        <div key={apt._id} className="border border-gray-100 rounded-2xl p-5 hover:border-primary-100 hover:shadow-md transition-all bg-white group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-primary-50">
                                        {apt.doctor?.profileImage ? (
                                            <img src={apt.doctor.profileImage} alt={apt.doctor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-primary-50 text-primary-600 flex items-center justify-center text-xl font-bold">
                                                {apt.doctor?.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Dr. {apt.doctor?.name}</h4>
                                        <p className="text-sm text-primary-600 font-medium">{apt.doctor?.specializations?.join(', ')}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                <Clock className="w-3.5 h-3.5 text-primary-500" /> {apt.slot?.date} | {apt.slot?.time}
                                            </span>
                                            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                                                apt.appointmentType === 'Online Consultation' 
                                                ? 'bg-secondary-50 text-secondary-700' 
                                                : 'bg-indigo-50 text-indigo-700'
                                            }`}>
                                                {apt.appointmentType === 'Online Consultation' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                {apt.appointmentType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        apt.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                                        apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                        apt.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                                        'bg-red-50 text-red-700'
                                    }`}>
                                        {apt.status}
                                    </span>
                                    {apt.meetingLink && apt.status === 'confirmed' && (
                                        <a href={apt.meetingLink} target="_blank" rel="noreferrer" className="btn-primary py-2.5 px-6 shadow-sm text-sm flex items-center justify-center gap-2 w-full md:w-auto">
                                            Join Video Room <ChevronRight className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
