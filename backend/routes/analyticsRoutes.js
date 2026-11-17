import { Router } from 'express';
import { summary, wasteTrends, consumptionTrends } from '../controllers/analyticsController.js';

const router = Router();
router.get('/summary', summary);
router.get('/waste-trends', wasteTrends);
router.get('/consumption-trends', consumptionTrends);
export default router;

