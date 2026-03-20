const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await Doctor.countDocuments({ status: 'approved' });
        const pendingDoctors = await Doctor.countDocuments({ status: 'pending' });
        const totalAppointments = await Appointment.countDocuments();
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const todayAppointments = await Appointment.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });

        res.status(200).json({
            success: true,
            data: { totalPatients, totalDoctors, pendingDoctors, totalAppointments, todayAppointments }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private/Admin
exports.getAllPatients = async (req, res, next) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('name email phone createdAt');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all appointments (admin)
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAllAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.find()
            .populate('user', 'name email')
            .populate('doctor', 'name specializations consultationFee')
            .populate('slot', 'date time')
            .sort('-createdAt');
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all pending doctors
// @route   GET /api/admin/doctors/pending
// @access  Private/Admin
exports.getPendingDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find({ status: 'pending' }).populate('user', 'name email phone');
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Approve doctor
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private/Admin
exports.approveDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, { status: 'approved' }, {
            new: true,
            runValidators: true
        }).populate('user', 'name email');

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Send Email notification to Doctor
        try {
            const emailMessage = `
                Hello Dr. ${doctor.name},
                
                Your application to join MEDCARE has been approved.
                
                You can now log in and set up your availability to start accepting appointments!
                
                Thank you,
                MEDCARE Admin Team
            `;

            await sendEmail({
                email: doctor.user.email,
                subject: 'MEDCARE Application Status: APPROVED',
                message: emailMessage
            });
        } catch (emailErr) {
            console.error('Failed to send status update email:', emailErr);
        }

        // Trigger real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('doctorStatusUpdate', {
                doctorId: doctor._id,
                status: doctor.status
            });
        }

        res.status(200).json({ success: true, data: doctor });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Reject doctor
// @route   PUT /api/admin/doctors/:id/reject
// @access  Private/Admin
exports.rejectDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, { status: 'rejected' }, {
            new: true,
            runValidators: true
        }).populate('user', 'name email');

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Send Email notification to Doctor
        try {
            const emailMessage = `
                Hello Dr. ${doctor.name},
                
                Your application to join MEDCARE has been rejected.
                
                Unfortunately, your application did not meet our requirements at this time.
                
                Thank you,
                MEDCARE Admin Team
            `;

            await sendEmail({
                email: doctor.user.email,
                subject: 'MEDCARE Application Status: REJECTED',
                message: emailMessage
            });
        } catch (emailErr) {
            console.error('Failed to send status update email:', emailErr);
        }

        // Trigger real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('doctorStatusUpdate', {
                doctorId: doctor._id,
                status: doctor.status
            });
        }

        res.status(200).json({ success: true, data: doctor });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
