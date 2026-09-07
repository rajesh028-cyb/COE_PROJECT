import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'normal' }) {
  const p = (priority || 'LOW').toUpperCase();

  const isSmall = size === 'small';

  if (p === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide'
      }`}>
        <AlertCircle className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        HIGH
      </span>
    );
  }

  if (p === 'MEDIUM') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide'
      }`}>
        <AlertTriangle className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        MEDIUM
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${
      isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide'
    }`}>
      <CheckCircle2 className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      LOW
    </span>
  );
}
