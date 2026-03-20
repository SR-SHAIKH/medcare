const express = require('express');
const {
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,
    getAdminStats,
    getAllPatients,
    getAllAppointments
} = require('../controllers/admin');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/stats').get(getAdminStats);
router.route('/patients').get(getAllPatients);
router.route('/appointments').get(getAllAppointments);
router.route('/doctors/pending').get(getPendingDoctors);
router.route('/doctors/:id/approve').put(approveDoctor);
router.route('/doctors/:id/reject').put(rejectDoctor);

module.exports = router;
