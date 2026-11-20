const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// Public lead capture route for guest website visitors
router.post('/capture', leadController.captureLead);
router.post('/', leadController.captureLead);

// Protected route to view leads list
router.get('/', protect, leadController.getLeads);

module.exports = router;
