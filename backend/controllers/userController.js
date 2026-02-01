const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Profile = require('../models/Profile');
const generateToken = require('../utils/generateToken');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    const profile = await Profile.findOne({ user: req.user._id });

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            // Spread profile fields for compatibility with frontend
            gender: profile ? profile.gender : 'Prefer not to say',
            age: profile ? profile.age : '',
            bio: profile ? profile.bio : '',
            height: profile ? profile.height : '',
            currentWeight: profile ? profile.currentWeight : '',
            targetWeight: profile ? profile.targetWeight : '',
            goal: profile ? profile.goal : 'maintain',
            fitnessLevel: profile ? profile.fitnessLevel : 'Beginner',
            activityLevel: profile ? profile.activityLevel : 'Moderately Active',
            bmi: profile ? profile.bmi : '0',
            healthScore: profile ? profile.healthScore : '0',
            profilePicture: profile ? profile.profilePicture : '',
            banner: profile ? profile.banner : '',
            createdAt: user.createdAt,
            updatedAt: profile ? profile.updatedAt : user.updatedAt
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update User-specific fields
    user.name = req.body.name || user.name;
    await user.save();

    // Find or create associated Profile
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
        profile = new Profile({ user: user._id });
    }

    // Basic identity
    profile.gender = req.body.gender || profile.gender;
    profile.age = req.body.age !== undefined && req.body.age !== '' ? Number(req.body.age) : profile.age;
    profile.bio = req.body.bio !== undefined ? req.body.bio : profile.bio;

    // Fitness & health data
    profile.height = req.body.height !== undefined && req.body.height !== '' ? Number(req.body.height) : profile.height;
    profile.currentWeight = req.body.currentWeight !== undefined && req.body.currentWeight !== '' ? Number(req.body.currentWeight) : profile.currentWeight;
    profile.targetWeight = req.body.targetWeight !== undefined && req.body.targetWeight !== '' ? Number(req.body.targetWeight) : profile.targetWeight;
    profile.goal = req.body.goal || profile.goal;
    profile.fitnessLevel = req.body.fitnessLevel || profile.fitnessLevel;
    profile.activityLevel = req.body.activityLevel || profile.activityLevel;

    // Validation for positive numbers
    if (profile.age < 0 || profile.height < 0 || profile.currentWeight < 0 || profile.targetWeight < 0) {
        res.status(400);
        throw new Error('Age, height, and weight must be positive numbers');
    }

    // Handle Media assets (Images)
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (req.files) {
        if (req.files.profilePicture) {
            profile.profilePicture = `${baseUrl}/uploads/${req.files.profilePicture[0].filename}`;
        }
        if (req.files.banner) {
            profile.banner = `${baseUrl}/uploads/${req.files.banner[0].filename}`;
        }
    }

    // Save profile - schema pre-save middleware will handle BMI and Health Score calculation
    const updatedProfile = await profile.save();

    // Link profile to user if not already linked
    if (!user.profile || user.profile.toString() !== updatedProfile._id.toString()) {
        user.profile = updatedProfile._id;
        await user.save();
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        // Spread profile fields for compatibility with frontend
        gender: updatedProfile.gender,
        age: updatedProfile.age,
        bio: updatedProfile.bio,
        height: updatedProfile.height,
        currentWeight: updatedProfile.currentWeight,
        targetWeight: updatedProfile.targetWeight,
        goal: updatedProfile.goal,
        fitnessLevel: updatedProfile.fitnessLevel,
        activityLevel: updatedProfile.activityLevel,
        bmi: updatedProfile.bmi,
        healthScore: updatedProfile.healthScore,
        profilePicture: updatedProfile.profilePicture,
        banner: updatedProfile.banner,
        createdAt: user.createdAt,
        updatedAt: updatedProfile.updatedAt
    });
});

module.exports = {
    getProfile,
    updateProfile,
};
