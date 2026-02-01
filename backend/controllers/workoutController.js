const asyncHandler = require('express-async-handler');
const Workout = require('../models/Workout');
const User = require('../models/User');

// @desc    Get workouts
// @route   GET /api/workouts
// @access  Private
const getWorkouts = asyncHandler(async (req, res) => {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(workouts);
});

// @desc    Set workout
// @route   POST /api/workouts
// @access  Private
const setWorkout = asyncHandler(async (req, res) => {
    let { type, duration, caloriesBurned, date, distance, steps, intensity, mood, notes } = req.body;

    if (!type || !duration) {
        res.status(400);
        throw new Error('Please add a workout type and duration');
    }

    // Smart Calorie Estimation if not provided
    if (!caloriesBurned) {
        // Approximate MET values
        const mets = {
            'Cardio': 8,
            'Strength': 5,
            'Yoga': 3,
            'HIIT': 9,
            'Cycling': 7,
            'Running': 10,
            'Walking': 3.5,
            'Pilates': 3.5,
            'Swimming': 7
        };
        // Default to 5 (moderate) if type unknown
        // Case-insensitive match attempt could be added, but assuming dropdown values
        const met = mets[type] || 5;
        const weight = req.user.currentWeight || 70; // Default 70kg if not set
        // Formula: Calories = (MET * 3.5 * weight / 200) * duration
        caloriesBurned = Math.round((met * 3.5 * weight / 200) * duration);
    }

    const workout = await Workout.create({
        user: req.user.id,
        type,
        duration,
        caloriesBurned,
        distance,
        steps,
        intensity,
        mood,
        notes,
        date: date || Date.now(),
    });

    // Update Profile Streak & Last Workout
    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
        const today = new Date().setHours(0, 0, 0, 0);
        const last = profile.lastWorkoutDate ? new Date(profile.lastWorkoutDate).setHours(0, 0, 0, 0) : 0;

        if (last !== today) {
            const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0); // 24 hours ago
            if (last === yesterday) {
                profile.streak += 1;
            } else {
                profile.streak = 1; // Reset
            }
        }
        profile.lastWorkoutDate = Date.now();

        // Calculate Stats for Gamification
        const statsAggregation = await Workout.aggregate([
            { $match: { user: req.user.id } },
            {
                $group: {
                    _id: null,
                    totalWorkouts: { $sum: 1 },
                    totalCalories: { $sum: '$caloriesBurned' }
                }
            }
        ]);

        const stats = statsAggregation.length > 0 ? statsAggregation[0] : { totalWorkouts: 0, totalCalories: 0 };

        const gameStats = {
            totalWorkouts: stats.totalWorkouts,
            totalCalories: stats.totalCalories,
            lastWorkout: workout
        };

        // Check Achievements
        const { checkAchievements } = require('../utils/gamification');
        const newBadges = checkAchievements(profile, gameStats);

        if (newBadges.length > 0) {
            profile.achievements.push(...newBadges);
        }

        await profile.save();
    }

    res.status(200).json(workout);
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
        res.status(400);
        throw new Error('Workout not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the workout user
    if (workout.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await workout.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
        res.status(400);
        throw new Error('Workout not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the workout user
    if (workout.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedWorkout);
});

module.exports = {
    getWorkouts,
    setWorkout,
    deleteWorkout,
    updateWorkout,
};
