const asyncHandler = require('express-async-handler');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Workout = require('../models/Workout');

// @desc    Get progress history
// @route   GET /api/progress
// @access  Private
const getProgress = asyncHandler(async (req, res) => {
    const progress = await Progress.find({ user: req.user.id }).sort({ date: 1 });
    res.status(200).json(progress);
});

// @desc    Add progress entry
// @route   POST /api/progress
// @access  Private
const addProgress = asyncHandler(async (req, res) => {
    const { weight, sleepHours, waterIntake, steps, heartRate, date } = req.body;

    if (!weight) {
        res.status(400);
        throw new Error('Please add weight');
    }

    const progress = await Progress.create({
        user: req.user.id,
        weight,
        sleepHours,
        waterIntake,
        steps,
        heartRate,
        date: date || Date.now(),
    });

    // Update user's current weight
    await User.findByIdAndUpdate(req.user.id, { currentWeight: weight }, { new: true });

    res.status(200).json(progress);
});

// @desc    Get Analytics & Insights
// @route   GET /api/progress/analytics
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);

    // Fetch data for insights
    const workouts = await Workout.find({
        user: userId,
        date: { $gte: twoWeeksAgo }
    });

    // Calculate Weekly Stats
    let thisWeekCalories = 0;
    let lastWeekCalories = 0;
    let thisWeekCount = 0;
    let lastWeekCount = 0;

    workouts.forEach(w => {
        const d = new Date(w.date);
        if (d >= oneWeekAgo) {
            thisWeekCalories += w.caloriesBurned;
            thisWeekCount++;
        } else {
            lastWeekCalories += w.caloriesBurned;
            lastWeekCount++;
        }
    });

    // Generate Insights
    const insights = [];

    // Calorie Insight
    if (thisWeekCalories > lastWeekCalories && lastWeekCalories > 0) {
        const increase = Math.round(((thisWeekCalories - lastWeekCalories) / lastWeekCalories) * 100);
        insights.push(`🔥 Your calorie burn increased by ${increase}% this week!`);
    } else if (thisWeekCalories < lastWeekCalories) {
        insights.push(`⚠️ Your calorie burn is down compared to last week.`);
    }

    // Consistency Insight
    if (thisWeekCount >= 3) {
        insights.push(`💪 Great consistency! You worked out ${thisWeekCount} times this week.`);
    } else if (thisWeekCount === 0) {
        insights.push(`📉 No workouts recorded this week. Let's get moving!`);
    }

    // Strength vs Cardio Insight (Simple)
    const strengthCount = workouts.filter(w => w.type === 'Strength' && new Date(w.date) >= oneWeekAgo).length;
    if (strengthCount > 2) {
        insights.push(`🏋️ You're building serious strength this week!`);
    }

    // Get Next Missions
    const { getNextMissions } = require('../utils/gamification');
    const Profile = require('../models/Profile');

    // Need profile for streak and achievements
    const profile = await Profile.findOne({ user: userId });

    if (profile && profile.streak > 0 && profile.lastWorkoutDate) {
        const today = new Date().setHours(0, 0, 0, 0);
        const last = new Date(profile.lastWorkoutDate).setHours(0, 0, 0, 0);
        const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0);

        // If last workout was not today or yesterday, streak has expired
        if (last < yesterday) {
            profile.streak = 0;
            await profile.save();
        }
    }

    res.status(200).json({
        insights,
        streak: profile ? profile.streak : 0,
        level: profile ? profile.fitnessLevel : 'Beginner',
        thisWeek: { calories: thisWeekCalories, workouts: thisWeekCount },
        lastWeek: { calories: lastWeekCalories, workouts: lastWeekCount },
        nextMissions: profile ? getNextMissions(profile) : []
    });
});

module.exports = {
    getProgress,
    addProgress,
    getAnalytics,
};
