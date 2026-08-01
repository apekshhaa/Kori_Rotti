export type NavTab = 'dashboard' | 'assessments' | 'analytics';

export type AssessmentSubView = 'referral' | 'news' | 'new-assessment';

export type RiskLevel = 'HIGH RISK' | 'URGENT' | 'STABLE' | 'MODERATE';

export type ThemeMode = 'light' | 'dark';

export interface Vitals {
  heartRate: number; // BPM
  spO2: number; // %
  temperature: number; // °F or °C
  tempUnit: '°F' | '°C';
  systolicBp: number; // mmHg
  diastolicBp?: number; // mmHg
  respiratoryRate?: number; // breaths/min
}

export interface VitalScoreBreakdown {
  label: string;
  value: string;
  unit: string;
  points: number;
  icon: string;
  statusColor: 'error' | 'warning' | 'normal';
}

export interface Patient {
  id: string; // e.g. "PHC-003" or "#4902"
  referralRef?: string; // e.g. "#REF-2024-082"
  name: string;
  age?: number;
  gender?: string;
  photoUrl?: string;
  riskLevel: RiskLevel;
  newsScore: number; // Max 20
  vitals: Vitals;
  caregiverFlags?: string[];
  lastAssessedTime: string;
  targetFacility: string;
  facilityDistance: string;
  referralSent: boolean;
  referralSentTime?: string;
  historyScores: { time: string; score: number }[];
  recommendation: string;
}
