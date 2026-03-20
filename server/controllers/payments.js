const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private/Patient
exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId).populate('doctor');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const amount = appointment.doctor.consultationFee * 100; // Razorpay expects smallest currency unit (paise)

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_order_${appointmentId}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ success: false, message: 'Some error occurred generating order' });
        }

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: appointment.doctor.consultationFee
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/razorpay/verify
// @access  Private/Patient
exports.verifyRazorpayPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            appointmentId
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is valid
            const appointment = await Appointment.findById(appointmentId).populate('doctor');

            // Create payment record in DB
            await Payment.create({
                user: req.user.id,
                appointment: appointmentId,
                amount: appointment.doctor.consultationFee,
                status: 'successful',
                gateway: 'razorpay',
                transactionId: razorpay_payment_id
            });

            // Update appointment status to confirmed
            const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, {
                status: 'confirmed'
            }, { new: true }).populate('doctor').populate('slot');

            // Send Confirmation Email
            try {
                const User = require('../models/User');
                const user = await User.findById(req.user.id);
                const sendEmail = require('../utils/sendEmail');

                let locationText = '';
                if (updatedAppointment.appointmentType === 'Physical Clinic Visit') {
                    locationText = `\nLocation: ${updatedAppointment.doctor.clinicLocation}\n`;
                } else {
                    locationText = `\nYou can join your video consultation using this link when the time comes:\n${updatedAppointment.meetingLink}\n`;
                }

                const emailMessage = `
                    Hello ${user.name},
                    
                    Your payment was successful and your appointment is CONFIRMED!
                    
                    Doctor: Dr. ${updatedAppointment.doctor.name}
                    Type: ${updatedAppointment.appointmentType}
                    Date: ${updatedAppointment.slot.date}
                    Time: ${updatedAppointment.slot.time}
                    ${locationText}
                    Thank you for choosing MEDCARE.
                `;

                await sendEmail({
                    email: user.email,
                    subject: 'Appointment Confirmed - MEDCARE',
                    message: emailMessage
                });
            } catch (emailErr) {
                console.error('Failed to send payment confirmation email:', emailErr);
            }

            return res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
