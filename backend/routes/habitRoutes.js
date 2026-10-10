const express = require('express');
const router = express.Router();
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/toggle', toggleHabitCompletion);

module.exports = router;
