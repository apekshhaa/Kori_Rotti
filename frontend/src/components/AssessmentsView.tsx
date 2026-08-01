import React, { useState } from 'react';
import { AssessmentSubView, Patient } from '../types';
import { ReferralDocCard } from './ReferralDocCard';
import { NewsBreakdownCard } from './NewsBreakdownCard';

interface AssessmentsViewProps {
  patients: Patient[];
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onSendReferral: (patientId: string) => void;
  onOpenNewAssessment: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  patients,
  activePatientId,
  onSelectPatient,
  onSendReferral,
  onOpenNewAssessment,
}) => {
  const [subView, setSubView] = useState<AssessmentSubView>('referral');

  const selectedPatient =
    patients.find((p) => p.id === activePatientId) || patients[0] || null;

  if (!selectedPatient) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
        <span className="material-symbols-outlined text-5xl text-[#5b3f47]">clinical_notes</span>
        <p className="text-sm font-semibold">No patient assessment found.</p>
        <button
          onClick={onOpenNewAssessment}
          className="px-5 py-2.5 bg-[#b50063] text-white rounded-full font-bold text-sm"
        >
          Create First Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4 animate-fadeIn pb-6">
      {/* Patient Selector Bar & Action */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {patients.map((p) => {
            const isSelected = p.id === selectedPatient.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPatient(p.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#b50063] text-white shadow-md shadow-[#b50063]/25'
                    : 'bg-[#eeedf7] dark:bg-[#2c2128] text-[#1a1b22] dark:text-[#f1effa] hover:bg-[#e3e1ec]'
                }`}
              >
                <span>{p.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e3e1ec] dark:bg-[#382a33] text-[#5b3f47] dark:text-[#e3bdc7]'
                  }`}
                >
                  {p.newsScore}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenNewAssessment}
          className="px-3 py-1.5 bg-[#ffd9e3] dark:bg-[#4f1030] text-[#8e004c] dark:text-[#ffb0c9] rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer hover:opacity-90"
          title="Start new clinical assessment"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* Main Assessment View Component */}
      {subView === 'referral' ? (
        <ReferralDocCard
          patient={selectedPatient}
          onSendReferral={onSendReferral}
          onSwitchToNewsView={() => setSubView('news')}
        />
      ) : (
        <NewsBreakdownCard
          patient={selectedPatient}
          onPrepareReferral={() => setSubView('referral')}
          onSwitchToDocView={() => setSubView('referral')}
        />
      )}
    </div>
  );
};
