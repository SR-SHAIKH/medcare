import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Video, Calendar, Activity } from 'lucide-react';

const mockServices = [
    { id: 1, name: 'General Consultation', category: 'General', price: 50, duration: 30, desc: 'Comprehensive initial health assessment.' },
    { id: 2, name: 'Dermatology Review', category: 'Specialist', price: 90, duration: 45, desc: 'Skin, hair, and nail health consultation.' },
    { id: 3, name: 'Pediatric Checkup', category: 'Pediatrics', price: 70, duration: 30, desc: 'Routine child wellness examination.' },
    { id: 4, name: 'Mental Health Counseling', category: 'Therapy', price: 120, duration: 60, desc: 'Confidential psychological support sessions.' },
    { id: 5, name: 'Nutrition Plan', category: 'Wellness', price: 80, duration: 45, desc: 'Customized dietary planning and advice.' },
    { id: 6, name: 'Cardiology Assessment', category: 'Specialist', price: 150, duration: 60, desc: 'Heart health review and diagnostics.' },
];

const categories = ['All', 'General', 'Specialist', 'Pediatrics', 'Therapy', 'Wellness'];

const Services = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredServices = mockServices.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.desc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="py-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">Our Medical Services</h1>
                    <p className="text-lg text-gray-600">Browse through our comprehensive range of medical services. Book an in-person visit or a secure video consultation.</p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-10">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search services, symptoms, or keywords..."
                                className="input-field pl-12 bg-gray-50 border-transparent focus:bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-6 py-2 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0">
                            <Filter className="h-4 w-4" /> Filters
                        </button>
                    </div>

                    <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 hide-scrollbar">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredServices.length > 0 ? (
                        filteredServices.map(service => (
                            <div key={service.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                        {service.category}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                                <p className="text-gray-600 mb-6 flex-grow">{service.desc}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Calendar className="h-4 w-4 text-primary-500" />
                                        <span>{service.duration} mins</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Video className="h-4 w-4 text-secondary-500" />
                                        <span>Virtual OK</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                    <div className="text-2xl font-bold text-gray-900">${service.price}</div>
                                    <Link to={`/doctors?service=${service.id}`} className="btn-primary py-2 px-5 text-sm flex items-center gap-1">
                                        Book <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-lg">No services found matching your criteria.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                                className="mt-4 text-primary-600 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Services;
