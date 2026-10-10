const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profile: {
      age: { type: Number, default: 28 },
      height: { type: Number, default: 175 }, // in cm
      currentWeight: { type: Number, default: 72 }, // in kg
      targetWeight: { type: Number, default: 68 }, // in kg
      activityLevel: {
        type: String,
        enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Super Active'],
        default: 'Moderately Active',
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        default: 'Prefer not to say',
      },
    },
    goals: {
      dailyCalories: { type: Number, default: 2000 },
      dailyWaterMl: { type: Number, default: 2500 },
      dailySleepHours: { type: Number, default: 8 },
      dailyProteinGrams: { type: Number, default: 120 },
      dailyCarbsGrams: { type: Number, default: 220 },
      dailyFatsGrams: { type: Number, default: 65 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
