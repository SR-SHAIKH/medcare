const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET || "fallback_secret_123",
        { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const {
            name, email, password, phone, role,
            qualification, experience, clinicLocation, consultationFee, specializations, consultationTypes, documents
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${!name ? 'name ' : ''}${!email ? 'email ' : ''}${!password ? 'password ' : ''}${!phone ? 'phone' : ''}`.trim()
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'patient'
        });

        // If role is doctor, create doctor profile
        if (role === 'doctor') {
            const doctor = await Doctor.create({
                user: user._id,
                name: user.name,
                specializations,
                consultationTypes,
                qualification,
                experience,
                clinicLocation,
                consultationFee,
                documents: documents ? [documents] : [],
                status: 'pending'
            });

            // Trigger real-time update to Admin Dashboard
            const io = req.app.get('io');
            if (io) {
                io.emit('newDoctor', {
                    _id: doctor._id,
                    name: doctor.name,
                    email: user.email,
                    specializations: doctor.specializations,
                    status: 'pending',
                    createdAt: doctor.createdAt
                });
            }
        }

        // Send Welcome Email
        try {
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                email: user.email,
                subject: 'Welcome to MEDCARE - Appointment Booking Platform',
                message: `Hello ${user.name},\n\nWelcome to MEDCARE! Your account has been successfully created. ${role === 'doctor' ? 'Your doctor profile is currently pending admin approval.' : 'You can now book appointments with our doctors.'}\n\nBest Regards,\nThe MEDCARE Team`
            });
        } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr);
        }

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error('[REGISTER ERROR]', err);
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error during registration: ' + err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('[LOGIN ERROR]', err);
        res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('[GET_ME ERROR]', err);
        res.status(500).json({ success: false, message: 'Server error fetching user profile' });
    }
};
