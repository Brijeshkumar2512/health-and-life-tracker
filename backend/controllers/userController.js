const User = require('../models/User');

// @desc    Update user profile (physical metrics)
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;

    if (req.body.profile) {
      user.profile = {
        ...user.profile.toObject(),
        ...req.body.profile,
      };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile: updatedUser.profile,
      goals: updatedUser.goals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user goals (calories, water, sleep, macros)
// @route   PUT /api/user/goals
// @access  Private
const updateUserGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.goals) {
      user.goals = {
        ...user.goals.toObject(),
        ...req.body.goals,
      };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile: updatedUser.profile,
      goals: updatedUser.goals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateUserProfile,
  updateUserGoals,
};
