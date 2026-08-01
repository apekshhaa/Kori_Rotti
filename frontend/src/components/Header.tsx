import React from 'react';
import { NavTab } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenProfile?: () => void;
  onNavigateToHospital?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isDarkMode,
  onToggleDarkMode,
  isOffline,
  onToggleOffline,
  onOpenProfile,
  onNavigateToHospital,
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'assessments':
        return 'Assessments';
      case 'analytics':
        return 'Analytics';
      default:
        return 'Setu';
    }
  };

  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AP1WRLtCucK7Nci_2MsbVjHTKcGmJJbraDfAyfJpRgg9zre-sRwQov0mXVJcSN9WldFJwtjNQxYpU2Cb1Xa7Ig3JZuLpTQtCOlCwNmRkTEZxQ5S9saz-pEdBFs3I8zbXEYvSQBJyMqWe6nCgehPzKWEp2ljSLXp5X7zRdBhNzQ4BqRmuLDNCY-PxJM4kddkZAzWsFQsw4yLVDW38fkK2OlS4krzcOoLPesZRX-hvz3QRUC9ezGtq3N-EbK0HYiU';

  return (
    <header className="fixed top-0 w-full z-50 bg-[#fbf8ff]/80 dark:bg-[#130f12]/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e3e1ec]/30 dark:border-[#44333e]/30">
      <div className="h-16 px-6 max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            alt="Setu logo"
            className="h-8 w-auto object-contain rounded-sm"
            src={logoUrl}
            onError={(e) => {
              // Fallback icon if URL fails
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-semibold text-xl text-[#1a1b22] dark:text-[#f1effa] tracking-tight">
            Setu
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#b50063] bg-[#ffd9e3] dark:bg-[#4f1030] dark:text-[#ffb0c9] px-2 py-0.5 rounded-full ml-1">
            PHC-V1
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hospital Dashboard Switcher */}
          {onNavigateToHospital && (
            <button
              onClick={onNavigateToHospital}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#84cc16]/20 text-[#4d7c0f] dark:bg-[#84cc16]/30 dark:text-[#a3e635] flex items-center gap-1 hover:opacity-95 transition-opacity cursor-pointer border border-[#84cc16]/40"
              title="Open Receiving Hospital Dashboard"
            >
              <span className="material-symbols-outlined text-sm">local_hospital</span>
              <span className="hidden xs:inline">Hospital Portal</span>
            </button>
          )}

          {/* Offline Status Toggle */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? 'Simulating Offline Mode' : 'Online'}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
              isOffline
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          {/* Dark Mode Switch */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e3e1ec] dark:hover:bg-[#44333e] transition-colors text-[#5b3f47] dark:text-[#e3bdc7]"
            onClick={onToggleDarkMode}
            title="Toggle contrast / dark mode"
          >
            <span className="material-symbols-outlined text-xl">contrast</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-[#b50063] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            title="Health Officer Profile"
          >
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </button>
        </div>
      </div>

      <div className="px-6 max-w-2xl mx-auto pb-2">
        <h1 className="font-semibold text-2xl text-[#1a1b22] dark:text-[#f1effa] tracking-tight">
          {getTitle()}
        </h1>
      </div>
    </header>
  );
};
