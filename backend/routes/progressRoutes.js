const express = require('express');
const router = express.Router();
const { getProgress, addProgress, getAnalytics } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getAnalytics);
router.route('/').get(protect, getProgress).post(protect, addProgress);

module.exports = router;
