# WasteWise

WasteWise is a full-stack ML-powered food demand and waste prediction system for college cafeterias and small food-service teams.

## What it demonstrates

- React + Vite dashboard with responsive navigation, forms, tables, charts, loading states, and error handling.
- Express + MongoDB REST API with Mongoose models, validation, CRUD operations, duplicate protection, and analytics endpoints.
- FastAPI machine-learning service using a chronological RandomForestRegressor pipeline saved with Joblib.
- A synthetic demo-data generator for local demonstrations. Synthetic performance is not a real-world accuracy claim.

## Architecture

```text
React (5173) -> Express API (5000) -> MongoDB (27017)
                         |
                         -> FastAPI ML service (8000)
```

The Node service owns request validation, historical feature assembly, the configurable planning buffer, persistence, and API responses. The Python service owns model training/loading and prediction.

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Community Server running locally on port 27017

## Setup on Windows PowerShell

### 1. Install frontend and backend dependencies

```powershell
cd C:\Users\vinut\Downloads\WasteWise
npm install --prefix frontend
npm install --prefix backend
```

### 2. Configure the backend

```powershell
Copy-Item backend\.env.example backend\.env
```

The default values target the local ports in the brief. Change `MONGODB_URI`, `ML_SERVICE_URL`, or `CLIENT_ORIGIN` if your environment differs.

### 3. Configure and train the ML service

```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python generate_demo.py
python train.py
```

If you skip the explicit training command, the FastAPI service generates synthetic data and trains a model on startup when no model file exists.

### 4. Seed MongoDB with synthetic demo records

In a new PowerShell window:

```powershell
cd C:\Users\vinut\Downloads\WasteWise
node backend\scripts\seedDemo.js
```

The seed script creates several months of weekday variation, holidays, exam periods, and special events. It clears the demo collections before inserting the generated records, so use it only for local demo data.

### 5. Start the services

PowerShell window 1:

```powershell
cd C:\Users\vinut\Downloads\WasteWise\ml-service
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```

PowerShell window 2:

```powershell
cd C:\Users\vinut\Downloads\WasteWise\backend
npm run dev
```

PowerShell window 3:

```powershell
cd C:\Users\vinut\Downloads\WasteWise\frontend
npm run dev
```

Open http://localhost:5173.

## API endpoints

| Area | Endpoints |
| --- | --- |
| Health | `GET /health` |
| Meals | `POST/GET /api/meals`, `GET/PUT/DELETE /api/meals/:id` |
| Predictions | `POST/GET /api/predictions`, `GET /api/predictions/:id` |
| Analytics | `GET /api/analytics/summary`, `GET /api/analytics/waste-trends`, `GET /api/analytics/consumption-trends` |

## Retraining

Replace or regenerate `ml-service/data/demo_records.csv`, then run `python train.py`. Restart FastAPI so it loads the new Joblib bundle. The model version is stored with every prediction.

## Testing

Backend tests use Jest and Supertest where configured. Run:

```powershell
cd backend
npm test
```

The integration tests expect MongoDB to be available. The ML service can be smoke-tested with:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

