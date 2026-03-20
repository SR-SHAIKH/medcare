import { useState, useEffect } from 'react';
import { Save, Loader2, Camera, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorSettings = () => {
    const { authFetch } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [form, setForm] = useState({
        name: '',
        phone: '',
        clinicLocation: '',
        specializations: '',
        consultationFee: '',
        bio: '',
        experience: '',
        consultationTypes: [],
        profileImage: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/profile`);
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
                setForm({
                    name: data.data.name || '',
                    phone: data.data.userPhone || '',
                    clinicLocation: data.data.clinicLocation || '',
                    specializations: (data.data.specializations || []).join(', '),
                    consultationFee: data.data.consultationFee || '',
                    bio: data.data.bio || '',
                    experience: data.data.experience || '',
                    consultationTypes: data.data.consultationTypes || [],
                    profileImage: data.data.profileImage || ''
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleConsultationType = (type) => {
        setForm(prev => ({
            ...prev,
            consultationTypes: prev.consultationTypes.includes(type)
                ? prev.consultationTypes.filter(t => t !== type)
                : [...prev.consultationTypes, type]
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5000000) {
            alert('File size exceeds 5MB limit');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, profileImage: previewUrl }));

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/upload-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setForm(prev => ({ ...prev, profileImage: data.data }));
            } else {
                alert(data.message || 'Image upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Something went wrong during upload.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const payload = {
                name: form.name,
                phone: form.phone,
                clinicLocation: form.clinicLocation,
                specializations: form.specializations.split(',').map(s => s.trim()).filter(Boolean),
                consultationFee: Number(form.consultationFee),
                bio: form.bio,
                experience: Number(form.experience),
                consultationTypes: form.consultationTypes,
                profileImage: form.profileImage
            };

            const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/doctor/profile`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Profile updated successfully!');
                setProfile(data.data);
            } else {
                setMessage('Error: ' + (data.message || data.error));
            }
        } catch (err) {
            setMessage('Error saving profile');
        }
        setSaving(false);
    };

    if (loading) return <div className="text-center py-16 text-gray-400">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-500 text-sm mt-1">Edit your professional profile</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
                {/* Photo Section */}
                <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md flex-shrink-0">
                            {form.profileImage ? (
                                <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors">
                            <Camera className="w-5 h-5" />
                            <input 
                                type="file"
                                accept="image/jpeg, image/png, image/jpg"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                        <h4 className="font-bold text-gray-900 text-lg">Your Profile Picture</h4>
                        <p className="text-sm text-gray-500 max-w-xs">Upload a professional photo. Max size 5MB. Must be JPG, JPEG, or PNG.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required
                            className="w-full px-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input type="text" name="phone" value={form.phone} onChange={handleChange}
                            className="w-full px-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Location</label>
                        <input type="text" name="clinicLocation" value={form.clinicLocation} onChange={handleChange}
                            className="w-full px-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (₹)</label>
                        <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange}
                            className="w-full px-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specializations (comma-separated)</label>
                        <input type="text" name="specializations" value={form.specializations} onChange={handleChange}
                            placeholder="Cardiology, Dermatology"
                            className="w-full px-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                        <input type="number" name="experience" value={form.experience} onChange={handleChange}
                            className="w-full px-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} rows="4"
                        placeholder="Write a brief professional bio..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Types</label>
                    <div className="flex gap-4">
                        {['Online Consultation', 'Physical Clinic Visit'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => toggleConsultationType(type)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${form.consultationTypes.includes(type) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button type="submit" disabled={saving}
                        className="btn-primary py-3 px-8 shadow-md shadow-primary-500/20 flex items-center gap-2 text-sm font-semibold">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorSettings;
