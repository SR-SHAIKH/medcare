const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');

// @desc    Get all appointments for a user/doctor
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
    try {
        let query;

        // Filter by role
        if (req.user.role === 'patient') {
            query = Appointment.find({ user: req.user.id })
                .populate('doctor', 'name specializations clinicLocation consultationFee')
                .populate('slot', 'date time');
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user.id });
            query = Appointment.find({ doctor: doctor._id })
                .populate('user', 'name email phone')
                .populate('slot', 'date time');
        } else {
            // Admin sees all
            query = Appointment.find()
                .populate('user', 'name email')
                .populate('doctor', 'name specializations')
                .populate('slot', 'date time');
        }

        const appointments = await query.sort('-createdAt');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('doctor', 'name specializations clinicLocation consultationFee')
            .populate('slot', 'date time');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private/Patient
exports.createAppointment = async (req, res, next) => {
    try {
        // Add user to body
        req.body.user = req.user.id;

        const { doctor, appointmentType, slot } = req.body;

        if (!appointmentType || !['Online Consultation', 'Physical Clinic Visit'].includes(appointmentType)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid appointmentType (Online Consultation or Physical Clinic Visit)' });
        }

        // Validate if slot exists and is available
        const existingSlot = await Slot.findById(slot);
        if (!existingSlot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }
        if (existingSlot.isBooked) {
            return res.status(400).json({ success: false, message: 'Slot is already booked' });
        }

        const existingDoctor = await Doctor.findById(doctor);
        if (!existingDoctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Generate Jitsi Meeting Link only if Online
        if (appointmentType === 'Online Consultation') {
            const meetingId = `medcare-${req.user.id}-${Date.now()}`;
            req.body.meetingLink = `https://meet.jit.si/${meetingId}`;
        }

        // Create Appointment (Status pending until payment)
        req.body.status = 'pending';
        const appointment = await Appointment.create(req.body);

        // Update slot to booked (reserved for this patient)
        existingSlot.isBooked = true;
        await existingSlot.save();

        // NOTE: Confirmation email is now sent after payment verification in payments controller


        res.status(201).json({ success: true, data: appointment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Make sure user is appointment owner or admin/doctor
        // Logic handles basic update
        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Release slot
        const slot = await Slot.findById(appointment.slot);
        if (slot) {
            slot.isBooked = false;
            await slot.save();
        }

        await appointment.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
