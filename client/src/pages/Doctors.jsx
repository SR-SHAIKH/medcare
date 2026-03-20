import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, MapPin, Video, Award, Clock } from 'lucide-react';
import axios from 'axios';

const specializations = ['All', 'General', 'Dermatologist', 'Cardiologist', 'Neurologist', 'Dentist', 'Physiotherapist', 'Orthopedic', 'Multi-Specialist'];

const Doctors = () => {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSpec, setActiveSpec] = useState(initialCategory);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors`);
            if (res.data.success) {
                // Filter only approved doctors (backend usually does this but safety first)
                setDoctors(res.data.data.filter(d => d.status === 'approved'));
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpec = activeSpec === 'All' || doctor.specializations.includes(activeSpec);
        return matchesSearch && matchesSpec;
    });

    return (
        <div className="py-12 bg-white min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">

                {/* Header */}
                <div className="mb-10 lg:mb-16">
                    <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 font-heading">Find a Doctor</h1>
                    <p className="text-gray-600 text-lg max-w-2xl text-balance">
                        Connect with certified top-tier medical professionals. Filter by specialty, review ratings, and book your online or offline consultation seamlessly.
                    </p>
                </div>

                {/* Search Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-gray-50 rounded-2xl p-6 sticky top-28 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Filters</h3>

                            <div className="mb-6 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search doctor name..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Specialization</h4>
                                {specializations.map(spec => (
                                    <button
                                        key={spec}
                                        onClick={() => setActiveSpec(spec)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSpec === spec
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="w-full lg:w-3/4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map(doctor => (
                                    <div key={doctor._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl p-6 transition-all duration-300 flex flex-col group relative">
                                        <div className="flex gap-4 items-start mb-4">
                                            <div className="relative">
                                                <img
                                                    src={doctor.image || `https://i.pravatar.cc/150?u=${doctor._id}`}
                                                    alt={doctor.name}
                                                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-50 group-hover:ring-primary-100 transition-all"
                                                />
                                                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                                                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="Available"></div>
                                                </div>
                                            </div>
                                            <div className="flex-1 mt-1">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors uppercase">{doctor.name}</h3>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {doctor.specializations?.map((spec, i) => (
                                                        <span key={i} className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded uppercase font-semibold">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {doctor.consultationTypes?.map((type, i) => (
                                                <div key={i} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md font-medium border ${type === 'Online Consultation' ? 'bg-secondary-50 text-secondary-700 border-secondary-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                                    {type === 'Online Consultation' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                    {type}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-3 mb-6 flex-grow text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-gray-400" />
                                                <span>{doctor.experience} Years Experience</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">{doctor.clinicLocation || 'MedCare Center'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                            <div className="text-xl font-bold text-gray-900">₹{doctor.consultationFee || doctor.fee}<span className="text-sm text-gray-500 font-normal">/visit</span></div>
                                            <Link to={`/booking/${doctor._id}`} className="btn-primary py-2 px-4 shadow-sm text-sm hover:-translate-y-0.5">
                                                Book Slot
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                                    <p>Try adjusting your filters or search terms.</p>
                                    <button
                                        onClick={() => { setSearchTerm(''); setActiveSpec('All'); }}
                                        className="mt-4 text-primary-600 font-medium hover:underline"
                                    >
                                        Clear all active filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Doctors;
