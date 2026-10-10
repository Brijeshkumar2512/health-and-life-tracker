const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAnalyticsTrends,
  seedDemoData,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/trends', getAnalyticsTrends);
router.post('/seed', seedDemoData);

module.exports = router;
