import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    predictionDate: { type: Date, required: true, index: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
    expectedAttendance: { type: Number, required: true, min: 0 },
    predictedMeals: { type: Number, required: true, min: 0 },
    recommendedPreparation: { type: Number, required: true, min: 0 },
    bufferPercentage: { type: Number, required: true, min: 0, max: 100 },
    modelVersion: { type: String, required: true }
  },
  { timestamps: true }
);

predictionSchema.index({ predictionDate: -1, mealType: 1 });

export default mongoose.model('Prediction', predictionSchema);

