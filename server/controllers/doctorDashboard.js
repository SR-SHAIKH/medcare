const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Slot = require('../models/Slot');

// Helper: get the Doctor document for the logged-in user
const getDoctorForUser = async (userId) => {
    return Doctor.findOne({ user: userId });
};

// @desc    Get doctor's own appointments
// @route   GET /api/doctor/appointments
// @access  Private/Doctor
exports.getMyAppointments = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate('user', 'name email phone')
            .populate('slot', 'date time')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get unique patients who booked with this doctor
// @route   GET /api/doctor/patients
// @access  Private/Doctor
exports.getMyPatients = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate('user', 'name email phone')
            .populate('slot', 'date time')
            .sort('-createdAt');

        // Build unique patients with their latest appointment info
        const patientMap = new Map();
        appointments.forEach(apt => {
            if (apt.user && !patientMap.has(apt.user._id.toString())) {
                patientMap.set(apt.user._id.toString(), {
                    _id: apt.user._id,
                    name: apt.user.name,
                    email: apt.user.email,
                    phone: apt.user.phone,
                    lastAppointmentDate: apt.slot?.date || '',
                    lastAppointmentType: apt.appointmentType,
                    lastStatus: apt.status,
                    totalVisits: 0
                });
            }
            if (apt.user) {
                const p = patientMap.get(apt.user._id.toString());
                p.totalVisits++;
            }
        });

        res.status(200).json({ success: true, data: Array.from(patientMap.values()) });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get doctor's earnings summary
// @route   GET /api/doctor/earnings
// @access  Private/Doctor
exports.getMyEarnings = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        // Get all completed appointments for this doctor
        const appointments = await Appointment.find({ doctor: doctor._id, status: 'completed' })
            .populate('payment');

        // Calculate earnings
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

        let totalEarnings = 0;
        let todayEarnings = 0;
        let monthlyEarnings = 0;
        const paymentHistory = [];

        appointments.forEach(apt => {
            const amount = apt.payment?.amount || doctor.consultationFee || 0;
            const paymentDate = apt.payment?.createdAt || apt.createdAt;

            totalEarnings += amount;
            if (paymentDate >= todayStart && paymentDate <= todayEnd) todayEarnings += amount;
            if (paymentDate >= monthStart) monthlyEarnings += amount;

            paymentHistory.push({
                _id: apt._id,
                patientId: apt.user,
                amount,
                date: paymentDate,
                status: apt.payment?.status || 'successful',
                appointmentType: apt.appointmentType
            });
        });

        // Also count confirmed appointments as potential earnings
        const confirmedCount = await Appointment.countDocuments({ doctor: doctor._id, status: 'confirmed' });

        res.status(200).json({
            success: true,
            data: {
                totalEarnings,
                todayEarnings,
                monthlyEarnings,
                totalCompleted: appointments.length,
                pendingAppointments: confirmedCount,
                consultationFee: doctor.consultationFee,
                paymentHistory: paymentHistory.sort((a, b) => b.date - a.date)
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get doctor's own profile
// @route   GET /api/doctor/profile
// @access  Private/Doctor
exports.getMyProfile = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        const user = await User.findById(req.user.id).select('name email phone');

        res.status(200).json({
            success: true,
            data: { ...doctor.toObject(), userName: user.name, userEmail: user.email, userPhone: user.phone }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update doctor's own profile
// @route   PUT /api/doctor/profile
// @access  Private/Doctor
exports.updateMyProfile = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        // Fields that can be updated by the doctor
        const allowedFields = [
            'name', 'specializations', 'consultationTypes', 'qualification',
            'experience', 'clinicLocation', 'consultationFee', 'bio',
            'profileImage', 'availability'
        ];

        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        // Prevent doctors from changing their own status
        delete updates.status;

        const updatedDoctor = await Doctor.findByIdAndUpdate(doctor._id, updates, {
            new: true,
            runValidators: true
        });

        // Also update user name/phone if provided
        if (req.body.phone) {
            await User.findByIdAndUpdate(req.user.id, { phone: req.body.phone });
        }

        res.status(200).json({ success: true, data: updatedDoctor });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get doctor's own slots
// @route   GET /api/doctor/slots
// @access  Private/Doctor
exports.getMySlots = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        const slots = await Slot.find({ doctor: doctor._id }).sort({ date: 1, time: 1 });

        res.status(200).json({ success: true, count: slots.length, data: slots });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create multiple slots (bulk generation)
// @route   POST /api/doctor/slots
// @access  Private/Doctor
exports.createMySlots = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        const { date, startTime, endTime, duration, appointmentType } = req.body;

        if (!date || !startTime || !endTime || !duration) {
            return res.status(400).json({ success: false, message: 'Please provide date, startTime, endTime, and duration' });
        }

        // Generate time slots
        const slots = [];
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        let currentMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        while (currentMinutes < endMinutes) {
            const hours = Math.floor(currentMinutes / 60);
            const mins = currentMinutes % 60;
            const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

            // Check if slot already exists
            const exists = await Slot.findOne({ doctor: doctor._id, date, time: timeStr });
            if (!exists) {
                slots.push({
                    doctor: doctor._id,
                    date,
                    time: timeStr,
                    appointmentType: appointmentType || 'Both',
                    isBooked: false
                });
            }

            currentMinutes += parseInt(duration);
        }

        if (slots.length === 0) {
            return res.status(400).json({ success: false, message: 'All slots for this time range already exist' });
        }

        const createdSlots = await Slot.insertMany(slots);

        res.status(201).json({ success: true, count: createdSlots.length, data: createdSlots });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a doctor's own slot
// @route   DELETE /api/doctor/slots/:id
// @access  Private/Doctor
exports.deleteMySlot = async (req, res) => {
    try {
        const doctor = await getDoctorForUser(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

        if (slot.doctor.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this slot' });
        }

        if (slot.isBooked) {
            return res.status(400).json({ success: false, message: 'Cannot delete a booked slot' });
        }

        await slot.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
