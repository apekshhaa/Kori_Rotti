"""Train a regression model that predicts future patient deterioration trend.

This script reads the flattened sequence dataset, trains a RandomForestRegressor,
prints evaluation metrics, and persists the fitted artifact for later inference.
"""
from __future__ import annotations

from math import sqrt
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from delta_trend_model import DeltaTrendModel


ROOT_DIR = Path(__file__).resolve().parent
DATA_PATH = ROOT_DIR / "data" / "vitals_dataset.csv"
MODEL_DIR = ROOT_DIR / "models"
MODEL_PATH = MODEL_DIR / "trend_model.pkl"
TARGET_COLUMN = "futureEWS"


REFERENCE_PATIENTS = [
    {
        "name": "Healthy patient",
        "patient": {
            "readings": [
                {"pulse": 78, "bpSys": 120, "bpDia": 80, "temperature": 36.8, "spo2": 99, "respiration": 16, "ews": 2},
                {"pulse": 80, "bpSys": 121, "bpDia": 80, "temperature": 36.9, "spo2": 99, "respiration": 16, "ews": 2},
                {"pulse": 81, "bpSys": 122, "bpDia": 80, "temperature": 36.9, "spo2": 99, "respiration": 16, "ews": 2},
            ]
        },
        "expected_trend": "Stable",
        "expected_min": 1.0,
        "expected_max": 3.5,
    },
    {
        "name": "Deteriorating patient",
        "patient": {
            "readings": [
                {"pulse": 90, "bpSys": 120, "bpDia": 80, "temperature": 37.2, "spo2": 98, "respiration": 18, "ews": 4},
                {"pulse": 98, "bpSys": 126, "bpDia": 82, "temperature": 37.8, "spo2": 96, "respiration": 20, "ews": 8},
                {"pulse": 110, "bpSys": 138, "bpDia": 88, "temperature": 38.5, "spo2": 93, "respiration": 24, "ews": 14},
            ]
        },
        "expected_trend": "Increasing",
        "expected_min": 14.5,
        "expected_max": 20.0,
    },
    {
        "name": "Critical patient",
        "patient": {
            "readings": [
                {"pulse": 120, "bpSys": 160, "bpDia": 100, "temperature": 39.0, "spo2": 90, "respiration": 26, "ews": 17},
                {"pulse": 126, "bpSys": 165, "bpDia": 102, "temperature": 39.4, "spo2": 88, "respiration": 28, "ews": 18},
                {"pulse": 132, "bpSys": 170, "bpDia": 105, "temperature": 40.0, "spo2": 86, "respiration": 31, "ews": 19},
            ]
        },
        "expected_trend": "Increasing",
        "expected_min": 18.0,
        "expected_max": 20.0,
    },
]


def print_feature_importances(model: RandomForestRegressor, feature_columns: list[str]) -> None:
    """Print feature importances from highest to lowest for explainability."""
    importances = sorted(
        zip(feature_columns, model.feature_importances_),
        key=lambda item: item[1],
        reverse=True,
    )

    print("Feature importance:")
    for feature_name, importance in importances:
        print(f"{feature_name}: {importance:.4f}")


def evaluate_reference_patients() -> None:
    """Run the trained model against the three manual clinical sanity checks."""
    from predict import predict_trend

    print("Reference patient validation:")
    for case in REFERENCE_PATIENTS:
        result = predict_trend(case["patient"])
        trend_ok = result["trend"] == case["expected_trend"]
        score_ok = case["expected_min"] <= result["predictedEWS30Min"] <= case["expected_max"]
        status = "PASS" if trend_ok and score_ok else "FAIL"
        print(
            f"- {case['name']}: trend={result['trend']}, predictedEWS30Min={result['predictedEWS30Min']:.1f}, "
            f"confidence={result['confidence']:.3f}, {status}"
        )


def main() -> None:
    """Load data, train the regressor, evaluate it, and save the model."""
    dataset = pd.read_csv(DATA_PATH)

    feature_columns = [column for column in dataset.columns if column != TARGET_COLUMN]
    features = dataset[feature_columns]
    current_ews = dataset["reading3_ews"]
    target_delta = dataset[TARGET_COLUMN] - current_ews

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target_delta,
        test_size=0.2,
        random_state=42,
    )

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    current_ews_train = x_train["reading3_ews"].to_numpy(dtype=float)
    positive_delta = np.clip(y_train.to_numpy(dtype=float), 0.0, None)
    sample_weights = 1.0 + np.clip(np.abs(y_train.to_numpy(dtype=float) - 10.0) / 4.0, 0.0, 2.0)
    sample_weights += np.clip((current_ews_train - 10.0) / 2.0, 0.0, 5.0)
    sample_weights += np.clip(positive_delta / 2.0, 0.0, 4.0)
    model.fit(x_train, y_train, sample_weight=sample_weights)

    wrapped_model = DeltaTrendModel(model, feature_columns=feature_columns, current_ews_column="reading3_ews")
    predictions = wrapped_model.predict(x_test)
    absolute_target = dataset.loc[x_test.index, TARGET_COLUMN]
    mae = mean_absolute_error(absolute_target, predictions)
    rmse = sqrt(mean_squared_error(absolute_target, predictions))
    r2 = r2_score(absolute_target, predictions)

    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R²: {r2:.4f}")
    print_feature_importances(wrapped_model, feature_columns)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": wrapped_model,
            "feature_columns": feature_columns,
        },
        MODEL_PATH,
    )
    print(f"Saved model to {MODEL_PATH}")
    evaluate_reference_patients()


if __name__ == "__main__":
    main()
