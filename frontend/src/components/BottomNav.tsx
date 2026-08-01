import React from 'react';
import { NavTab } from '../types';
import { useTranslation } from '../i18n.tsx';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const tabs: { id: NavTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: t('bottomNav.dashboard'), icon: 'dashboard' },
    { id: 'assessments', label: t('bottomNav.assessments'), icon: 'clinical_notes' },
    { id: 'analytics', label: t('bottomNav.analytics'), icon: 'monitoring' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#fbf8ff]/90 dark:bg-[#130f12]/90 backdrop-blur-xl border-t border-[#e3e1ec]/40 dark:border-[#44333e]/40 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 flex items-center justify-around px-2 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-20 py-1 gap-1 transition-all ${
                isActive
                  ? 'text-[#b50063] font-bold dark:text-[#ffb0c9]'
                  : 'text-[#5b3f47] dark:text-[#e3bdc7] hover:text-[#b50063] font-medium'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl transition-transform"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                }}
              >
                {tab.icon}
              </span>
              <span className="text-[11px] leading-tight tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#b50063] dark:bg-[#ffb0c9] -mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
