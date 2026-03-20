import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'patient'
    });

    const navigate = useNavigate();
    const { login, getDashboardPath } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const data = await response.json();
            
            if (data.success) {
                login(data.user, data.token);
                // Redirect based on role returned from server
                navigate(getDashboardPath(data.user.role));
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen py-10 flex items-center justify-center relative overflow-hidden bg-gray-50">
            {/* Decorative blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/40 rounded-full blur-3xl -z-10 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-200/40 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto px-4 z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="bg-primary-600 text-white p-2 rounded-xl border border-primary-500 shadow-md">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-600">
                            MedCare
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Log in to manage your appointments</p>
                </div>

                <div className="glass-card p-8 sm:p-10 border border-white/40">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Role Selection */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                            {['patient', 'doctor', 'admin'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${formData.role === role ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        <div className="input-group">
                            <Mail className="input-icon w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="input-field bg-white/60 focus:bg-white"
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
                                className="input-field bg-white/60 focus:bg-white"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <button type="submit" className="w-full btn-primary py-3 text-base tracking-wide shadow-primary-500/40">
                            Log In
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
