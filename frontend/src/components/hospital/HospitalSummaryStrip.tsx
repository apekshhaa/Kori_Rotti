import React from 'react';
import { NormalizedReferral } from '../../services/referralApi';

interface HospitalSummaryStripProps {
  referrals: NormalizedReferral[];
}

export const HospitalSummaryStrip: React.FC<HospitalSummaryStripProps> = ({ referrals }) => {
  const incomingCount = referrals.length;
  const urgentCount = referrals.filter((r) => r.riskLevel === 'URGENT').length;
  const acknowledgedCount = referrals.filter(
    (r) => r.status === 'acknowledged' || r.status === 'arrived' || r.status === 'checked_in'
  ).length;

  // Find nearest ETA (smallest non-null numeric eta in minutes)
  const incomingWithEta = referrals.filter((r) => r.eta !== null && r.status !== 'arrived' && r.status !== 'checked_in');
  let nearestEtaStr = 'None';
  if (incomingWithEta.length > 0) {
    const sorted = [...incomingWithEta].sort((a, b) => (a.eta || 0) - (b.eta || 0));
    nearestEtaStr = sorted[0].formattedEta;
  } else if (referrals.length > 0) {
    nearestEtaStr = referrals[0].formattedEta;
  }

  return (
    <div className="bg-white dark:bg-[#1a1316] border border-slate-200 dark:border-[#382a33] rounded-2xl p-4 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-[#382a33]">
        {/* Metric 1 */}
        <div className="flex flex-col items-start px-2 pt-2 sm:pt-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Incoming
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-[#f1effa] mt-0.5">
            {incomingCount}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col items-start px-2 pt-2 sm:pt-0 sm:pl-6">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Urgent
          </span>
          <span className={`text-2xl font-black mt-0.5 ${urgentCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-[#f1effa]'}`}>
            {urgentCount}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col items-start px-2 pt-2 sm:pt-0 sm:pl-6">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Nearest ETA
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-[#f1effa] mt-0.5">
            {nearestEtaStr}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col items-start px-2 pt-2 sm:pt-0 sm:pl-6">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Acknowledged
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-[#f1effa] mt-0.5">
            {acknowledgedCount}
          </span>
        </div>
      </div>
    </div>
  );
};
