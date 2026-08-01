import React from 'react';
import { Patient } from '../types';
import { calculateNewsPoints } from '../utils/newsCalculator';

interface NewsBreakdownCardProps {
  patient: Patient;
  onPrepareReferral: () => void;
  onSwitchToDocView: () => void;
}

export const NewsBreakdownCard: React.FC<NewsBreakdownCardProps> = ({
  patient,
  onPrepareReferral,
  onSwitchToDocView,
}) => {
  const calculation = calculateNewsPoints(patient.vitals);

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      {/* View Switcher Banner */}
      <div className="flex items-center justify-between bg-[#eeedf7] dark:bg-[#2c2128] p-2 px-3 rounded-xl">
        <span className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">
          Mode: <strong className="text-[#1a1b22] dark:text-[#f1effa]">NEWS Scoring Model</strong>
        </span>
        <button
          onClick={onSwitchToDocView}
          className="text-xs font-semibold text-[#b50063] dark:text-[#ffb0c9] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View Referral Card</span>
          <span className="material-symbols-outlined text-sm">description</span>
        </button>
      </div>

      {/* Hero Risk Score Section */}
      <div className="relative overflow-hidden rounded-2xl bg-[#e8e7f1] dark:bg-[#382a33] p-6 flex flex-col items-center justify-center text-center shadow-sm border border-[#e3e1ec]/50 dark:border-[#44333e]">
        {/* Ambient SVG animation */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#pink-gradient)"
              strokeWidth="0.8"
            >
              <animate attributeName="r" dur="4s" repeatCount="indefinite" values="70;92;70" />
              <animate
                attributeName="opacity"
                dur="4s"
                repeatCount="indefinite"
                values="0.2;0.8;0.2"
              />
            </circle>
            <defs>
              <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b50063" />
                <stop offset="100%" stopColor="#ffb0c9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Pulsing Status Indicator */}
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-full bg-[#b50063] animate-ping opacity-50" />
            <div className="w-4 h-4 rounded-full bg-[#b50063] relative shadow-[0_0_15px_rgba(181,0,99,0.8)]" />
          </div>

          <span className="text-xs font-bold text-[#b50063] dark:text-[#ffb0c9] tracking-[0.2em] mb-1 uppercase">
            National Early Warning Score
          </span>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-[76px] leading-none font-black text-[#1a1b22] dark:text-[#f1effa] tracking-tighter">
              {patient.newsScore}
            </span>
            <span className="text-2xl font-bold text-[#5b3f47] dark:text-[#e3bdc7] opacity-60">
              /20
            </span>
          </div>

          <div className="mt-3 px-5 py-1.5 bg-[#b50063] dark:bg-[#e2007d] rounded-full shadow-lg shadow-[#b50063]/30">
            <span className="text-xs font-extrabold text-white tracking-widest uppercase">
              {calculation.urgencyLevel === 'URGENT' || patient.newsScore >= 15
                ? 'Urgent Action Required'
                : `${calculation.urgencyLevel} RISK LEVEL`}
            </span>
          </div>
        </div>
      </div>

      {/* Assessment Breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-[#1a1b22] dark:text-[#f1effa]">
            Clinical Breakdown
          </h2>
          <span className="text-xs font-medium text-[#5b3f47] dark:text-[#e3bdc7]">
            Last updated: {patient.lastAssessedTime}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {calculation.breakdown.map((item, idx) => {
            return (
              <div
                key={idx}
                className="group flex items-center justify-between p-4 bg-[#eeedf7] dark:bg-[#2c2128] rounded-xl transition-all hover:bg-[#e8e7f1] dark:hover:bg-[#382a33]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffd9e3] dark:bg-[#4f1030] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#8e004c] dark:text-[#ffb0c9] text-xl">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">
                      {item.label}
                    </span>
                    <span className="text-lg font-bold text-[#1a1b22] dark:text-[#f1effa]">
                      {item.value} <small className="text-sm font-normal text-[#5b3f47] dark:text-[#e3bdc7]">{item.unit}</small>
                    </span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.points >= 3
                      ? 'bg-[#ffdad6] dark:bg-[#600010] text-[#93000a] dark:text-[#ffdad6]'
                      : item.points >= 1
                      ? 'bg-[#e3e1ec] dark:bg-[#44333e] text-[#5b3f47] dark:text-[#e3bdc7]'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {item.points > 0 ? `+${item.points} Points` : 'Normal (0)'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Action Alert Section */}
      <div className="mt-2 flex flex-col gap-3">
        <div className="bg-[#e2007d] dark:bg-[#4f1030] p-4 rounded-2xl flex items-start gap-3 shadow-md border border-[#b50063]/30">
          <span className="material-symbols-outlined text-white text-2xl flex-shrink-0">
            info
          </span>
          <p className="text-sm font-medium text-white leading-relaxed">
            {calculation.recommendation}
          </p>
        </div>

        <button
          onClick={onPrepareReferral}
          className="w-full h-14 bg-[#b50063] hover:bg-[#a00057] text-white rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-[#b50063]/25 active:scale-95 transition-transform"
        >
          <span>Prepare Referral</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </div>

      {/* Decorative Chart Placeholder with Live Patient History */}
      <div className="w-full bg-[#f4f2fd] dark:bg-[#221a1f] rounded-2xl p-4 flex flex-col gap-2 border border-[#eeedf7] dark:border-[#382a33]">
        <div className="flex items-center justify-between text-xs text-[#5b3f47] dark:text-[#e3bdc7] font-semibold">
          <span>NEWS Progression Timeline</span>
          <span>Max Score: 20</span>
        </div>
        <div className="h-28 flex items-end gap-2 pt-2">
          {patient.historyScores.map((h, i) => {
            const heightPct = Math.min(100, Math.max(15, (h.score / 20) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] font-bold text-[#b50063] dark:text-[#ffb0c9] opacity-0 group-hover:opacity-100 transition-opacity">
                  {h.score}
                </span>
                <div
                  className="w-full bg-[#b50063] rounded-t-md transition-all duration-700 animate-grow"
                  style={{
                    height: `${heightPct}%`,
                    opacity: 0.3 + (i / patient.historyScores.length) * 0.7,
                  }}
                />
                <span className="text-[9px] text-[#5b3f47] dark:text-[#e3bdc7] truncate w-full text-center">
                  {h.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
