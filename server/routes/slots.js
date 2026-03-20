const express = require('express');
const {
    getSlots,
    getSlot,
    createSlot,
    updateSlot,
    deleteSlot
} = require('../controllers/slots');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(getSlots)
    .post(protect, authorize('doctor', 'admin'), createSlot);

router
    .route('/:id')
    .get(getSlot)
    .put(protect, authorize('doctor', 'admin'), updateSlot)
    .delete(protect, authorize('doctor', 'admin'), deleteSlot);

module.exports = router;
