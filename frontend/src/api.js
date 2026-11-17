import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 10000 });
export const mlHealthUrl = import.meta.env.VITE_ML_HEALTH_URL || 'http://localhost:8000/health';

export const getSummary = () => api.get('/analytics/summary');
export const getWasteTrends = () => api.get('/analytics/waste-trends');
export const getConsumptionTrends = () => api.get('/analytics/consumption-trends');
export const getMeals = (params) => api.get('/meals', { params });
export const createMeal = (payload) => api.post('/meals', payload);
export const updateMeal = (id, payload) => api.put(`/meals/${id}`, payload);
export const deleteMeal = (id) => api.delete(`/meals/${id}`);
export const createPrediction = (payload) => api.post('/predictions', payload);
export const getPredictions = (params) => api.get('/predictions', { params });

export function apiMessage(error) {
  return error?.response?.data?.message || 'We could not reach the WasteWise API. Check that the backend and MongoDB are running.';
}

