const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { GlucoReading, MealLog } = require('../models/GlucoLog');

const logReading = asyncHandler(async (req, res) => {
  const { glucoseLevel, timeOfDay, readingType, notes } = req.body;

  if (glucoseLevel === undefined || glucoseLevel === null) {
    throw new ApiError(400, 'Glucose level is required');
  }

  const reading = await GlucoReading.create({
    user: req.user._id,
    glucoseLevel: Number(glucoseLevel),
    timeOfDay: timeOfDay || 'Morning',
    readingType: readingType || 'Fasting',
    notes: notes || '',
    loggedAt: new Date(),
  });

  res.status(201).json(new ApiResponse(201, { reading }, 'Glucose reading logged successfully'));
});

const logMeal = asyncHandler(async (req, res) => {
  const { mealType, carbs, calories, notes } = req.body;

  if (!mealType) {
    throw new ApiError(400, 'Meal type is required');
  }

  const meal = await MealLog.create({
    user: req.user._id,
    mealType,
    carbs: Number(carbs) || 0,
    calories: Number(calories) || 0,
    notes: notes || '',
    loggedAt: new Date(),
  });

  res.status(201).json(new ApiResponse(201, { meal }, 'Meal logged successfully'));
});

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [recentReadings, recentMeals] = await Promise.all([
    GlucoReading.find({ user: userId }).sort({ loggedAt: -1 }).limit(10),
    MealLog.find({ user: userId }).sort({ loggedAt: -1 }).limit(5),
  ]);

  // Calculate average glucose
  let avgGlucose = 110;
  let inTargetRangePercent = 88;
  if (recentReadings.length > 0) {
    const sum = recentReadings.reduce((acc, curr) => acc + curr.glucoseLevel, 0);
    avgGlucose = Math.round((sum / recentReadings.length) * 10) / 10;
    const inRange = recentReadings.filter((r) => r.glucoseLevel >= 70 && r.glucoseLevel <= 140).length;
    inTargetRangePercent = Math.round((inRange / recentReadings.length) * 100);
  }

  const dashboardData = {
    summary: {
      averageGlucose: avgGlucose,
      targetRange: '70 - 140 mg/dL',
      inTargetRangePercent: inTargetRangePercent,
      totalReadingsLogged: recentReadings.length,
      healthStatus: avgGlucose <= 125 ? 'Optimal' : avgGlucose <= 150 ? 'Moderate' : 'Needs Attention',
    },
    recentReadings,
    recentMeals,
  };

  res.status(200).json(new ApiResponse(200, dashboardData, 'Gluco dashboard data retrieved'));
});

module.exports = {
  logReading,
  logMeal,
  getDashboard,
};
