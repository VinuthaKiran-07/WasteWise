import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createMeal, deleteMeal, getMeal, listMeals, updateMeal } from '../controllers/mealController.js';
import { validate } from './validation.js';

const mealBody = [
  body('date').isISO8601().withMessage('Date must use YYYY-MM-DD format.'),
  body('mealType').isIn(['Breakfast', 'Lunch', 'Dinner']),
  body('prepared').isFloat({ min: 0 }),
  body('consumed').isFloat({ min: 0 }),
  body('attendance').isFloat({ min: 0 }),
  body('isHoliday').optional().isBoolean(),
  body('isExamDay').optional().isBoolean(),
  body('isSpecialEvent').optional().isBoolean()
];

const router = Router();
router.post('/', mealBody, validate, createMeal);
router.get('/', [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })], validate, listMeals);
router.get('/:id', param('id').isMongoId(), validate, getMeal);
router.put('/:id', [param('id').isMongoId(), ...mealBody], validate, updateMeal);
router.delete('/:id', param('id').isMongoId(), validate, deleteMeal);
export default router;

