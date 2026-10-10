const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get or initialize daily log for a specific date (YYYY-MM-DD)
// @route   GET /api/logs/:date?
// @access  Private
const getDailyLog = async (req, res) => {
  try {
    const date = req.params.date || getTodayDateStr();

    let log = await DailyLog.findOne({ user: req.user._id, date });

    if (!log) {
      log = await DailyLog.create({
        user: req.user._id,
        date,
        water: { totalMl: 0, logs: [] },
        meals: [],
        workouts: [],
        sleep: { durationHours: 0, qualityRating: 3, notes: '' },
        mood: { status: 'Good', journalNotes: '' },
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log water intake (incremental or set)
// @route   POST /api/logs/:date/water
// @access  Private
const logWater = async (req, res) => {
  try {
    const date = req.params.date || getTodayDateStr();
    const { amountMl, isReset } = req.body;

    let log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      log = new DailyLog({ user: req.user._id, date, water: { totalMl: 0, logs: [] } });
    }

    if (isReset) {
      log.water.totalMl = 0;
      log.water.logs = [];
    } else {
      const amount = Number(amountMl) || 0;
      log.water.totalMl = Math.max(0, log.water.totalMl + amount);
      if (amount > 0) {
        log.water.logs.push({
          amountMl: amount,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a meal to daily log
// @route   POST /api/logs/:date/meals
// @access  Private
const addMeal = async (req, res) => {
  try {
    const date = req.params.date || getTodayDateStr();
    const { mealType, foodName, calories, protein, carbs, fat } = req.body;

    if (!foodName || calories === undefined) {
      return res.status(400).json({ message: 'Food name and calories are required' });
    }

    let log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      log = new DailyLog({ user: req.user._id, date });
    }

    log.meals.push({
      mealType: mealType || 'Lunch',
      foodName,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a meal from daily log
// @route   DELETE /api/logs/:date/meals/:mealId
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const { date, mealId } = req.params;

    const log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    log.meals = log.meals.filter((m) => m._id.toString() !== mealId);
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add workout to daily log
// @route   POST /api/logs/:date/workouts
// @access  Private
const addWorkout = async (req, res) => {
  try {
    const date = req.params.date || getTodayDateStr();
    const { exerciseName, category, durationMinutes, caloriesBurned, notes } = req.body;

    if (!exerciseName || !durationMinutes) {
      return res.status(400).json({ message: 'Exercise name and duration are required' });
    }

    let log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      log = new DailyLog({ user: req.user._id, date });
    }

    log.workouts.push({
      exerciseName,
      category: category || 'Strength',
      durationMinutes: Number(durationMinutes) || 0,
      caloriesBurned: Number(caloriesBurned) || 0,
      notes: notes || '',
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete workout from daily log
// @route   DELETE /api/logs/:date/workouts/:workoutId
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const { date, workoutId } = req.params;

    const log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    log.workouts = log.workouts.filter((w) => w._id.toString() !== workoutId);
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sleep & mood metrics
// @route   PUT /api/logs/:date/sleep-mood
// @access  Private
const updateSleepAndMood = async (req, res) => {
  try {
    const date = req.params.date || getTodayDateStr();
    const { sleep, mood, weight } = req.body;

    let log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      log = new DailyLog({ user: req.user._id, date });
    }

    if (sleep) {
      if (sleep.durationHours !== undefined) log.sleep.durationHours = Number(sleep.durationHours);
      if (sleep.qualityRating !== undefined) log.sleep.qualityRating = Number(sleep.qualityRating);
      if (sleep.notes !== undefined) log.sleep.notes = sleep.notes;
    }

    if (mood) {
      if (mood.status) log.mood.status = mood.status;
      if (mood.journalNotes !== undefined) log.mood.journalNotes = mood.journalNotes;
    }

    if (weight !== undefined && weight !== null && weight > 0) {
      log.weight = Number(weight);
      // Also update user's currentWeight
      await User.findByIdAndUpdate(req.user._id, { 'profile.currentWeight': Number(weight) });
    }

    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyLog,
  logWater,
  addMeal,
  deleteMeal,
  addWorkout,
  deleteWorkout,
  updateSleepAndMood,
};
