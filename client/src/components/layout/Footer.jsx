import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 pt-16 pb-8 text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Info */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary-600 text-white p-2 rounded-xl">
                                <Activity className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold text-white">MedCare</span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed max-w-sm">
                            Your trusted partner in modern healthcare. Book appointments online, consult via video, and manage your health seamlessly.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 tracking-wide">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link to="/services" className="hover:text-primary-400 transition-colors">Our Services</Link></li>
                            <li><Link to="/doctors" className="hover:text-primary-400 transition-colors">Find a Doctor</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
                            <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 tracking-wide">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/disclaimer" className="hover:text-primary-400 transition-colors">Medical Disclaimer</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 tracking-wide">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                                <span className="text-gray-400">123 Health Ave, Medical City, MC 10001</span>
                            </li>
                            <li className="flex gap-3">
                                <Phone className="h-5 w-5 text-primary-500 shrink-0" />
                                <span className="text-gray-400">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex gap-3">
                                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                                <span className="text-gray-400">support@medcare.com</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
                    <p>&copy; {currentYear} MedCare. All rights reserved.</p>
                    <div className="mt-4 md:mt-0 flex gap-6">
                        <span>Powered by Stripe</span>
                        <span>Secured Connections</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
