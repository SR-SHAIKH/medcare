const express = require('express');
const {
    getMyAppointments,
    getMyPatients,
    getMyEarnings,
    getMyProfile,
    updateMyProfile,
    getMySlots,
    createMySlots,
    deleteMySlot
} = require('../controllers/doctorDashboard');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require doctor authentication
router.use(protect);
router.use(authorize('doctor'));

router.get('/appointments', getMyAppointments);
router.get('/patients', getMyPatients);
router.get('/earnings', getMyEarnings);
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);
router.get('/slots', getMySlots);
router.post('/slots', createMySlots);
router.delete('/slots/:id', deleteMySlot);

module.exports = router;
