import MealRecord from '../models/MealRecord.js';
import Prediction from '../models/Prediction.js';

export async function summary(req, res) {
  const [totals, latestPrediction, recordCount] = await Promise.all([
    MealRecord.aggregate([{ $group: { _id: null, prepared: { $sum: '$prepared' }, consumed: { $sum: '$consumed' }, leftover: { $sum: '$leftover' } } }]),
    Prediction.findOne().sort({ createdAt: -1 }).lean(),
    MealRecord.countDocuments()
  ]);
  const data = totals[0] || { prepared: 0, consumed: 0, leftover: 0 };
  data.wasteRate = data.prepared ? (data.leftover / data.prepared) * 100 : 0;
  res.json({ success: true, data: { ...data, recordCount, latestPrediction } });
}

export async function wasteTrends(req, res) {
  const rows = await MealRecord.aggregate([
    { $group: { _id: '$date', prepared: { $sum: '$prepared' }, consumed: { $sum: '$consumed' }, leftover: { $sum: '$leftover' } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data: rows.map((row) => ({ date: row._id, prepared: row.prepared, consumed: row.consumed, leftover: row.leftover, wasteRate: row.prepared ? (row.leftover / row.prepared) * 100 : 0 })) });
}

export async function consumptionTrends(req, res) {
  const [actual, predictions] = await Promise.all([
    MealRecord.aggregate([{ $group: { _id: '$date', consumed: { $sum: '$consumed' }, prepared: { $sum: '$prepared' } } }, { $sort: { _id: 1 } }]),
    Prediction.aggregate([{ $group: { _id: '$predictionDate', predicted: { $sum: '$predictedMeals' } } }, { $sort: { _id: 1 } }])
  ]);
  const byDate = new Map(actual.map((row) => [new Date(row._id).toISOString().slice(0, 10), { date: row._id, consumed: row.consumed, prepared: row.prepared }]));
  predictions.forEach((row) => {
    const key = new Date(row._id).toISOString().slice(0, 10);
    byDate.set(key, { ...(byDate.get(key) || { date: row._id }), predicted: row.predicted });
  });
  res.json({ success: true, data: [...byDate.values()].sort((a, b) => new Date(a.date) - new Date(b.date)) });
}

