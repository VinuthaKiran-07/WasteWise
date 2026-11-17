import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createPrediction, getPrediction, listPredictions } from '../controllers/predictionController.js';
import { validate } from './validation.js';

const router = Router();
router.post('/', [
  body('predictionDate').isISO8601(),
  body('mealType').isIn(['Breakfast', 'Lunch', 'Dinner']),
  body('expectedAttendance').isFloat({ min: 0 }),
  body('isHoliday').optional().isBoolean(),
  body('isExamDay').optional().isBoolean(),
  body('isSpecialEvent').optional().isBoolean()
], validate, createPrediction);
router.get('/', query('limit').optional().isInt({ min: 1, max: 100 }), validate, listPredictions);
router.get('/:id', param('id').isMongoId(), validate, getPrediction);
export default router;

