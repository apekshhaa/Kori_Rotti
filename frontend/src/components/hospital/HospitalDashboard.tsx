import React, { useState, useEffect, useRef } from 'react';
import {
  fetchIncomingReferrals,
  updateReferralStatus,
  NormalizedReferral,
} from '../../services/referralApi';
import { HospitalHeader } from './HospitalHeader';
import { HospitalSummaryStrip } from './HospitalSummaryStrip';
import { ReferralQueueItem } from './ReferralQueueItem';
import { ReferralDetail } from './ReferralDetail';

interface HospitalDashboardProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateToPhc: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onNavigateToPhc,
}) => {
  const [referrals, setReferrals] = useState<NormalizedReferral[]>([]);
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState<Set<string>>(new Set());

  const previousIdsRef = useRef<Set<string>>(new Set());
  const initialLoadCompletedRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    const res = await fetchIncomingReferrals();
    setIsMock(res.isMock);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    // Sort referrals: URGENT first, then WATCH, then LOW
    const sorted = [...res.referrals].sort((a, b) => {
      const priorityMap: Record<string, number> = { URGENT: 3, WATCH: 2, LOW: 1 };
      const priorityDiff = (priorityMap[b.riskLevel] || 0) - (priorityMap[a.riskLevel] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.eta ?? 999) - (b.eta ?? 999);
    });

    // Check for newly arrived referrals during polling
    const currentIds = new Set(sorted.map((r) => r.id));
    if (initialLoadCompletedRef.current) {
      const brandNewIds = new Set<string>();
      for (const r of sorted) {
        if (!previousIdsRef.current.has(r.id)) {
          brandNewIds.add(r.id);
          if (r.riskLevel === 'URGENT') {
            showToast(`Urgent referral received · ${r.patientId}`);
          } else {
            showToast(`New referral received from ${r.phc}`);
          }
        }
      }
      if (brandNewIds.size > 0) {
        setNewlyArrivedIds(brandNewIds);
        setTimeout(() => setNewlyArrivedIds(new Set()), 6000);
      }
    } else {
      initialLoadCompletedRef.current = true;
    }

    previousIdsRef.current = currentIds;
    setReferrals(sorted);

    // Auto-select first referral if none selected
    if (sorted.length > 0 && !selectedReferralId) {
      setSelectedReferralId(sorted[0].id);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData(false);

    // Poll every 5 seconds for live updates
    const interval = setInterval(() => {
      loadData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (
    referralId: string,
    newStatus: 'acknowledged' | 'arrived' | 'checked_in'
  ) => {
    // Optimistic UI update
    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? { ...r, status: newStatus } : r))
    );

    await updateReferralStatus(referralId, newStatus);
    showToast(
      newStatus === 'acknowledged'
        ? 'Referral acknowledged by Receiving Hospital team.'
        : newStatus === 'arrived'
        ? 'Patient marked as Arrived.'
        : 'Patient successfully Checked In.'
    );
  };

  const selectedReferral = referrals.find((r) => r.id === selectedReferralId) || referrals[0];
  const urgentCount = referrals.filter((r) => r.riskLevel === 'URGENT').length;

  return (
    <div className="min-h-screen bg-[#fbf8f6] dark:bg-[#130f12] text-slate-900 dark:text-[#f1effa] font-['Geist',sans-serif] transition-colors duration-200">
      {/* Hospital Top Header */}
      <HospitalHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onNavigateToPhc={onNavigateToPhc}
        isMock={isMock}
      />

      {/* Main Workstation Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 dark:bg-[#f1effa] text-white dark:text-slate-900 text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-white/20 animate-bounce max-w-md">
            <span className="material-symbols-outlined text-lg text-[#84cc16]">
              notifications_active
            </span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-[#f1effa] tracking-tight">
                Incoming referrals
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] animate-pulse" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-[#e3bdc7] mt-1">
              Advance notice from referring PHCs before patient arrival.
            </p>
          </div>

          {urgentCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{urgentCount} urgent referral incoming</span>
            </div>
          )}
        </div>

        {/* Summary Strip */}
        <HospitalSummaryStrip referrals={referrals} />

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-5 flex flex-col gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-slate-200 dark:bg-[#221a1f] rounded-xl" />
              ))}
            </div>
            <div className="lg:col-span-7 h-96 bg-slate-200 dark:bg-[#221a1f] rounded-2xl" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
            <span className="material-symbols-outlined text-4xl text-red-600">cloud_off</span>
            <h3 className="text-base font-bold text-red-900 dark:text-red-200">
              Unable to reach referral service.
            </h3>
            <button
              onClick={() => loadData(false)}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && referrals.length === 0 && (
          <div className="bg-white dark:bg-[#1a1316] border border-slate-200 dark:border-[#382a33] p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#2c2128] flex items-center justify-center text-slate-400 dark:text-slate-500">
              <span className="material-symbols-outlined text-3xl">inbox</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#f1effa]">
              No incoming referrals
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-[#e3bdc7] max-w-md">
              New referrals from connected PHCs will appear here in real-time.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Listening for referrals</span>
            </div>
          </div>
        )}

        {/* Content Layout (Desktop Split View / Responsive Drawer) */}
        {!isLoading && !error && referrals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Queue Column (Left) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Referral Queue ({referrals.length})
                </span>
                <span className="text-xs font-medium text-slate-400">Sorted by Urgency</span>
              </div>

              <div className="flex flex-col gap-3">
                {referrals.map((item) => (
                  <ReferralQueueItem
                    key={item.id}
                    referral={item}
                    isSelected={selectedReferral?.id === item.id}
                    onSelect={(ref) => setSelectedReferralId(ref.id)}
                    isNewUrgent={newlyArrivedIds.has(item.id) && item.riskLevel === 'URGENT'}
                  />
                ))}
              </div>
            </div>

            {/* Detail Column (Right) */}
            <div className="lg:col-span-7">
              {selectedReferral ? (
                <ReferralDetail
                  referral={selectedReferral}
                  onStatusUpdate={handleStatusUpdate}
                  onClose={() => setSelectedReferralId(null)}
                />
              ) : (
                <div className="bg-white dark:bg-[#1a1316] p-8 rounded-2xl border border-slate-200 dark:border-[#382a33] text-center text-slate-500">
                  Select a referral from the queue to view full clinical details.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
