import MealRecord from '../models/MealRecord.js';
import Prediction from '../models/Prediction.js';
import { requestPrediction } from '../services/mlService.js';
import { parseDateOnly } from '../utils/dateUtils.js';

function buildHistoricalFeatures(records, predictionDate, mealType) {
  const sameMeal = records.filter((record) => record.mealType === mealType).sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sameMeal[0];
  const weekAgo = new Date(predictionDate);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const previousWeek = sameMeal.find((record) => Math.abs(new Date(record.date) - weekAgo) <= 2 * 86400000);
  const rolling = sameMeal.slice(0, 5).map((record) => record.consumed);
  const fallback = rolling.length ? rolling.reduce((sum, value) => sum + value, 0) / rolling.length : 0;
  return {
    previous_day_demand: latest?.consumed ?? fallback,
    previous_week_demand: previousWeek?.consumed ?? latest?.consumed ?? fallback,
    rolling_average: fallback
  };
}

export async function createPrediction(req, res) {
  const { predictionDate, mealType, expectedAttendance, isHoliday, isExamDay, isSpecialEvent } = req.body;
  const date = parseDateOnly(predictionDate);
  if (!date) return res.status(400).json({ success: false, message: 'Prediction date must use YYYY-MM-DD format.' });
  const historical = await MealRecord.find({ date: { $lt: date } }).sort({ date: -1 }).lean();
  const historicalFeatures = buildHistoricalFeatures(historical, date, mealType);
  const features = {
    day_of_week: date.getUTCDay(),
    expected_attendance: expectedAttendance,
    is_holiday: Number(Boolean(isHoliday)),
    is_exam_day: Number(Boolean(isExamDay)),
    is_special_event: Number(Boolean(isSpecialEvent)),
    ...historicalFeatures
  };
  const mlResult = await requestPrediction(features);
  const predictedMeals = Math.max(0, Math.round(Number(mlResult.predicted_meals)));
  const bufferPercentage = Number(process.env.PLANNING_BUFFER_PERCENTAGE || 5);
  const recommendedPreparation = Math.ceil(predictedMeals * (1 + bufferPercentage / 100));
  const prediction = await Prediction.create({
    predictionDate: date,
    mealType,
    expectedAttendance,
    predictedMeals,
    recommendedPreparation,
    bufferPercentage,
    modelVersion: mlResult.model_version || 'unknown'
  });
  res.status(201).json({ success: true, data: { ...prediction.toObject(), historicalFeatures, features } });
}

export async function listPredictions(req, res) {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ success: true, data: predictions });
}

export async function getPrediction(req, res) {
  const prediction = await Prediction.findById(req.params.id);
  if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found.' });
  res.json({ success: true, data: prediction });
}

