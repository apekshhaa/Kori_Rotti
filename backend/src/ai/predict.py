"""Run inference against the trained deterioration trend model.

The script expects the most recent three readings for one patient and returns a
JSON-compatible payload with the predicted 30-minute EWS trend and confidence.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from delta_trend_model import DeltaTrendModel


ROOT_DIR = Path(__file__).resolve().parent
MODEL_PATH = ROOT_DIR / "models" / "trend_model.pkl"
DEFAULT_FEATURE_COLUMNS = [
    "reading1_pulse",
    "reading1_bpSys",
    "reading1_bpDia",
    "reading1_temperature",
    "reading1_spo2",
    "reading1_respiration",
    "reading1_ews",
    "reading2_pulse",
    "reading2_bpSys",
    "reading2_bpDia",
    "reading2_temperature",
    "reading2_spo2",
    "reading2_respiration",
    "reading2_ews",
    "reading3_pulse",
    "reading3_bpSys",
    "reading3_bpDia",
    "reading3_temperature",
    "reading3_spo2",
    "reading3_respiration",
    "reading3_ews",
]

TREND_THRESHOLD = 0.75


def load_model_bundle() -> tuple[Any, list[str]]:
    """Load the persisted model and feature ordering."""
    bundle = joblib.load(MODEL_PATH)

    if isinstance(bundle, dict) and "model" in bundle:
        model = bundle["model"]
        feature_columns = bundle.get("feature_columns", DEFAULT_FEATURE_COLUMNS)
        return model, list(feature_columns)

    return bundle, DEFAULT_FEATURE_COLUMNS


def _coerce_reading(reading: dict[str, Any]) -> dict[str, float]:
    """Convert a single reading to numeric values expected by the model."""
    return {
        "pulse": float(reading["pulse"]),
        "bpSys": float(reading["bpSys"]),
        "bpDia": float(reading["bpDia"]),
        "temperature": float(reading["temperature"]),
        "spo2": float(reading["spo2"]),
        "respiration": float(reading["respiration"]),
        "ews": float(reading["ews"]),
    }


def flatten_readings(readings: list[dict[str, Any]], feature_columns: list[str]) -> pd.DataFrame:
    """Convert three nested readings into the single row expected by the model."""
    if len(readings) != 3:
        raise ValueError("Exactly three readings are required.")

    row: dict[str, float] = {}
    for index, reading in enumerate(readings, start=1):
        normalized = _coerce_reading(reading)
        prefix = f"reading{index}_"
        row[f"{prefix}pulse"] = normalized["pulse"]
        row[f"{prefix}bpSys"] = normalized["bpSys"]
        row[f"{prefix}bpDia"] = normalized["bpDia"]
        row[f"{prefix}temperature"] = normalized["temperature"]
        row[f"{prefix}spo2"] = normalized["spo2"]
        row[f"{prefix}respiration"] = normalized["respiration"]
        row[f"{prefix}ews"] = normalized["ews"]

    frame = pd.DataFrame([row])
    return frame[feature_columns]


def compute_confidence(model: Any, features: pd.DataFrame) -> tuple[float, float]:
    """Estimate prediction uncertainty from the tree ensemble spread."""
    numeric_row = features.to_numpy(dtype=float)
    tree_predictions = np.array([tree.predict(numeric_row)[0] for tree in model.estimators_], dtype=float)
    predicted_value = float(tree_predictions.mean())
    spread = float(tree_predictions.std(ddof=0))
    confidence = float(np.clip(np.exp(-spread / 3.5), 0.0, 1.0))
    return predicted_value, confidence


def predict_trend(patient: dict[str, Any]) -> dict[str, Any]:
    """Predict the future EWS for the most recent three vital readings."""
    model, feature_columns = load_model_bundle()

    readings = patient.get("readings")
    if readings is None:
        readings = [patient.get("reading1"), patient.get("reading2"), patient.get("reading3")]
        readings = [reading for reading in readings if reading is not None]

    features = flatten_readings(readings, feature_columns)
    predicted_ews, confidence = compute_confidence(model, features)
    current_ews = float(_coerce_reading(readings[-1])["ews"])
    delta = predicted_ews - current_ews

    if delta > TREND_THRESHOLD:
        trend = "Increasing"
    elif delta < -TREND_THRESHOLD:
        trend = "Improving"
    else:
        trend = "Stable"

    return {
        "currentEWS": int(round(current_ews)),
        "predictedEWS30Min": round(predicted_ews, 1),
        "trend": trend,
        "confidence": round(confidence, 3),
    }

def main() -> None:
    """Read patient JSON from stdin and print the prediction payload."""

    if sys.stdin.isatty():
        raw_input = ""
    else:
        raw_input = sys.stdin.read().strip()

    if raw_input:
        patient_data = json.loads(raw_input)
    else:
        patient_data = {
            "readings": [
                {
                    "pulse": 90,
                    "bpSys": 120,
                    "bpDia": 80,
                    "temperature": 37.2,
                    "spo2": 98,
                    "respiration": 18,
                    "ews": 4,
                },
                {
                    "pulse": 98,
                    "bpSys": 126,
                    "bpDia": 82,
                    "temperature": 37.8,
                    "spo2": 96,
                    "respiration": 20,
                    "ews": 8,
                },
                {
                    "pulse": 110,
                    "bpSys": 138,
                    "bpDia": 88,
                    "temperature": 38.5,
                    "spo2": 93,
                    "respiration": 24,
                    "ews": 14,
                },
            ]
        }

    model, feature_columns = load_model_bundle()

    readings = patient_data.get("readings")
    if readings is None:
        readings = [patient_data.get("reading1"), patient_data.get("reading2"), patient_data.get("reading3")]
        readings = [reading for reading in readings if reading is not None]

    features = flatten_readings(readings, feature_columns)

    predicted_ews, confidence = compute_confidence(model, features)

    current_ews = float(_coerce_reading(readings[-1])["ews"])
    delta = predicted_ews - current_ews

    if delta > TREND_THRESHOLD:
        trend = "Increasing"
    elif delta < -TREND_THRESHOLD:
        trend = "Improving"
    else:
        trend = "Stable"

    result = {
        "currentEWS": int(round(current_ews)),
        "predictedEWS30Min": round(predicted_ews, 1),
        "trend": trend,
        "confidence": round(confidence, 3),
    }
    print(json.dumps(result, indent=4))


if __name__ == "__main__":
    main()
