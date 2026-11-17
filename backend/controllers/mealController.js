import MealRecord from '../models/MealRecord.js';
import { parseDateOnly } from '../utils/dateUtils.js';

export function cleanPayload(body) {
  const date = parseDateOnly(body.date);
  if (!date) {
    const error = new Error('Date must use YYYY-MM-DD format.');
    error.statusCode = 400;
    throw error;
  }
  if (body.consumed > body.prepared) {
    const error = new Error('Consumed meals cannot exceed prepared meals.');
    error.statusCode = 400;
    throw error;
  }
  return {
    date,
    mealType: body.mealType,
    prepared: body.prepared,
    consumed: body.consumed,
    attendance: body.attendance,
    isHoliday: Boolean(body.isHoliday),
    isExamDay: Boolean(body.isExamDay),
    isSpecialEvent: Boolean(body.isSpecialEvent),
    leftover: body.prepared - body.consumed
  };
}

export async function createMeal(req, res) {
  const record = await MealRecord.create(cleanPayload(req.body));
  res.status(201).json({ success: true, data: record });
}

export async function listMeals(req, res) {
  const { page = 1, limit = 10, mealType, date, search, sortBy = 'date', sortOrder = 'desc' } = req.query;
  const filter = {};
  if (mealType) filter.mealType = mealType;
  if (date) {
    const parsed = parseDateOnly(date);
    if (parsed) {
      const next = new Date(parsed);
      next.setUTCDate(next.getUTCDate() + 1);
      filter.date = { $gte: parsed, $lt: next };
    }
  }
  if (search) {
    const parsedSearch = parseDateOnly(search);
    if (parsedSearch) {
      const next = new Date(parsedSearch);
      next.setUTCDate(next.getUTCDate() + 1);
      filter.date = { $gte: parsedSearch, $lt: next };
    }
  }
  const safePage = Math.max(1, Number(page));
  const safeLimit = Math.min(100, Math.max(1, Number(limit)));
  const allowedSorts = ['date', 'mealType', 'prepared', 'consumed', 'leftover'];
  const sort = { [allowedSorts.includes(sortBy) ? sortBy : 'date']: sortOrder === 'asc' ? 1 : -1 };
  const [records, total] = await Promise.all([
    MealRecord.find(filter).sort(sort).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    MealRecord.countDocuments(filter)
  ]);
  res.json({ success: true, data: records, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
}

export async function getMeal(req, res) {
  const record = await MealRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Meal record not found.' });
  res.json({ success: true, data: record });
}

export async function updateMeal(req, res) {
  const record = await MealRecord.findByIdAndUpdate(req.params.id, cleanPayload(req.body), { new: true, runValidators: true });
  if (!record) return res.status(404).json({ success: false, message: 'Meal record not found.' });
  res.json({ success: true, data: record });
}

export async function deleteMeal(req, res) {
  const record = await MealRecord.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Meal record not found.' });
  res.json({ success: true, message: 'Meal record deleted.' });
}

