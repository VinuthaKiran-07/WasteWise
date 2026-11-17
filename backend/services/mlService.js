import axios from 'axios';

export async function requestPrediction(features) {
  const baseUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
  try {
    const response = await axios.post(`${baseUrl}/predict`, features, { timeout: 8000 });
    return response.data;
  } catch (error) {
    const wrapped = new Error('The ML prediction service is unavailable. Start FastAPI on port 8000 and try again.');
    wrapped.statusCode = 503;
    wrapped.cause = error;
    throw wrapped;
  }
}

