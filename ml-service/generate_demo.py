from __future__ import annotations

import csv
from datetime import date, timedelta
from pathlib import Path

MEALS = {"Breakfast": 360, "Lunch": 690, "Dinner": 520}
OUTPUT = Path(__file__).parent / "data" / "demo_records.csv"


def generate() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    start = date.today() - timedelta(days=180)
    rows = []
    for index in range(180):
        current = start + timedelta(days=index)
        day = current.weekday()
        is_holiday = int(day >= 5)
        is_exam_day = int(120 <= index <= 140)
        is_special_event = int(index % 31 == 0)
        attendance = round((0.48 if is_holiday else 0.78) * 1000 + ((index * 37) % 120))
        weekday_factor = [0.98, 1.04, 1.01, 1.08, 0.96, 0.42, 0.46][day]
        for meal_type, base in MEALS.items():
            event_factor = 0.88 if is_exam_day else 1.12 if is_special_event else 1
            consumed = max(0, round(base * weekday_factor * event_factor * attendance / 900))
            rows.append({"date": current.isoformat(), "meal_type": meal_type, "consumed": consumed, "attendance": attendance, "is_holiday": is_holiday, "is_exam_day": is_exam_day, "is_special_event": is_special_event})
    with OUTPUT.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} synthetic demo rows at {OUTPUT}")


if __name__ == "__main__":
    generate()

