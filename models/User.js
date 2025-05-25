const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },  // Store Google OAuth ID
    email: { type: String, required: true, unique: true }, // Email of the user
    displayName: { type: String },  // Name of the user from Google profile
    reminders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reminder' }]  // References to the reminders created by the user
});

const User = mongoose.model('User', userSchema);
module.exports = User;
