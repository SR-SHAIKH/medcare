import { Link } from 'react-router-dom';
import { Calendar, Video, Clock, ShieldCheck, ArrowRight, Star, CheckCircle } from 'lucide-react';

const Home = () => {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="w-full lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/80 text-primary-700 font-medium text-sm mb-6 border border-primary-200 shadow-sm backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                                Virtual Care Available 24/7
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 drop-shadow-sm">
                                Healthcare that revolves around <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">You.</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Connect with top-rated medical professionals, book in-person visits, or consult virtually from the comfort of your home.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/doctors" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center gap-2">
                                    Book Appointment <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link to="/services" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 rounded-2xl font-semibold shadow-md border border-gray-100 hover:bg-gray-50 transition-all duration-300 text-center">
                                    Explore Services
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-6">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <img key={i} className="w-12 h-12 rounded-full border-2 border-white object-cover" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <p className="font-medium text-gray-800 mt-0.5">Over 10,000+ happy patients</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 relative lg:h-[600px] flex justify-center items-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-transparent rounded-[3rem] rotate-3 scale-105 -z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=1000&auto=format&fit=crop"
                                alt="Doctor consulting patient"
                                className="rounded-[3rem] shadow-2xl w-full max-w-lg object-cover h-auto lg:h-[90%] border-4 border-white/50"
                            />

                            {/* Floating Cards */}
                            <div className="absolute top-[10%] -left-8 md:-left-12 glass-card p-4 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-600">
                                    <Video className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Online Consult</p>
                                    <p className="text-xs text-gray-500">Secure WebRTC</p>
                                </div>
                            </div>

                            <div className="absolute bottom-[10%] -right-4 md:-right-8 glass-card p-4 flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Verified Doctors</p>
                                    <p className="text-xs text-gray-500">Top Specialists</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-primary-600 font-semibold tracking-wider uppercase text-sm mb-2">Our Capabilities</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Comprehensive healthcare options tailored for you</h3>
                        <p className="text-gray-600 text-lg">We blend modern technology with exceptional medical expertise to provide seamless care.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 text-center transition-all duration-300 border border-gray-100 group">
                            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Easy Booking</h4>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Discover specialists, view real-time availability, and secure your appointment with just three clicks.
                            </p>
                            <Link to="/doctors" className="text-primary-600 font-medium flex items-center justify-center gap-1 hover:text-primary-800">
                                Find Doctor <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gradient-to-b from-primary-600 to-primary-800 rounded-3xl p-8 shadow-xl shadow-primary-500/20 translate-y-0 md:-translate-y-4 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-0"></div>
                            <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-6 relative z-10">
                                <Video className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-bold mb-3 relative z-10">Telemedicine</h4>
                            <p className="text-primary-100 leading-relaxed mb-6 relative z-10">
                                Consult securely from anywhere via high-quality video links integrated directly into your appointments.
                            </p>
                            <Link to="/services" className="text-white font-medium flex items-center justify-center gap-1 group relative z-10">
                                Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 text-center transition-all duration-300 border border-gray-100 group">
                            <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-600 mb-6 group-hover:bg-secondary-600 group-hover:text-white transition-colors duration-300">
                                <Clock className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Instant Reminders</h4>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Never miss a consultation with automated Email, SMS, and WhatsApp notifications before your visit.
                            </p>
                            <Link to="/register" className="text-secondary-600 font-medium flex items-center justify-center gap-1 hover:text-secondary-800">
                                Sign Up Now <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2">
                            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop" alt="App interface" className="rounded-3xl shadow-2xl border flex-1" />
                        </div>
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-primary-600 font-semibold tracking-wider uppercase text-sm mb-2">The Process</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">How MedCare Works</h3>

                            <div className="space-y-8">
                                {[
                                    { step: '01', title: 'Search & Select', desc: 'Find the right doctor based on specialty, ratings, and availability parameters.' },
                                    { step: '02', title: 'Schedule Slot', desc: 'Pick a convenient date and time from the doctor\'s active dynamic calendar.' },
                                    { step: '03', title: 'Secure Payment', desc: 'Pay safely online using our Stripe integration to confirm your booking instantly.' },
                                    { step: '04', title: 'Get Care', desc: 'Visit the clinic or join the secure video link we text to your WhatsApp.' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="shrink-0">
                                            <div className="w-12 h-12 bg-white border border-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold shadow-sm">
                                                {item.step}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                                            <p className="text-gray-600">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-900"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e18690c5e561?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">Ready to take control of your health?</h2>
                    <p className="text-primary-100 text-lg md:text-xl">Join thousands of patients who trust MedCare for simple, secure, and fast healthcare access.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                        <Link to="/register" className="px-8 py-4 bg-white text-primary-900 font-bold rounded-xl shadow-lg hover:bg-primary-50 hover:-translate-y-1 transition-all duration-300">
                            Create Patient Account
                        </Link>
                        <Link to="/register?role=doctor" className="px-8 py-4 bg-primary-800 text-white border border-primary-700 font-medium rounded-xl hover:bg-primary-700 hover:-translate-y-1 transition-all duration-300">
                            Join as a Provider
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
