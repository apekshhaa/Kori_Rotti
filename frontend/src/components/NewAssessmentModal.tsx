import React, { useState } from 'react';
import { Patient, Vitals } from '../types';
import { calculateNewsPoints } from '../utils/newsCalculator';
import { useTranslation } from '../i18n.tsx';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSavePatient,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [targetFacility, setTargetFacility] = useState('District General Hospital');

  const [vitals, setVitals] = useState<Vitals>({
    heartRate: 110,
    spO2: 90,
    temperature: 100.8,
    tempUnit: '°F',
    systolicBp: 140,
    diastolicBp: 90,
    respiratoryRate: 22,
  });

  const newsCalc = calculateNewsPoints(vitals);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Patient ${patientId}`;
    const resolvedPatientId = patientId.trim() || finalName.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'PATIENT';
    const newPatient: Patient = {
      patientId: resolvedPatientId,
      patientName: finalName,
      age,
      gender,
      riskLevel:
        newsCalc.urgencyLevel === 'URGENT'
          ? 'URGENT'
          : newsCalc.urgencyLevel === 'HIGH'
          ? 'HIGH RISK'
          : newsCalc.urgencyLevel === 'MEDIUM'
          ? 'MODERATE'
          : 'STABLE',
      newsScore: newsCalc.totalScore,
      vitals,
      lastAssessedTime: 'Just now',
      phc: targetFacility,
      facilityDistance: '4.2km',
      referralSent: false,
      historyScores: [{ time: 'Just now', score: newsCalc.totalScore }],
      recommendation: newsCalc.recommendation,
    };

    onSavePatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fbf8ff] dark:bg-[#1a1316] text-[#1a1b22] dark:text-[#f1effa] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#e3e1ec] dark:border-[#44333e] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#eeedf7] dark:border-[#382a33] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b50063] dark:text-[#ffb0c9] text-2xl">
              clinical_notes
            </span>
            <h2 className="text-xl font-bold">{t('newAssessment.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eeedf7] dark:bg-[#382a33] flex items-center justify-center hover:bg-[#e3e1ec]"
          >
            <span className="material-symbols-outlined text-sm">{t('newAssessment.close')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Live Calculated NEWS Score Banner */}
          <div className="bg-[#e8e7f1] dark:bg-[#382a33] p-4 rounded-2xl flex items-center justify-between border border-[#b50063]/30">
            <div>
              <span className="text-[10px] font-bold text-[#b50063] dark:text-[#ffb0c9] uppercase tracking-wider block">
                {t('newAssessment.calculatedNEWS')}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-[#1a1b22] dark:text-[#f1effa]">
                  {newsCalc.totalScore}
                </span>
                <span className="text-sm font-bold text-[#5b3f47] dark:text-[#e3bdc7]">{t('newAssessment.scoreOf')}</span>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                newsCalc.urgencyLevel === 'URGENT' || newsCalc.totalScore >= 12
                  ? 'bg-[#b50063] text-white animate-pulse'
                  : newsCalc.urgencyLevel === 'HIGH'
                  ? 'bg-[#ffdad6] text-[#93000a]'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {newsCalc.urgencyLevel === 'URGENT' || newsCalc.totalScore >= 12
                ? t('newAssessment.actionUrgent')
                : newsCalc.urgencyLevel === 'HIGH'
                ? t('newAssessment.actionHigh')
                : t('newAssessment.actionNormal')}
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.patientName')}
              </label>
              <input
                type="text"
                placeholder="e.g. Meena Devi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm focus:outline-none focus:border-[#b50063]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.patientId')}
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm focus:outline-none focus:border-[#b50063]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.age')}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm focus:outline-none focus:border-[#b50063]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.gender')}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm focus:outline-none focus:border-[#b50063]"
              >
                <option value="Female">{t('newAssessment.genderOptions.female')}</option>
                <option value="Male">{t('newAssessment.genderOptions.male')}</option>
                <option value="Other">{t('newAssessment.genderOptions.other')}</option>
              </select>
            </div>
          </div>

          {/* Vitals Input Grid */}
          <span className="text-xs font-bold text-[#b50063] dark:text-[#ffb0c9] uppercase tracking-wider mt-2 block">
            {t('newAssessment.clinicalVitalsEntry')}
          </span>

          <div className="grid grid-cols-2 gap-3">
            {/* Heart Rate */}
            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.heartRate')}
              </label>
              <input
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm font-bold focus:outline-none focus:border-[#b50063]"
              />
            </div>

            {/* SpO2 */}
            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.spo2')}
              </label>
              <input
                type="number"
                value={vitals.spO2}
                onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm font-bold focus:outline-none focus:border-[#b50063]"
              />
            </div>

            {/* Systolic BP */}
            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.systolicBp')}
              </label>
              <input
                type="number"
                value={vitals.systolicBp}
                onChange={(e) => setVitals({ ...vitals, systolicBp: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm font-bold focus:outline-none focus:border-[#b50063]"
              />
            </div>

            {/* Diastolic BP */}
            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.diastolicBp')}
              </label>
              <input
                type="number"
                value={vitals.diastolicBp || 80}
                onChange={(e) => setVitals({ ...vitals, diastolicBp: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm font-bold focus:outline-none focus:border-[#b50063]"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.temperature')} ({vitals.tempUnit})
              </label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm font-bold focus:outline-none focus:border-[#b50063]"
              />
            </div>

            {/* Respiratory Rate */}
            <div>
              <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
                {t('newAssessment.respRate')}
              </label>
              <input
                type="number"
                value={vitals.respiratoryRate || 18}
                onChange={(e) => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm font-bold focus:outline-none focus:border-[#b50063]"
              />
            </div>
          </div>

          {/* Target Facility Selection */}
          <div>
            <label className="text-xs font-semibold text-[#5b3f47] dark:text-[#e3bdc7] block mb-1">
              {t('newAssessment.facility')}
            </label>
            <select
              value={targetFacility}
              onChange={(e) => setTargetFacility(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#f4f2fd] dark:bg-[#221a1f] border border-[#eeedf7] dark:border-[#382a33] text-sm focus:outline-none focus:border-[#b50063]"
            >
              <option value="District General Hospital">District General Hospital (4.2km)</option>
              <option value="District Tertiary Trauma Center">District Tertiary Trauma Center (8.5km)</option>
              <option value="Community Health Center">Community Health Center (1.8km)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-4 pt-2 border-t border-[#eeedf7] dark:border-[#382a33]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-[#e3e1ec] dark:border-[#44333e] text-sm font-bold text-[#5b3f47] dark:text-[#e3bdc7]"
            >
              {t('newAssessment.close')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#b50063] hover:bg-[#a00057] text-white text-sm font-bold shadow-lg shadow-[#b50063]/30"
            >
              {t('newAssessment.saveButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
