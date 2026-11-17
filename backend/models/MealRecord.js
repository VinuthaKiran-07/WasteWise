import mongoose from 'mongoose';

const mealRecordSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
    prepared: { type: Number, required: true, min: 0 },
    consumed: { type: Number, required: true, min: 0 },
    attendance: { type: Number, required: true, min: 0 },
    isHoliday: { type: Boolean, default: false },
    isExamDay: { type: Boolean, default: false },
    isSpecialEvent: { type: Boolean, default: false },
    leftover: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

mealRecordSchema.index({ date: 1, mealType: 1 }, { unique: true });
mealRecordSchema.index({ date: -1 });

export default mongoose.model('MealRecord', mealRecordSchema);

