const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), updateProfile);

module.exports = router;
