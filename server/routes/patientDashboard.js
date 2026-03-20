const express = require('express');
const router = express.Router();
const {
    getMyAppointments,
    getMyMedicalHistory,
    uploadMedicalReport,
    getMyProfile,
    updateMyProfile
} = require('../controllers/patientDashboard');
const { protect, authorize } = require('../middleware/auth');

// All routes are private and restricted to patients
router.use(protect);
router.use(authorize('patient'));

router.get('/appointments', getMyAppointments);
router.get('/medical-history', getMyMedicalHistory);
router.post('/upload-report', uploadMedicalReport);
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

module.exports = router;
