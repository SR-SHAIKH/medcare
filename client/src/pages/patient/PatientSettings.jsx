import { API_URL } from "../../config";
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientSettings = () => {
    const { authFetch, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authFetch(`${API_URL}/api/patient/profile`);
            const data = await res.json();
            if (data.success) {
                setProfile(prev => ({
                    ...prev,
                    name: data.data.name,
                    email: data.data.email,
                    phone: data.data.phone,
                    profileImage: data.data.profileImage || ''
                }));
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5000000) {
            alert('File size exceeds 5MB limit');
            return;
        }

        // Preview
        const previewUrl = URL.createObjectURL(file);
        setProfile(prev => ({ ...prev, profileImage: previewUrl }));

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/api/profile/upload-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Assuming token is stored in localStorage
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setProfile(prev => ({ ...prev, profileImage: data.data }));
            } else {
                alert(data.message || 'Image upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Something went wrong during upload.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (profile.password && profile.password !== profile.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await authFetch(`${API_URL}/api/patient/profile`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    profileImage: profile.profileImage,
                    ...(profile.password && { password: profile.password })
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Profile updated successfully!');
            }
        } catch (err) {
            console.error('Update failed:', err);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                <p className="text-gray-500 text-sm">Update your personal information and security settings</p>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-8">
                {/* Photo Section */}
                <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
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
                        <p className="text-sm text-gray-500 max-w-xs">Upload a profile photo. Max size 5MB. We'll show this across the platform.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <div className="input-group">
                            <User className="input-icon w-5 h-5" />
                            <input 
                                type="text"
                                required
                                className="input-field"
                                value={profile.name}
                                onChange={(e) => setProfile({...profile, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <div className="input-group">
                            <Mail className="input-icon w-5 h-5" />
                            <input 
                                type="email"
                                required
                                className="input-field"
                                value={profile.email}
                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                        <div className="input-group">
                            <Phone className="input-icon w-5 h-5" />
                            <input 
                                type="tel"
                                required
                                className="input-field"
                                value={profile.phone}
                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary-500 pl-4">Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">New Password (Optional)</label>
                            <div className="input-group">
                                <Lock className="input-icon w-5 h-5" />
                                <input 
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={profile.password}
                                    onChange={(e) => setProfile({...profile, password: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                            <div className="input-group">
                                <Lock className="input-icon w-5 h-5" />
                                <input 
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={profile.confirmPassword}
                                    onChange={(e) => setProfile({...profile, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary py-4 px-10 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-primary-500/30 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientSettings;
