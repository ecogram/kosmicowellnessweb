const express = require('express');
const router = express.Router();
const glucoController = require('../controllers/glucoController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/reading', glucoController.logReading);
router.post('/meal', glucoController.logMeal);
router.get('/dashboard', glucoController.getDashboard);

module.exports = router;
