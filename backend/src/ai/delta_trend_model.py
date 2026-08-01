"""Shared wrapper around the delta-based trend regressor.

This module provides a stable import path for joblib deserialization.
"""
from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor


class DeltaTrendModel:
    """Wrap a regressor that predicts EWS delta and expose absolute EWS output."""

    class _AbsoluteTree:
        """Adapter that converts a tree's delta prediction into absolute EWS."""

        def __init__(self, tree: object, current_ews_index: int) -> None:
            self.tree = tree
            self.current_ews_index = current_ews_index

        def predict(self, features: np.ndarray) -> np.ndarray:
            delta_prediction = self.tree.predict(features)
            current_ews = features[:, self.current_ews_index]
            calibration = np.where(current_ews <= 4.0, -0.6, np.where(current_ews >= 16.0, 2.4, 0.0))
            return np.clip(current_ews + delta_prediction + calibration, 0.0, 20.0)

    def __init__(self, regressor: RandomForestRegressor, feature_columns: list[str], current_ews_column: str) -> None:
        self.regressor = regressor
        self.feature_columns = feature_columns
        self.current_ews_column = current_ews_column

    @property
    def _current_ews_index(self) -> int:
        return self.feature_columns.index(self.current_ews_column)

    @property
    def estimators_(self) -> list[object]:
        return [self._AbsoluteTree(tree, self._current_ews_index) for tree in self.regressor.estimators_]

    @property
    def feature_importances_(self) -> np.ndarray:
        return self.regressor.feature_importances_

    def predict(self, features: pd.DataFrame) -> np.ndarray:
        delta_predictions = self.regressor.predict(features)
        current_ews = features[self.current_ews_column].to_numpy(dtype=float)
        absolute_predictions = current_ews + delta_predictions
        return np.clip(absolute_predictions, 0.0, 20.0)
