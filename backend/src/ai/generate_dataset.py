"""Generate synthetic patient vital sign sequences for trend forecasting.

The dataset models 30-minute EWS trend prediction from the previous three vital
readings. It intentionally avoids diagnosis or classification.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
OUTPUT_PATH = DATA_DIR / "vitals_dataset.csv"
SAMPLE_COUNT = 10_000
RANDOM_SEED = 42

TRAJECTORY_WEIGHTS = (
    ("stable", 0.40),
    ("slow_deterioration", 0.30),
    ("rapid_deterioration", 0.20),
    ("improving", 0.10),
)


def clamp(value: float, lower: float, upper: float) -> float:
    """Keep generated values in a realistic physiological range."""
    return float(max(lower, min(upper, value)))


def pulse_score(pulse: float) -> int:
    if pulse <= 40:
        return 3
    if pulse <= 50:
        return 2
    if pulse <= 90:
        return 0
    if pulse <= 110:
        return 1
    if pulse <= 130:
        return 2
    return 3


def systolic_score(bp_sys: float) -> int:
    if bp_sys <= 70:
        return 3
    if bp_sys <= 80:
        return 2
    if bp_sys <= 90:
        return 1
    if bp_sys <= 100:
        return 0
    if bp_sys <= 110:
        return 1
    return 0


def diastolic_score(bp_dia: float) -> int:
    if bp_dia <= 45:
        return 2
    if bp_dia <= 55:
        return 1
    if bp_dia <= 90:
        return 0
    if bp_dia <= 100:
        return 1
    return 2


def temperature_score(temperature: float) -> int:
    if temperature <= 35.0:
        return 3
    if temperature <= 36.0:
        return 1
    if temperature <= 38.0:
        return 0
    if temperature <= 39.0:
        return 1
    return 2


def spo2_score(spo2: float) -> int:
    if spo2 <= 91:
        return 3
    if spo2 <= 93:
        return 2
    if spo2 <= 95:
        return 1
    return 0


def respiration_score(respiration: float) -> int:
    if respiration <= 8:
        return 3
    if respiration <= 11:
        return 1
    if respiration <= 20:
        return 0
    if respiration <= 24:
        return 2
    return 3


def calculate_ews(reading: dict[str, float]) -> int:
    """Approximate an early warning score from a single reading."""
    total = (
        pulse_score(reading["pulse"])
        + systolic_score(reading["bpSys"])
        + diastolic_score(reading["bpDia"])
        + temperature_score(reading["temperature"])
        + spo2_score(reading["spo2"])
        + respiration_score(reading["respiration"])
    )
    return int(clamp(total, 0, 20))


def weighted_choice(rng: np.random.Generator) -> str:
    """Sample a trajectory label using the requested class mix."""
    labels = [label for label, _ in TRAJECTORY_WEIGHTS]
    probabilities = [weight for _, weight in TRAJECTORY_WEIGHTS]
    return str(rng.choice(labels, p=probabilities))


def generate_reading(
    rng: np.random.Generator,
    severity: float,
    shared_instability: float,
    previous_reading: dict[str, float] | None,
    direction: float,
) -> dict[str, float]:
    """Create one synthetic vital reading with correlated physiological noise."""
    pulse_center = 76 + severity * 22 + shared_instability * 2.2
    bp_sys_center = 130 - severity * 14.5 - shared_instability * 1.9
    bp_dia_center = 82 - severity * 7.2 - shared_instability * 1.1
    temperature_center = 36.5 + severity * 0.75 + shared_instability * 0.05
    spo2_center = 98 - severity * 5.0 - shared_instability * 1.0
    respiration_center = 15 + severity * 4.1 + shared_instability * 0.9

    if previous_reading is not None:
        pulse_center = 0.58 * previous_reading["pulse"] + 0.42 * pulse_center
        bp_sys_center = 0.60 * previous_reading["bpSys"] + 0.40 * bp_sys_center
        bp_dia_center = 0.58 * previous_reading["bpDia"] + 0.42 * bp_dia_center
        temperature_center = 0.56 * previous_reading["temperature"] + 0.44 * temperature_center
        spo2_center = 0.60 * previous_reading["spo2"] + 0.40 * spo2_center
        respiration_center = 0.57 * previous_reading["respiration"] + 0.43 * respiration_center

    pulse_center += max(0.0, severity - 1.0) * 2.0
    respiration_center += max(0.0, severity - 0.9) * 1.1
    spo2_center -= max(0.0, severity - 0.8) * 0.8

    pulse = pulse_center + direction * rng.normal(2.0, 0.9) + rng.normal(0.0, 2.3)
    bp_sys = bp_sys_center - direction * rng.normal(1.5, 0.8) + rng.normal(0.0, 3.0)
    bp_dia = bp_dia_center - direction * rng.normal(0.9, 0.6) + rng.normal(0.0, 2.4)
    temperature = temperature_center + direction * rng.normal(0.11, 0.04) + rng.normal(0.0, 0.10)
    spo2 = spo2_center - direction * rng.normal(1.0, 0.5) + rng.normal(0.0, 0.9)
    respiration = respiration_center + direction * rng.normal(0.9, 0.5) + rng.normal(0.0, 0.9)

    reading = {
        "pulse": round(clamp(pulse, 45, 180), 1),
        "bpSys": round(clamp(bp_sys, 65, 190), 1),
        "bpDia": round(clamp(bp_dia, 35, 120), 1),
        "temperature": round(clamp(temperature, 35.0, 41.6), 1),
        "spo2": round(clamp(spo2, 70, 100), 1),
        "respiration": round(clamp(respiration, 8, 40), 1),
    }
    reading["ews"] = calculate_ews(reading)
    return reading


def severity_to_future_ews(
    rng: np.random.Generator,
    future_severity: float,
    future_direction: float,
) -> int:
    """Convert latent future patient state into the target future EWS."""
    future_pulse = 78 + future_severity * 24 + future_direction * rng.normal(1.2, 1.0)
    future_bp_sys = 129 - future_severity * 18 - future_direction * rng.normal(0.8, 0.7)
    future_bp_dia = 82 - future_severity * 9 - future_direction * rng.normal(0.4, 0.5)
    future_temperature = 36.6 + future_severity * 0.95 + future_direction * rng.normal(0.12, 0.05)
    future_spo2 = 98 - future_severity * 6.5 - future_direction * rng.normal(0.9, 0.4)
    future_respiration = 15 + future_severity * 4.8 + future_direction * rng.normal(0.8, 0.5)

    future_reading = {
        "pulse": round(clamp(future_pulse, 45, 180), 1),
        "bpSys": round(clamp(future_bp_sys, 65, 190), 1),
        "bpDia": round(clamp(future_bp_dia, 35, 120), 1),
        "temperature": round(clamp(future_temperature, 35.0, 41.6), 1),
        "spo2": round(clamp(future_spo2, 70, 100), 1),
        "respiration": round(clamp(future_respiration, 8, 40), 1),
    }
    return calculate_ews(future_reading)


def severity_progression(rng: np.random.Generator, trajectory: str) -> tuple[float, float, float]:
    """Create a three-step latent severity path for one patient."""
    if trajectory == "stable":
        base = rng.uniform(0.10, 0.90)
        deltas = (
            rng.normal(0.00, 0.04),
            rng.normal(0.01, 0.04),
            rng.normal(0.00, 0.05),
        )
    elif trajectory == "slow_deterioration":
        base = rng.uniform(0.25, 1.10)
        deltas = (
            rng.normal(0.12, 0.05),
            rng.normal(0.16, 0.06),
            rng.normal(0.20, 0.06),
        )
    elif trajectory == "rapid_deterioration":
        base = rng.uniform(0.55, 1.70)
        deltas = (
            rng.normal(0.26, 0.08),
            rng.normal(0.36, 0.10),
            rng.normal(0.48, 0.11),
        )
    else:
        base = rng.uniform(1.00, 2.45)
        deltas = (
            rng.normal(-0.10, 0.07),
            rng.normal(-0.18, 0.08),
            rng.normal(-0.26, 0.10),
        )

    s1 = clamp(base, 0.0, 3.0)
    s2 = clamp(s1 + deltas[0], 0.0, 3.0)
    s3 = clamp(s2 + deltas[1], 0.0, 3.0)

    if trajectory == "stable" and rng.random() < 0.35:
        s2 = clamp(s1 + rng.normal(0.0, 0.03), 0.0, 3.0)
    if trajectory == "slow_deterioration" and rng.random() < 0.22:
        s2 = clamp(s1 + rng.normal(0.04, 0.04), 0.0, 3.0)
    if trajectory == "rapid_deterioration" and rng.random() < 0.18:
        s2 = clamp(s1 + rng.normal(0.10, 0.05), 0.0, 3.0)
    if trajectory == "improving" and rng.random() < 0.28:
        s2 = clamp(s1 + rng.normal(-0.04, 0.05), 0.0, 3.0)

    if trajectory == "stable":
        s3 = clamp(s2 + rng.normal(0.00, 0.05), 0.0, 3.0)
    elif trajectory == "slow_deterioration":
        s3 = clamp(s2 + rng.normal(0.16, 0.06), 0.0, 3.0)
    elif trajectory == "rapid_deterioration":
        s3 = clamp(s2 + rng.normal(0.34, 0.09), 0.0, 3.0)
    else:
        s3 = clamp(s2 + rng.normal(-0.20, 0.09), 0.0, 3.0)

    return s1, s2, s3


def build_dataset(sample_count: int, seed: int) -> pd.DataFrame:
    """Generate a tabular dataset of three-reading sequences."""
    rng = np.random.default_rng(seed)
    rows: list[dict[str, float]] = []

    for _ in range(sample_count):
        trajectory = weighted_choice(rng)
        severity_1, severity_2, severity_3 = severity_progression(rng, trajectory)
        shared_instability = rng.normal(0.0, 1.0)
        readings: list[dict[str, float]] = []
        previous_reading: dict[str, float] | None = None

        severity_steps = (severity_1, severity_2, severity_3)
        for index, severity in enumerate(severity_steps):
            if trajectory == "stable":
                direction = 0.15
                if index == 1 and rng.random() < 0.40:
                    direction = 0.0
            elif trajectory == "slow_deterioration":
                direction = 0.70
                if index == 1 and rng.random() < 0.25:
                    direction *= 0.35
            elif trajectory == "rapid_deterioration":
                direction = 1.15
                if index == 1 and rng.random() < 0.20:
                    direction *= 0.65
            else:
                direction = -0.95
                if index == 1 and rng.random() < 0.35:
                    direction = -0.25

            if index > 0 and rng.random() < 0.20:
                direction += rng.normal(0.0, 0.18)

            readings.append(
                generate_reading(
                    rng=rng,
                    severity=severity,
                    shared_instability=shared_instability + rng.normal(0.0, 0.35),
                    previous_reading=previous_reading,
                    direction=direction,
                )
            )
            previous_reading = readings[-1]

        trend_signal = (severity_3 - severity_1) + 0.35 * (severity_3 - severity_2)
        physiological_pressure = (
            0.10 * max(0.0, readings[2]["pulse"] - readings[0]["pulse"])
            + 0.22 * max(0.0, readings[0]["spo2"] - readings[2]["spo2"])
            + 0.14 * max(0.0, readings[2]["respiration"] - readings[0]["respiration"])
            + 0.06 * max(0.0, readings[0]["bpSys"] - readings[2]["bpSys"])
            + 0.18 * max(0.0, readings[2]["temperature"] - readings[0]["temperature"])
        )

        if trajectory == "stable":
            future_severity = clamp(severity_3 + rng.normal(0.0, 0.05) + max(0.0, trend_signal) * 0.08, 0.0, 3.0)
        elif trajectory == "slow_deterioration":
            future_severity = clamp(severity_3 + rng.uniform(0.12, 0.34) + max(0.0, trend_signal) * 0.18, 0.0, 3.0)
        elif trajectory == "rapid_deterioration":
            acceleration = max(0.0, trend_signal) * rng.uniform(0.30, 0.55) + rng.uniform(0.20, 0.45)
            future_severity = clamp(severity_3 + acceleration + rng.normal(0.10, 0.10), 0.0, 3.0)
        else:
            intervention_effect = rng.uniform(0.22, 0.55)
            rebound = rng.uniform(-0.05, 0.08)
            future_severity = clamp(severity_3 - intervention_effect + rebound + rng.normal(0.0, 0.08), 0.0, 3.0)

        projected_future_ews = severity_to_future_ews(
            rng=rng,
            future_severity=clamp(future_severity + physiological_pressure * 0.02, 0.0, 3.0),
            future_direction=trend_signal + physiological_pressure * 0.06,
        )

        current_ews = readings[2]["ews"]
        if trajectory == "stable":
            future_ews = current_ews + rng.normal(-0.85, 0.25) + 0.02 * physiological_pressure
            future_ews = clamp(future_ews, 0, 3)
        elif trajectory == "slow_deterioration":
            future_ews = current_ews + rng.uniform(2.0, 4.0) + 0.25 * physiological_pressure + 0.40 * max(0.0, severity_3 - severity_1)
            future_ews = clamp(future_ews, 0, 15)
        elif trajectory == "rapid_deterioration":
            future_ews = current_ews + rng.uniform(5.0, 8.0) + 0.35 * physiological_pressure + 0.65 * max(0.0, severity_3 - severity_1)
            if current_ews >= 15:
                future_ews = 20.0
            future_ews = clamp(future_ews, 0, 20)
        else:
            future_ews = current_ews - rng.uniform(2.0, 5.0) - 0.20 * physiological_pressure - 0.20 * max(0.0, severity_1 - severity_3)
            future_ews = clamp(future_ews, 0, 15)

        future_ews = future_ews + rng.normal(0.0, 0.25)
        future_ews = int(round(clamp(future_ews, 0, 20)))

        row: dict[str, float] = {}
        for index, reading in enumerate(readings, start=1):
            prefix = f"reading{index}_"
            row[f"{prefix}pulse"] = reading["pulse"]
            row[f"{prefix}bpSys"] = reading["bpSys"]
            row[f"{prefix}bpDia"] = reading["bpDia"]
            row[f"{prefix}temperature"] = reading["temperature"]
            row[f"{prefix}spo2"] = reading["spo2"]
            row[f"{prefix}respiration"] = reading["respiration"]
            row[f"{prefix}ews"] = reading["ews"]

        row["futureEWS"] = future_ews
        rows.append(row)

    return pd.DataFrame(rows)


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dataset = build_dataset(SAMPLE_COUNT, RANDOM_SEED)
    dataset.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved synthetic dataset to {OUTPUT_PATH}")
    print(f"Rows: {len(dataset):,}")


if __name__ == "__main__":
    main()
