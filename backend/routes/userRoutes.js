const express = require('express');
const router = express.Router();
const { updateUserProfile, updateUserGoals } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.put('/profile', updateUserProfile);
router.put('/goals', updateUserGoals);

module.exports = router;
