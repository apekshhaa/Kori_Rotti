const db = require('../config/firebase');

const DEFAULT_HOSPITALS = [
  {
    id: 'dist-hospital-1',
    name: 'District Hospital A',
    latitude: 6.9271,
    longitude: 79.8612,
    distance: '8 km',
    estimatedTravelTime: '12 min',
    icuBedsAvailable: true,
    oxygenAvailable: true,
    bloodAvailable: false,
    doctorAvailable: true,
    status: 'ready',
  },
  {
    id: 'dist-hospital-2',
    name: 'City Medical Center',
    latitude: 6.9344,
    longitude: 79.8428,
    distance: '10 km',
    estimatedTravelTime: '16 min',
    icuBedsAvailable: true,
    oxygenAvailable: true,
    bloodAvailable: true,
    doctorAvailable: true,
    status: 'ready',
  },
  {
    id: 'dist-hospital-3',
    name: 'Regional Health Complex',
    latitude: 6.9157,
    longitude: 79.8737,
    distance: '11 km',
    estimatedTravelTime: '20 min',
    icuBedsAvailable: true,
    oxygenAvailable: true,
    bloodAvailable: true,
    doctorAvailable: false,
    status: 'busy',
  },
];

const { getHospitalById, listHospitals } = require('./hospitalService');

// Generate checklist using Ollama or deterministic rules
async function generateChecklist(referral, hospital) {
  const payload = {
    patient: {
      id: referral.patientId || referral.patientId || referral.patientName || 'unknown',
      riskScore: referral.riskScore || referral.risk?.score || 0,
      riskLevel: (referral.riskLevel || referral.risk?.level || '').toString(),
    },
    hospital: hospital || {},
    instruction: 'Return an array of checklist item strings appropriate for this patient and hospital resources.'
  };

  const llm = await callOllama(payload);
  if (llm && Array.isArray(llm.checklist)) {
    return llm.checklist;
  }

  // Fallback deterministic checklist
  const items = [];
  const risk = payload.patient.riskScore || 0;
  // Base items
  items.push('ICU Bed Available');
  items.push('Oxygen Ready');
  items.push('Blood Available');
  items.push('Respiratory Technician Available');
  items.push('Ventilator Ready');

  // If hospital lacks a resource, keep it required so AI can reroute or wait
  return items;
}

function matchResourceToItem(item, hospital) {
  const lower = String(item || '').toLowerCase();
  const root = hospital || {};
  const res = root.resources || root || {};
  const candidates = [root, res].filter(Boolean);

  const lookup = (keys) => {
    for (const candidate of candidates) {
      for (const key of keys) {
        if (candidate && Object.prototype.hasOwnProperty.call(candidate, key)) {
          const value = candidate[key];
          if (value !== undefined && value !== null) {
            return value;
          }
        }
      }
    }
    return undefined;
  };

  const asNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const asBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return ['1', 'true', 'yes', 'y', 'available', 'ready'].includes(normalized);
    }
    return Boolean(value);
  };

  // ICU
  const icuBeds = asNumber(lookup(['icuBeds', 'icuBedsAvailable', 'availableIcuBeds'])) || (res.beds && res.beds.icu && Number(res.beds.icu.available || 0));
  if (lower.includes('icu')) return icuBeds > 0;

  // Oxygen (cylinders or equipment)
  const oxygenCylinders = asNumber(lookup(['oxygenCylinders', 'oxygenAvailable', 'oxygen'])) || (res.equipment && Number(res.equipment.oxymeter?.available || 0));
  if (lower.includes('oxygen')) return oxygenCylinders > 0 || asBoolean(lookup(['oxygenAvailable', 'oxygen'])) || Boolean(res.oxygenAvailable);

  // Blood (blood bank availability)
  const bloodUnits = asNumber(lookup(['bloodTypeOUnits', 'bloodUnits', 'bloodAvailable'])) || (res.supportServices && Number(res.supportServices.bloodBank?.units || 0));
  if (lower.includes('blood')) return bloodUnits > 0 || asBoolean(lookup(['bloodAvailable'])) || Boolean(res.supportServices?.bloodBank?.available);

  // Respiratory techs / teams
  const respiratoryTeam = asBoolean(lookup(['respiratoryTherapistsAvailable', 'respiratoryTherapists', 'respiratoryTeamAvailable'])) || Boolean(res.teams?.respiratory?.available) || Boolean(res.respiratoryTherapists || res.respiratoryTherapistsAvailable);
  if (lower.includes('respiratory')) return respiratoryTeam;

  // Doctor / emergency team
  const doctorAvailable = asBoolean(lookup(['doctorAvailable', 'doctorsAvailable', 'emergencyDoctorAvailable', 'emergencyDoctorsAvailable'])) || Boolean(res.teams?.emergency?.available) || (res.teams && Object.values(res.teams).some((team) => asBoolean(team?.available)));
  if (lower.includes('doctor')) return doctorAvailable;

  // Ventilator
  const ventilators = asNumber(lookup(['ventilators', 'ventilatorsAvailable'])) || Number(res.equipment?.ventilators?.available || 0);
  if (lower.includes('ventilator')) return ventilators > 0 || Boolean(res.ventilatorsAvailable);

  return false;
}

function getOllamaSettings() {
  const configuredHost = process.env.OLLAMA_HOST || process.env.OLLAMA_BASE_URL || '';
  const enabled = process.env.OLLAMA_ENABLED === 'true' || Boolean(configuredHost);

  return {
    enabled,
    host: configuredHost || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
  };
}

async function callOllama(reasoningPayload) {
  const { enabled, host, model } = getOllamaSettings();
  if (!enabled) {
    return null;
  }

  try {
    const response = await fetch(`${host.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        prompt: `You are an autonomous hospital coordination agent. Return structured JSON only.\n${JSON.stringify(reasoningPayload)}`,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.response || '{}';
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// Ask Ollama to evaluate each checklist item given the hospital's resource snapshot.
async function callOllamaEvaluateChecklist(referral, hospital, checklistItems = []) {
  try {
    const payload = {
      task: 'evaluate_checklist',
      referralId: referral?.id || referral?.firestoreId || null,
      patient: {
        id: referral?.patientId || null,
        riskScore: referral?.riskScore || referral?.risk?.score || 0,
        riskLevel: (referral?.riskLevel || referral?.risk?.level || '').toString(),
      },
      hospital: hospital || {},
      checklist: checklistItems,
      instruction: 'Using only the hospital resources provided, return JSON with an `evaluations` map where keys are checklist item strings and values are booleans indicating whether the hospital currently satisfies that item. Return structured JSON only.'
    };

    const result = await callOllama(payload);
    if (!result) return null;

    // Accept multiple possible shapes from the LLM
    if (result.evaluations && typeof result.evaluations === 'object') return result.evaluations;
    if (Array.isArray(result.checklist)) {
      const map = {};
      result.checklist.forEach((it) => {
        if (typeof it === 'string') map[it] = true;
        else if (it && typeof it === 'object') map[it.item || it.name] = Boolean(it.available || it.present || it.available === true);
      });
      return map;
    }

    return null;
  } catch (err) {
    console.warn('Ollama checklist evaluation failed:', err.message);
    return null;
  }
}

function computeReadinessScore(hospital, requiredResources) {
  let score = 60;

  const res = hospital?.resources || hospital || {};
  const icuBeds = (res.beds && res.beds.icu && Number(res.beds.icu.available || 0)) || Number(res.icuBedsAvailable || 0);
  const oxygen = Number(res.oxygenCylinders || 0) || Number(res.equipment?.oxymeter?.available || 0) || Number(res.oxygenAvailable || 0);
  const blood = Number(res.bloodTypeOUnits || 0) || Number(res.supportServices?.bloodBank?.units || 0) || Number(res.bloodAvailable || 0);
  const doctors = Boolean(res.teams?.emergency?.available) || Boolean(res.doctorsAvailable || res.doctorAvailable);
  const ventilators = Number(res.ventilators || 0) || Number(res.equipment?.ventilators?.available || 0);

  if (icuBeds > 0) score += 10;
  if (oxygen > 0) score += 8;
  if (blood > 0) score += 7;
  if (doctors) score += 9;
  if (ventilators > 0) score += 6;
  if (hospital.status === 'ready') score += 5;

  const requiredSet = new Set(requiredResources || []);
  const coverage = [
    icuBeds > 0 && requiredSet.has('icu'),
    oxygen > 0 && requiredSet.has('oxygen'),
    blood > 0 && requiredSet.has('blood'),
    doctors && requiredSet.has('doctor'),
  ].filter(Boolean).length;
  score += coverage * 4;

  return Math.min(100, score);
}

function getReferralDocumentId(referral) {
  return referral?.firestoreId || referral?.documentId || referral?.referralId || referral?.id;
}

function sanitizeReferralPayload(payload = {}) {
  return Object.entries(payload || {}).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function pickBestHospital(referral, hospitals = DEFAULT_HOSPITALS) {
  const requiredResources = referral.requiredResources || ['icu', 'oxygen', 'blood', 'doctor'];
  const scored = hospitals
    .filter((hospital) => hospital.status !== 'offline')
    .map((hospital) => ({
      ...hospital,
      readinessScore: computeReadinessScore(hospital, requiredResources),
    }))
    .sort((a, b) => b.readinessScore - a.readinessScore);

  return scored[0] || hospitals[0];
}

async function evaluateReferralDecision(referral) {
  const deadline = referral.acknowledgementDeadline || referral.deadline || Date.now() + 10 * 60 * 1000;
  const completedChecklist = referral.completedChecklist || [];
  const checklistItems = referral.checklistItems || [];
  const isReady = checklistItems.length > 0 && checklistItems.every((item) => completedChecklist.includes(item));
  const isPastDeadline = Date.now() > deadline;

  if (isReady) {
    return {
      decision: 'acknowledge',
      status: 'ready',
      message: 'Hospital fully prepared. Referral confirmed.',
      confidence: 0.97,
      explanation: ['All preparation checklist items are complete.', 'The hospital is ready for immediate acknowledgement.'],
    };
  }

  const reasoningPayload = {
    referralId: referral.id,
    currentTime: new Date().toISOString(),
    deadline: new Date(deadline).toISOString(),
    checklistItems,
    completedChecklist,
    hospitalId: referral.hospitalId,
    reason: isPastDeadline ? 'Acknowledgement timeout exceeded.' : 'Readiness checklist remains incomplete.',
  };

  const ollamaResult = await callOllama(reasoningPayload);

  if (ollamaResult && ollamaResult.decision === 'reroute') {
    const candidateHospital = pickBestHospital(referral);
    return {
      ...ollamaResult,
      newHospital: {
        id: candidateHospital.id,
        name: candidateHospital.name,
        distance: candidateHospital.distance,
        travelTime: candidateHospital.estimatedTravelTime,
      },
      confidence: Number(ollamaResult.confidence || 0.9),
      explanation: ollamaResult.explanation || [
        'The checklist remains incomplete.',
        'The selected hospital has stronger readiness coverage.',
      ],
    };
  }

  const candidateHospital = pickBestHospital(referral);

  return {
    decision: isPastDeadline ? 'reroute' : 'monitor',
    reason: isPastDeadline
      ? 'Acknowledgement timeout exceeded before the hospital completed the required checklist.'
      : 'Checklist completion is still incomplete and the coordinator is monitoring readiness.',
    newHospital: {
      id: candidateHospital.id,
      name: candidateHospital.name,
      distance: candidateHospital.distance,
      travelTime: candidateHospital.estimatedTravelTime,
    },
    confidence: isPastDeadline ? 0.93 : 0.82,
    explanation: isPastDeadline
      ? ['The acknowledgement deadline passed.', 'Required resources remain unavailable at the current hospital.', 'A better-equipped facility was selected for rerouting.']
      : ['The hospital has not completed the full preparation checklist yet.', 'The coordinator is continuing to monitor the deadline.'],
  };
}

async function acknowledgeReferral(referralId, payload = {}) {
  if (!referralId) return null;

  const updatePayload = {
    referralStatus: 'acknowledged',
    status: 'acknowledged',
    acknowledgedAt: new Date().toISOString(),
    acknowledgedBy: 'ai-coordinator',
    completedChecklist: payload.completedChecklist || [],
    hospitalId: payload.hospitalId || null,
    aiDecision: 'acknowledge',
    aiReason: payload.reason || 'Hospital fully prepared before the acknowledgement deadline.',
    aiUpdatedAt: new Date().toISOString(),
  };

  const documentId = getReferralDocumentId({ id: referralId });
  const safePayload = sanitizeReferralPayload(updatePayload);
  await db.collection('referrals').doc(documentId).set(safePayload, { merge: true, ignoreUndefinedProperties: true });
  return safePayload;
}

async function rerouteReferral(referralId, newHospital, payload = {}) {
  if (!referralId || !newHospital) return null;

  const documentId = getReferralDocumentId({ id: referralId });
  const doc = await db.collection('referrals').doc(documentId).get();
  const existing = doc.exists ? doc.data() : {};
  const rerouteCount = Number(existing.rerouteCount || 0) + 1;

  const updatePayload = {
    referralStatus: 'sent',
    status: 'sent',
    hospitalId: newHospital.id,
    rerouteCount,
    reroutedAt: new Date().toISOString(),
    reroutedToHospitalId: newHospital.id,
    reroutedToHospitalName: newHospital.name,
    aiDecision: 'reroute',
    aiReason: payload.reason || 'Acknowledgement timeout exceeded. Rerouting to a better-prepared hospital.',
    aiRecommendedHospitalId: newHospital.id,
    aiRecommendedHospitalName: newHospital.name,
    aiUpdatedAt: new Date().toISOString(),
  };

  const safePayload = sanitizeReferralPayload(updatePayload);
  await db.collection('referrals').doc(documentId).set(safePayload, { merge: true, ignoreUndefinedProperties: true });
  return safePayload;
}

async function monitorReferral(referral) {
  if (!referral || !referral.id) return null;

  // Ensure we have hospital info
  let hospital = null;
  try {
    hospital = await getHospitalById(referral.hospitalId);
  } catch (err) {
    hospital = null;
  }

  // If no checklist present, generate one and persist
  if (!Array.isArray(referral.checklistItems) || referral.checklistItems.length === 0) {
    const checklist = await generateChecklist(referral, hospital);
    const documentId = getReferralDocumentId(referral);
    try {
      const payload = sanitizeReferralPayload({ checklistItems: checklist });
      await db.collection('referrals').doc(documentId).set(payload, { merge: true, ignoreUndefinedProperties: true });
      referral.checklistItems = checklist;
    } catch (err) {
      console.warn('Failed to persist generated checklist:', err.message);
    }
  }

  // Auto-complete items: prefer Ollama evaluation (using hospital resources), fall back to deterministic matcher
  const completed = new Set(referral.completedChecklist || []);
  let ollamaEval = null;
  try {
    ollamaEval = await callOllamaEvaluateChecklist(referral, hospital, referral.checklistItems || []);
  } catch (e) {
    ollamaEval = null;
  }

  (referral.checklistItems || []).forEach((item) => {
    let marked = false;
    if (ollamaEval) {
      // try exact match, then lowercase key
      if (Object.prototype.hasOwnProperty.call(ollamaEval, item)) {
        if (ollamaEval[item]) {
          completed.add(item);
          marked = true;
        }
      } else if (Object.prototype.hasOwnProperty.call(ollamaEval, item.toLowerCase())) {
        if (ollamaEval[item.toLowerCase()]) {
          completed.add(item);
          marked = true;
        }
      }
    }

    if (!marked) {
      if (matchResourceToItem(item, hospital)) completed.add(item);
    }
  });

  // Persist completed checklist
  const documentId = getReferralDocumentId(referral);
  try {
    const payload = sanitizeReferralPayload({ completedChecklist: Array.from(completed) });
    await db.collection('referrals').doc(documentId).set(payload, { merge: true, ignoreUndefinedProperties: true });
    referral.completedChecklist = Array.from(completed);
  } catch (err) {
    console.warn('Unable to persist completed checklist:', err.message);
  }

  // Re-evaluate decision with updated checklist
  const decision = await evaluateReferralDecision(referral);
  if (!decision) return null;

  const updatePayload = {
    aiDecision: decision.decision,
    aiReason: decision.reason || decision.message || null,
    aiConfidence: decision.confidence || null,
    aiExplanation: decision.explanation || [],
    aiRecommendedHospitalId: decision.newHospital?.id || null,
    aiRecommendedHospitalName: decision.newHospital?.name || null,
    aiUpdatedAt: new Date().toISOString(),
  };

  try {
    const payload = sanitizeReferralPayload(updatePayload);
    await db.collection('referrals').doc(documentId).set(payload, { merge: true, ignoreUndefinedProperties: true });
  } catch (error) {
    console.warn('Unable to persist coordinator decision:', error.message);
  }

  // If ready -> acknowledge
  if (decision.decision === 'acknowledge') {
    await acknowledgeReferral(documentId, {
      ...payloadFromReferral(referral),
      reason: decision.reason,
      completedChecklist: referral.completedChecklist || [],
    });
    return decision;
  }

  // If monitor or reroute: compute wait window based on risk score
  const risk = referral.riskScore || (referral.risk && referral.risk.score) || 0;
  const waitMs = risk >= 12 ? 2 * 60 * 1000 : 5 * 60 * 1000;
  const ackDeadline = referral.acknowledgementDeadline || referral.deadline || Date.now();
  const now = Date.now();

  if (now > (ackDeadline + waitMs)) {
    // Time exceeded -> reroute
    const candidate = pickBestHospital(referral, await listHospitals());
    if (candidate) {
      await rerouteReferral(documentId, candidate, { reason: 'Acknowledgement and wait window exceeded.' });
      return { decision: 'reroute', reason: 'Wait window exceeded', newHospital: candidate };
    }
  }

  return decision;
}

function payloadFromReferral(referral) {
  return {
    hospitalId: referral.hospitalId,
    completedChecklist: referral.completedChecklist || [],
  };
}

async function startCoordinatorMonitoring(intervalMs = 300000) {
  const run = async () => {
    const snapshot = await db.collection('referrals').get();
    const referrals = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => ['sent', 'acknowledged'].includes(item.referralStatus || item.status || 'sent'));

    for (const referral of referrals) {
      await monitorReferral(referral);
    }
  };

  await run();
  setInterval(run, intervalMs);
}

module.exports = {
  evaluateReferralDecision,
  monitorReferral,
  pickBestHospital,
  startCoordinatorMonitoring,
  acknowledgeReferral,
  rerouteReferral,
  matchResourceToItem,
  sanitizeReferralPayload,
};
