const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
    bio: { type: String, default: '' },

    // Fitness & health data
    height: { type: Number, min: 0 }, // in cm
    currentWeight: { type: Number, min: 0 }, // in kg
    targetWeight: { type: Number, min: 0 }, // in kg
    goal: { type: String, enum: ['lose', 'gain', 'maintain', 'build_muscle'], default: 'maintain' },
    fitnessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Pro'], default: 'Beginner' },
    activityLevel: { type: String, enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Super Active'], default: 'Moderately Active' },

    // Calculated fields
    bmi: { type: Number, default: 0 },
    healthScore: { type: Number, default: 0 },

    // Media assets
    profilePicture: { type: String, default: '' },
    banner: { type: String, default: '' },

    // Gamification
    streak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date },
    achievements: [{
        id: String,
        title: String,
        date: Date,
        icon: String
    }]
}, {
    timestamps: true
});

// Middleware to calculate BMI and Health Score
profileSchema.pre('save', async function (next) {
    if (this.height && this.currentWeight) {
        const heightInMeters = this.height / 100;
        this.bmi = parseFloat((this.currentWeight / (heightInMeters * heightInMeters)).toFixed(2));

        const deviation = Math.abs(this.bmi - 22);
        this.healthScore = Math.max(0, Math.min(100, Math.round(100 - (deviation * 4))));
    }
    next();
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
