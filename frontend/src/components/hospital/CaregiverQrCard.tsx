import React from 'react';
import QRCode from 'react-qr-code';
import { generateCaregiverUrl, isPublicAppUrlConfigured, NormalizedReferral } from '../../services/referralApi';

interface CaregiverQrCardProps {
  referral: NormalizedReferral;
}

export const CaregiverQrCard: React.FC<CaregiverQrCardProps> = ({ referral }) => {
  const caregiverUrl = generateCaregiverUrl(referral.patientToken || referral.id);
  const hasPublicUrl = isPublicAppUrlConfigured();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#382a33] dark:bg-[#221a1f]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Caregiver QR</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-[#e3bdc7]">Scan to send updates</p>
        </div>
        <div className="rounded-full bg-[#84cc16] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">
          Live
        </div>
      </div>

      {!hasPublicUrl && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
          PUBLIC_APP_URL is not configured. QR codes will not work outside this computer.
        </div>
      )}

      <div className="mt-3 flex justify-center rounded-2xl border border-white/60 bg-white p-3 shadow-sm">
        {caregiverUrl ? (
          <QRCode value={caregiverUrl} size={140} level="M" />
        ) : (
          <div className="flex h-[140px] w-[140px] items-center justify-center rounded-xl bg-slate-100 text-center text-[11px] font-semibold text-slate-500">
            QR unavailable
          </div>
        )}
      </div>

      <p className="mt-3 break-all text-[11px] font-semibold text-slate-500 dark:text-[#e3bdc7]">{caregiverUrl || 'Configure PUBLIC_APP_URL to generate a public caregiver link.'}</p>
    </div>
  );
};
