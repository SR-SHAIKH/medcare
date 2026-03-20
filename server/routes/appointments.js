const express = require('express');
const {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointments');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(protect, getAppointments)
    .post(protect, authorize('patient', 'admin'), createAppointment);

router
    .route('/:id')
    .get(protect, getAppointment)
    .put(protect, authorize('admin', 'doctor', 'patient'), updateAppointment)
    .delete(protect, authorize('admin', 'patient'), deleteAppointment);

module.exports = router;
