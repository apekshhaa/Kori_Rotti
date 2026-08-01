import React from 'react';
import { NormalizedReferral } from '../../services/referralApi';
import { PreparationChecklist } from './PreparationChecklist';
import { ReferralTimeline } from './ReferralTimeline';

interface ReferralDetailProps {
  referral: NormalizedReferral;
  onStatusUpdate: (referralId: string, newStatus: 'acknowledged' | 'arrived' | 'checked_in') => void;
  onClose?: () => void;
}

export const ReferralDetail: React.FC<ReferralDetailProps> = ({
  referral,
  onStatusUpdate,
  onClose,
}) => {
  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'URGENT':
        return 'bg-red-500/10 text-red-600 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'WATCH':
        return 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  const getStatusButtonConfig = () => {
    switch (referral.status) {
      case 'sent':
        return {
          label: 'Acknowledge Referral',
          nextStatus: 'acknowledged' as const,
          icon: 'task_alt',
          bgColor: 'bg-slate-900 hover:bg-slate-800 dark:bg-[#84cc16] dark:hover:bg-[#a3e635] text-white dark:text-[#1a1b22]',
        };
      case 'acknowledged':
        return {
          label: 'Mark Patient Arrived',
          nextStatus: 'arrived' as const,
          icon: 'local_hospital',
          bgColor: 'bg-[#84cc16] hover:bg-[#99e320] text-slate-950 font-extrabold',
        };
      case 'arrived':
        return {
          label: 'Mark Checked In',
          nextStatus: 'checked_in' as const,
          icon: 'how_to_reg',
          bgColor: 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold',
        };
      case 'checked_in':
        return {
          label: '✓ Patient Checked In',
          nextStatus: null,
          icon: 'verified',
          bgColor: 'bg-slate-200 dark:bg-[#382a33] text-slate-600 dark:text-[#e3bdc7] cursor-default',
        };
      default:
        return {
          label: 'Acknowledge Referral',
          nextStatus: 'acknowledged' as const,
          icon: 'task_alt',
          bgColor: 'bg-slate-900 text-white',
        };
    }
  };

  const buttonConfig = getStatusButtonConfig();

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-[#1a1316] p-6 rounded-2xl border border-slate-200 dark:border-[#382a33] shadow-sm animate-fadeIn transition-all">
      {/* Detail Header */}
      <div className="flex flex-col gap-3 pb-5 border-b border-slate-100 dark:border-[#382a33]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getRiskBadgeColor(
                referral.riskLevel
              )}`}
            >
              {referral.riskLevel} REFERRAL
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#e3bdc7] bg-slate-100 dark:bg-[#2c2128] px-2.5 py-1 rounded-md">
              {referral.patientId}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-[#f1effa] tracking-tight">
              {referral.patientName}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-[#e3bdc7]">
              {referral.age}y {referral.gender} · From: <strong className="text-slate-800 dark:text-[#f1effa]">{referral.phc}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 block">
                ETA
              </span>
              <span className="text-lg font-black text-[#84cc16] dark:text-[#a3e635]">
                {referral.formattedEta}
              </span>
            </div>
            <div className="text-right border-l border-slate-200 dark:border-[#382a33] pl-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 block">
                EWS Score
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#f1effa]">
                {referral.riskScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Current Vitals
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Pulse */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#221a1f] border border-slate-100 dark:border-[#382a33]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-[#e3bdc7] block">Pulse</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-[#f1effa]">
                {referral.vitals.pulse}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#e3bdc7]">bpm</span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#221a1f] border border-slate-100 dark:border-[#382a33]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-[#e3bdc7] block">
              Blood Pressure
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-[#f1effa]">
                {referral.vitals.systolic_bp}/{referral.vitals.diastolic_bp}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#e3bdc7]">mmHg</span>
            </div>
          </div>

          {/* SpO2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#221a1f] border border-slate-100 dark:border-[#382a33]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-[#e3bdc7] block">SpO2</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-black ${referral.vitals.spo2 < 95 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-[#f1effa]'}`}>
                {referral.vitals.spo2}%
              </span>
            </div>
          </div>

          {/* Temperature */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#221a1f] border border-slate-100 dark:border-[#382a33]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-[#e3bdc7] block">
              Temperature
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-[#f1effa]">
                {referral.vitals.temperature}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#e3bdc7]">
                {referral.vitals.tempUnit}
              </span>
            </div>
          </div>

          {/* Respiration */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#221a1f] border border-slate-100 dark:border-[#382a33]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-[#e3bdc7] block">
              Respiration
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-[#f1effa]">
                {referral.vitals.respiration}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#e3bdc7]">/min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Caregiver Observations */}
      {referral.caregiverFlags.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Caregiver Observations
          </h3>
          <div className="flex flex-wrap gap-2">
            {referral.caregiverFlags.map((flag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>{flag}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trend */}
      <div className="flex flex-col gap-2 bg-slate-50 dark:bg-[#221a1f] p-4 rounded-xl border border-slate-200/80 dark:border-[#382a33]">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Recent Trend
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700 dark:text-[#e3bdc7]">
          <div>
            <span className="text-[10px] text-slate-400 block font-normal">SpO2</span>
            <span>97 → 95 → {referral.vitals.spo2}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-normal">Pulse</span>
            <span>82 → 96 → {referral.vitals.pulse} bpm</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-normal">Respiration</span>
            <span>18 → 21 → {referral.vitals.respiration}/min</span>
          </div>
        </div>
      </div>

      {/* Preparation Checklist */}
      <PreparationChecklist
        referralId={referral.id}
        recommendedActions={referral.recommendedActions}
      />

      {/* Status Action Button */}
      {buttonConfig.nextStatus && (
        <button
          onClick={() => onStatusUpdate(referral.id, buttonConfig.nextStatus!)}
          className={`w-full py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 font-bold shadow-md transition-all active:scale-[0.99] cursor-pointer ${buttonConfig.bgColor}`}
        >
          <span className="material-symbols-outlined text-lg">{buttonConfig.icon}</span>
          <span>{buttonConfig.label}</span>
        </button>
      )}

      {!buttonConfig.nextStatus && (
        <div className="w-full py-3 px-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-center text-xs font-bold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Patient Checked In & Admitted</span>
        </div>
      )}

      {/* Referral Timeline */}
      <ReferralTimeline timeline={referral.timeline} />
    </div>
  );
};
