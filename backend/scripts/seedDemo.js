import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import MealRecord from '../models/MealRecord.js';
import Prediction from '../models/Prediction.js';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
const baseDemand = { Breakfast: 360, Lunch: 690, Dinner: 520 };
const start = new Date();
start.setUTCDate(start.getUTCDate() - 180);

function makeRecord(index, mealType) {
  const date = new Date(start);
  date.setUTCDate(start.getUTCDate() + index);
  const day = date.getUTCDay();
  const isHoliday = day === 0 || day === 6;
  const isExamDay = index >= 120 && index <= 140;
  const isSpecialEvent = index % 31 === 0;
  const attendance = Math.round((isHoliday ? 0.48 : 0.78) * 1000 + ((index * 37) % 120));
  const weekdayFactor = [0.42, 0.98, 1.04, 1.01, 1.08, 0.96, 0.46][day];
  const eventFactor = isExamDay ? 0.88 : isSpecialEvent ? 1.12 : 1;
  const consumed = Math.max(0, Math.round(baseDemand[mealType] * weekdayFactor * eventFactor * (attendance / 900)));
  const prepared = consumed + Math.round(18 + ((index * 11 + mealType.length * 7) % 32));
  return { date, mealType, prepared, consumed, attendance, isHoliday, isExamDay, isSpecialEvent, leftover: prepared - consumed };
}

await connectDB();
await MealRecord.deleteMany({});
await Prediction.deleteMany({});
const records = [];
for (let index = 0; index < 180; index += 1) for (const mealType of mealTypes) records.push(makeRecord(index, mealType));
await MealRecord.insertMany(records);
console.log(`Inserted ${records.length} synthetic demo meal records into wastewise_db.`);
await disconnectDB();

