import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Patient, TrendReading } from '../types';
import { TREND_PATIENT_DATA } from '../data/trendPatientData';
import { predictTrend, TrendPrediction } from '../services/aiService';

interface AnalyticsViewProps {
  patients: Patient[];
}

interface TrendChartProps {
  title: string;
  icon: string;
  color: string;
  data: Array<{ label: string; value: number }>;
  delta: number;
  worsening: boolean;
  unit: string;
  latestValue: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ title, icon, color, data, delta, worsening, unit, latestValue }) => {
  const trendDir = delta >= 0 ? '↑' : '↓';
  const trendLabel = worsening ? 'Worsening' : 'Improving';
  
  return (
    <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#b50063]/10 flex items-center justify-center text-[#b50063] dark:text-[#ffb0c9]">
            <span className="material-symbols-outlined text-base">{icon}</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">{title} Trend</h3>
            <p className="text-[10px] text-[#e3bdc7]">Time-series from latest 3 readings.</p>
          </div>
        </div>
        <span className="rounded-full bg-[#ba1a1a]/20 px-2 py-1 text-[10px] font-bold text-[#ba1a1a] dark:text-[#ffdad6]">
          {trendDir} {trendLabel}
        </span>
      </div>
      
      <div className="h-24 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#382a33" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#e3bdc7' }} />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip contentStyle={{ backgroundColor: '#130f12', border: '1px solid #382a33', borderRadius: '8px', color: '#f1effa' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: color }}
              activeDot={{ r: 3.5 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[#e3bdc7]">Latest value</span>
        <span className="font-bold text-white">{latestValue}</span>
      </div>
      
      <div className="rounded-full bg-[#ba1a1a]/20 px-2 py-1.5 text-[10px] font-bold text-[#ba1a1a] dark:text-[#ffdad6] w-fit mt-2">
        {trendDir} {Math.abs(delta).toFixed(1)}{unit} since 10:00 AM
      </div>
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ patients }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [trendReadings, setTrendReadings] = useState<TrendReading[]>([]);
  const [prediction, setPrediction] = useState<TrendPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!patients.length) return;
    if (!patients.some((patient) => patient.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  const dataset = useMemo(() => {
    return TREND_PATIENT_DATA.find((entry) => entry.patientId === selectedPatient?.id) || TREND_PATIENT_DATA[0];
  }, [selectedPatient]);

  useEffect(() => {
    if (!selectedPatient) return;

    const loadPrediction = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const readings = dataset?.readings || [];
        setTrendReadings(readings);
        const result = await predictTrend(readings);
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

  const timeline = useMemo(() => {
    return trendReadings.map((reading) => ({
      time: reading.timestamp,
      label: 'Vitals recorded',
    }));
  }, [trendReadings]);

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
            const isActive = patient.id === selectedPatient?.id;
            return (
              <button
                key={patient.id}
                type="button"
                onClick={() => setSelectedPatientId(patient.id)}
                className={`min-w-[140px] rounded-2xl border p-3 text-left transition-all ${
                  isActive
                    ? 'border-[#b50063] bg-[#221a1f] shadow-lg shadow-[#b50063]/20'
                    : 'border-[#382a33] bg-[#130f12]'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3bdc7]">{patient.id}</div>
                <div className="text-sm font-bold text-white mt-1">{patient.name}</div>
                <div className="text-[10px] text-[#b50063] dark:text-[#ffb0c9] font-semibold mt-2">Risk {patient.newsScore}</div>
                <div className="text-[10px] text-[#e3bdc7] mt-1">{patient.riskLevel}</div>
                <button className="text-[10px] font-bold text-[#b50063] dark:text-[#ffb0c9] mt-2 hover:underline">
                  View →
                </button>
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
            <div className="text-2xl font-extrabold text-white mt-1">{selectedPatient?.name || 'N/A'}</div>
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
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.temperature }))}
          delta={vitalsDelta.temp}
          worsening={vitalsDelta.temp > 1}
          unit="°C"
          latestValue={`${trendReadings[trendReadings.length - 1]?.temperature || 0}°C`}
        />
        <TrendChart
          title="Pulse"
          icon="favorite"
          color="#b50063"
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.pulse }))}
          delta={vitalsDelta.pulse}
          worsening={vitalsDelta.pulse > 10}
          unit="bpm"
          latestValue={`${trendReadings[trendReadings.length - 1]?.pulse || 0}bpm`}
        />
        <TrendChart
          title="SpO₂"
          icon="humidity_mid"
          color="#00bfa5"
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.spo2 }))}
          delta={vitalsDelta.spo2}
          worsening={vitalsDelta.spo2 < 0}
          unit="%"
          latestValue={`${trendReadings[trendReadings.length - 1]?.spo2 || 0}%`}
        />
        <TrendChart
          title="Respiration"
          icon="air"
          color="#ff9800"
          data={trendReadings.map((r) => ({ label: r.timestamp, value: r.respiration }))}
          delta={vitalsDelta.resp}
          worsening={vitalsDelta.resp > 0}
          unit="/min"
          latestValue={`${trendReadings[trendReadings.length - 1]?.respiration || 0}/min`}
        />
      </div>

      {/* AI Clinical Summary */}
      <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#b50063]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-[#b50063]">insights</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Clinical Summary</h3>
              <p className="text-[10px] text-[#e3bdc7]">
                The model looks for meaningful changes in the vitals, not just the score.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#ba1a1a]/20 text-[#ffdad6] px-2 py-1 rounded-full">
            {summary.overall}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Observation Signals */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e3bdc7]">Observation Signals</span>
            <span className="text-[10px] text-[#e3bdc7] block">Latest vs 10:00 AM</span>
            <div className="mt-3 space-y-2">
              {summary.signals.map((signal) => (
                <div key={signal.label} className="bg-[#130f12] p-2.5 rounded-xl border border-[#382a33]">
                  <div className="text-xs font-bold text-white">{signal.label}</div>
                  <div className="text-[10px] text-[#b50063] font-semibold mt-1 flex items-center gap-1">
                    {signal.delta >= 0 ? '↑' : '↓'} WORSENING
                  </div>
                  <div className="text-[10px] text-[#ba1a1a] font-bold mt-1">
                    {signal.delta >= 0 ? '↑' : '↓'} {Math.abs(signal.delta).toFixed(1)}{signal.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Trend */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e3bdc7]">Overall Trend</span>
            <span className="text-[10px] text-[#e3bdc7] block">Based on the direction of the last three readings.</span>
            <div className="mt-3 space-y-3">
              <div className="bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#e3bdc7]">Overall Clinical Call</span>
                <div className="text-xl font-extrabold text-white mt-2">{summary.overall}</div>
              </div>
              <div className="bg-[#130f12] p-3 rounded-xl border border-[#382a33]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#e3bdc7]">Clinical Assessment</span>
                <div className="text-base font-extrabold text-[#ba1a1a] mt-2">{summary.clinicalCall}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {summary.recommendation && (
          <div className="mt-4 bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a] text-lg mt-0.5 flex-shrink-0">warning</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffdad6]">Recommendation</span>
                <p className="text-xs text-[#e3bdc7] mt-1">{summary.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Prediction Card */}
      <div className="bg-[#1a1b22]/50 dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">AI Prediction Card</h3>
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
              <div className="text-3xl font-extrabold text-white mt-1">{prediction.currentEWS}</div>
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
