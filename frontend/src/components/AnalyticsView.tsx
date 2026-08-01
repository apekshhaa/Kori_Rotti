import React from 'react';
import { Patient } from '../types';

interface AnalyticsViewProps {
  patients: Patient[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ patients }) => {
  const totalAssessments = 142;
  const totalReferralsSent = patients.filter((p) => p.referralSent).length + 38;
  const urgentCount = patients.filter((p) => p.newsScore >= 12).length + 12;
  const avgResponseTime = '14.2 min';

  const facilityStats = [
    { name: 'District General Hospital', count: 28, dist: '4.2 km' },
    { name: 'District Tertiary Trauma Center', count: 14, dist: '8.5 km' },
    { name: 'Community Health Center', count: 42, dist: '1.8 km' },
  ];

  const monthlyVolume = [
    { month: 'Feb', count: 18 },
    { month: 'Mar', count: 24 },
    { month: 'Apr', count: 31 },
    { month: 'May', count: 28 },
    { month: 'Jun', count: 45 },
    { month: 'Jul', count: 52 },
  ];

  return (
    <div className="flex flex-col w-full gap-5 animate-fadeIn pb-6">
      {/* Overview Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#f4f2fd] dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
          <span className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">
            Total Assessments
          </span>
          <div className="text-3xl font-extrabold text-[#1a1b22] dark:text-[#f1effa] mt-1">
            {totalAssessments}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 mt-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            +18% this month
          </span>
        </div>

        <div className="bg-[#f4f2fd] dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
          <span className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">
            Transmitted Referrals
          </span>
          <div className="text-3xl font-extrabold text-[#b50063] dark:text-[#ffb0c9] mt-1">
            {totalReferralsSent}
          </div>
          <span className="text-[10px] text-[#5b3f47] dark:text-[#e3bdc7] font-medium mt-1 block">
            100% digital signature
          </span>
        </div>

        <div className="bg-[#f4f2fd] dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
          <span className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">
            Urgent Escalations
          </span>
          <div className="text-3xl font-extrabold text-[#ba1a1a] dark:text-[#ffdad6] mt-1">
            {urgentCount}
          </div>
          <span className="text-[10px] text-[#93000a] dark:text-[#ffdad6] font-bold mt-1 block">
            Score ≥ 12/20
          </span>
        </div>

        <div className="bg-[#f4f2fd] dark:bg-[#221a1f] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33]">
          <span className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">
            Avg Transfer Time
          </span>
          <div className="text-3xl font-extrabold text-[#1a1b22] dark:text-[#f1effa] mt-1">
            {avgResponseTime}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
            3.5 min faster target
          </span>
        </div>
      </div>

      {/* Monthly Referral Volume */}
      <div className="bg-[#e8e7f1] dark:bg-[#382a33] p-5 rounded-2xl border border-[#e3e1ec]/50 dark:border-[#44333e]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">
            Monthly Referral Trends
          </h3>
          <span className="text-xs font-semibold text-[#b50063] dark:text-[#ffb0c9]">
            2026 YTD
          </span>
        </div>

        <div className="h-36 flex items-end gap-3 pt-4">
          {monthlyVolume.map((m, idx) => {
            const maxVal = 60;
            const pct = (m.count / maxVal) * 100;
            const isLatest = idx === monthlyVolume.length - 1;

            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] font-bold text-[#b50063] dark:text-[#ffb0c9]">
                  {m.count}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    isLatest
                      ? 'bg-[#b50063] shadow-md shadow-[#b50063]/30'
                      : 'bg-[#b50063]/40 dark:bg-[#ffb0c9]/30'
                  }`}
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[10px] font-medium text-[#5b3f47] dark:text-[#e3bdc7]">
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facility Distribution List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-[#5b3f47] dark:text-[#e3bdc7] uppercase tracking-widest px-1">
          Target Referral Facilities
        </h3>

        <div className="flex flex-col gap-2">
          {facilityStats.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-[#f4f2fd] dark:bg-[#221a1f] rounded-xl border border-[#eeedf7] dark:border-[#382a33]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#b50063]/10 dark:bg-[#ffb0c9]/10 text-[#b50063] dark:text-[#ffb0c9] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">local_hospital</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#1a1b22] dark:text-[#f1effa]">
                    {f.name}
                  </span>
                  <span className="text-xs text-[#5b3f47] dark:text-[#e3bdc7]">
                    Distance: {f.dist}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#b50063] dark:text-[#ffb0c9]">
                  {f.count}
                </span>
                <span className="text-[10px] text-[#5b3f47] dark:text-[#e3bdc7] block">cases</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
