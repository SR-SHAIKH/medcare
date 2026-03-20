const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const path = require('path');

// @desc    Upload profile photo
// @route   POST /api/profile/upload-photo
// @access  Private
router.post('/upload-photo', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image' });
        }

        // Generate URL for the image
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        // Update user's profileImage in DB
        const user = await User.findById(req.user.id);
        user.profileImage = imageUrl;
        await user.save();

        res.status(200).json({
            success: true,
            data: imageUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
