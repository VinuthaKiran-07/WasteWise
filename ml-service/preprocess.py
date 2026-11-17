from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

FEATURE_NAMES = [
    "day_of_week",
    "expected_attendance",
    "is_holiday",
    "is_exam_day",
    "is_special_event",
    "previous_day_demand",
    "previous_week_demand",
    "rolling_average",
]


def load_records(path: str | Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    required = {"date", "meal_type", "consumed", "attendance", "is_holiday", "is_exam_day", "is_special_event"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame = frame.dropna(subset=["date", "consumed"]).copy()
    frame = frame.sort_values(["meal_type", "date"]).reset_index(drop=True)
    return frame


def add_historical_features(frame: pd.DataFrame) -> pd.DataFrame:
    output = frame.copy()
    output["day_of_week"] = output["date"].dt.dayofweek
    for column in ["attendance", "is_holiday", "is_exam_day", "is_special_event"]:
        output[column] = pd.to_numeric(output[column], errors="coerce").fillna(0)
    output["previous_day_demand"] = output.groupby("meal_type")["consumed"].shift(1)
    output["previous_week_demand"] = output.groupby("meal_type")["consumed"].shift(7)
    output["rolling_average"] = output.groupby("meal_type")["consumed"].transform(lambda values: values.shift(1).rolling(5, min_periods=1).mean())
    group_means = output.groupby("meal_type")["consumed"].transform("mean")
    overall_mean = float(output["consumed"].mean()) if len(output) else 0.0
    for column in ["previous_day_demand", "previous_week_demand", "rolling_average"]:
        output[column] = output[column].fillna(group_means).fillna(overall_mean).fillna(0)
    output["expected_attendance"] = output["attendance"]
    return output


def feature_matrix(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    prepared = add_historical_features(frame)
    return prepared[FEATURE_NAMES].astype(float), prepared["consumed"].astype(float)


def request_frame(payload: dict[str, Any]) -> np.ndarray:
    values = [float(payload.get(name, 0) or 0) for name in FEATURE_NAMES]
    return np.array(values, dtype=float).reshape(1, -1)

