const mongoose = require('mongoose');

const progressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    weight: {
        type: Number,
        required: [true, 'Please add weight'],
    },
    sleepHours: { type: Number, default: 0 },
    waterIntake: { type: Number, default: 0 }, // in glasses/liters
    steps: { type: Number, default: 0 },
    heartRate: { type: Number, default: 0 }, // Avg BPM
    date: {
        type: Date,
        default: Date.now, // Or user specified date
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Progress', progressSchema);
