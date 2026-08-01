import React, { useState, useEffect } from 'react';
import {
  NormalizedReferral,
  HospitalInfo,
  fetchHospitalDetails,
  manualReroute,
  fetchReferralStatus,
} from '../../services/referralApi';
import { ReferralDetail } from './ReferralDetail';

interface HospitalPreparationProps {
  referral: NormalizedReferral;
  onStatusUpdate: (referralId: string, newStatus: 'acknowledged' | 'arrived' | 'checked_in') => void;
  onReferralUpdate?: (updatedReferral: NormalizedReferral) => void;
  onDelete?: (referralId: string) => void;
  onClose?: () => void;
}

export const HospitalPreparation: React.FC<HospitalPreparationProps> = ({
  referral,
  onStatusUpdate,
  onReferralUpdate,
  onDelete,
  onClose,
}) => {
  const [hospital, setHospital] = useState<HospitalInfo | null>(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [hospitalError, setHospitalError] = useState<string | null>(null);

  const [rerouteCount, setRerouteCount] = useState(0);
  const [maxReroutesReached, setMaxReroutesReached] = useState(false);

  const [showRerouteConfirm, setShowRerouteConfirm] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);
  const [rerouteError, setRerouteError] = useState<string | null>(null);
  const [rerouteSuccess, setRerouteSuccess] = useState<string | null>(null);

  const MAX_REROUTES = 3;
  const isAwaiting = referral.status === 'sent';
  const canReroute = isAwaiting && !maxReroutesReached && !isRerouting;

  // Load hospital details on mount or when referral changes
  useEffect(() => {
    const loadHospital = async () => {
      setHospitalLoading(true);
      setHospitalError(null);

      const result = await fetchHospitalDetails(referral.hospitalId);
      if (result.hospital) {
        setHospital(result.hospital);
      } else {
        setHospitalError(result.error || 'Failed to load hospital details');
      }
      setHospitalLoading(false);
    };

    loadHospital();
  }, [referral.hospitalId]);

  // Load referral status including reroute count
  useEffect(() => {
    const loadReferralStatus = async () => {
      const result = await fetchReferralStatus(referral.id);
      if (result.referral && result.rerouteCount !== undefined) {
        setRerouteCount(result.rerouteCount);
        setMaxReroutesReached(result.rerouteCount >= MAX_REROUTES);
      }
    };

    loadReferralStatus();
  }, [referral.id]);

  const handleRerouteClick = () => {
    setRerouteError(null);
    setRerouteSuccess(null);
    setShowRerouteConfirm(true);
  };

  const handleRerouteConfirm = async () => {
    setShowRerouteConfirm(false);
    setIsRerouting(true);
    setRerouteError(null);
    setRerouteSuccess(null);

    const response = await manualReroute(referral.id);

    if (response.success) {
      setRerouteSuccess(response.message || 'Rerouting initiated. New hospital will receive alert.');
      
      // Update reroute count
      if (response.rerouteCount !== undefined) {
        setRerouteCount(response.rerouteCount);
        setMaxReroutesReached(response.rerouteCount >= MAX_REROUTES);
      }

      // Fetch updated hospital details if available
      if (response.newHospitalId) {
        const hospitalResult = await fetchHospitalDetails(response.newHospitalId);
        if (hospitalResult.hospital) {
          setHospital(hospitalResult.hospital);
          
          // Update parent with new referral info if callback provided
          if (onReferralUpdate) {
            const statusResult = await fetchReferralStatus(referral.id);
            if (statusResult.referral) {
              onReferralUpdate(statusResult.referral);
            }
          }
        }
      }

      // Clear success message after 4 seconds
      setTimeout(() => {
        setRerouteSuccess(null);
      }, 4000);
    } else {
      setRerouteError(
        response.message ||
        'Failed to reroute. Please try again or escalate manually.'
      );
    }

    setIsRerouting(false);
  };

  const handleRerouteCancel = () => {
    setShowRerouteConfirm(false);
    setRerouteError(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hospital Header Section */}
      <div className="flex flex-col gap-4 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-[#2c2128] dark:via-[#1a1316] dark:to-[#0f0a0d] p-6 rounded-2xl border border-slate-700 dark:border-[#382a33] shadow-lg">
        {/* Hospital Name and Phone */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {hospitalLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-slate-700 dark:bg-slate-600 rounded-lg mb-2" />
                <div className="h-5 w-40 bg-slate-700 dark:bg-slate-600 rounded-lg" />
              </div>
            ) : hospital ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                  {hospital.name}
                </h2>
                <p className="text-sm text-slate-400 dark:text-slate-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">phone</span>
                  <span>{hospital.phone}</span>
                </p>
                {hospital.address && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{hospital.address}</span>
                  </p>
                )}
              </>
            ) : hospitalError ? (
              <div className="text-sm text-amber-200">
                <p className="font-semibold">Unable to load hospital details</p>
                <p className="text-xs text-amber-100">{hospitalError}</p>
              </div>
            ) : null}
          </div>

          {/* Reroute Button */}
          <button
            onClick={handleRerouteClick}
            disabled={!canReroute}
            className={`
              flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              font-bold text-sm whitespace-nowrap transition-all shadow-md
              ${
                canReroute
                  ? 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95 cursor-pointer'
                  : 'bg-slate-700 dark:bg-slate-600 text-slate-400 cursor-not-allowed opacity-60'
              }
            `}
            title={
              !isAwaiting
                ? 'Only available when status is AWAITING_ACKNOWLEDGMENT'
                : maxReroutesReached
                ? 'Max reroutes exceeded'
                : 'Reroute to another hospital'
            }
          >
            <span className="material-symbols-outlined text-base">
              {maxReroutesReached ? 'block' : 'local_hospital'}
            </span>
            <span className="hidden sm:inline">
              {maxReroutesReached ? 'MAX REROUTES' : 'REROUTE'}
            </span>
          </button>
        </div>

        {/* Hospital Capacity Info */}
        {hospital && hospital.availableBeds !== undefined && (
          <div className="flex items-center gap-4 pt-3 border-t border-slate-700 dark:border-slate-600">
            <div className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-base text-blue-400">
                bed
              </span>
              <div>
                <p className="text-slate-400 dark:text-slate-300">Available Beds</p>
                <p className="font-bold text-white">
                  {hospital.availableBeds} / {hospital.totalBeds}
                </p>
              </div>
            </div>
            {hospital.specialties && hospital.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-4">
                {hospital.specialties.slice(0, 2).map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-block text-xs px-2 py-1 rounded-md bg-slate-700 dark:bg-slate-600 text-slate-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {rerouteError && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-950/50 border border-red-800/50">
            <span className="material-symbols-outlined text-red-400 mt-0.5 flex-shrink-0">
              error
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-200">Reroute Failed</p>
              <p className="text-xs text-red-100/80 mt-0.5">{rerouteError}</p>
            </div>
          </div>
        )}

        {rerouteSuccess && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/6 border border-slate-200 animate-fadeIn">
            <span className="material-symbols-outlined mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
              check_circle
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Rerouting Initiated</p>
              <p className="text-xs" style={{ color: 'var(--color-primary)', opacity: 0.85, marginTop: 6 }}>{rerouteSuccess}</p>
            </div>
          </div>
        )}

        {maxReroutesReached && !rerouteSuccess && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-950/50 border border-red-800/50">
            <span className="material-symbols-outlined text-red-400 mt-0.5 flex-shrink-0">
              warning
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-200">Max Reroutes Exceeded</p>
              <p className="text-xs text-red-100/80 mt-0.5">
                Patient has been rerouted {rerouteCount} times. Escalating to manual dispatch.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reroute Confirmation Dialog */}
      {showRerouteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1316] rounded-2xl p-6 shadow-xl max-w-sm mx-4 border border-slate-200 dark:border-[#382a33] animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.12 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>
                  warning
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Reroute?</h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              Are you sure you want to reroute this patient to another hospital?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              This will escalate the referral to a different facility and the new hospital will receive an alert.
              <span className="block mt-1 font-semibold">Current hospital: {hospital?.name || 'Unknown'}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleRerouteCancel}
                disabled={isRerouting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-[#382a33] text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRerouteConfirm}
                disabled={isRerouting}
                className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all disabled:opacity-60 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isRerouting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Rerouting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">local_hospital</span>
                    <span>Reroute</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Detail Component */}
      <ReferralDetail
        referral={referral}
        onStatusUpdate={onStatusUpdate}
        onDelete={onDelete}
        onClose={onClose}
      />
    </div>
  );
};
