const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, immutable: true },
    password: { type: String, required: true },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    // Preferences
    preferences: {
        theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
        notifications: { type: Boolean, default: true }
    },
    // Security & Logs
    loginHistory: [{
        date: { type: Date, default: Date.now },
        ip: String,
        device: String
    }]
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
