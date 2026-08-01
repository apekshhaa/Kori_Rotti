import React, { useMemo, useState, type ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Hospital,
  Minus,
  Thermometer,
  Wind,
  AlertTriangle,
} from 'lucide-react';

interface AnalyticsViewProps {
  patients: unknown[];
}

type Direction = 'improving' | 'worsening' | 'stable';
type OverallTrend = 'Stable' | 'Improving' | 'Deteriorating' | 'High Risk';
type MetricKey = 'temperature' | 'pulse' | 'spo2' | 'respiration';

type Reading = {
  time: string;
  pulse: number;
  bp: string;
  temperature: number;
  spo2: number;
  respiration: number;
  risk: number;
};

type Prediction = {
  currentEWS: number;
  predictedEWS30Min: number;
  trend: 'Increasing' | 'Stable' | 'Improving';
  confidence: number;
};

type PatientCase = {
  id: string;
  name: string;
  age: number;
  gender: string;
  label: string;
  currentRiskScore: number;
  readings: Reading[];
  prediction: Prediction;
  recommendation: string;
};

type MetricCardConfig = {
  key: MetricKey;
  title: string;
  unit: string;
  color: string;
  icon: ReactNode;
  series: Array<{ time: string; value: number }>;
  direction: Direction;
  deltaLabel: string;
  latestValue: number;
};

type InsightRow = {
  label: string;
  text: string;
  direction: Direction;
};

type TooltipContentProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number }>;
};

const patientCases: PatientCase[] = [
  {
    id: 'PHC-001',
    name: 'Ramesh',
    age: 46,
    gender: 'Male',
    label: 'Stable',
    currentRiskScore: 4,
    readings: [
      { time: '10:00 AM', pulse: 82, bp: '120/80', temperature: 36.8, spo2: 99, respiration: 16, risk: 4 },
      { time: '12:00 PM', pulse: 83, bp: '121/80', temperature: 36.9, spo2: 99, respiration: 16, risk: 4 },
      { time: '2:00 PM', pulse: 82, bp: '120/80', temperature: 36.8, spo2: 99, respiration: 16, risk: 4 },
    ],
    prediction: {
      currentEWS: 4,
      predictedEWS30Min: 4.1,
      trend: 'Stable',
      confidence: 92.4,
    },
    recommendation: 'Continue monitoring',
  },
  {
    id: 'PHC-002',
    name: 'Lakshmi',
    age: 32,
    gender: 'Female',
    label: 'Early Infection',
    currentRiskScore: 5,
    readings: [
      { time: '10:00 AM', pulse: 88, bp: '118/76', temperature: 37.0, spo2: 98, respiration: 18, risk: 5 },
      { time: '12:00 PM', pulse: 90, bp: '120/78', temperature: 38.1, spo2: 98, respiration: 18, risk: 5 },
      { time: '2:00 PM', pulse: 93, bp: '122/78', temperature: 38.8, spo2: 97, respiration: 19, risk: 5 },
    ],
    prediction: {
      currentEWS: 5,
      predictedEWS30Min: 7.6,
      trend: 'Increasing',
      confidence: 87.1,
    },
    recommendation: 'Repeat vitals in 30 minutes',
  },
  {
    id: 'PHC-003',
    name: 'Ahmed',
    age: 58,
    gender: 'Male',
    label: 'Respiratory Distress',
    currentRiskScore: 13,
    readings: [
      { time: '10:00 AM', pulse: 95, bp: '128/82', temperature: 37.6, spo2: 96, respiration: 20, risk: 8 },
      { time: '12:00 PM', pulse: 105, bp: '134/84', temperature: 38.0, spo2: 93, respiration: 24, risk: 10 },
      { time: '2:00 PM', pulse: 118, bp: '140/88', temperature: 38.4, spo2: 90, respiration: 28, risk: 13 },
    ],
    prediction: {
      currentEWS: 13,
      predictedEWS30Min: 19.4,
      trend: 'Increasing',
      confidence: 63.6,
    },
    recommendation: 'Immediate transfer recommended',
  },
  {
    id: 'PHC-004',
    name: 'Meera',
    age: 41,
    gender: 'Female',
    label: 'Recovery',
    currentRiskScore: 5,
    readings: [
      { time: '10:00 AM', pulse: 104, bp: '150/94', temperature: 38.4, spo2: 92, respiration: 24, risk: 11 },
      { time: '12:00 PM', pulse: 96, bp: '138/88', temperature: 37.8, spo2: 95, respiration: 20, risk: 8 },
      { time: '2:00 PM', pulse: 88, bp: '126/82', temperature: 37.1, spo2: 98, respiration: 17, risk: 5 },
    ],
    prediction: {
      currentEWS: 5,
      predictedEWS30Min: 6.2,
      trend: 'Improving',
      confidence: 90.8,
    },
    recommendation: 'Continue observation',
  },
];

const cardClass =
  'rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#f4f2fd]/80 dark:bg-[#221a1f]/80 backdrop-blur-md shadow-[0_10px_30px_rgba(26,27,34,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(26,27,34,0.10)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]';

const directionMeta: Record<Direction, { icon: ReactNode; className: string; label: string }> = {
  improving: {
    icon: <ArrowDown className="w-3.5 h-3.5" />,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    label: 'Improving',
  },
  worsening: {
    icon: <ArrowUp className="w-3.5 h-3.5" />,
    className: 'bg-[#ffdad6] text-[#93000a] dark:bg-[#600010] dark:text-[#ffdad6]',
    label: 'Worsening',
  },
  stable: {
    icon: <Minus className="w-3.5 h-3.5" />,
    className: 'bg-[#e3e1ec] text-[#5b3f47] dark:bg-[#382a33] dark:text-[#e3bdc7]',
    label: 'Unchanged',
  },
};

const metricPalette: Record<MetricKey, string> = {
  temperature: '#F472B6',
  pulse: '#b50063',
  spo2: '#10b981',
  respiration: '#f59e0b',
};

const metricMeta: Record<MetricKey, { title: string; unit: string; icon: ReactNode }> = {
  temperature: { title: 'Temperature Trend', unit: '°C', icon: <Thermometer className="w-4 h-4" /> },
  pulse: { title: 'Pulse Trend', unit: 'bpm', icon: <Activity className="w-4 h-4" /> },
  spo2: { title: 'SpO₂ Trend', unit: '%', icon: <Droplets className="w-4 h-4" /> },
  respiration: { title: 'Respiration Trend', unit: '/min', icon: <Wind className="w-4 h-4" /> },
};

const timelineBase = [
  { time: '10:00 AM', text: 'Vitals recorded' },
  { time: '12:00 PM', text: 'Vitals recorded' },
  { time: '2:00 PM', text: 'Vitals recorded' },
  { time: 'Now', text: 'Prediction generated' },
];

function getDirection(delta: number, invert = false): Direction {
  const adjusted = invert ? delta * -1 : delta;
  if (Math.abs(adjusted) < 0.15) return 'stable';
  return adjusted > 0 ? 'worsening' : 'improving';
}

function formatDelta(delta: number, unit: string, absolute = false): string {
  const value = absolute ? Math.abs(delta) : delta;
  const prefix = delta > 0 ? '+' : delta < 0 ? '-' : '';
  const decimals = unit === '%' ? 0 : 1;
  return `${prefix}${Math.abs(value).toFixed(decimals)}${unit}`;
}

function calculateClinicalSummary(patient: PatientCase) {
  const first = patient.readings[0];
  const last = patient.readings[patient.readings.length - 1];
  const tempDelta = last.temperature - first.temperature;
  const pulseDelta = last.pulse - first.pulse;
  const spo2Delta = last.spo2 - first.spo2;
  const respDelta = last.respiration - first.respiration;
  const riskDelta = last.risk - first.risk;

  const observations: InsightRow[] = [
    {
      label: 'Temperature',
      text: `${getDirection(tempDelta).toUpperCase()} ${formatDelta(tempDelta, '°C')}`,
      direction: getDirection(tempDelta),
    },
    {
      label: 'Pulse',
      text: `${getDirection(pulseDelta).toUpperCase()} ${formatDelta(pulseDelta, ' bpm')}`,
      direction: getDirection(pulseDelta),
    },
    {
      label: 'SpO₂',
      text: `${getDirection(spo2Delta, true).toUpperCase()} ${formatDelta(spo2Delta, '%', true)}`,
      direction: getDirection(spo2Delta, true),
    },
    {
      label: 'Respiration',
      text: `${getDirection(respDelta).toUpperCase()} ${formatDelta(respDelta, ' /min')}`,
      direction: getDirection(respDelta),
    },
  ];

  const weightedSignal =
    tempDelta * 2.4 +
    pulseDelta * 0.25 +
    (first.spo2 - last.spo2) * 2.2 +
    respDelta * 0.45 +
    riskDelta * 0.8;

  let overallTrend: OverallTrend = 'Stable';
  if (weightedSignal >= 10 || patient.prediction.predictedEWS30Min >= 18) {
    overallTrend = 'High Risk';
  } else if (weightedSignal >= 2.4 || patient.prediction.trend === 'Increasing') {
    overallTrend = 'Deteriorating';
  } else if (weightedSignal <= -3.2 || patient.prediction.trend === 'Improving') {
    overallTrend = 'Improving';
  }

  let recommendation = 'Continue monitoring';
  if (overallTrend === 'Deteriorating' && patient.id === 'PHC-002') {
    recommendation = 'Repeat vitals in 30 minutes';
  } else if (overallTrend === 'High Risk') {
    recommendation = 'Immediate transfer recommended';
  } else if (overallTrend === 'Improving') {
    recommendation = 'Continue observation';
  }

  return { observations, overallTrend, recommendation };
}

function MetricTooltip({ active, label, payload }: TooltipContentProps & { unit: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[#44333e] bg-[#1a1316]/95 px-3 py-2 shadow-xl backdrop-blur-md">
      <div className="text-[11px] font-semibold text-[#e3bdc7]">{label}</div>
      <div className="text-sm font-bold text-[#ffb0c9]">{payload[0]?.value}</div>
    </div>
  );
}

function ChartCard({ config }: { config: MetricCardConfig }) {
  const latestDirection = config.direction;
  const directionStyle = directionMeta[latestDirection];

  return (
    <div className={`${cardClass} p-4 sm:p-5`}> 
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#ffd9e3] dark:bg-[#4f1030] text-[#8e004c] dark:text-[#ffb0c9] flex-shrink-0">
            {config.icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">{config.title}</h4>
            <p className="text-[11px] text-[#5b3f47] dark:text-[#e3bdc7] mt-0.5 truncate">
              Time-series from 10:00 AM to 2:00 PM
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${directionStyle.className}`}>
          {directionStyle.icon}
          {directionStyle.label}
        </span>
      </div>

      <div className="h-48 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={config.series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="#e3e1ec" strokeOpacity={0.18} vertical={false} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#e3bdc7', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={28}
              tick={{ fill: '#e3bdc7', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip content={(props: TooltipContentProps) => <MetricTooltip {...props} unit={config.unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={3}
              dot={{ r: 3.5, fill: config.color, stroke: config.color, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#ffd9e3', stroke: config.color, strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1100}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[#5b3f47] dark:text-[#e3bdc7]">
        <span>Latest value</span>
        <span className="font-bold text-[#1a1b22] dark:text-[#f1effa]">
          {config.latestValue.toFixed(config.key === 'spo2' ? 0 : 1)}{config.unit}
        </span>
      </div>
      <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${directionStyle.className}`}>
        {directionStyle.icon}
        {config.deltaLabel}
      </div>
    </div>
  );
}

function PatientSelectorButton({
  patient,
  active,
  onSelect,
}: {
  patient: PatientCase;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-[230px] text-left rounded-[18px] border p-4 sm:p-4.5 transition-all duration-300 ${
        active
          ? 'border-[#b50063]/50 dark:border-[#ffb0c9]/45 bg-[#ffd9e3]/60 dark:bg-[#4f1030]/55 shadow-[0_12px_30px_rgba(181,0,99,0.16)]'
          : 'border-[#e3e1ec]/60 dark:border-[#44333e] bg-[#f4f2fd]/75 dark:bg-[#221a1f]/75 hover:border-[#b50063]/30 dark:hover:border-[#ffb0c9]/25'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa] truncate">
              {patient.id}
            </span>
            <span className="text-[11px] font-semibold text-[#5b3f47] dark:text-[#e3bdc7] truncate">
              {patient.name}
            </span>
          </div>
          <p className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] mt-1 truncate">
            {patient.label}
          </p>
        </div>

        <span className="text-[11px] font-bold rounded-full px-2.5 py-1 bg-[#e3e1ec] dark:bg-[#382a33] text-[#5b3f47] dark:text-[#e3bdc7]">
          Risk {patient.currentRiskScore}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-[#5b3f47] dark:text-[#e3bdc7]">
          {patient.age} yrs • {patient.gender}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b50063] dark:text-[#ffb0c9]">
          View <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

function TimelineItem({
  time,
  text,
  last,
  accent = 'normal',
}: {
  time: string;
  text: string;
  last?: boolean;
  accent?: 'normal' | 'good' | 'warning' | 'critical';
}) {
  const accentClass =
    accent === 'good'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      : accent === 'warning'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      : accent === 'critical'
      ? 'bg-[#ffdad6] text-[#93000a] dark:bg-[#600010] dark:text-[#ffdad6]'
      : 'bg-[#e3e1ec] text-[#5b3f47] dark:bg-[#382a33] dark:text-[#e3bdc7]';

  return (
    <div className="flex gap-3 relative">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accentClass}`}>
          <CheckCircle2 className="w-4 h-4" />
        </div>
        {!last && <div className="w-px flex-1 bg-[#e3e1ec] dark:bg-[#44333e] mt-2" />}
      </div>

      <div className="pb-5">
        <div className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">{time}</div>
        <div className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] mt-1">{text}</div>
      </div>
    </div>
  );
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PHC-002');

  const selectedPatient = useMemo(() => {
    return patientCases.find((patient) => patient.id === selectedPatientId) ?? patientCases[0];
  }, [selectedPatientId]);

  const clinical = useMemo(() => calculateClinicalSummary(selectedPatient), [selectedPatient]);

  const charts: MetricCardConfig[] = useMemo(() => {
    return [
      {
        key: 'temperature',
        title: metricMeta.temperature.title,
        unit: metricMeta.temperature.unit,
        color: metricPalette.temperature,
        icon: metricMeta.temperature.icon,
        series: selectedPatient.readings.map((reading) => ({ time: reading.time, value: reading.temperature })),
        direction: getDirection(selectedPatient.readings[selectedPatient.readings.length - 1].temperature - selectedPatient.readings[0].temperature),
        deltaLabel: `${formatDelta(
          selectedPatient.readings[selectedPatient.readings.length - 1].temperature - selectedPatient.readings[0].temperature,
          '°C'
        )} since 10:00 AM`,
        latestValue: selectedPatient.readings[selectedPatient.readings.length - 1].temperature,
      },
      {
        key: 'pulse',
        title: metricMeta.pulse.title,
        unit: metricMeta.pulse.unit,
        color: metricPalette.pulse,
        icon: metricMeta.pulse.icon,
        series: selectedPatient.readings.map((reading) => ({ time: reading.time, value: reading.pulse })),
        direction: getDirection(selectedPatient.readings[selectedPatient.readings.length - 1].pulse - selectedPatient.readings[0].pulse),
        deltaLabel: `${formatDelta(
          selectedPatient.readings[selectedPatient.readings.length - 1].pulse - selectedPatient.readings[0].pulse,
          ' bpm'
        )} since 10:00 AM`,
        latestValue: selectedPatient.readings[selectedPatient.readings.length - 1].pulse,
      },
      {
        key: 'spo2',
        title: metricMeta.spo2.title,
        unit: metricMeta.spo2.unit,
        color: metricPalette.spo2,
        icon: metricMeta.spo2.icon,
        series: selectedPatient.readings.map((reading) => ({ time: reading.time, value: reading.spo2 })),
        direction: getDirection(selectedPatient.readings[selectedPatient.readings.length - 1].spo2 - selectedPatient.readings[0].spo2, true),
        deltaLabel: `${formatDelta(
          selectedPatient.readings[selectedPatient.readings.length - 1].spo2 - selectedPatient.readings[0].spo2,
          '%',
          true
        )} since 10:00 AM`,
        latestValue: selectedPatient.readings[selectedPatient.readings.length - 1].spo2,
      },
      {
        key: 'respiration',
        title: metricMeta.respiration.title,
        unit: metricMeta.respiration.unit,
        color: metricPalette.respiration,
        icon: metricMeta.respiration.icon,
        series: selectedPatient.readings.map((reading) => ({ time: reading.time, value: reading.respiration })),
        direction: getDirection(selectedPatient.readings[selectedPatient.readings.length - 1].respiration - selectedPatient.readings[0].respiration),
        deltaLabel: `${formatDelta(
          selectedPatient.readings[selectedPatient.readings.length - 1].respiration - selectedPatient.readings[0].respiration,
          ' /min'
        )} since 10:00 AM`,
        latestValue: selectedPatient.readings[selectedPatient.readings.length - 1].respiration,
      },
    ];
  }, [selectedPatient]);

  const latestReading = selectedPatient.readings[selectedPatient.readings.length - 1];
  const overallTrendAccent =
    clinical.overallTrend === 'Improving'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      : clinical.overallTrend === 'Stable'
      ? 'bg-[#e3e1ec] text-[#5b3f47] dark:bg-[#382a33] dark:text-[#e3bdc7]'
      : clinical.overallTrend === 'Deteriorating'
      ? 'bg-[#ffdad6] text-[#93000a] dark:bg-[#600010] dark:text-[#ffdad6]'
      : 'bg-[#ffd9e3] text-[#b50063] dark:bg-[#4f1030] dark:text-[#ffb0c9]';

  const referralDecision =
    clinical.overallTrend === 'Improving'
      ? 'Continue observation.'
      : clinical.overallTrend === 'Stable'
      ? 'Continue routine monitoring.'
      : clinical.overallTrend === 'Deteriorating'
      ? 'Repeat vitals in 30 minutes.'
      : 'Immediate transfer recommended.';

  const timelineAccent: Array<'normal' | 'good' | 'warning' | 'critical'> = [
    'normal',
    'normal',
    'normal',
    clinical.overallTrend === 'Improving' ? 'good' : clinical.overallTrend === 'Stable' ? 'normal' : clinical.overallTrend === 'Deteriorating' ? 'warning' : 'critical',
    clinical.overallTrend === 'Improving' ? 'good' : clinical.overallTrend === 'Stable' ? 'normal' : clinical.overallTrend === 'Deteriorating' ? 'warning' : 'critical',
  ];

  return (
    <div className="flex flex-col w-full gap-5 animate-fadeIn pb-6">
      <section className={`${cardClass} p-5 sm:p-6`}> 
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1b22] dark:text-[#f1effa] tracking-tight">
              Patient Trend Analysis
            </h2>
            <p className="text-sm text-[#5b3f47] dark:text-[#e3bdc7] mt-1 max-w-2xl">
              Monitor whether a patient is improving or deteriorating over time, even when the EWS stays unchanged.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#b50063] dark:text-[#ffb0c9] rounded-full px-3 py-1 bg-[#ffd9e3]/70 dark:bg-[#4f1030]/60 whitespace-nowrap">
            3 reading window
          </span>
        </div>

        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-3 min-w-max">
            {patientCases.map((patient) => (
              <PatientSelectorButton
                key={patient.id}
                patient={patient}
                active={patient.id === selectedPatient.id}
                onSelect={() => setSelectedPatientId(patient.id)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
          <div className="rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#f4f2fd]/70 dark:bg-[#221a1f]/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5b3f47] dark:text-[#e3bdc7]">
              Patient
            </span>
            <div className="mt-2 text-lg font-bold text-[#1a1b22] dark:text-[#f1effa]">{selectedPatient.name}</div>
          </div>
          <div className="rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#f4f2fd]/70 dark:bg-[#221a1f]/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5b3f47] dark:text-[#e3bdc7]">
              Age / Gender
            </span>
            <div className="mt-2 text-lg font-bold text-[#1a1b22] dark:text-[#f1effa]">
              {selectedPatient.age} yrs / {selectedPatient.gender}
            </div>
          </div>
          <div className="rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#f4f2fd]/70 dark:bg-[#221a1f]/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5b3f47] dark:text-[#e3bdc7]">
              Current Risk Score
            </span>
            <div className="mt-2 text-lg font-black text-[#b50063] dark:text-[#ffb0c9]">{selectedPatient.currentRiskScore}/20</div>
          </div>
          <div className="rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#f4f2fd]/70 dark:bg-[#221a1f]/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5b3f47] dark:text-[#e3bdc7]">
              Clinical Trend
            </span>
            <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${overallTrendAccent}`}>
              {selectedPatient.prediction.trend === 'Improving' ? <ArrowDown className="w-3.5 h-3.5" /> : selectedPatient.prediction.trend === 'Stable' ? <Minus className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
              {clinical.overallTrend}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {charts.map((chart) => (
          <ChartCard key={chart.key} config={chart} />
        ))}
      </div>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffd9e3] dark:bg-[#4f1030] text-[#8e004c] dark:text-[#ffb0c9] flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1a1b22] dark:text-[#f1effa]">
                AI Clinical Summary
              </h3>
              <p className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] mt-1">
                The model looks for meaningful changes in the vitals, not just the score.
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${overallTrendAccent}`}>
            {clinical.overallTrend}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#eeedf7]/70 dark:bg-[#2c2128]/70 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">Observation Signals</h4>
              <span className="text-[11px] font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">Latest vs 10:00 AM</span>
            </div>

            <div className="flex flex-col gap-3">
              {clinical.observations.map((row) => {
                const meta = directionMeta[row.direction];
                return (
                  <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f4f2fd]/70 dark:bg-[#221a1f]/70 border border-[#e3e1ec]/50 dark:border-[#44333e] px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${meta.className}`}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">{row.label}</div>
                        <div className="text-xs text-[#5b3f47] dark:text-[#e3bdc7]">{row.text}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#eeedf7]/70 dark:bg-[#2c2128]/70 p-4 sm:p-5 flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">Overall Trend</h4>
              <p className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] mt-1">
                Based on the direction of the last three readings.
              </p>
            </div>

            <div className={`rounded-[18px] p-4 border ${
              clinical.overallTrend === 'Improving'
                ? 'border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30'
                : clinical.overallTrend === 'Stable'
                ? 'border-[#e3e1ec]/60 dark:border-[#44333e] bg-[#f4f2fd]/70 dark:bg-[#221a1f]/70'
                : clinical.overallTrend === 'Deteriorating'
                ? 'border-[#ffc2bc]/70 dark:border-[#600010]/60 bg-[#fff1ef]/70 dark:bg-[#381116]/40'
                : 'border-[#ffd9e3]/70 dark:border-[#4f1030]/60 bg-[#fff1f5]/70 dark:bg-[#4f1030]/30'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5b3f47] dark:text-[#e3bdc7]">
                    Overall Clinical Call
                  </span>
                  <div className="mt-2 text-2xl font-black text-[#1a1b22] dark:text-[#f1effa]">
                    {clinical.overallTrend}
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${overallTrendAccent}`}>
                  {clinical.overallTrend === 'Improving' ? <ArrowDown className="w-3.5 h-3.5" /> : clinical.overallTrend === 'Stable' ? <Minus className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                  {selectedPatient.label}
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e3e1ec]/55 dark:border-[#44333e] bg-[#f4f2fd]/70 dark:bg-[#221a1f]/70 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[#b50063] dark:text-[#ffb0c9]">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">Recommendation</div>
                  <p className="text-sm text-[#5b3f47] dark:text-[#e3bdc7] mt-1 leading-relaxed">
                    {selectedPatient.id === 'PHC-002'
                      ? 'Temperature increasing despite unchanged EWS. Possible early infection. Reassess within 30 minutes.'
                      : selectedPatient.id === 'PHC-003'
                      ? 'Rapid respiratory deterioration detected. Oxygen saturation falling. Respiratory rate increasing. Immediate referral recommended.'
                      : selectedPatient.id === 'PHC-004'
                      ? 'Vitals improving. Patient responding to treatment. Continue observation.'
                      : 'Patient stable. Continue routine monitoring.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffd9e3] dark:bg-[#4f1030] text-[#8e004c] dark:text-[#ffb0c9] flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1a1b22] dark:text-[#f1effa]">
                AI Prediction Summary
              </h3>
              <p className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] mt-1">
                Thirty-minute trend forecast for the selected patient.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-[18px] bg-[#eeedf7] dark:bg-[#2c2128] p-4">
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#5b3f47] dark:text-[#e3bdc7]">
              Current EWS
            </span>
            <div className="mt-2 text-2xl font-black text-[#1a1b22] dark:text-[#f1effa]">
              {selectedPatient.prediction.currentEWS}
            </div>
          </div>
          <div className="rounded-[18px] bg-[#eeedf7] dark:bg-[#2c2128] p-4">
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#5b3f47] dark:text-[#e3bdc7]">
              Predicted EWS (30 min)
            </span>
            <div className="mt-2 text-2xl font-black text-[#1a1b22] dark:text-[#f1effa]">
              {selectedPatient.prediction.predictedEWS30Min.toFixed(1)}
            </div>
          </div>
          <div className="rounded-[18px] bg-[#eeedf7] dark:bg-[#2c2128] p-4">
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#5b3f47] dark:text-[#e3bdc7]">
              Trend
            </span>
            <div className="mt-2 text-2xl font-black text-[#1a1b22] dark:text-[#f1effa]">
              {selectedPatient.prediction.trend}
            </div>
          </div>
          <div className="rounded-[18px] bg-[#eeedf7] dark:bg-[#2c2128] p-4">
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#5b3f47] dark:text-[#e3bdc7]">
              Confidence
            </span>
            <div className="mt-2 text-2xl font-black text-[#1a1b22] dark:text-[#f1effa]">
              {selectedPatient.prediction.confidence.toFixed(1)}%
            </div>
          </div>
        </div>
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1a1b22] dark:text-[#f1effa]">
              Trend Timeline
            </h3>
            <p className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] mt-1">
              Vitals, analysis, and decision flow for the selected patient.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-[#e3e1ec] text-[#5b3f47] dark:bg-[#382a33] dark:text-[#e3bdc7]">
            <Clock3 className="w-3.5 h-3.5" />
            30 minute watch window
          </span>
        </div>

        <div className="flex flex-col">
          {timelineBase.map((step, index) => (
            <TimelineItem
              key={step.time}
              time={step.time}
              text={
                index < 3
                  ? 'Vitals recorded'
                  : index === 3
                  ? 'Prediction generated'
                  : referralDecision
              }
              accent={timelineAccent[index]}
              last={index === timelineBase.length - 1}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
