import React from 'react';

interface TimelineEvent {
  time: string;
  label: string;
}

interface ReferralTimelineProps {
  timeline: TimelineEvent[];
}

export const ReferralTimeline: React.FC<ReferralTimelineProps> = ({ timeline }) => {
  return (
    <div className="flex flex-col gap-3 bg-slate-50 dark:bg-[#221a1f] p-5 rounded-2xl border border-slate-200/80 dark:border-[#382a33]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-slate-500 dark:text-[#e3bdc7] text-xl">
          schedule
        </span>
        <h4 className="text-sm font-bold text-slate-900 dark:text-[#f1effa] uppercase tracking-wide">
          Referral Timeline
        </h4>
      </div>

      <div className="relative pl-6 flex flex-col gap-4 pt-1">
        {/* Timeline line */}
        <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200 dark:bg-[#382a33]" />

        {timeline.map((item, index) => {
          const isLast = index === timeline.length - 1;
          return (
            <div key={index} className="relative flex items-baseline justify-between gap-4">
              {/* Dot */}
              <div
                className={`absolute -left-[18.5px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                  isLast
                    ? 'bg-[#84cc16] border-[#84cc16] ring-4 ring-[#84cc16]/20'
                    : 'bg-slate-400 dark:bg-slate-500 border-slate-50 dark:border-[#221a1f]'
                }`}
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-[#f1effa]">
                {item.label}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-[#e3bdc7] whitespace-nowrap">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
