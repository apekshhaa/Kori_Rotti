import React, { useState, useEffect } from 'react';
import { updateReferralChecklistApi } from '../../services/referralApi';

interface PreparationChecklistProps {
  referralId: string;
  recommendedActions: string[];
  checklistItems?: string[];
  completedChecklist?: string[];
  onProgressChange?: (completed: number, total: number) => void;
}

export const PreparationChecklist: React.FC<PreparationChecklistProps> = ({
  referralId,
  recommendedActions,
  checklistItems = recommendedActions,
  completedChecklist = [],
  onProgressChange,
}) => {
  const [completedIndices, setCompletedIndices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    checklistItems.forEach((item, index) => {
      initialState[index] = completedChecklist.includes(item);
    });
    setCompletedIndices(initialState);
  }, [checklistItems, completedChecklist]);

  // Reset or load saved checked states when referral changes
  useEffect(() => {
    const storageKey = `prep_checklist_${referralId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedIndices(JSON.parse(saved));
      } catch (e) {
        setCompletedIndices({});
      }
    } else {
      setCompletedIndices({});
    }
  }, [referralId]);

  const toggleAction = (index: number) => {
    setCompletedIndices((prev) => {
      const next = { ...prev, [index]: prev[index] ? false : true };
      localStorage.setItem(`prep_checklist_${referralId}`, JSON.stringify(next));

      // Persist to backend: compute completed items array
      try {
        const completedItems = Object.keys(next).filter((k) => next[k]).map((k) => checklistItems[Number(k)]).filter(Boolean);
        updateReferralChecklistApi(referralId, completedItems).catch(() => {});
      } catch (e) {}

      return next;
    });
  };

  const total = checklistItems.length || recommendedActions.length;
  const completedCount = Object.values(completedIndices).filter(Boolean).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  useEffect(() => {
    onProgressChange?.(completedCount, total);
  }, [completedCount, total, onProgressChange]);

  return (
    <div className="flex flex-col gap-3.5 bg-slate-50 dark:bg-[#221a1f] p-5 rounded-2xl border border-slate-200/80 dark:border-[#382a33]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-primary)' }}>
            checklist
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#f1effa] uppercase tracking-wide">
            Preparation
          </h4>
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-[#e3bdc7]">
          {completedCount} of {total} prepared
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-[#382a33] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-primary)' }}
        />
      </div>

      {/* Checklist items */}
      <div className="flex flex-col gap-2 pt-1">
        {checklistItems.map((action, idx) => {
          const isDone = Boolean(completedIndices[idx]);
          return (
            <button
              key={idx}
              onClick={() => toggleAction(idx)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left border transition-all cursor-pointer ${
                isDone
                  ? 'bg-white/80 dark:bg-transparent border-slate-200 dark:border-[#382a33] text-slate-700 dark:text-[var(--color-on-primary)]'
                  : 'bg-white dark:bg-[#1a1316] border-slate-200 dark:border-[#382a33] text-slate-800 dark:text-[#f1effa] hover:border-slate-300 dark:hover:border-[#44333e]'
              }`}
              style={isDone ? { backgroundColor: 'rgba(181,0,99,0.06)' } : undefined}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors flex-shrink-0 ${
                  isDone
                    ? ''
                    : 'border-slate-300 dark:border-slate-600 bg-transparent'
                }`}
                style={isDone ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' } : undefined}
              >
                {isDone && (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium leading-snug ${
                  isDone ? 'line-through opacity-80' : ''
                }`}
              >
                {action}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
