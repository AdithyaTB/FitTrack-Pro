const mongoose = require('mongoose');

const workoutSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    type: {
        type: String, // cardio, strength, etc.
        required: [true, 'Please add a workout type'],
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Please add a duration'],
    },
    caloriesBurned: {
        type: Number,
        required: [true, 'Please add calories burned'],
    },
    distance: { type: Number, default: 0 }, // in km
    steps: { type: Number, default: 0 },
    intensity: { type: Number, min: 1, max: 10, default: 5 },
    mood: { type: String, enum: ['Great', 'Good', 'Okay', 'Tired', 'Exhausted'], default: 'Good' },
    notes: { type: String },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Workout', workoutSchema);
