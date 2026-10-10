const DailyLog = require('../models/DailyLog');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { formatDateStr, getOffsetDateStr } = require('../utils/streakCalculator');

// @desc    Get dashboard summary metrics for today
// @route   GET /api/analytics/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const todayStr = formatDateStr(new Date());
    const user = await User.findById(req.user._id);

    let todayLog = await DailyLog.findOne({ user: req.user._id, date: todayStr });
    if (!todayLog) {
      todayLog = {
        meals: [],
        workouts: [],
        water: { totalMl: 0, logs: [] },
        sleep: { durationHours: 0, qualityRating: 0, notes: '' },
        mood: { status: 'Good', journalNotes: '' },
      };
    }

    const caloriesConsumed = (todayLog.meals || []).reduce((sum, m) => sum + (m.calories || 0), 0);
    const caloriesBurned = (todayLog.workouts || []).reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const proteinConsumed = (todayLog.meals || []).reduce((sum, m) => sum + (m.protein || 0), 0);
    const carbsConsumed = (todayLog.meals || []).reduce((sum, m) => sum + (m.carbs || 0), 0);
    const fatConsumed = (todayLog.meals || []).reduce((sum, m) => sum + (m.fat || 0), 0);

    const calorieGoal = user.goals.dailyCalories || 2000;
    const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed + caloriesBurned);

    const waterConsumed = todayLog.water?.totalMl || 0;
    const waterGoal = user.goals.dailyWaterMl || 2500;
    const waterPercentage = Math.min(100, Math.round((waterConsumed / waterGoal) * 100));

    // Habits progress
    const habits = await Habit.find({ user: req.user._id, isActive: true });
    const totalHabits = habits.length;
    const completedHabitsToday = habits.filter((h) => h.completedDates.includes(todayStr)).length;
    const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;
    const totalActiveStreaks = habits.reduce((sum, h) => sum + (h.currentStreak > 0 ? 1 : 0), 0);

    res.json({
      todayDate: todayStr,
      profile: user.profile,
      goals: user.goals,
      nutrition: {
        caloriesConsumed,
        caloriesBurned,
        calorieGoal,
        caloriesRemaining,
        netCalories: caloriesConsumed - caloriesBurned,
        proteinConsumed,
        carbsConsumed,
        fatConsumed,
      },
      hydration: {
        waterConsumed,
        waterGoal,
        waterPercentage,
      },
      sleep: {
        durationHours: todayLog.sleep?.durationHours || 0,
        sleepGoal: user.goals.dailySleepHours || 8,
        qualityRating: todayLog.sleep?.qualityRating || 0,
        notes: todayLog.sleep?.notes || '',
      },
      mood: {
        status: todayLog.mood?.status || 'Good',
        journalNotes: todayLog.mood?.journalNotes || '',
      },
      habits: {
        total: totalHabits,
        completedToday: completedHabitsToday,
        completionRate: habitCompletionRate,
        activeStreaks: totalActiveStreaks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get historical analytics trends (7 to 30 days)
// @route   GET /api/analytics/trends?days=7
// @access  Private
const getAnalyticsTrends = async (req, res) => {
  try {
    const days = Math.min(60, Math.max(7, parseInt(req.query.days) || 7));
    const todayStr = formatDateStr(new Date());
    const user = await User.findById(req.user._id);

    // Generate array of past dates
    const dateList = [];
    for (let i = days - 1; i >= 0; i--) {
      dateList.push(getOffsetDateStr(todayStr, -i));
    }

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $in: dateList },
    });

    const habits = await Habit.find({ user: req.user._id, isActive: true });

    // Map logs by date
    const logMap = {};
    logs.forEach((log) => {
      logMap[log.date] = log;
    });

    let lastKnownWeight = user.profile.currentWeight || 70;

    const trendData = dateList.map((dStr) => {
      const log = logMap[dStr];
      const consumed = log ? log.meals.reduce((sum, m) => sum + (m.calories || 0), 0) : 0;
      const burned = log ? log.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) : 0;
      const water = log ? log.water.totalMl || 0 : 0;
      const sleepHours = log ? log.sleep.durationHours || 0 : 0;
      const sleepQuality = log ? log.sleep.qualityRating || 0 : 0;
      const protein = log ? log.meals.reduce((sum, m) => sum + (m.protein || 0), 0) : 0;
      const carbs = log ? log.meals.reduce((sum, m) => sum + (m.carbs || 0), 0) : 0;
      const fat = log ? log.meals.reduce((sum, m) => sum + (m.fat || 0), 0) : 0;

      if (log && log.weight) {
        lastKnownWeight = log.weight;
      }

      // Format date for UI e.g., 'Oct 10'
      const parts = dStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedLabel = `${monthNames[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;

      // Habit completion on this date
      const habitsDone = habits.filter((h) => h.completedDates.includes(dStr)).length;
      const habitRate = habits.length > 0 ? Math.round((habitsDone / habits.length) * 100) : 0;

      return {
        date: dStr,
        label: formattedLabel,
        caloriesConsumed: consumed,
        caloriesBurned: burned,
        calorieGoal: user.goals.dailyCalories || 2000,
        netCalories: consumed - burned,
        waterMl: water,
        waterGoal: user.goals.dailyWaterMl || 2500,
        sleepHours,
        sleepGoal: user.goals.dailySleepHours || 8,
        sleepQuality,
        protein,
        carbs,
        fat,
        weight: lastKnownWeight,
        habitCompletionRate: habitRate,
      };
    });

    // Macro aggregates for pie chart
    const totalProtein = trendData.reduce((acc, curr) => acc + curr.protein, 0);
    const totalCarbs = trendData.reduce((acc, curr) => acc + curr.carbs, 0);
    const totalFat = trendData.reduce((acc, curr) => acc + curr.fat, 0);

    res.json({
      days,
      trends: trendData,
      macros: [
        { name: 'Protein', grams: totalProtein, calories: totalProtein * 4, color: '#10b981' },
        { name: 'Carbohydrates', grams: totalCarbs, calories: totalCarbs * 4, color: '#3b82f6' },
        { name: 'Fats', grams: totalFat, calories: totalFat * 9, color: '#f59e0b' },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed rich sample data for current user
// @route   POST /api/analytics/seed
// @access  Private
const seedDemoData = async (req, res) => {
  try {
    const todayStr = formatDateStr(new Date());
    const userId = req.user._id;

    // 1. Create or ensure habits
    await Habit.deleteMany({ user: userId });

    const sampleHabits = [
      {
        user: userId,
        title: 'Morning 20-min Meditation & Stretch',
        description: 'Mindful breathing and full-body mobility',
        category: 'Mindfulness',
        color: '#8b5cf6',
        icon: 'sparkles',
        frequency: 'daily',
        completedDates: [],
      },
      {
        user: userId,
        title: 'Drink 2.5L Water Daily',
        description: 'Stay hydrated throughout work hours',
        category: 'Health',
        color: '#06b6d4',
        icon: 'droplet',
        frequency: 'daily',
        completedDates: [],
      },
      {
        user: userId,
        title: 'Daily Workout / 45-min Activity',
        description: 'Strength training or cardio run',
        category: 'Fitness',
        color: '#10b981',
        icon: 'dumbbell',
        frequency: 'daily',
        completedDates: [],
      },
      {
        user: userId,
        title: 'Read 20 Pages Non-Fiction',
        description: 'Expand knowledge before bedtime',
        category: 'Productivity',
        color: '#f59e0b',
        icon: 'book',
        frequency: 'daily',
        completedDates: [],
      },
    ];

    // Seed past 14 days logs & habit completions
    await DailyLog.deleteMany({ user: userId });

    const past14Days = [];
    for (let i = 13; i >= 0; i--) {
      past14Days.push(getOffsetDateStr(todayStr, -i));
    }

    const { calculateStreaks } = require('../utils/streakCalculator');

    // Populate habit completed dates for realistic streaks
    sampleHabits[0].completedDates = past14Days.slice(2); // 12-day streak
    sampleHabits[1].completedDates = past14Days.slice(0); // 14-day streak
    sampleHabits[2].completedDates = past14Days.filter((_, idx) => idx % 2 === 0); // Alternate days
    sampleHabits[3].completedDates = past14Days.slice(5); // 9-day streak

    for (const h of sampleHabits) {
      const { currentStreak, longestStreak } = calculateStreaks(h.completedDates, todayStr);
      h.currentStreak = currentStreak;
      h.longestStreak = longestStreak;
      await Habit.create(h);
    }

    // Seed 14 daily logs
    const mealTemplates = [
      { mealType: 'Breakfast', foodName: 'Oatmeal with Blueberries & Whey', calories: 420, protein: 32, carbs: 55, fat: 8 },
      { mealType: 'Lunch', foodName: 'Grilled Chicken Bowl with Quinoa', calories: 650, protein: 48, carbs: 62, fat: 18 },
      { mealType: 'Dinner', foodName: 'Baked Salmon with Sweet Potato & Asparagus', calories: 580, protein: 42, carbs: 45, fat: 22 },
      { mealType: 'Snacks', foodName: 'Greek Yogurt & Mixed Almonds', calories: 250, protein: 18, carbs: 14, fat: 12 },
    ];

    const workoutTemplates = [
      { exerciseName: 'Full Body Resistance Training', category: 'Strength', durationMinutes: 50, caloriesBurned: 420, notes: 'Felt strong on squats' },
      { exerciseName: 'Interval Hill Running', category: 'Cardio', durationMinutes: 35, caloriesBurned: 380, notes: 'Cardio endurance training' },
      { exerciseName: 'Power Vinyasa Flow', category: 'Yoga', durationMinutes: 40, caloriesBurned: 210, notes: 'Mobility and relaxation' },
    ];

    let currentWeight = 73.5;

    for (let i = 0; i < past14Days.length; i++) {
      const d = past14Days[i];
      const isToday = d === todayStr;

      // Slight natural variation in weight decreasing toward target
      currentWeight = parseFloat((currentWeight - 0.1 + (Math.random() * 0.08 - 0.04)).toFixed(1));

      const dailyMeals = [
        mealTemplates[0],
        mealTemplates[1],
        mealTemplates[2],
        ...(i % 2 === 0 ? [mealTemplates[3]] : []),
      ];

      const dailyWorkouts = i % 4 === 3 ? [] : [workoutTemplates[i % workoutTemplates.length]];

      const waterMl = 2200 + Math.floor(Math.random() * 600);
      const sleepDuration = 7 + parseFloat((Math.random() * 1.5).toFixed(1));
      const moods = ['Great', 'Good', 'Great', 'Good', 'Neutral', 'Good', 'Great'];

      await DailyLog.create({
        user: userId,
        date: d,
        water: {
          totalMl: waterMl,
          logs: [
            { amountMl: 500, time: '08:30 AM' },
            { amountMl: 500, time: '11:15 AM' },
            { amountMl: 750, time: '02:45 PM' },
            { amountMl: waterMl - 1750, time: '06:30 PM' },
          ],
        },
        meals: dailyMeals,
        workouts: dailyWorkouts,
        sleep: {
          durationHours: sleepDuration,
          qualityRating: 4,
          notes: 'Consistent restful sleep routine',
        },
        mood: {
          status: moods[i % moods.length],
          journalNotes: 'Productive day, maintained healthy meal timing and good hydration.',
        },
        weight: currentWeight,
      });
    }

    // Update user profile weight
    await User.findByIdAndUpdate(userId, { 'profile.currentWeight': currentWeight });

    res.json({ message: 'Demo data seeded successfully with 14 days of logs and active habits!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getAnalyticsTrends,
  seedDemoData,
};
