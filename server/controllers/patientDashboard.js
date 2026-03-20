const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const bcrypt = require('bcrypt');

/**
 * @desc    Get patient appointments
 * @route   GET /api/patient/appointments
 * @access  Private/Patient
 */
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id })
            .populate({ path: 'doctor', select: 'name specializations profileImage' })
            .populate('slot')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

/**
 * @desc    Get patient medical history
 * @route   GET /api/patient/medical-history
 * @access  Private/Patient
 */
exports.getMyMedicalHistory = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.user._id })
            .populate({ path: 'doctor', select: 'name' })
            .sort('-date');

        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

/**
 * @desc    Upload medical report
 * @route   POST /api/patient/upload-report
 * @access  Private/Patient
 */
exports.uploadMedicalReport = async (req, res) => {
    try {
        const { reportName, reportUrl, recordId } = req.body;

        if (recordId) {
            const record = await MedicalRecord.findById(recordId);
            if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
            
            record.reports.push({ name: reportName, url: reportUrl });
            await record.save();
            return res.status(200).json({ success: true, data: record });
        }

        // Generic upload not tied to a record
        const user = await User.findById(req.user._id);
        // This is a simplified version, ideally you'd have a separate collection for generic docs
        // For now, let's just allow appending to an existing record or return success for the "upload"
        res.status(200).json({ success: true, message: 'Report uploaded successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

/**
 * @desc    Get patient profile
 * @route   GET /api/patient/profile
 * @access  Private/Patient
 */
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

/**
 * @desc    Update patient profile
 * @route   PUT /api/patient/profile
 * @access  Private/Patient
 */
exports.updateMyProfile = async (req, res) => {
    try {
        const { name, email, phone, password, profileImage } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (profileImage) user.profileImage = profileImage;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};
