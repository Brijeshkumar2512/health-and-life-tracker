const express = require('express');
const router = express.Router();
const { getAIInstructions, askAICoach } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/instructions', getAIInstructions);
router.post('/ask', askAICoach);

module.exports = router;
