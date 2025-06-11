const mongoose = require("mongoose");

// Define the reminder schema
const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventType: { type: String, required: true },
  eventName: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventTime: { type: String, required: false },
  reminderType: { type: String, required: true },
  isRecurringEvent: { type: Boolean, required: false },
  recurringFrequency: { type: String, required: false },
  notes: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  lastSent: { type: Date },
});

// Use existing Reminder model if it exists, or create it
const Reminder =
  mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;
