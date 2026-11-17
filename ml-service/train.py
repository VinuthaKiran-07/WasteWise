from __future__ import annotations

import json
from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from generate_demo import OUTPUT, generate
from preprocess import FEATURE_NAMES, feature_matrix, load_records

MODEL_PATH = Path(__file__).parent / "models" / "wastewise_model.joblib"


def train_model() -> dict:
    if not OUTPUT.exists():
        generate()
    frame = load_records(OUTPUT)
    features, target = feature_matrix(frame)
    split_index = max(1, int(len(features) * 0.8))
    x_train, x_test = features.iloc[:split_index], features.iloc[split_index:]
    y_train, y_test = target.iloc[:split_index], target.iloc[split_index:]
    model = RandomForestRegressor(n_estimators=180, random_state=42, min_samples_leaf=2, n_jobs=-1)
    model.fit(x_train, y_train)
    predictions = model.predict(x_test) if len(x_test) else model.predict(x_train)
    truth = y_test if len(y_test) else y_train
    baseline = [float(y_train.mean())] * len(truth)
    metrics = {
        "mae": round(float(mean_absolute_error(truth, predictions)), 3),
        "rmse": round(float(mean_squared_error(truth, predictions) ** 0.5), 3),
        "r2": round(float(r2_score(truth, predictions)), 3) if len(truth) > 1 else None,
        "baseline_mae": round(float(mean_absolute_error(truth, baseline)), 3),
        "training_rows": int(len(frame)),
    }
    bundle = {"model": model, "feature_names": FEATURE_NAMES, "model_version": "v1-rf", "metrics": metrics}
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)
    print(json.dumps(metrics, indent=2))
    print(f"Saved model to {MODEL_PATH}")
    return bundle


if __name__ == "__main__":
    train_model()

