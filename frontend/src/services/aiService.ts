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

export async function predictTrend(readings: TrendReading[]): Promise<TrendPrediction> {
  const response = await axios.post<TrendPredictionResponse>('/api/ai/trend', {
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
  });

  if (!response.data?.success || !response.data.prediction) {
    throw new Error('Prediction response was not successful.');
  }

  return response.data.prediction;
}
