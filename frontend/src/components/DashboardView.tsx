import React from 'react';
import { Patient } from '../types';
import { useTranslation } from '../i18n.tsx';

interface DashboardViewProps {
  patients: Patient[];
  onStartAssessment: () => void;
  onSelectPatient: (patientId: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onLoadDemoData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  onStartAssessment,
  onSelectPatient,
  isOffline,
  onToggleOffline,
  onLoadDemoData,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn pb-6">
      {/* Hero Section with Decorative Blob Animation */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#e8e7f1] dark:bg-[#382a33] p-6 flex flex-col gap-4 shadow-sm border border-[#e3e1ec]/50 dark:border-[#44333e]">
        {/* Animated Background Blob */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M44.7,-76.4C58.3,-69.2,70.1,-57.4,78.2,-43.3C86.3,-29.2,90.7,-12.8,89.5,3.1C88.3,19.1,81.4,34.5,71.2,47.4C61.1,60.3,47.7,70.6,33,76.4C18.3,82.2,2.3,83.5,-13.7,80.7C-29.8,77.9,-45.9,71,-59.1,59.8C-72.3,48.7,-82.7,33.3,-86.3,16.8C-89.9,0.3,-86.7,-17.3,-78.9,-32.5C-71.1,-47.7,-58.7,-60.5,-44.5,-67.4C-30.3,-74.3,-14.2,-75.4,1.4,-77.9C17,-80.4,31.1,-83.6,44.7,-76.4Z"
              fill="#b50063"
              transform="translate(100 100)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="25s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbf8ff] dark:bg-[#1a1316] w-fit shadow-xs border border-[#e3e1ec] dark:border-[#44333e]">
            <span className="material-symbols-outlined text-sm text-[#b50063] dark:text-[#ffb0c9]">
              bolt
            </span>
            <span className="text-[11px] font-bold text-[#b50063] dark:text-[#ffb0c9] uppercase tracking-wider">
              {t('dashboard.heroBadge')}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1b22] dark:text-[#f1effa] leading-tight tracking-tight">
            {t('dashboard.heroTitle')}
          </h2>

          <p className="text-sm sm:text-base text-[#5b3f47] dark:text-[#e3bdc7] leading-relaxed max-w-xs">
            {t('dashboard.heroSubtitle')}
          </p>
        </div>

        <div className="relative z-10 mt-2">
          <button
            onClick={onStartAssessment}
            className="w-full bg-[#b50063] hover:bg-[#a00057] text-white py-3.5 px-6 rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#b50063]/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{t('dashboard.startAssessment')}</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Status & Utilities Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Offline Indicator Card */}
        <button
          onClick={onToggleOffline}
          className="bg-[#f4f2fd] dark:bg-[#221a1f] p-4 rounded-2xl flex flex-col gap-1.5 relative overflow-hidden text-left border border-[#eeedf7] dark:border-[#382a33] hover:border-[#b50063]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 z-10">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-bold text-[#1a1b22] dark:text-[#f1effa]">
              {isOffline ? t('dashboard.offlineActive') : t('dashboard.offlineReady')}
            </span>
          </div>
          <p className="text-[11px] text-[#5b3f47] dark:text-[#e3bdc7] leading-snug z-10">
            {t('dashboard.offlineDescription')}
          </p>
          <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-5xl text-[#e3e1ec] dark:text-[#382a33] opacity-60 pointer-events-none group-hover:scale-110 transition-transform">
            cloud_off
          </span>
        </button>

        {/* Demo Patient Card */}
        <button
          onClick={onLoadDemoData}
          className="bg-[#f4f2fd] dark:bg-[#221a1f] p-4 rounded-2xl flex flex-col gap-1.5 text-left border border-[#eeedf7] dark:border-[#382a33] hover:border-[#b50063]/40 transition-all cursor-pointer active:bg-[#e3e1ec] dark:active:bg-[#382a33]"
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#b50063] dark:text-[#ffb0c9] text-lg">
              clinical_notes
            </span>
            <span className="text-xs font-bold text-[#1a1b22] dark:text-[#f1effa]">
              {t('dashboard.demoPatient')}
            </span>
          </div>
          <p className="text-[11px] text-[#5b3f47] dark:text-[#e3bdc7] leading-snug">
            {t('dashboard.demoDescription')}
          </p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#5b3f47] dark:text-[#e3bdc7] uppercase tracking-widest">
            {t('dashboard.recentActivity')}
          </h3>
          <span
            onClick={onStartAssessment}
            className="text-xs font-semibold text-[#b50063] dark:text-[#ffb0c9] cursor-pointer hover:underline"
          >
            {t('dashboard.viewAll')} ({patients.length})
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {patients.map((p) => {
            const isUrgent = p.riskLevel === 'URGENT' || p.newsScore >= 15;
            const isHigh = p.riskLevel === 'HIGH RISK' || (p.newsScore >= 8 && !isUrgent);

            return (
              <div
                key={p.patientId}
                onClick={() => onSelectPatient(p.patientId)}
                className="flex items-center gap-3 bg-[#ffffff] dark:bg-[#1a1316] p-4 rounded-2xl border border-[#eeedf7] dark:border-[#382a33] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="w-11 h-11 rounded-full bg-[#ffd9e3] dark:bg-[#4f1030] flex items-center justify-center flex-shrink-0 text-[#8e004c] dark:text-[#ffb0c9]">
                  {p.photoUrl ? (
                    <img
                      src={p.photoUrl}
                      alt={p.patientName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-xl">person</span>
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-base font-bold text-[#1a1b22] dark:text-[#f1effa] truncate">
                    {p.patientName} ({p.patientId})
                  </span>
                  <span className="text-xs text-[#5b3f47] dark:text-[#e3bdc7]">
                    Last assessed {p.lastAssessedTime} • Score {p.newsScore}/20
                  </span>
                </div>

                <div
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-tight flex-shrink-0 ${
                    isUrgent
                      ? 'bg-[#ffdad6] dark:bg-[#600010] text-[#93000a] dark:text-[#ffdad6] animate-pulse'
                      : isHigh
                      ? 'bg-[#ffdad6] dark:bg-[#600010] text-[#93000a] dark:text-[#ffdad6]'
                      : 'bg-[#e3e1ec] dark:bg-[#382a33] text-[#5b3f47] dark:text-[#e3bdc7]'
                  }`}
                >
                  {p.riskLevel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-4 flex flex-col items-center gap-2 opacity-70">
        <div className="w-16 h-1 bg-[#e3e1ec] dark:bg-[#382a33] rounded-full" />
        <p className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] text-center max-w-[220px]">
          {t('dashboard.footer')}
        </p>
      </div>
    </div>
  );
};
