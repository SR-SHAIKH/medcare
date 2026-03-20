import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CreditCard, CheckCircle, ChevronRight, Activity, Video, MapPin } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
const Booking = () => {
    const { user } = useAuth();
    const { doctorId } = useParams();
    const [step, setStep] = useState(1);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookingData, setBookingData] = useState({
        appointmentType: '',
        date: '',
        slotId: '',
        slotTime: '',
        service: { name: 'Standard Consultation', duration: 30, price: 0 }
    });

    useEffect(() => {
        fetchDoctorDetails();
    }, [doctorId]);

    useEffect(() => {
        if (bookingData.date) {
            fetchAvailableSlots(bookingData.date);
        }
    }, [bookingData.date]);

    const fetchDoctorDetails = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors/${doctorId}`);
            if (res.data.success) {
                const doc = res.data.data;
                setDoctor(doc);
                setBookingData(prev => ({ 
                    ...prev, 
                    service: { ...prev.service, price: doc.consultationFee } 
                }));
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching doctor details:', err);
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async (date) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/slots?doctorId=${doctorId}&date=${date}&isBooked=false`);
            if (res.data.success) {
                setAvailableSlots(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
    };

    // Mock Date generator for next 7 days
    const nextDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        return {
            date: iso,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: d.getDate()
        };
    });

    const handleRazorpayPayment = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert('Please login to book an appointment');

            // 1. Create Pending Appointment
            const appointRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments`, {
                doctor: doctorId,
                appointmentType: bookingData.appointmentType,
                slot: bookingData.slotId
            }, { headers: { Authorization: `Bearer ${token}` } });

            const appointmentId = appointRes.data.data._id;

            // 2. Create Razorpay Order
            const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/payments/razorpay/order`, {
                appointmentId
            }, { headers: { Authorization: `Bearer ${token}` } });

            const { orderId, amount } = orderRes.data;

            // 3. Open Razorpay Checkout
            // NOTE: In production, use your real key from an env variable exposed to frontend
            const options = {
                key: 'rzp_test_dummy', 
                amount: amount * 100,
                currency: "INR",
                name: "MedCare Platform",
                description: `Appointment with Dr. ${doctor.name}`,
                order_id: orderId,
                handler: async (response) => {
                    // 4. Verify Payment
                    try {
                        const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/payments/razorpay/verify`, {
                            ...response,
                            appointmentId
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        if (verifyRes.data.success) {
                            handleSuccess();
                        }
                    } catch (err) {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || ''
                },
                theme: { color: "#0066FF" }
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                alert('Razorpay SDK failed to load');
            }
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Failed to initiate booking/payment. ' + (err.response?.data?.message || ''));
        }
    };

    const handleNextStep = () => setStep(step + 1);
    const handleSuccess = () => setStep(5);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!doctor) return <div className="min-h-screen flex items-center justify-center">Doctor not found</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                        {['Type', 'Slot', 'Details', 'Payment', 'Confirmed'].map((label, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step > idx + 1 ? 'bg-primary-600 text-white' : step === idx + 1 ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > idx + 1 ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block ${step >= idx + 1 ? 'text-primary-700' : 'text-gray-400'}`}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Form Steps */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px]">

                            {/* STEP 1: Select Appointment Type */}
                            {step === 1 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you like to consult?</h2>
                                    <p className="text-gray-500 mb-10">Choose your preferred mode of consultation</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                                        {doctor.consultationTypes?.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    setBookingData({ ...bookingData, appointmentType: type });
                                                    setStep(2);
                                                }}
                                                className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${bookingData.appointmentType === type ? 'border-primary-600 bg-primary-50' : 'border-gray-100 bg-white hover:border-primary-300 hover:bg-gray-50 shadow-sm'}`}
                                            >
                                                <div className={`p-4 rounded-2xl ${type === 'Online Consultation' ? 'bg-secondary-100 text-secondary-600' : 'bg-green-100 text-green-600'}`}>
                                                    {type === 'Online Consultation' ? <Video className="w-8 h-8" /> : <MapPin className="w-8 h-8" />}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-lg text-gray-900">{type}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {type === 'Online Consultation' ? 'Video call from anywhere' : `Visit at ${doctor.clinicLocation || 'Clinic'}`}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Select Date & Time */}
                            {step === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <CalendarIcon className="h-6 w-6 text-primary-500" /> Select Date & Time
                                    </h2>

                                    <div className="mb-8">
                                        <h3 className="text-sm border-b pb-2 font-semibold text-gray-500 uppercase tracking-wider mb-4">Upcoming Schedule</h3>
                                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                                            {nextDays.map(day => (
                                                <button
                                                    key={day.date}
                                                    onClick={() => setBookingData({ ...bookingData, date: day.date, slotId: '', slotTime: '' })}
                                                    className={`min-w-20 p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${bookingData.date === day.date ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/30' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'}`}
                                                >
                                                    <span className="text-xs uppercase opacity-80 mb-1">{day.dayName}</span>
                                                    <span className="text-xl font-bold">{day.dayNumber}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {bookingData.date && (
                                        <div className="animate-in fade-in duration-300">
                                            <h3 className="text-sm border-b pb-2 font-semibold text-gray-500 uppercase tracking-wider mb-4">Available Slots</h3>
                                            {availableSlots.length > 0 ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                    {availableSlots.map(slot => (
                                                        <button
                                                            key={slot._id}
                                                            onClick={() => setBookingData({ ...bookingData, slotId: slot._id, slotTime: slot.time })}
                                                            className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${bookingData.slotId === slot._id ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-gray-50'}`}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500">
                                                    No slots available for this date.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-10 flex justify-between">
                                        <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                                        <button
                                            onClick={handleNextStep}
                                            disabled={!bookingData.date || !bookingData.slotId}
                                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Confirm Details */}
                            {step === 3 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading text-center">Review Details</h2>

                                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Consultation Mode</p>
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    {bookingData.appointmentType === 'Online Consultation' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                    {bookingData.appointmentType}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Fee</p>
                                                <p className="font-bold text-primary-600 text-lg">₹{bookingData.service.price}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Date</p>
                                                <p className="font-semibold text-gray-900">{bookingData.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Time</p>
                                                <p className="font-semibold text-gray-900 text-primary-600">{bookingData.slotTime}</p>
                                            </div>
                                        </div>

                                        {bookingData.appointmentType === 'Physical Clinic Visit' && (
                                            <div className="flex items-start gap-2 bg-white p-4 rounded-xl border border-gray-200">
                                                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clinic Address</p>
                                                    <p className="text-sm text-gray-700">{doctor.clinicLocation}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between mt-8">
                                        <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                                        <button onClick={handleNextStep} className="btn-primary flex items-center gap-2">Proceed to Payment <ChevronRight className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Payment via Razorpay */}
                            {step === 4 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <CreditCard className="h-6 w-6 text-primary-500" /> Secure Payment
                                    </h2>
                                    <p className="text-gray-500 mb-8">Complete your payment via Razorpay to confirm the appointment.</p>

                                    <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                                        <div className="text-3xl font-bold text-gray-900 mb-2">₹{bookingData.service.price}</div>
                                        <p className="text-sm text-gray-500 mb-8">Including all consultation charges</p>
                                        
                                        <button
                                            onClick={handleRazorpayPayment}
                                            className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-500/20"
                                        >
                                            Pay Now with Razorpay
                                        </button>
                                    </div>

                                    <div className="mt-8 text-center pt-6 border-t border-gray-100 text-xs text-gray-400">
                                        <p>Secure transactions powered by Razorpay. Multiple payment options available.</p>
                                    </div>
                                    <div className="flex justify-start mt-6">
                                        <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-primary-600">Back to details</button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: Success */}
                            {step === 5 && (
                                <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-10">
                                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="h-12 w-12" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">Booking Confirmed!</h2>
                                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                                        Your appointment with Dr. {doctor.name} has been successfully scheduled. We've sent a confirmation to your email.
                                    </p>

                                    <div className="bg-gray-50 p-6 rounded-2xl inline-block text-left mb-8 border border-gray-100 max-w-sm w-full shadow-sm">
                                        <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                                        <p className="font-semibold text-gray-900 mb-4">{bookingData.date} at {bookingData.slotTime}</p>

                                        {bookingData.appointmentType === 'Online Consultation' && (
                                            <>
                                                <p className="text-sm text-gray-500 mb-1">Meeting Link</p>
                                                <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary-600 hover:text-primary-800 break-all">Available in Dashboard</a>
                                            </>
                                        )}
                                        {bookingData.appointmentType === 'Physical Clinic Visit' && (
                                            <>
                                                <p className="text-sm text-gray-500 mb-1">Location</p>
                                                <p className="font-medium text-gray-700">{doctor.clinicLocation}</p>
                                            </>
                                        )}
                                    </div>

                                    <br />
                                    <Link to="/profile" className="btn-primary">
                                        Go to My Appointments
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 shadow-xl text-white sticky top-28">
                            <div className="flex gap-4 items-center mb-6 pb-6 border-b border-primary-500/30">
                                <img src={doctor.image || `https://i.pravatar.cc/150?u=${doctor._id}`} alt={doctor.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20" />
                                <div>
                                    <h3 className="font-bold text-lg">Dr. {doctor.name}</h3>
                                    <p className="text-primary-100 text-sm truncate w-40">{doctor.specializations?.join(', ')}</p>
                                </div>
                            </div>

                            <h4 className="font-semibold mb-4 text-primary-50 uppercase tracking-widest text-xs">Summary</h4>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-primary-100 flex items-center gap-2"><Clock className="h-4 w-4" /> Duration</span>
                                    <span className="font-medium">{bookingData.service.duration} Mins</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-primary-100 flex items-center gap-2"><Activity className="h-4 w-4" /> Visit Type</span>
                                    <span className="font-medium bg-primary-500/50 px-2 py-0.5 rounded text-white text-xs">{bookingData.appointmentType || 'Not Selected'}</span>
                                </div>
                                {bookingData.date && (
                                    <div className="flex justify-between items-center text-sm pt-4 border-t border-primary-500/30">
                                        <span className="text-primary-100 flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Selected Slot</span>
                                        <span className="font-medium text-right">{bookingData.date}<br />{bookingData.slotTime}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-primary-500/30 flex justify-between items-center">
                                <span className="font-bold">Total</span>
                                <span className="text-2xl font-bold">₹{bookingData.service.price}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Booking;
