import React, { useEffect, useMemo, useState } from 'react';
import { getCaregiverPageData, submitCaregiverObservation } from '../services/referralApi';

interface CaregiverObservationPageProps {
  patientToken: string;
}

const placeholderExamples = [
  'Patient is breathing faster.',
  'Patient is not responding.',
  'Patient complained of chest pain.',
  'Patient vomited after lunch.',
  'Patient is sleeping continuously.',
  'Patient is unable to eat.',
];

export const CaregiverObservationPage: React.FC<CaregiverObservationPageProps> = ({ patientToken }) => {
  const [patientName, setPatientName] = useState('Patient');
  const [resolvedPatientToken, setResolvedPatientToken] = useState(patientToken);
  const [observationText, setObservationText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isActive = true;

    const resetState = () => {
      setPatientName('Patient');
      setResolvedPatientToken(patientToken);
      setObservationText('');
      setIsSubmitting(false);
      setError(null);
      setSubmitted(false);
    };

    const loadPatient = async () => {
      resetState();
      setIsLoading(true);

      const result = await getCaregiverPageData(patientToken);
      if (!isActive) {
        return;
      }

      if (result.success && result.referral) {
        setPatientName(result.referral.patientName || 'Patient');
        setResolvedPatientToken(result.referral.patientToken || patientToken);
      } else {
        setError(result.error || 'Unable to load this patient link right now.');
      }

      setIsLoading(false);
    };

    void loadPatient();

    return () => {
      isActive = false;
      setIsSubmitting(false);
    };
  }, [patientToken]);

  const charCount = useMemo(() => observationText.length, [observationText]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = observationText.trim();

    if (!text) {
      setError('Please enter an observation before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitCaregiverObservation(resolvedPatientToken, patientName, text);

    if (result.success) {
      setObservationText('');
      setSubmitted(true);
      setError(null);
    } else {
      setError(result.error || 'Unable to submit observation. Please try again.');
      setSubmitted(false);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf8f6] px-3 py-4 text-slate-900 sm:px-4">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#84cc16] text-sm font-black text-slate-950">
              SETU
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">SETU</p>
              <h1 className="text-xl font-black text-slate-900">Caregiver Observation</h1>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Patient</p>
            <p className="text-lg font-black text-slate-900">{isLoading ? 'Loading patient...' : patientName}</p>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Please describe any changes you have noticed in the patient&apos;s condition. Your observations will be shared with the healthcare team.
          </p>

          <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="text-sm font-bold text-slate-700" htmlFor="observation-text">
              Observation
            </label>
            <textarea
              id="observation-text"
              rows={8}
              maxLength={500}
              value={observationText}
              onChange={(event) => setObservationText(event.target.value)}
              placeholder={placeholderExamples.join('\n')}
              className="min-h-[180px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20"
            />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Examples of useful updates</span>
              <span>{charCount}/500</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="rounded-2xl bg-[#84cc16] px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-[#a3e635] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Observation'}
            </button>
          </form>

          {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
          {submitted && !error && (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              Thank you. Your observation has been shared with the care team.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
