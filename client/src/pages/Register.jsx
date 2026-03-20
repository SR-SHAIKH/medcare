import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, Activity, Stethoscope, MapPin, Briefcase, DollarSign, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SPECIALIZATIONS = [
    'Dermatologist', 'Cardiologist', 'Neurologist',
    'Dentist', 'Physiotherapist', 'Orthopedic', 'Multi-Specialist'
];

const Register = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: initialRole,
        qualification: '',
        experience: '',
        clinicLocation: '',
        consultationFee: '',
        specializations: [],
        consultationTypes: [],
        documents: '' // Will stub as string for UI demo purposes
    });

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSpecializationChange = (spec) => {
        setFormData(prev => {
            if (prev.specializations.includes(spec)) {
                return { ...prev, specializations: prev.specializations.filter(s => s !== spec) };
            } else {
                return { ...prev, specializations: [...prev.specializations, spec] };
            }
        });
    };

    const handleConsultationTypeChange = (type) => {
        setFormData(prev => {
            if (prev.consultationTypes.includes(type)) {
                return { ...prev, consultationTypes: prev.consultationTypes.filter(t => t !== type) };
            } else {
                return { ...prev, consultationTypes: [...prev.consultationTypes, type] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (data.success) {
                login(data.user, data.token);
                // Redirect based on role
                navigate(formData.role === 'doctor' ? '/doctor-panel' : '/dashboard');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen py-10 flex items-center justify-center relative overflow-hidden mt-10">
            <div className={`container mx-auto px-4 z-10 w-full ${formData.role === 'doctor' ? 'max-w-2xl' : 'max-w-md'} transition-all duration-500`}>

                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
                        <div className="bg-primary-600 text-white p-2 rounded-xl">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-600">
                            MedCare
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
                    <p className="text-gray-500">Join our healthcare platform today</p>
                </div>

                <div className="glass-card p-8 sm:p-10 border border-white/40">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Role Selection */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 max-w-md mx-auto">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'patient' })}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${formData.role === 'patient' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${formData.role === 'doctor' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Doctor
                            </button>
                        </div>

                        <div className={`grid gap-5 ${formData.role === 'doctor' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                            {/* General Inputs */}
                            <div className="space-y-5">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
                                <div className="input-group">
                                    <UserIcon className="input-icon w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <Mail className="input-icon w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email Address"
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <Phone className="input-icon w-5 h-5" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <Lock className="input-icon w-5 h-5" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Doctor Specific Inputs */}
                            {formData.role === 'doctor' && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Professional Details</h3>

                                    <div className="input-group">
                                        <Briefcase className="input-icon w-5 h-5" />
                                        <input
                                            type="text"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                            placeholder="Qualification (e.g. MBBS, MD)"
                                            className="input-field"
                                            required={formData.role === 'doctor'}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="input-group">
                                            <Stethoscope className="input-icon w-5 h-5" />
                                            <input
                                                type="number"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                placeholder="Experience (Years)"
                                                className="input-field"
                                                required={formData.role === 'doctor'}
                                                min="0"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <DollarSign className="input-icon w-5 h-5" />
                                            <input
                                                type="number"
                                                name="consultationFee"
                                                value={formData.consultationFee}
                                                onChange={handleChange}
                                                placeholder="Fee (INR)"
                                                className="input-field text-sm"
                                                required={formData.role === 'doctor'}
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <MapPin className="input-icon w-5 h-5" />
                                        <input
                                            type="text"
                                            name="clinicLocation"
                                            value={formData.clinicLocation}
                                            onChange={handleChange}
                                            placeholder="Clinic Full Address"
                                            className="input-field"
                                            required={formData.role === 'doctor'}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Specializations (Select multiple)</label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl h-32 overflow-y-auto">
                                            {SPECIALIZATIONS.map((spec) => (
                                                <button
                                                    key={spec}
                                                    type="button"
                                                    onClick={() => handleSpecializationChange(spec)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${formData.specializations.includes(spec)
                                                            ? 'bg-primary-100 border-primary-500 text-primary-700'
                                                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {spec}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Consultation Types</label>
                                        <div className="flex gap-3">
                                            {['Online Consultation', 'Physical Clinic Visit'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => handleConsultationTypeChange(type)}
                                                    className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${formData.consultationTypes.includes(type)
                                                            ? 'bg-secondary-100 border-secondary-500 text-secondary-700'
                                                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-6 h-6 mb-2 text-gray-500" />
                                                <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span> Medical License & ID</p>
                                            </div>
                                            <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFormData({ ...formData, documents: e.target.files[0]?.name })} />
                                        </label>
                                        {formData.documents && <p className="text-xs text-green-600 mt-1">Attached: {formData.documents}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full btn-primary py-3 mt-8 text-base tracking-wide md:max-w-md mx-auto block">
                            {formData.role === 'doctor' ? 'Submit Application' : 'Create Patient Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
