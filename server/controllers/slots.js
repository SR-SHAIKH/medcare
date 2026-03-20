const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');

// @desc    Get all slots
// @route   GET /api/slots
// @access  Public
exports.getSlots = async (req, res, next) => {
    try {
        let query;

        if (req.query.doctorId) {
            query = Slot.find({ doctor: req.query.doctorId });
        } else {
            query = Slot.find().populate('doctor', 'name specialization');
        }

        const slots = await query;

        res.status(200).json({ success: true, count: slots.length, data: slots });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single slot
// @route   GET /api/slots/:id
// @access  Public
exports.getSlot = async (req, res, next) => {
    try {
        const slot = await Slot.findById(req.params.id).populate('doctor', 'name specialization');

        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        res.status(200).json({ success: true, data: slot });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new slot
// @route   POST /api/slots
// @access  Private/Doctor/Admin
exports.createSlot = async (req, res, next) => {
    try {
        // If user is a doctor, ensure they can only create slots for themselves
        if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user.id });
            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor profile not found' });
            }
            req.body.doctor = doctor._id;
        }

        // Verify doctor exists
        const doctorExists = await Doctor.findById(req.body.doctor);
        if (!doctorExists) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const slot = await Slot.create(req.body);

        res.status(201).json({ success: true, data: slot });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update slot
// @route   PUT /api/slots/:id
// @access  Private/Doctor/Admin
exports.updateSlot = async (req, res, next) => {
    try {
        let slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        // Checking ownership
        if (req.user.role !== 'admin') {
            const doctor = await Doctor.findOne({ user: req.user.id });
            if (slot.doctor.toString() !== doctor._id.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized to update this slot' });
            }
        }

        slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: slot });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete slot
// @route   DELETE /api/slots/:id
// @access  Private/Doctor/Admin
exports.deleteSlot = async (req, res, next) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        if (req.user.role !== 'admin') {
            const doctor = await Doctor.findOne({ user: req.user.id });
            if (!doctor || slot.doctor.toString() !== doctor._id.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized to delete this slot' });
            }
        }

        await slot.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
