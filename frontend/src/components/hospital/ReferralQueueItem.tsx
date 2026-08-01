import React from 'react';
import QRCode from 'react-qr-code';
import { generateCaregiverUrl, isPublicAppUrlConfigured, NormalizedReferral } from '../../services/referralApi';

interface ReferralQueueItemProps {
  referral: NormalizedReferral;
  isSelected: boolean;
  onSelect: (referral: NormalizedReferral) => void;
  isNewUrgent?: boolean;
}

export const ReferralQueueItem: React.FC<ReferralQueueItemProps> = ({
  referral,
  isSelected,
  onSelect,
  isNewUrgent,
}) => {
  const getRiskBorder = (level: string) => {
    switch (level) {
      case 'URGENT':
        return 'bg-red-500';
      case 'WATCH':
        return 'bg-primary';
      default:
        return 'bg-primary';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'WATCH':
        return 'bg-white/60 text-[var(--color-primary)] dark:bg-[#2c2128] dark:text-[var(--color-on-primary)] border border-slate-200 dark:border-[#382a33]';
      default:
        return 'bg-white/60 text-[var(--color-primary)] dark:bg-[#2c2128] dark:text-[var(--color-on-primary)] border border-slate-200 dark:border-[#382a33]';
    }
  };

  const caregiverUrl = generateCaregiverUrl(referral.patientToken || referral.id);
  const hasPublicUrl = isPublicAppUrlConfigured();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'arrived':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'checked_in':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-white dark:bg-[#1a1316] text-[var(--color-on-surface)] border-slate-200 dark:border-[#382a33]';
    }
  };

  return (
    <div
      onClick={() => onSelect(referral)}
      className={`relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'bg-slate-50 dark:bg-[#2c2128] border-slate-900 shadow-md'
          : 'bg-white dark:bg-[#1a1316] border-slate-200/90 dark:border-[#382a33] hover:border-slate-300 dark:hover:border-[#44333e] hover:shadow-xs'
      } ${isNewUrgent ? 'animate-pulse ring-2 ring-red-400 dark:ring-red-500/50' : ''}`}
    >
      {/* Risk Color Strip on Left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getRiskBorder(referral.riskLevel)}`} />

      <div className="p-4 pl-5 flex flex-col gap-3">
        {/* Row 1: Badges, Patient ID, Facility, ETA */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide border uppercase ${getRiskBadge(
                referral.riskLevel
              )}`}
            >
              {referral.riskLevel}
            </span>

            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-[#f1effa]">
              {referral.patientId}
            </span>

            <span className="text-xs text-slate-500 dark:text-[#e3bdc7] hidden sm:inline">
              · {referral.phc}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${getStatusBadge(
                referral.status
              )}`}
            >
              {referral.status.replace('_', ' ')}
            </span>

              <div className="flex items-center gap-1 text-xs font-black text-slate-900 dark:text-[#f1effa] bg-slate-100 dark:bg-[#221a1f] px-2 py-0.5 rounded-md">
              <span className="material-symbols-outlined text-xs" style={{ color: 'var(--color-primary)' }}>schedule</span>
              <span>{referral.formattedEta}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Patient Info & EWS Score */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="font-bold text-base text-slate-900 dark:text-[#f1effa]">
              {referral.patientName}
            </span>
            <span className="text-xs text-slate-500 dark:text-[#e3bdc7] ml-2 font-medium">
              ({referral.age}y {referral.gender})
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 block sm:hidden">
              From: {referral.phc}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              EWS
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-[#f1effa]">
              {referral.riskScore}
            </span>
          </div>
        </div>

        {/* Row 3: Key Vitals Summary */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-[#e3bdc7] pt-1 border-t border-slate-100 dark:border-[#2c2128]/60">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span>
              SpO2:{' '}
              <strong
                className={
                  referral.vitals.spo2 < 95
                    ? 'text-red-600 dark:text-red-400 font-extrabold'
                    : 'text-slate-900 dark:text-[#f1effa]'
                }
              >
                {referral.vitals.spo2}%
              </strong>
            </span>
            <span>
              Pulse:{' '}
              <strong className="text-slate-900 dark:text-[#f1effa]">
                {referral.vitals.pulse}
              </strong>
            </span>
            <span>
              BP:{' '}
              <strong className="text-slate-900 dark:text-[#f1effa]">
                {referral.vitals.systolic_bp}/{referral.vitals.diastolic_bp}
              </strong>
            </span>
            <span>
              Resp:{' '}
              <strong className="text-slate-900 dark:text-[#f1effa]">
                {referral.vitals.respiration}
              </strong>
            </span>
          </div>

          <button className="text-xs font-extrabold flex items-center gap-0.5 hover:underline flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
            <span>View</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {referral.caregiverFlags.length > 0 && (
              <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit" style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-primary)' }}>
                <span className="material-symbols-outlined text-xs">visibility</span>
                <span>{referral.caregiverFlags.join(', ')}</span>
              </div>
            )}
            {referral.caregiverObservations.length > 0 && (
              <>
                <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1.5 w-fit">
                  <span className="material-symbols-outlined text-xs">visibility</span>
                  <span>{referral.caregiverObservations[0].text}</span>
                </div>
                <span className="rounded-full bg-[#84cc16] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">
                  New
                </span>
              </>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-[#382a33] dark:bg-[#221a1f]">
            {caregiverUrl ? (
              <QRCode value={caregiverUrl} size={56} level="M" />
            ) : (
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-lg bg-slate-100 text-[8px] font-semibold text-slate-500">
                QR
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
