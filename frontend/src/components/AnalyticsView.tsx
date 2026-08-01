import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Patient, TrendReading, Intervention, InterventionType, VitalKey } from '../types';
import { TREND_PATIENT_DATA } from '../data/trendPatientData';
import { predictTrend, TrendPrediction } from '../services/aiService';

interface AnalyticsViewProps {
  patients: Patient[];
}

interface TrendChartProps {
  title: string;
  icon: string;
  color: string;
  vitalKey: VitalKey;
  data: Array<{ label: string; value: number }>;
  interventions?: Intervention[];
  delta: number;
  worsening: boolean;
  unit: string;
  latestValue: string;
}

const INTERVENTION_ICONS: Record<InterventionType, string> = {
  medication: '💊',
  oxygen: '🫁',
  iv: '💧',
  nebulizer: '🌫',
  antibiotic: '💉',
  referral: '🚑',
};

const InterventionMarker: React.FC<any> = ({ cx, cy, payload }) => {
  if (cx === undefined || cy === undefined || !payload) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill="#140c16" opacity={0.95} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={16} fill="#ffcad4" style={{ pointerEvents: 'none' }}>
        {payload.icon}
      </text>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 -1;0 1;0 -1"
        dur="2.5s"
        repeatCount="indefinite"
      />
    </g>
  );
};

const TrendChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const event = payload.find((entry: any) => entry.payload?.eventName)?.payload;
  const valueEntry = payload.find((entry: any) => entry.dataKey === 'value')?.payload;

  if (event) {
    return (
      <div className="rounded-xl border border-[#382a33] bg-[#130f12] p-3 text-[12px] text-[#f1effa] shadow-xl">
        <div className="font-semibold text-white mb-2">Medication Administered</div>
        <div className="text-xs text-[#d7c8e3] mb-2">{event.eventName}</div>
        <div className="text-[11px] text-[#c7b8e3]">
          <div><strong>Medicine:</strong> {event.eventName}{event.dosage ? ` ${event.dosage}` : ''}</div>
          <div><strong>Reason:</strong> {event.description}</div>
          <div><strong>Given by:</strong> {event.givenBy}</div>
          <div><strong>Time:</strong> {event.time}</div>
          {event.expectedEffect && <div><strong>Expected Effect:</strong> {event.expectedEffect}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#382a33] bg-[#130f12] p-3 text-[12px] text-[#f1effa] shadow-xl">
      <div className="font-semibold text-white mb-1">{label}</div>
      {valueEntry && (
        <div className="text-[11px] text-[#d7c8e3]">Value: {valueEntry.value}</div>
      )}
    </div>
  );
};

const TrendChart: React.FC<TrendChartProps> = ({ title, icon, color, vitalKey, data, interventions, delta, worsening, unit, latestValue }) => {
  const markerPoints = (interventions ?? [])
    .filter((intervention) => intervention.affectedVitals.includes(vitalKey))
    .map((intervention) => {
      const matchingPoint = data.find((point) => point.label === intervention.time);
      if (!matchingPoint) {
        return null;
      }
      return {
        ...matchingPoint,
        icon: INTERVENTION_ICONS[intervention.type],
        eventName: intervention.name,
        description: intervention.reason,
        dosage: intervention.dosage,
        givenBy: intervention.givenBy,
        expectedEffect: intervention.expectedEffect,
        time: intervention.time,
      };
    })
    .filter(Boolean) as Array<{
      label: string;
      value: number;
      icon: string;
      eventName: string;
      description: string;
      dosage?: string;
      givenBy: string;
      expectedEffect?: string;
      time: string;
    }>;
  const trendDir = delta >= 0 ? '↑' : '↓';
  const trendLabel = worsening ? 'Worsening' : 'Improving';
  
  return (
    <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-5 rounded-[28px] border border-[#eeedf7] dark:border-[#382a33] shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#b50063]/10 flex items-center justify-center text-[#b50063] dark:text-[#ffb0c9]">
            <span className="material-symbols-outlined text-base">{icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title} Trend</h3>
            <p className="text-[11px] text-[#d7c8e3] mt-1">Time-series from latest 3 readings.</p>
          </div>
        </div>
        <span className="rounded-full bg-[#b50063]/15 px-3 py-1 text-[10px] font-bold text-[#ffb0c9] border border-[#b50063]/20">
          {trendDir} {trendLabel}
        </span>
      </div>
      
      <div className="h-36 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#382a33" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#d7c8e3' }} />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip content={<TrendChartTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 4 }}
              animationDuration={600}
            />
            {markerPoints.length > 0 && (
              <Scatter data={markerPoints} fill={color} shape={<InterventionMarker />} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="text-[#d7c8e3]">Latest value</span>
        <span className="font-bold text-white">{latestValue}</span>
      </div>
      
      <div className="rounded-full bg-[#b50063]/15 px-3 py-2 text-[12px] font-semibold text-[#ffb0c9] w-fit mt-4">
        {trendDir} {Math.abs(delta).toFixed(1)}{unit} since 10:00 AM
      </div>
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ patients }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.patientId || '');
  const [trendReadings, setTrendReadings] = useState<TrendReading[]>([]);
  const [prediction, setPrediction] = useState<TrendPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!patients.length) return;
    if (!patients.some((patient) => patient.patientId === selectedPatientId)) {
      setSelectedPatientId(patients[0].patientId);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.patientId === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  const dataset = useMemo(() => {
    return TREND_PATIENT_DATA.find((entry) => entry.patientId === selectedPatient?.patientId) || TREND_PATIENT_DATA[0];
  }, [selectedPatient]);

  const interventionSummary = useMemo(() => {
    const interventions = dataset.interventions || [];
    if (!interventions.length || !trendReadings.length) {
      return '';
    }

    const responseEvents = interventions.filter((intervention) =>
      intervention.affectedVitals.some((vital) =>
        ['temperature', 'spo2', 'pulse', 'respiration'].includes(vital)
      )
    );

    const improved = trendReadings[trendReadings.length - 1].temperature < trendReadings[0].temperature;
    const oxygenResponse = trendReadings[trendReadings.length - 1].spo2 > trendReadings[0].spo2;

    if (responseEvents.length && (improved || oxygenResponse)) {
      return `${responseEvents[0].name} given at ${responseEvents[0].time}. Patient responded to treatment.`;
    }

    if (responseEvents.length) {
      return `${responseEvents[0].name} given at ${responseEvents[0].time}. Temperature increased despite medication. Possible persistent infection. Recommend physician review.`;
    }

    return '';
  }, [dataset.interventions, trendReadings]);

  const currentEWSValue = selectedPatient?.newsScore ?? prediction?.currentEWS ?? 0;

  useEffect(() => {
    if (!selectedPatient) return;

    const loadPrediction = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const allReadings = dataset?.readings || [];
        const recentReadings = allReadings.slice(-3);
        setTrendReadings(allReadings);
        const result = await predictTrend(recentReadings, selectedPatient?.newsScore);
        setPrediction(result);
      } catch (error) {
        setPrediction(null);
        setErrorMessage('Unable to fetch AI prediction. Retry.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrediction();
  }, [dataset, selectedPatient]);

  const vitalsDelta = useMemo(() => {
    if (!trendReadings.length) return { temp: 0, pulse: 0, spo2: 0, resp: 0 };
    const first = trendReadings[0];
    const last = trendReadings[trendReadings.length - 1];
    return {
      temp: last.temperature - first.temperature,
      pulse: last.pulse - first.pulse,
      spo2: last.spo2 - first.spo2,
      resp: last.respiration - first.respiration,
    };
  }, [trendReadings]);

  const summary = useMemo(() => {
    if (!trendReadings.length) {
      return { signals: [], overall: 'Needs Monitoring', clinicalCall: '', recommendation: '' };
    }

    const first = trendReadings[0];
    const last = trendReadings[trendReadings.length - 1];
    const worseningFlags = [
      vitalsDelta.temp > 1,
      vitalsDelta.pulse > 10,
      vitalsDelta.spo2 < 0,
      vitalsDelta.resp > 0,
    ].filter(Boolean).length;

    const signals = [
      { label: 'Temperature', delta: vitalsDelta.temp, unit: '°', worsening: vitalsDelta.temp > 1 },
      { label: 'Pulse', delta: vitalsDelta.pulse, unit: ' bpm', worsening: vitalsDelta.pulse > 10 },
      { label: 'SpO₂', delta: vitalsDelta.spo2, unit: '%', worsening: vitalsDelta.spo2 < 0 },
      { label: 'Respiration', delta: vitalsDelta.resp, unit: ' /min', worsening: vitalsDelta.resp > 0 },
    ];

    let overall = 'Needs Monitoring';
    let clinicalCall = '';
    let recommendation = '';

    if (worseningFlags >= 3) {
      overall = 'Deteriorating';
      clinicalCall = 'Early Infection';
      recommendation = 'Temperature increasing despite unchanged EWS. Possible early infection. Reassess within 30 minutes.';
    } else if (worseningFlags === 0) {
      overall = 'Recovering';
      clinicalCall = 'Stabilizing';
      recommendation = 'Vitals trending in positive direction. Continue current management.';
    } else {
      clinicalCall = 'Monitor';
    }

    return { signals, overall, clinicalCall, recommendation };
  }, [trendReadings, vitalsDelta]);

  const parseTimeValue = (time: string) => {
    const [clock, period] = time.split(' ');
    const [hours, minutes] = clock.split(':').map(Number);
    const normalizedHour = hours % 12 + (period === 'PM' ? 12 : 0);
    return normalizedHour * 60 + minutes;
  };

  const timeline = useMemo(() => {
    const readingItems = trendReadings.map((reading) => ({
      time: reading.timestamp,
      label: 'Vitals recorded',
      type: 'vitals' as const,
    }));

    const interventionItems = (dataset.interventions ?? []).map((intervention) => ({
      time: intervention.time,
      label: `${INTERVENTION_ICONS[intervention.type]} ${intervention.name} administered`,
      type: 'intervention' as const,
      reason: intervention.reason,
      icon: INTERVENTION_ICONS[intervention.type],
    }));

    return [...readingItems, ...interventionItems].sort((a, b) => parseTimeValue(a.time) - parseTimeValue(b.time));
  }, [trendReadings, dataset.interventions]);

  return (
    <div className="flex flex-col w-full gap-5 animate-fadeIn pb-6">
      {/* Patient Carousel */}
      <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-white">Patient Trend Analysis</h2>
          <span className="text-[10px] font-bold text-[#b50063] dark:text-[#ffb0c9] bg-[#b50063]/10 rounded-full px-2 py-1">
            3 reading window
          </span>
        </div>
        <p className="text-xs text-[#e3bdc7] mb-4">
          Monitor whether a patient is improving or deteriorating over time, even when the EWS stays unchanged.
        </p>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {patients.map((patient) => {
            const isActive = patient.patientId === selectedPatient?.patientId;
            return (
              <button
                key={patient.patientId}
                type="button"
                onClick={() => setSelectedPatientId(patient.patientId)}
                className={`min-w-[140px] rounded-2xl border p-3 text-left transition-all ${
                  isActive
                    ? 'border-[#b50063] bg-[#221a1f] shadow-lg shadow-[#b50063]/20'
                    : 'border-[#382a33] bg-[#130f12]'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3bdc7]">{patient.patientId}</div>
                <div className="text-sm font-bold text-white mt-1">{patient.patientName}</div>
                <div className="text-[10px] text-[#b50063] dark:text-[#ffb0c9] font-semibold mt-2">Risk {patient.newsScore}</div>
                <div className="text-[10px] text-[#e3bdc7] mt-1">{patient.riskLevel}</div>
                <span className="text-[10px] font-bold text-[#b50063] dark:text-[#ffb0c9] mt-2 inline-block hover:underline">
                  View →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e3bdc7]">Patient</span>
            <div className="text-2xl font-extrabold text-white mt-1">{selectedPatient?.patientName || 'N/A'}</div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e3bdc7]">Age / Gender</span>
            <div className="text-lg font-extrabold text-white mt-1">
              {selectedPatient?.age || 'N/A'} yrs / {selectedPatient?.gender || 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e3bdc7]">Current Risk Score</span>
            <div className="text-2xl font-extrabold text-[#b50063] mt-1">{selectedPatient?.newsScore || 0}/20</div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e3bdc7]">Clinical Trend</span>
            <div className="text-lg font-extrabold text-[#ba1a1a] mt-1 flex items-center gap-1">
              ↑ {summary.overall}
            </div>
          </div>
        </div>
      </div>

      {/* Vital Trend Charts Grid */}
      <div className="grid grid-cols-2 gap-3">
        <TrendChart
          title="Temperature"
          icon="thermometer"
          color="#b50063"
          vitalKey="temperature"
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.temperature }))}
          interventions={dataset.interventions}
          delta={vitalsDelta.temp}
          worsening={vitalsDelta.temp > 1}
          unit="°C"
          latestValue={`${trendReadings[trendReadings.length - 1]?.temperature || 0}°C`}
        />
        <TrendChart
          title="Pulse"
          icon="favorite"
          color="#b50063"
          vitalKey="pulse"
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.pulse }))}
          interventions={dataset.interventions}
          delta={vitalsDelta.pulse}
          worsening={vitalsDelta.pulse > 10}
          unit="bpm"
          latestValue={`${trendReadings[trendReadings.length - 1]?.pulse || 0}bpm`}
        />
        <TrendChart
          title="SpO₂"
          icon="humidity_mid"
          color="#00bfa5"
          vitalKey="spo2"
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.spo2 }))}
          interventions={dataset.interventions}
          delta={vitalsDelta.spo2}
          worsening={vitalsDelta.spo2 < 0}
          unit="%"
          latestValue={`${trendReadings[trendReadings.length - 1]?.spo2 || 0}%`}
        />
        <TrendChart
          title="Respiration"
          icon="air"
          color="#ff9800"
          vitalKey="respiration"
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.respiration }))}
          interventions={dataset.interventions}
          delta={vitalsDelta.resp}
          worsening={vitalsDelta.resp > 0}
          unit="/min"
          latestValue={`${trendReadings[trendReadings.length - 1]?.respiration || 0}/min`}
        />
      </div>

      {/* AI Prediction Card */}
      <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">AI Prediction Summary</h3>
          {isLoading ? (
            <span className="text-[10px] font-bold text-[#b50063] animate-pulse">Connecting…</span>
          ) : errorMessage ? (
            <span className="text-[10px] font-bold text-[#ba1a1a]">Error</span>
          ) : (
            <span className="text-[10px] font-bold text-[#00bfa5]">Operational</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-4 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#b50063] border-t-transparent" />
            <p className="text-xs text-[#e3bdc7] mt-2">Connecting to AI trend endpoint…</p>
          </div>
        ) : errorMessage ? (
          <div>
            <p className="text-xs text-[#ba1a1a] font-semibold">{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                const readings = dataset?.readings || [];
                setTrendReadings(readings);
                predictTrend(readings)
                  .then(setPrediction)
                  .catch(() => setErrorMessage('Unable to fetch AI prediction.'));
              }}
              className="mt-2 text-[10px] font-bold bg-[#b50063] text-white px-3 py-1.5 rounded-full hover:bg-[#b50063]/80"
            >
              Retry
            </button>
          </div>
        ) : prediction ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e3bdc7]">Current EWS</span>
              <div className="text-3xl font-extrabold text-white mt-1">{currentEWSValue}</div>
            </div>
            <div className="bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e3bdc7]">Predicted EWS (30 min)</span>
              <div className="text-3xl font-extrabold text-[#b50063] mt-1">{prediction.predictedEWS30Min.toFixed(1)}</div>
            </div>
            <div className="bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e3bdc7]">Trend</span>
              <div className="text-xl font-extrabold text-white mt-1">{prediction.trend}</div>
            </div>
            <div className="bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e3bdc7]">Confidence</span>
              <div className="text-2xl font-extrabold text-[#b50063] mt-1">{(prediction.confidence * 100).toFixed(1)}%</div>
            </div>
            <div className="col-span-2 text-[10px] text-[#d7c8e3] mt-2">
              Confidence reflects the model's certainty based on the internal ensemble spread. Higher values mean a more stable prediction; lower values suggest less reliable trend confidence.
            </div>
          </div>
        ) : null}
      </div>

      {/* Trend Timeline */}
      <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Trend Timeline</h3>
          <span className="text-[10px] font-bold text-[#5b3f47] bg-[#5b3f47]/10 rounded-full px-2 py-1">
            ⏱ 30 minute watch window
          </span>
        </div>
        <p className="text-[10px] text-[#e3bdc7] mb-4">Vitals, analysis, and decision flow for the selected patient.</p>
        
        <div className="space-y-3">
          {timeline.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b50063]/20 flex-shrink-0">
                <span className="text-xs font-bold text-[#b50063]">{idx + 1}</span>
              </div>
              <div className="flex-1 bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
                <div className="font-bold text-white text-sm">{step.time}</div>
                <div className="text-[10px] text-[#e3bdc7] mt-1">{step.label}</div>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff9800]/20 flex-shrink-0">
              <span className="material-symbols-outlined text-xs text-[#ff9800]">check_circle</span>
            </div>
            <div className="flex-1 bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
              <div className="font-bold text-white text-sm">Now</div>
              <div className="text-[10px] text-[#e3bdc7] mt-1">Prediction generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
