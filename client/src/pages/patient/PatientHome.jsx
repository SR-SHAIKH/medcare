import { API_URL } from "../../config";
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Video, Clock, FileText, ChevronRight, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientHome = () => {
    const { authFetch } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await authFetch(`${API_URL}/api/patient/appointments`);
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Could not load latest data. Please refresh.');
        }
        setLoading(false);
    };

    const upcomingAppointments = useMemo(() => {
        return appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).slice(0, 3);
    }, [appointments]);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-heading">Patient Dashboard</h1>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <h3 className="text-xl font-bold mb-2 relative z-10">Need a Doctor?</h3>
                    <p className="text-primary-100 mb-6 text-sm relative z-10">Find specialists and book new appointments easily.</p>
                    <Link to="/doctors" className="inline-block bg-white text-primary-700 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all relative z-10">Book New Visit</Link>
                </div>
                <Link to="/dashboard/medical-history" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-secondary-300 transition-colors">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Health Records</h3>
                        <p className="text-sm text-gray-500">View lab results and prescriptions</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary-50 text-secondary-600 rounded-2xl flex items-center justify-center group-hover:bg-secondary-600 group-hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                    </div>
                </Link>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Upcoming</h2>
                    <Link to="/dashboard/appointments" className="text-primary-600 text-sm font-semibold hover:underline">View All</Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400">Loading appointments...</div>
                ) : error ? (
                    <div className="py-12 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>
                ) : upcomingAppointments.length === 0 ? (
                    <div className="py-12 text-center">
                        <Calendar className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                        <p className="text-gray-500 mb-6">You have no upcoming appointments. Find a doctor to get started.</p>
                        <Link to="/doctors" className="btn-primary py-2 px-6 text-sm">Find a Doctor</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingAppointments.map(apt => (
                            <div key={apt._id} className="border border-gray-100 rounded-2xl p-5 hover:border-primary-100 hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">Dr. {apt.doctor?.name || 'Doctor'}</h4>
                                            <p className="text-sm text-gray-500">{apt.doctor?.specializations?.join(', ')}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm font-medium">
                                                <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md">
                                                    <Clock className="w-4 h-4 text-primary-500" /> {apt.slot?.date} at {apt.slot?.time}
                                                </span>
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary-50 text-secondary-700">
                                                    {apt.appointmentType === 'Online Consultation' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                    {apt.appointmentType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-3 mt-4 md:mt-0">
                                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider w-max ${apt.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                            {apt.status}
                                        </span>
                                        {apt.meetingLink && (
                                            <a href={apt.meetingLink} target="_blank" rel="noreferrer" className="btn-primary py-2 px-4 shadow-sm text-sm flex items-center justify-center gap-2">
                                                Join Video <ChevronRight className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientHome;
