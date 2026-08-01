import { useState, useEffect } from 'react';
import { NavTab, Patient } from './types';
import { INITIAL_PATIENTS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AssessmentsView } from './components/AssessmentsView';
import { AnalyticsView } from './components/AnalyticsView';
import { NewAssessmentModal } from './components/NewAssessmentModal';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { createReferral } from './services/referralApi';
import { useTranslation, languageOptions, LanguageCode } from './i18n.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const { t, setLanguage, language } = useTranslation();

  // Theme state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('setu_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  });

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>('PHC-003');
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Client-side URL Routing state
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Sync dark mode class on <html> element and persist in localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('setu_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('setu_theme', 'light');
    }
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleOffline = () => {
    setIsOffline((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Offline Mode Active. Referrals queued locally.'
          : 'Online Connected. Data synced with District Hospital network.'
      );
      return next;
    });
  };

  const handleSendReferral = async (patientId: string) => {
    const targetPatient = patients.find((p) => p.patientId === patientId);
    if (targetPatient) {
      await createReferral(targetPatient, targetPatient.caregiverFlags || ['Breathing harder']);
    }
    setPatients((prev) =>
      prev.map((p) =>
        p.patientId === patientId
          ? {
              ...p,
              referralSent: true,
              referralSentTime: 'Just now',
            }
          : p
      )
    );
    showToast('Referral transmitted to District Hospital!');
  };

  const handleSaveNewPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setActivePatientId(newPatient.patientId);
    setActiveTab('assessments');
    showToast(`Assessment created for ${newPatient.patientName} (Score ${newPatient.newsScore}/20)`);
  };

  const handleStartAssessmentFromDashboard = () => {
    setActiveTab('assessments');
  };

  const handleSelectPatient = (patientId: string) => {
    setActivePatientId(patientId);
    setActiveTab('assessments');
  };

  const handleLoadDemoData = () => {
    setActivePatientId('PHC-003');
    setActiveTab('assessments');
    showToast('Loaded demo patient Lakshmi (#REF-2024-082)');
  };

  const translatePage = (lang: LanguageCode) => {
    setLanguage(lang);
  };

  // Render Receiving Hospital Dashboard at /hospital route
  if (currentPath.startsWith('/hospital')) {
    return (
      <HospitalDashboard
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onNavigateToPhc={() => navigateTo('/')}
      />
    );
  }

  // Render existing PHC Application at default / route
  return (
    <div className="min-h-screen bg-[#fbf8f6] dark:bg-[#130f12] text-[#1a1b22] dark:text-[#f1effa] font-['Geist',sans-serif] transition-colors duration-200">
      {/* Fixed Top Header */}
      <Header
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        onOpenProfile={() => showToast(t('toast.referralSent'))}
        onNavigateToHospital={() => navigateTo('/hospital')}
        selectedLanguage={language}
        languageOptions={languageOptions}
        onSelectLanguage={translatePage}
      />

      {/* Main Content View Container */}
      <main className="pt-28 pb-24 px-4 sm:px-6 max-w-2xl mx-auto min-h-screen">
        {activeTab === 'dashboard' && (
          <DashboardView
            patients={patients}
            onStartAssessment={handleStartAssessmentFromDashboard}
            onSelectPatient={handleSelectPatient}
            isOffline={isOffline}
            onToggleOffline={handleToggleOffline}
            onLoadDemoData={handleLoadDemoData}
          />
        )}

        {activeTab === 'assessments' && (
          <AssessmentsView
            patients={patients}
            activePatientId={activePatientId}
            onSelectPatient={setActivePatientId}
            onSendReferral={handleSendReferral}
            onOpenNewAssessment={() => setIsNewModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView patients={patients} />}
      </main>

      {/* Bottom Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1a1b22] dark:bg-[#f1effa] text-white dark:text-[#1a1b22] text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce">
          <span className="material-symbols-outlined text-sm text-[#b50063]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* New Patient Assessment Modal */}
      <NewAssessmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSavePatient={handleSaveNewPatient}
      />

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
