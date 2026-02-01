const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const {
        name, email, password, age, gender, height, currentWeight, targetWeight,
        activityLevel, fitnessLevel, goal
    } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
        // Create initial profile
        const profile = await Profile.create({
            user: user._id,
            age,
            gender: gender || 'Prefer not to say',
            height,
            currentWeight,
            targetWeight,
            activityLevel,
            fitnessLevel,
            goal
        });

        // Link profile to user
        user.profile = profile._id;
        await user.save();

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            // Return profile data for compatibility
            fitnessLevel: profile.fitnessLevel,
            profilePicture: profile.profilePicture
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Log login activity
        user.loginHistory.push({
            ip: req.ip,
            device: req.headers['user-agent']
        });
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            profilePicture: user.profilePicture,
            fitnessLevel: user.fitnessLevel
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});



// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
