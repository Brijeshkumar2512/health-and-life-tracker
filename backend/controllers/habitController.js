const Habit = require('../models/Habit');
const { calculateStreaks, formatDateStr } = require('../utils/streakCalculator');

// @desc    Get all active habits for user
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });

    const todayStr = formatDateStr(new Date());

    // Update streak calculations on retrieval
    const updatedHabits = await Promise.all(
      habits.map(async (habit) => {
        const { currentStreak, longestStreak } = calculateStreaks(habit.completedDates, todayStr);
        if (habit.currentStreak !== currentStreak || habit.longestStreak !== longestStreak) {
          habit.currentStreak = currentStreak;
          habit.longestStreak = longestStreak;
          await habit.save();
        }
        return habit;
      })
    );

    res.json(updatedHabits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res) => {
  try {
    const { title, description, category, color, icon, frequency } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Habit title is required' });
    }

    const habit = await Habit.create({
      user: req.user._id,
      title,
      description: description || '',
      category: category || 'General',
      color: color || '#10b981',
      icon: icon || 'target',
      frequency: frequency || 'daily',
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const { title, description, category, color, icon, frequency } = req.body;

    if (title !== undefined) habit.title = title;
    if (description !== undefined) habit.description = description;
    if (category !== undefined) habit.category = category;
    if (color !== undefined) habit.color = color;
    if (icon !== undefined) habit.icon = icon;
    if (frequency !== undefined) habit.frequency = frequency;

    const updated = await habit.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await Habit.deleteOne({ _id: req.params.id });
    res.json({ message: 'Habit deleted successfully', habitId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle habit completion for a specific date
// @route   POST /api/habits/:id/toggle
// @access  Private
const toggleHabitCompletion = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || formatDateStr(new Date());

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const dateIndex = habit.completedDates.indexOf(targetDate);

    if (dateIndex > -1) {
      // Already completed on this date -> uncheck it
      habit.completedDates.splice(dateIndex, 1);
    } else {
      // Not completed -> mark complete
      habit.completedDates.push(targetDate);
    }

    // Recalculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(habit.completedDates, formatDateStr(new Date()));
    habit.currentStreak = currentStreak;
    habit.longestStreak = longestStreak;

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
};
