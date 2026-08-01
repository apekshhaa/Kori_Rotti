import { Patient } from '../types';

export interface BackendVitals {
  pulse?: number;
  heartRate?: number;
  systolic_bp?: number;
  systolicBP?: number;
  systolicBp?: number;
  diastolic_bp?: number;
  diastolicBP?: number;
  diastolicBp?: number;
  temperature?: number;
  temp?: number;
  tempUnit?: string;
  spo2?: number;
  spO2?: number;
  respiration?: number;
  respiratoryRate?: number;
}

export interface BackendReferral {
  id?: string;
  referralId?: string;
  _id?: string;
  patientId?: string;
  patientName?: string;
  name?: string;
  age?: number;
  gender?: string;
  phc?: string;
  referringFacility?: string;
  timestamp?: number | string;
  riskScore?: number;
  riskLevel?: string;
  risk?: {
    score?: number;
    level?: string;
  };
  newsScore?: number;
  vitals?: BackendVitals;
  caregiverFlags?: string[];
  caregiverObservations?: string[];
  hospitalId?: string;
  status?: string; // 'sent' | 'acknowledged' | 'arrived' | 'checked_in'
  referralStatus?: string;
  eta?: number; // minutes
  recommendedActions?: string[];
  checklistItems?: string[];
  completedChecklist?: string[];
  acknowledgementDeadline?: number | string;
  acknowledgedAt?: number | string | Date;
  arrivedAt?: number | string | Date;
  checkedInAt?: number | string | Date;
  createdAt?: number | string | Date;
  statusUpdatedAt?: number | string | Date;
  aiDecision?: string;
  aiReason?: string;
  aiConfidence?: number;
  aiExplanation?: string[];
  aiRecommendedHospitalId?: string;
  aiRecommendedHospitalName?: string;
  historyScores?: { time: string; score: number }[];
}

export interface CaregiverObservation {
  id: string;
  patientId?: string;
  patientName?: string;
  text: string;
  timestamp: string | Date;
  observedBy?: string;
}

export interface NormalizedReferral {
  id: string;
  referralId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  phc: string;
  timestamp: number;
  formattedTime: string;
  riskScore: number;
  riskLevel: 'URGENT' | 'WATCH' | 'LOW';
  vitals: {
    pulse: number;
    systolic_bp: number;
    diastolic_bp: number;
    temperature: number;
    tempUnit: string;
    spo2: number;
    respiration: number;
  };
  caregiverFlags: string[];
  caregiverObservations: CaregiverObservation[];
  hospitalId: string;
  status: 'sent' | 'acknowledged' | 'arrived' | 'checked_in';
  eta: number | null; // minutes
  formattedEta: string;
  recommendedActions: string[];
  checklistItems: string[];
  completedChecklist: string[];
  acknowledgementDeadline: number | null;
  aiDecision: string | null;
  aiReason: string | null;
  aiConfidence: number | null;
  aiExplanation: string[];
  aiRecommendedHospitalId: string | null;
  aiRecommendedHospitalName: string | null;
  trend?: { time: string; score: number; pulse?: number; spo2?: number; respiration?: number }[];
  timeline: { time: string; label: string }[];
  patientToken?: string;
}

export function getPublicAppUrl(): string {
  const configuredUrl = (import.meta.env.VITE_PUBLIC_APP_URL || import.meta.env.PUBLIC_APP_URL || '').trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return window.location.origin.replace(/\/$/, '');
  }

  return '';
}

export function generateCaregiverUrl(patientToken: string): string {
  const baseUrl = getPublicAppUrl();
  if (!baseUrl) {
    return '';
  }

  return `${baseUrl}/caregiver/${encodeURIComponent(patientToken)}`;
}

export function isPublicAppUrlConfigured(): boolean {
  return Boolean(getPublicAppUrl());
}

function formatTimelineTime(value?: number | string | Date | null): string {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  const parsed = value instanceof Date
    ? value.getTime()
    : typeof value === 'number'
      ? value
      : Date.parse(String(value));

  if (Number.isNaN(parsed)) {
    return '—';
  }

  return new Date(parsed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildTimeline(raw: BackendReferral, status: 'sent' | 'acknowledged' | 'arrived' | 'checked_in', formattedEta: string) {
  const sentAt = raw.timestamp ?? raw.createdAt ?? raw.statusUpdatedAt ?? Date.now();
  const acknowledgedAt = raw.acknowledgedAt || raw.statusUpdatedAt || null;
  const arrivedAt = raw.arrivedAt || (status === 'arrived' || status === 'checked_in' ? raw.statusUpdatedAt : null);
  const checkedInAt = raw.checkedInAt || (status === 'checked_in' ? raw.statusUpdatedAt : null);

  const timeline = [
    { time: formatTimelineTime(sentAt), label: 'Risk threshold crossed' },
    { time: formatTimelineTime(sentAt), label: 'Referral sent' },
    { time: formatTimelineTime(sentAt), label: 'Hospital received alert' },
  ];

  if (acknowledgedAt) {
    timeline.push({ time: formatTimelineTime(acknowledgedAt), label: 'Hospital acknowledged' });
  }

  if (arrivedAt) {
    timeline.push({ time: formatTimelineTime(arrivedAt), label: 'Patient arrived' });
  } else if (status === 'arrived' || status === 'checked_in') {
    timeline.push({ time: formatTimelineTime(sentAt), label: 'Patient arrived' });
  }

  if (checkedInAt) {
    timeline.push({ time: formatTimelineTime(checkedInAt), label: 'Patient checked in' });
  } else if (status === 'checked_in') {
    timeline.push({ time: formatTimelineTime(sentAt), label: 'Patient checked in' });
  } else if (status !== 'checked_in') {
    timeline.push({ time: `Expected ${formattedEta}`, label: 'Patient arrival' });
  }

  return timeline;
}

/**
 * Normalizes backend responses into a unified referral model.
 */
export function normalizeReferral(raw: BackendReferral): NormalizedReferral {
  const id = raw.id || raw.referralId || raw._id || `REF-${Math.floor(1000 + Math.random() * 9000)}`;
  const referralId = raw.referralId || id;
  const patientId = raw.patientId || raw.id || 'PHC-003';
  const patientName = raw.patientName || raw.name || 'Lakshmi';
  const age = raw.age ?? 62;
  const gender = raw.gender || 'Female';
  const phc = raw.phc || raw.referringFacility || 'Demo Rural PHC';

  let timestamp = Date.now();
  if (typeof raw.timestamp === 'number') {
    timestamp = raw.timestamp;
  } else if (typeof raw.timestamp === 'string') {
    const parsed = Date.parse(raw.timestamp);
    if (!isNaN(parsed)) timestamp = parsed;
  }

  const dateObj = new Date(timestamp);
  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Risk Score & Level
  const riskScore = raw.riskScore ?? raw.risk?.score ?? raw.newsScore ?? 18;
  let rawLevel = (raw.riskLevel || raw.risk?.level || '').toUpperCase();
  if (!rawLevel) {
    if (riskScore >= 12) rawLevel = 'URGENT';
    else if (riskScore >= 5) rawLevel = 'WATCH';
    else rawLevel = 'LOW';
  } else if (rawLevel === 'HIGH RISK' || rawLevel === 'HIGH') {
    rawLevel = 'URGENT';
  } else if (rawLevel === 'MODERATE' || rawLevel === 'STABLE') {
    rawLevel = 'WATCH';
  }

  const riskLevel = (['URGENT', 'WATCH', 'LOW'].includes(rawLevel) ? rawLevel : 'URGENT') as 'URGENT' | 'WATCH' | 'LOW';

  // Vitals
  const v = raw.vitals || {};
  const vitals = {
    pulse: v.pulse ?? v.heartRate ?? 115,
    systolic_bp: v.systolic_bp ?? v.systolicBP ?? v.systolicBp ?? 160,
    diastolic_bp: v.diastolic_bp ?? v.diastolicBP ?? v.diastolicBp ?? 95,
    temperature: v.temperature ?? v.temp ?? 38.5,
    tempUnit: v.tempUnit || '°C',
    spo2: v.spo2 ?? v.spO2 ?? 92,
    respiration: v.respiration ?? v.respiratoryRate ?? 26,
  };

  // Caregiver flags
  let caregiverFlags: string[] = [];
  if (Array.isArray(raw.caregiverFlags) && raw.caregiverFlags.length > 0) {
    caregiverFlags = raw.caregiverFlags;
  } else if (Array.isArray(raw.caregiverObservations) && raw.caregiverObservations.length > 0) {
    caregiverFlags = raw.caregiverObservations;
  } else {
    caregiverFlags = ['Breathing harder'];
  }

  const hospitalId = raw.hospitalId || 'dist-hospital-1';
  const status = (raw.referralStatus || raw.status || 'sent').toLowerCase() as 'sent' | 'acknowledged' | 'arrived' | 'checked_in';
  const patientToken = (raw as any).patientToken || (raw as any).id || (raw as any).referralId || (raw as any).patientId || '';

  const caregiverObservations: CaregiverObservation[] = Array.isArray((raw as any).caregiverObservations)
    ? (raw as any).caregiverObservations
        .map((item: any) => ({
          id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          patientId: item.patientId,
          patientName: item.patientName,
          text: item.text || item.observation || '',
          timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
          observedBy: item.observedBy || 'Caregiver',
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  // ETA formatting
  const eta = raw.eta !== undefined && raw.eta !== null ? Number(raw.eta) : 75;
  let formattedEta = 'ETA unavailable';
  if (eta !== null && !isNaN(eta)) {
    if (eta >= 60) {
      const hours = Math.floor(eta / 60);
      const mins = eta % 60;
      formattedEta = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else if (eta > 0) {
      formattedEta = `${eta} min`;
    } else {
      formattedEta = 'Arrived';
    }
  }

  // Recommended actions (preparation checklist)
  const recommendedActions = raw.recommendedActions && raw.recommendedActions.length > 0
    ? raw.recommendedActions
    : [
        'Prepare appropriate monitored bed/area',
        'Check oxygen/support equipment availability',
        'Alert receiving clinical team',
        'Review referral information',
      ];

  const checklistItems = Array.isArray(raw.checklistItems) && raw.checklistItems.length > 0
    ? raw.checklistItems
    : recommendedActions;

  const completedChecklist = Array.isArray(raw.completedChecklist) ? raw.completedChecklist : [];
  const acknowledgementDeadline = typeof raw.acknowledgementDeadline === 'number'
    ? raw.acknowledgementDeadline
    : typeof raw.acknowledgementDeadline === 'string'
      ? Date.parse(raw.acknowledgementDeadline)
      : Date.now() + 10 * 60 * 1000;

  const timeline = buildTimeline(raw, status, formattedEta);

  return {
    id,
    referralId,
    patientId,
    patientName,
    age,
    gender,
    phc,
    timestamp,
    formattedTime,
    riskScore,
    riskLevel,
    vitals,
    caregiverFlags,
    caregiverObservations,
    hospitalId,
    status,
    eta,
    formattedEta,
    recommendedActions,
    checklistItems,
    completedChecklist,
    acknowledgementDeadline,
    aiDecision: raw.aiDecision || null,
    aiReason: raw.aiReason || null,
    aiConfidence: raw.aiConfidence ?? null,
    aiExplanation: raw.aiExplanation || [],
    aiRecommendedHospitalId: raw.aiRecommendedHospitalId || null,
    aiRecommendedHospitalName: raw.aiRecommendedHospitalName || null,
    timeline,
    patientToken,
  };
}

// Local mock referrals state for demo fallback
const MOCK_REFERRALS: BackendReferral[] = [
  {
    id: 'REF-2024-082',
    patientId: 'PHC-003',
    patientName: 'Lakshmi',
    age: 62,
    gender: 'Female',
    phc: 'Demo Rural PHC',
    timestamp: Date.now() - 15 * 60 * 1000,
    riskScore: 18,
    riskLevel: 'URGENT',
    vitals: {
      heartRate: 115,
      spO2: 92,
      temperature: 38.5,
      tempUnit: '°C',
      systolicBp: 160,
      diastolicBp: 95,
      respiratoryRate: 26,
    },
    caregiverFlags: ['Breathing harder'],
    hospitalId: 'dist-hospital-1',
    status: 'sent',
    eta: 75,
    recommendedActions: [
      'Prepare appropriate monitored bed/area',
      'Check oxygen/support equipment availability',
      'Alert receiving clinical team',
      'Review referral information',
    ],
  },
  {
    id: 'REF-2024-091',
    patientId: '#4902',
    patientName: 'Ramesh Patel',
    age: 54,
    gender: 'Male',
    phc: 'Anugraha PHC',
    timestamp: Date.now() - 45 * 60 * 1000,
    riskScore: 14,
    riskLevel: 'URGENT',
    vitals: {
      heartRate: 128,
      spO2: 88,
      temperature: 38.4,
      tempUnit: '°C',
      systolicBp: 92,
      diastolicBp: 60,
      respiratoryRate: 26,
    },
    caregiverFlags: ['Chest discomfort', 'High fever'],
    hospitalId: 'dist-hospital-1',
    status: 'acknowledged',
    eta: 35,
    recommendedActions: [
      'Prepare resuscitation room',
      'Alert trauma/cardiology registrar',
      'Ready IV access & continuous O2',
    ],
  },
  {
    id: 'REF-2024-095',
    patientId: '#5220',
    patientName: 'Anand Kumar',
    age: 68,
    gender: 'Male',
    phc: 'Kudpu Community Sub-center',
    timestamp: Date.now() - 90 * 60 * 1000,
    riskScore: 6,
    riskLevel: 'WATCH',
    vitals: {
      heartRate: 98,
      spO2: 94,
      temperature: 37.8,
      tempUnit: '°C',
      systolicBp: 138,
      diastolicBp: 88,
      respiratoryRate: 20,
    },
    caregiverFlags: ['Persistent cough'],
    hospitalId: 'dist-hospital-1',
    status: 'sent',
    eta: 90,
    recommendedActions: [
      'Assign general observation bed',
      'Schedule routine lab work',
    ],
  },
];

let inMemoryReferrals = [...MOCK_REFERRALS];

export async function fetchIncomingReferrals(): Promise<{
  referrals: NormalizedReferral[];
  isMock: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/referrals/incoming', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        referrals: [],
        isMock: false,
        error: `Referral API error ${res.status}: ${errorText}`,
      };
    }

    const data = await res.json();
    const rawList: BackendReferral[] = Array.isArray(data) ? data : data.referrals || [];
    const normalized = rawList.map(normalizeReferral);
    return { referrals: normalized, isMock: false };
  } catch (err) {
    return {
      referrals: [],
      isMock: false,
      error: 'Unable to connect to referral API.',
    };
  }
}

export async function updateReferralStatus(
  referralId: string,
  status: 'acknowledged' | 'arrived' | 'checked_in'
): Promise<{ success: boolean; isMock: boolean }> {
  // Update local memory copy
  inMemoryReferrals = inMemoryReferrals.map((r) =>
    (r.id === referralId || r.referralId === referralId || r.patientId === referralId)
      ? { ...r, status }
      : r
  );

  try {
    const encodedId = encodeURIComponent(referralId);
    const res = await fetch(`/api/referrals/${encodedId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      return { success: true, isMock: false };
    }

    const errorText = await res.text();
    console.error('Referral status update failed:', res.status, errorText);
    return { success: false, isMock: false };
  } catch (err) {
    // API unavailable - fallback worked locally
  }

  return { success: true, isMock: true };
}

/**
 * Update completed checklist on the backend
 */
export async function updateReferralChecklistApi(referralId: string, completedChecklist: string[]): Promise<{ success: boolean; isMock: boolean }> {
  try {
    const encodedId = encodeURIComponent(referralId);
    const res = await fetch(`${API_BASE_URL}/api/referrals/${encodedId}/checklist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedChecklist }),
    });

    if (res.ok) return { success: true, isMock: false };
    return { success: false, isMock: false };
  } catch (err) {
    return { success: true, isMock: true };
  }
}

export async function deleteReferral(
  referralId: string
): Promise<{ success: boolean; isMock: boolean }> {
  inMemoryReferrals = inMemoryReferrals.filter(
    (r) => r.id !== referralId && r.referralId !== referralId && r.patientId !== referralId
  );

  try {
    const encodedId = encodeURIComponent(referralId);
    const res = await fetch(`/api/referrals/${encodedId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Referral delete failed:', res.status, errorText);
      return { success: false, isMock: false };
    }

    return { success: true, isMock: false };
  } catch (err) {
    // API unavailable - fallback worked locally
  }

  return { success: true, isMock: true };
}

export async function getCaregiverPageData(patientToken: string): Promise<{ success: boolean; referral?: { patientName: string; patientId: string; patientToken?: string }; error?: string }> {
  try {
    const res = await fetch(`/api/referrals/caregiver/${encodeURIComponent(patientToken)}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: errorText || 'Unable to load patient details.' };
    }

    const data = await res.json();
    return { success: true, referral: data.referral };
  } catch (error) {
    return { success: false, error: 'Unable to load patient details.' };
  }
}

export function broadcastObservationUpdate(patientToken?: string): void {
  if (typeof window === 'undefined') return;

  const payload = { patientToken, timestamp: Date.now() };
  try {
    localStorage.setItem('setu_observation_update', JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }

  window.dispatchEvent(new CustomEvent('caregiver-observation-updated', { detail: payload }));
}

export async function submitCaregiverObservation(patientToken: string, patientName: string, text: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/referrals/caregiver/${encodeURIComponent(patientToken)}/observations`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      body: JSON.stringify({ text, patientName, patientToken }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: errorText || 'Unable to submit observation.' };
    }

    broadcastObservationUpdate(patientToken);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unable to submit observation.' };
  }
}

export async function dismissObservation(referralId: string, observationId: string): Promise<{ success: boolean; isMock: boolean }> {
  try {
    const encodedId = encodeURIComponent(referralId);
    const res = await fetch(`/api/referrals/${encodedId}/observations`, {
      method: 'PATCH',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      body: JSON.stringify({ observationId }),
    });

    return { success: res.ok, isMock: false };
  } catch (err) {
    return { success: false, isMock: false };
  }
}

export async function createReferral(patient: Patient, caregiverFlags: string[] = ['Breathing harder']): Promise<{ success: boolean; isMock: boolean; data?: NormalizedReferral }> {
  const patientToken = `${patient.patientId || 'patient'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newRaw: BackendReferral = {
    id: patient.referralRef || `REF-2024-${Math.floor(100 + Math.random() * 900)}`,
    patientId: patient.patientId,
    patientName: patient.patientName,
    age: patient.age || 50,
    gender: patient.gender || 'Female',
    phc: patient.phc || 'Demo Rural PHC',
    timestamp: Date.now(),
    risk: {
      score: patient.newsScore,
      level: patient.newsScore >= 12 ? 'URGENT' : patient.newsScore >= 5 ? 'WATCH' : 'LOW',
    },
    riskScore: patient.newsScore,
    riskLevel: patient.newsScore >= 12 ? 'URGENT' : patient.newsScore >= 5 ? 'WATCH' : 'LOW',
    vitals: {
      pulse: patient.vitals.heartRate,
      heartRate: patient.vitals.heartRate,
      spo2: patient.vitals.spO2,
      spO2: patient.vitals.spO2,
      temperature: patient.vitals.temperature,
      tempUnit: patient.vitals.tempUnit,
      systolic_bp: patient.vitals.systolicBp,
      diastolic_bp: patient.vitals.diastolicBp,
      respiration: patient.vitals.respiratoryRate || 24,
    },
    caregiverFlags,
    caregiverObservations: [],
    patientToken,
    hospitalId: 'dist-hospital-1',
    status: 'sent',
    eta: 75,
    recommendedActions: [
      'Prepare appropriate monitored bed/area',
      'Check oxygen/support equipment availability',
      'Alert receiving clinical team',
      'Review referral information',
    ],
  };

  // Add to in-memory list at top
  inMemoryReferrals = [newRaw, ...inMemoryReferrals];

  try {
    const res = await fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRaw),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, isMock: false, data: normalizeReferral(data) };
    }
  } catch (err) {
    // API unavailable
  }

  return { success: true, isMock: true, data: normalizeReferral(newRaw) };
}

// Hospital data interfaces
export interface HospitalInfo {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalBeds?: number;
  availableBeds?: number;
  specialties?: string[];
}

export interface ReferralRerouteResponse {
  success: boolean;
  newHospitalId?: string;
  newHospital?: HospitalInfo;
  rerouteCount?: number;
  message?: string;
}

// Mock hospital data
const MOCK_HOSPITALS: Record<string, HospitalInfo> = {
  'dist-hospital-1': {
    id: 'dist-hospital-1',
    name: 'District Hospital A',
    phone: '+91-9876543210',
    address: '123 Medical Plaza, City Center',
    totalBeds: 150,
    availableBeds: 12,
    specialties: ['Emergency', 'Cardiology', 'Pulmonology'],
  },
  'dist-hospital-2': {
    id: 'dist-hospital-2',
    name: 'City Medical Center',
    phone: '+91-9876543211',
    address: '456 Health Street, Downtown',
    totalBeds: 200,
    availableBeds: 8,
    specialties: ['Emergency', 'ICU', 'Trauma'],
  },
  'dist-hospital-3': {
    id: 'dist-hospital-3',
    name: 'Regional Health Complex',
    phone: '+91-9876543212',
    address: '789 Wellness Road, North Wing',
    totalBeds: 180,
    availableBeds: 15,
    specialties: ['General', 'Pediatrics', 'Gynecology'],
  },
};

/**
 * Fetch hospital details by hospital ID
 */
export async function fetchHospitalDetails(
  hospitalId: string
): Promise<{ hospital: HospitalInfo | null; error?: string }> {
  try {
    const encodedId = encodeURIComponent(hospitalId);
    const res = await fetch(`${API_BASE_URL}/api/hospitals/${encodedId}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      return { hospital: data };
    }

    // Fallback to mock data
    const mockHospital = MOCK_HOSPITALS[hospitalId];
    if (mockHospital) {
      return { hospital: mockHospital };
    }

    return { hospital: null, error: `Hospital ${hospitalId} not found` };
  } catch (err) {
    // Fallback to mock
    const mockHospital = MOCK_HOSPITALS[hospitalId];
    return { hospital: mockHospital || null };
  }
}

/**
 * Manually reroute a referral to another hospital
 */
export async function manualReroute(
  referralId: string
): Promise<ReferralRerouteResponse> {
  try {
    const encodedId = encodeURIComponent(referralId);
    const res = await fetch(`${API_BASE_URL}/api/referrals/${encodedId}/manual-reroute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        newHospitalId: data.newHospitalId,
        newHospital: data.newHospital,
        rerouteCount: data.rerouteCount,
        message: data.message || 'Rerouting initiated. New hospital will receive alert.',
      };
    }

    const errorText = await res.text();
    return {
      success: false,
      message: `Reroute failed: ${res.status} ${errorText}`,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to reroute service',
    };
  }
}

/**
 * Fetch referral status and hospital info
 */
export async function fetchReferralStatus(
  referralId: string
): Promise<{
  referral: NormalizedReferral | null;
  hospital: HospitalInfo | null;
  rerouteCount?: number;
  error?: string;
}> {
  try {
    const encodedId = encodeURIComponent(referralId);
    const res = await fetch(`${API_BASE_URL}/api/referrals/${encodedId}/status`, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const normalizedReferral = normalizeReferral(data);
      const hospitalDetails = await fetchHospitalDetails(normalizedReferral.hospitalId);
      return {
        referral: normalizedReferral,
        hospital: hospitalDetails.hospital,
        rerouteCount: data.rerouteCount,
      };
    }

    return { referral: null, hospital: null, error: `Referral ${referralId} not found` };
  } catch (err) {
    return { referral: null, hospital: null, error: 'Failed to fetch referral status' };
  }
}
