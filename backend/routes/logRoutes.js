const express = require('express');
const router = express.Router();
const {
  getDailyLog,
  logWater,
  addMeal,
  deleteMeal,
  addWorkout,
  deleteWorkout,
  updateSleepAndMood,
} = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getDailyLog);
router.get('/:date', getDailyLog);
router.post('/:date/water', logWater);
router.post('/:date/meals', addMeal);
router.delete('/:date/meals/:mealId', deleteMeal);
router.post('/:date/workouts', addWorkout);
router.delete('/:date/workouts/:workoutId', deleteWorkout);
router.put('/:date/sleep-mood', updateSleepAndMood);

module.exports = router;
