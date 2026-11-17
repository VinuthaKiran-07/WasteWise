import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import mealRoutes from './routes/mealRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',')[0].trim() }));
app.use(express.json());
app.get('/health', (req, res) => res.json({ success: true, service: 'wastewise-api', timestamp: new Date().toISOString() }));
app.use('/api/meals', mealRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isEntryPoint) {
  connectDB()
    .then(() => app.listen(port, () => console.log(`WasteWise API listening on http://localhost:${port}`)))
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    });
}

export default app;

