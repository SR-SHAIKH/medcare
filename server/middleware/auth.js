const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes — verify JWT and ensure user exists in DB
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // No token → 401
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized — no token provided' });
    }

    try {
        // Verify token signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user still exists in database (handles deleted/deactivated users)
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized — user no longer exists' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired — please log in again' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized — invalid token' });
    }
};

// @desc    Grant access to specific roles only
// @usage   authorize('admin') or authorize('admin', 'doctor')
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — no role assigned'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied — role '${req.user.role}' is not authorized for this resource`
            });
        }
        next();
    };
};
