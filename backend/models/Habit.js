const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Mindfulness', 'Fitness', 'Productivity', 'Nutrition', 'Sleep', 'Health', 'General'],
      default: 'General',
    },
    color: {
      type: String,
      default: '#10b981', // emerald brand default
    },
    icon: {
      type: String,
      default: 'target',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    completedDates: {
      type: [String], // Array of 'YYYY-MM-DD' strings
      default: [],
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

habitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
