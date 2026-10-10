const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    required: true,
  },
  foodName: {
    type: String,
    required: true,
    trim: true,
  },
  calories: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  protein: {
    type: Number,
    min: 0,
    default: 0,
  },
  carbs: {
    type: Number,
    min: 0,
    default: 0,
  },
  fat: {
    type: Number,
    min: 0,
    default: 0,
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
});

const workoutItemSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Cardio', 'Strength', 'HIIT', 'Yoga', 'Walking', 'Sports', 'Other'],
    default: 'Strength',
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1,
  },
  caloriesBurned: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    default: '',
  },
});

const dailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD' format for clean date querying
      required: true,
      index: true,
    },
    water: {
      totalMl: {
        type: Number,
        default: 0,
        min: 0,
      },
      logs: [
        {
          amountMl: { type: Number, required: true },
          time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        },
      ],
    },
    meals: [mealItemSchema],
    workouts: [workoutItemSchema],
    sleep: {
      durationHours: {
        type: Number,
        default: 0,
        min: 0,
        max: 24,
      },
      qualityRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      notes: {
        type: String,
        default: '',
      },
    },
    mood: {
      status: {
        type: String,
        enum: ['Great', 'Good', 'Neutral', 'Tired', 'Stressed', 'Bad'],
        default: 'Good',
      },
      journalNotes: {
        type: String,
        default: '',
      },
    },
    weight: {
      type: Number,
      min: 20,
      max: 300,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique log per user per calendar day
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtuals for computed totals
dailyLogSchema.virtual('totalCaloriesConsumed').get(function () {
  return this.meals.reduce((sum, item) => sum + (item.calories || 0), 0);
});

dailyLogSchema.virtual('totalCaloriesBurned').get(function () {
  return this.workouts.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
});

dailyLogSchema.virtual('totalProtein').get(function () {
  return this.meals.reduce((sum, item) => sum + (item.protein || 0), 0);
});

dailyLogSchema.virtual('totalCarbs').get(function () {
  return this.meals.reduce((sum, item) => sum + (item.carbs || 0), 0);
});

dailyLogSchema.virtual('totalFat').get(function () {
  return this.meals.reduce((sum, item) => sum + (item.fat || 0), 0);
});

dailyLogSchema.set('toJSON', { virtuals: true });
dailyLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
