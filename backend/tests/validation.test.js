import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../server.js';
import { cleanPayload } from '../controllers/mealController.js';
import { parseDateOnly } from '../utils/dateUtils.js';

test('meal payload calculates leftover on the server', () => {
  const record = cleanPayload({ date: '2026-11-17', mealType: 'Lunch', prepared: 900, consumed: 842, attendance: 880, isHoliday: false, isExamDay: true, isSpecialEvent: false });
  assert.equal(record.leftover, 58);
  assert.equal(record.date.toISOString(), '2026-11-17T00:00:00.000Z');
});

test('meal payload rejects consumption above preparation', () => {
  assert.throws(() => cleanPayload({ date: '2026-11-17', mealType: 'Lunch', prepared: 10, consumed: 11, attendance: 12 }), /Consumed meals cannot exceed prepared meals/);
});

test('date-only parser rejects ambiguous formats', () => {
  assert.equal(parseDateOnly('2026-11-17')?.toISOString(), '2026-11-17T00:00:00.000Z');
  assert.equal(parseDateOnly('17/11/2026'), null);
});

test('meal route returns validation errors without a database round trip', async () => {
  const response = await request(app).post('/api/meals').send({ date: '2026-11-17', mealType: 'Lunch', prepared: -1, consumed: 3, attendance: 4 });
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test('prediction route validates the meal type', async () => {
  const response = await request(app).post('/api/predictions').send({ predictionDate: '2026-11-18', mealType: 'Snack', expectedAttendance: 500 });
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

