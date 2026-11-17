from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).parent / "models" / "wastewise_model.joblib"

if __name__ == "__main__":
    bundle = joblib.load(MODEL_PATH)
    print(bundle.get("metrics", {}))

