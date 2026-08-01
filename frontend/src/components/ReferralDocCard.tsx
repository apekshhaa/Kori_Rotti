import React, { useState } from 'react';
import { Patient } from '../types';
import { useTranslation } from '../i18n.tsx';
import { CaregiverQrCard } from './hospital/CaregiverQrCard';

interface ReferralDocCardProps {
  patient: Patient;
  onSendReferral: (patientId: string) => void;
  onDeletePatient: (patientId: string) => void;
  onSwitchToNewsView: () => void;
}

export const ReferralDocCard: React.FC<ReferralDocCardProps> = ({
  patient,
  onSendReferral,
  onDeletePatient,
  onSwitchToNewsView,
}) => {
  const { t } = useTranslation();
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isSent, setIsSent] = useState(patient.referralSent);
  const caregiverReferral = {
    id: patient.referralRef?.replace(/^#/, '') || patient.patientId,
    referralId: patient.referralRef?.replace(/^#/, '') || patient.patientId,
    patientId: patient.patientId,
    patientToken: patient.referralRef?.replace(/^#/, '') || patient.patientId,
  } as any;

  const handleSendReferralClick = () => {
    if (isSent || isTransmitting) return;

    setIsTransmitting(true);

    setTimeout(() => {
      setIsTransmitting(false);
      setIsSent(true);
      onSendReferral(patient.patientId);
    }, 1800);
  };

  const handleDeleteClick = () => {
    const confirmed = window.confirm(`Delete the record for ${patient.patientName}? This cannot be undone.`);
    if (!confirmed) return;
    onDeletePatient(patient.patientId);
  };

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      {/* View Switcher Banner */}
      <div className="flex items-center justify-between bg-[#eeedf7] dark:bg-[#2c2128] p-2 px-3 rounded-xl">
        <span className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7]">
          {t('referral.modeLabel')}: <strong className="text-[#1a1b22] dark:text-[#f1effa]">{t('referral.modeValue')}</strong>
        </span>
        <button
          onClick={onSwitchToNewsView}
          className="text-xs font-semibold text-[#b50063] dark:text-[#ffb0c9] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>{t('referral.viewNewsBreakdown')}</span>
          <span className="material-symbols-outlined text-sm">analytics</span>
        </button>
      </div>

      {/* Document Header & Status Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#e8e7f1] dark:bg-[#382a33] p-6 flex flex-col gap-4 shadow-sm border border-[#e3e1ec]/50 dark:border-[#44333e]">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#b50063] dark:text-[#ffb0c9] uppercase tracking-widest">
              {t('referral.officialDocument')}
            </span>
            <h2 className="text-xl font-bold text-[#1a1b22] dark:text-[#f1effa] tracking-tight">
              {t('referral.setuReferral')}
            </h2>
          </div>
          <div className="bg-[#b50063]/10 dark:bg-[#ffb0c9]/20 px-3 py-1 rounded-full border border-[#b50063]/20 dark:border-[#ffb0c9]/30">
            <span className="text-xs font-bold text-[#b50063] dark:text-[#ffb0c9]">
              {patient.referralRef || 'Referral'}
            </span>
          </div>
        </div>

        {/* Patient Profile */}
        <div className="flex items-center gap-4 pt-2">
          <div className="w-14 h-14 rounded-full bg-[#e3e1ec] dark:bg-[#44333e] flex items-center justify-center overflow-hidden border-2 border-[#b50063]/20 flex-shrink-0 shadow-sm">
            {patient.photoUrl ? (
              <img
                className="w-full h-full object-cover"
                src={patient.photoUrl}
                alt={patient.patientName}
              />
            ) : (
              <span className="material-symbols-outlined text-3xl text-[#5b3f47]">person</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#1a1b22] dark:text-[#f1effa]">
              {patient.patientName}
            </span>
            <span className="text-sm text-[#5b3f47] dark:text-[#e3bdc7]">
              Patient ID: {patient.patientId} {patient.age ? `• ${patient.age}y ${patient.gender}` : ''}
            </span>
          </div>
        </div>

        {/* Watermark icon */}
        <div className="absolute -right-4 -bottom-4 opacity-5 dark:opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[130px] text-[#1a1b22] dark:text-white">
            description
          </span>
        </div>
      </div>

      <CaregiverQrCard referral={caregiverReferral} />

      {/* Urgency Score Card */}
      <div className="bg-[#b50063] dark:bg-[#8e004c] rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-[#b50063]/25 transition-all">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
            {t('referral.clinicalPriorityScore')}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-black text-white">{patient.newsScore}</span>
            <span className="text-xl font-semibold text-white/60">/ 20</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-1 border border-white/20">
            <span className="text-xs font-bold text-white uppercase tracking-tight">
              {patient.riskLevel === 'URGENT' || patient.newsScore >= 15
                ? t('referral.urgentAction')
                : patient.riskLevel}
            </span>
          </div>
          <span className="text-sm text-white/90 text-right italic font-medium">
            {patient.newsScore >= 15 ? t('referral.immediateTransfer') : t('referral.highPriority')}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDeleteClick}
          className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-lg align-middle mr-2">delete</span>
          Delete Patient Record
        </button>
      </div>

      {/* Clinical Vitals Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#b50063] dark:text-[#ffb0c9]">
            analytics
          </span>
          <h3 className="text-lg font-bold text-[#1a1b22] dark:text-[#f1effa]">{t('referral.clinicalVitals')}</h3>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Heart Rate */}
          <div className="flex items-center justify-between p-4 bg-[#f4f2fd] dark:bg-[#221a1f] rounded-xl border border-[#eeedf7] dark:border-[#382a33]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#382a33] flex items-center justify-center text-[#b50063] dark:text-[#ffb0c9] shadow-xs">
                <span className="material-symbols-outlined">favorite</span>
              </div>
              <span className="text-base font-medium text-[#1a1b22] dark:text-[#f1effa]">
                Heart Rate
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#b50063] dark:text-[#ffb0c9]">
                {patient.vitals.heartRate}
              </span>
              <span className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] ml-1 font-medium">
                BPM
              </span>
            </div>
          </div>

          {/* SpO2 */}
          <div className="flex items-center justify-between p-4 bg-[#f4f2fd] dark:bg-[#221a1f] rounded-xl border border-[#eeedf7] dark:border-[#382a33]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#382a33] flex items-center justify-center text-[#b50063] dark:text-[#ffb0c9] shadow-xs">
                <span className="material-symbols-outlined">air</span>
              </div>
              <span className="text-base font-medium text-[#1a1b22] dark:text-[#f1effa]">
                SpO2
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#ba1a1a] dark:text-[#ffdad6]">
                {patient.vitals.spO2}
              </span>
              <span className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] ml-1 font-medium">
                %
              </span>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between p-4 bg-[#f4f2fd] dark:bg-[#221a1f] rounded-xl border border-[#eeedf7] dark:border-[#382a33]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#382a33] flex items-center justify-center text-[#b50063] dark:text-[#ffb0c9] shadow-xs">
                <span className="material-symbols-outlined">device_thermostat</span>
              </div>
              <span className="text-base font-medium text-[#1a1b22] dark:text-[#f1effa]">
                Temperature
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#1a1b22] dark:text-[#f1effa]">
                {patient.vitals.temperature}
              </span>
              <span className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] ml-1 font-medium">
                {patient.vitals.tempUnit}
              </span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="flex items-center justify-between p-4 bg-[#f4f2fd] dark:bg-[#221a1f] rounded-xl border border-[#eeedf7] dark:border-[#382a33]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#382a33] flex items-center justify-center text-[#b50063] dark:text-[#ffb0c9] shadow-xs">
                <span className="material-symbols-outlined">blood_pressure</span>
              </div>
              <span className="text-base font-medium text-[#1a1b22] dark:text-[#f1effa]">BP</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#1a1b22] dark:text-[#f1effa]">
                {patient.vitals.systolicBp}
                {patient.vitals.diastolicBp ? `/${patient.vitals.diastolicBp}` : ''}
              </span>
              <span className="text-xs text-[#5b3f47] dark:text-[#e3bdc7] ml-1 font-medium">
                mmHg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Facility Map View */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[#5b3f47] dark:text-[#e3bdc7] uppercase tracking-wider">
          Target Facility
        </span>
        <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-[#e3e1ec] dark:bg-[#382a33] border border-[#eeedf7] dark:border-[#44333e] flex items-center justify-center group shadow-inner">
          {/* Simulated Map visual background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd9e3]/30 via-slate-200/50 to-[#eeedf7] dark:from-[#4f1030]/40 dark:to-[#1a1316] opacity-90" />

          {/* SVG Map grid lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 30 Q 100 80 200 40 T 400 90"
              stroke="#b50063"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 50 0 Q 80 100 120 150 T 250 200"
              stroke="#5f5e5e"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
            />
            <circle cx="200" cy="50" r="6" fill="#b50063" />
          </svg>

          {/* Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#b50063] text-white flex items-center justify-center shadow-lg animate-bounce">
              <span className="material-symbols-outlined text-lg">local_hospital</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-[#fbf8ff]/95 dark:bg-[#1a1316]/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#e3e1ec] dark:border-[#44333e] flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#b50063] dark:text-[#ffb0c9]">
                location_on
              </span>
              <span className="text-xs font-bold text-[#1a1b22] dark:text-[#f1effa] truncate">
                {patient.phc} ({patient.facilityDistance})
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#b50063] dark:text-[#ffb0c9] bg-[#ffd9e3] dark:bg-[#4f1030] px-2 py-0.5 rounded-full">
              Route Verified
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={handleSendReferralClick}
          disabled={isTransmitting}
          className={`w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 shadow-xl transition-all relative overflow-hidden active:scale-[0.98] ${
            isSent
              ? 'bg-[#1a1b22] dark:bg-[#f1effa] text-white dark:text-[#1a1b22] shadow-emerald-500/20'
              : 'bg-[#b50063] hover:bg-[#a00057] text-white shadow-[#b50063]/30'
          }`}
        >
          <span className="text-lg font-bold z-10">
            {isTransmitting
              ? 'Transmitting Referral...'
              : isSent
              ? 'Referral Transmitted'
              : 'Send Referral'}
          </span>
          <span
            className={`material-symbols-outlined z-10 text-xl ${
              isTransmitting ? 'animate-spin' : ''
            }`}
          >
            {isTransmitting ? 'sync' : isSent ? 'check_circle' : 'arrow_forward'}
          </span>

          {isTransmitting && (
            <div className="absolute left-0 top-0 h-full bg-white/20 w-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Footer Info */}
      <p className="text-center text-xs text-[#5b3f47] dark:text-[#e3bdc7] px-4 leading-relaxed font-normal">
        By clicking "Send Referral", you are electronically signing this document and initiating
        emergency logistics and medical registrar dispatch.
      </p>
    </div>
  );
};
