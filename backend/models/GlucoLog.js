const mongoose = require('mongoose');

const glucoReadingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    glucoseLevel: {
      type: Number,
      required: true,
    },
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'dawn', 'day', 'dusk', 'night'],
      default: 'Morning',
    },
    readingType: {
      type: String,
      enum: ['Fasting', 'Post-Meal', 'Random', 'Before-Sleep', 'Pre-Meal'],
      default: 'Fasting',
    },
    notes: {
      type: String,
      default: '',
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const mealLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: true,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    calories: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const GlucoReading = mongoose.model('GlucoReading', glucoReadingSchema);
const MealLog = mongoose.model('MealLog', mealLogSchema);

module.exports = {
  GlucoReading,
  MealLog,
};
