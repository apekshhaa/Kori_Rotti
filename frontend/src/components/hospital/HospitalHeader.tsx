import React, { useState, useEffect } from 'react';

interface HospitalHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateToPhc: () => void;
  isMock: boolean;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onNavigateToPhc,
  isMock,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1a1316]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#382a33] px-6 py-3.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shadow-sm" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
              S
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 dark:text-[#f1effa] tracking-tight">
                  SETU
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                  Receiving Hospital
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#e3bdc7]">
                District Hospital, Mangalore
              </span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          {/* Live Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-[#2c2128] border border-slate-200 dark:border-[#382a33] text-xs font-semibold" >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }} />
            <span style={{ color: 'var(--color-primary)' }}>Receiving referrals</span>
          </div>

          {/* Demo Data Indicator if applicable */}
          {isMock && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-primary)' }}>
              Demo data
            </span>
          )}

          {/* Time display */}
          <span className="hidden md:inline text-xs font-mono font-medium text-slate-500 dark:text-[#e3bdc7]">
            {timeStr}
          </span>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#2c2128] hover:bg-slate-200 dark:hover:bg-[#382a33] text-slate-700 dark:text-[#f1effa] transition-colors cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            <span className="material-symbols-outlined text-xl">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Switch to PHC App */}
          <button
            onClick={onNavigateToPhc}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#f1effa] dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">smartphone</span>
            <span>PHC Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
