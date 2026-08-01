import axios from 'axios';
import { TrendReading } from '../types';

export interface TrendPrediction {
  currentEWS: number;
  predictedEWS30Min: number;
  trend: string;
  confidence: number;
}

export interface TrendPredictionResponse {
  success: boolean;
  prediction: TrendPrediction;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function predictTrend(readings: TrendReading[], currentRiskScore?: number): Promise<TrendPrediction> {
  const response = await axios.post<TrendPredictionResponse>(`${API_BASE_URL}/api/ai/trend`, {
    readings: readings.map((reading) => ({
      timestamp: reading.timestamp,
      pulse: reading.pulse,
      bpSys: reading.bpSys,
      bpDia: reading.bpDia,
      temperature: reading.temperature,
      spo2: reading.spo2,
      respiration: reading.respiration,
      ews: reading.ews,
    })),
    currentRiskScore,
  });

  if (!response.data?.success || !response.data.prediction) {
    throw new Error('Prediction response was not successful.');
  }

  return response.data.prediction;
}
