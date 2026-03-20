const express = require('express');
const {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor
} = require('../controllers/doctors');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(getDoctors)
    .post(protect, authorize('admin', 'doctor'), createDoctor);

router
    .route('/:id')
    .get(getDoctor)
    .put(protect, authorize('admin', 'doctor'), updateDoctor)
    .delete(protect, authorize('admin'), deleteDoctor);

module.exports = router;
