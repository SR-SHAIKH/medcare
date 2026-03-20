import { useState, useEffect } from 'react';
import { Users, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorPatients = () => {
    const { authFetch } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/patients`);
            const data = await res.json();
            if (data.success) setPatients(data.data);
        } catch (err) {
            console.error('Error fetching patients:', err);
        }
        setLoading(false);
    };

    if (loading) return <div className="text-center py-16 text-gray-400">Loading patients...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
                <p className="text-gray-500 text-sm mt-1">Patients who have booked appointments with you</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {patients.length === 0 ? (
                    <div className="p-16 text-center">
                        <Users className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
                        <p className="text-gray-500">Your patient list will appear here once appointments are booked.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visits</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {patients.map(patient => (
                                    <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                                                    {patient.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="font-medium text-gray-900">{patient.name}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {patient.email}</span>
                                                {patient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{patient.lastAppointmentDate || 'N/A'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{patient.lastAppointmentType || 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700">
                                                {patient.totalVisits}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                                patient.lastStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                patient.lastStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                patient.lastStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {patient.lastStatus}
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

export default DoctorPatients;
