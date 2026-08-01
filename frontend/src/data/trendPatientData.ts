import { TrendReading } from '../types';

interface TrendPatientDataset {
  patientId: string;
  readings: TrendReading[];
}

export const TREND_PATIENT_DATA: TrendPatientDataset[] = [
  {
    patientId: 'PHC-003',
    readings: [
      {
        timestamp: '10:00 AM',
        pulse: 88,
        bpSys: 118,
        bpDia: 76,
        temperature: 37.0,
        spo2: 98,
        respiration: 18,
        ews: 5,
      },
      {
        timestamp: '12:00 PM',
        pulse: 90,
        bpSys: 120,
        bpDia: 78,
        temperature: 38.1,
        spo2: 98,
        respiration: 18,
        ews: 5,
      },
      {
        timestamp: '2:00 PM',
        pulse: 93,
        bpSys: 124,
        bpDia: 80,
        temperature: 38.8,
        spo2: 97,
        respiration: 19,
        ews: 5,
      },
    ],
  },
  {
    patientId: '#4902',
    readings: [
      {
        timestamp: '08:00 AM',
        pulse: 92,
        bpSys: 118,
        bpDia: 76,
        temperature: 38.0,
        spo2: 94,
        respiration: 22,
        ews: 8,
      },
      {
        timestamp: '10:00 AM',
        pulse: 96,
        bpSys: 120,
        bpDia: 78,
        temperature: 38.4,
        spo2: 92,
        respiration: 24,
        ews: 10,
      },
      {
        timestamp: '12:00 PM',
        pulse: 102,
        bpSys: 126,
        bpDia: 82,
        temperature: 39.1,
        spo2: 90,
        respiration: 26,
        ews: 14,
      },
    ],
  },
  {
    patientId: '#5118',
    readings: [
      {
        timestamp: '06:00 AM',
        pulse: 72,
        bpSys: 118,
        bpDia: 76,
        temperature: 37.0,
        spo2: 99,
        respiration: 16,
        ews: 2,
      },
      {
        timestamp: '09:00 AM',
        pulse: 70,
        bpSys: 116,
        bpDia: 74,
        temperature: 36.9,
        spo2: 99,
        respiration: 15,
        ews: 2,
      },
      {
        timestamp: '12:00 PM',
        pulse: 68,
        bpSys: 114,
        bpDia: 74,
        temperature: 36.8,
        spo2: 99,
        respiration: 14,
        ews: 1,
      },
    ],
  },
  {
    patientId: '#5220',
    readings: [
      {
        timestamp: '01:00 PM',
        pulse: 86,
        bpSys: 132,
        bpDia: 86,
        temperature: 37.8,
        spo2: 95,
        respiration: 18,
        ews: 6,
      },
      {
        timestamp: '02:00 PM',
        pulse: 88,
        bpSys: 132,
        bpDia: 85,
        temperature: 37.6,
        spo2: 95,
        respiration: 18,
        ews: 5,
      },
      {
        timestamp: '03:00 PM',
        pulse: 90,
        bpSys: 134,
        bpDia: 84,
        temperature: 37.4,
        spo2: 96,
        respiration: 17,
        ews: 4,
      },
    ],
  },
];
