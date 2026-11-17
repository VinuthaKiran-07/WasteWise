from __future__ import annotations

from pathlib import Path
from typing import Optional

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from train import MODEL_PATH, train_model
from preprocess import request_frame

app = FastAPI(title="WasteWise ML Service", version="1.0.0")
bundle: Optional[dict] = None


class PredictionInput(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    expected_attendance: float = Field(ge=0)
    is_holiday: int = Field(ge=0, le=1)
    is_exam_day: int = Field(ge=0, le=1)
    is_special_event: int = Field(ge=0, le=1)
    previous_day_demand: float = Field(ge=0)
    previous_week_demand: float = Field(ge=0)
    rolling_average: float = Field(ge=0)


def load_bundle() -> dict:
    global bundle
    if bundle is None:
        if not MODEL_PATH.exists():
            bundle = train_model()
        else:
            bundle = joblib.load(MODEL_PATH)
    return bundle


@app.on_event("startup")
def startup() -> None:
    load_bundle()


@app.get("/health")
def health() -> dict:
    current = load_bundle()
    return {"status": "ok", "model_version": current.get("model_version", "unknown"), "metrics": current.get("metrics", {})}


@app.post("/predict")
def predict(payload: PredictionInput) -> dict:
    try:
        current = load_bundle()
        value = float(current["model"].predict(request_frame(payload.model_dump()))[0])
        return {"predicted_meals": max(0, round(value)), "model_version": current.get("model_version", "unknown")}
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Prediction failed: {error}") from error

