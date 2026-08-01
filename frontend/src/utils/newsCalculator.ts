import { Vitals, VitalScoreBreakdown } from '../types';

/**
 * Calculates NEWS (National Early Warning Score) points for vital signs
 */
export function calculateNewsPoints(vitals: Vitals): {
  totalScore: number;
  breakdown: VitalScoreBreakdown[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  recommendation: string;
} {
  let totalScore = 0;
  const breakdown: VitalScoreBreakdown[] = [];

  // 1. Heart Rate (bpm)
  let hrPoints = 0;
  const hr = vitals.heartRate;
  if (hr <= 40 || hr >= 131) hrPoints = 3;
  else if (hr >= 111 && hr <= 130) hrPoints = 2;
  else if ((hr >= 41 && hr <= 50) || (hr >= 91 && hr <= 110)) hrPoints = 1;

  totalScore += hrPoints;
  breakdown.push({
    label: 'Heart Rate',
    value: `${hr}`,
    unit: 'bpm',
    points: hrPoints,
    icon: 'favorite',
    statusColor: hrPoints >= 3 ? 'error' : hrPoints >= 1 ? 'warning' : 'normal',
  });

  // 2. SpO2 (%)
  let spo2Points = 0;
  const spo2 = vitals.spO2;
  if (spo2 <= 91) spo2Points = 3;
  else if (spo2 >= 92 && spo2 <= 93) spo2Points = 2;
  else if (spo2 >= 94 && spo2 <= 95) spo2Points = 1;

  totalScore += spo2Points;
  breakdown.push({
    label: 'SpO2 (Oxygen)',
    value: `${spo2}`,
    unit: '%',
    points: spo2Points,
    icon: 'air',
    statusColor: spo2Points >= 3 ? 'error' : spo2Points >= 1 ? 'warning' : 'normal',
  });

  // 3. Systolic BP (mmHg)
  let bpPoints = 0;
  const sys = vitals.systolicBp;
  if (sys <= 90 || sys >= 220) bpPoints = 3;
  else if (sys >= 91 && sys <= 100) bpPoints = 2;
  else if (sys >= 101 && sys <= 110) bpPoints = 1;

  totalScore += bpPoints;
  breakdown.push({
    label: 'Systolic BP',
    value: vitals.diastolicBp ? `${sys}/${vitals.diastolicBp}` : `${sys}`,
    unit: 'mmHg',
    points: bpPoints,
    icon: 'blood_pressure',
    statusColor: bpPoints >= 3 ? 'error' : bpPoints >= 1 ? 'warning' : 'normal',
  });

  // 4. Temperature (°C or converted from °F)
  let tempC = vitals.temperature;
  if (vitals.tempUnit === '°F') {
    tempC = ((vitals.temperature - 32) * 5) / 9;
  }
  let tempPoints = 0;
  if (tempC <= 35.0 || tempC >= 39.1) tempPoints = 3;
  else if (tempC >= 38.1 && tempC <= 39.0) tempPoints = 2;
  else if ((tempC >= 35.1 && tempC <= 36.0) || (tempC >= 37.5 && tempC <= 38.0)) tempPoints = 1;

  totalScore += tempPoints;
  const tempDisplay = vitals.tempUnit === '°F' ? vitals.temperature.toFixed(1) : tempC.toFixed(1);
  breakdown.push({
    label: 'Temperature',
    value: `${tempDisplay}`,
    unit: vitals.tempUnit,
    points: tempPoints,
    icon: 'device_thermostat',
    statusColor: tempPoints >= 3 ? 'error' : tempPoints >= 1 ? 'warning' : 'normal',
  });

  // Urgency classification
  let urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'LOW';
  let recommendation = 'Patient is stable. Continue routine monitoring.';

  if (totalScore >= 7 || hrPoints === 3 || spo2Points === 3 || bpPoints === 3) {
    urgencyLevel = 'URGENT';
    recommendation =
      'The patient exhibits clinical instability. Immediate escalation to Medical Registrar and preparation for intensive care transfer is recommended.';
  } else if (totalScore >= 5) {
    urgencyLevel = 'HIGH';
    recommendation = 'Urgent clinical review required by senior clinician within 30 minutes.';
  } else if (totalScore >= 1) {
    urgencyLevel = 'MEDIUM';
    recommendation = 'Increase monitoring frequency to every 1-2 hours and notify nursing lead.';
  }

  return {
    totalScore,
    breakdown,
    urgencyLevel,
    recommendation,
  };
}
